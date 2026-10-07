from flask import Blueprint, jsonify, request
from sqlalchemy import text
from extensions import db, limiter
from services.ai_service import extract_intent, vectorize_text, generate_explainable_advice
from config import Config

analyze_bp = Blueprint('analyze', __name__)


@analyze_bp.route('/api/analyze-personality', methods=['POST'])
@limiter.limit(Config.RATELIMIT_ANALYZE)
def analyze_personality():
    data = request.get_json()
    if not data or 'text' not in data:
        return jsonify({"status": "error", "message": "Vui lòng cung cấp trường 'text' chứa chia sẻ của học sinh"}), 400

    user_text = data['text'].strip()

    # ── Input validation ───────────────────────────────────────────────────────
    if not user_text:
        return jsonify({"status": "error", "message": "Văn bản không được để trống"}), 400
    if len(user_text) > 2000:
        return jsonify({"status": "error", "message": "Văn bản quá dài. Vui lòng giữ dưới 2000 ký tự"}), 400

    try:
        print("\n[RAG] Đang gọi Groq trích xuất Intent (HyDE)...")
        intent_keywords = extract_intent(user_text)

        print(f"[RAG] Đang mã hóa Vector cho HyDE Profile...")
        vector_str = vectorize_text(intent_keywords)

        print("[RAG] Đang tìm kiếm 5 ngành lõi & ngành liên quan trên Database...")
        sql_query = text("""
            WITH Top5Majors AS (
                SELECT
                    m.id AS major_id,
                    m.name AS major_name,
                    m.group_code,
                    m.group_name,
                    me.description,
                    1 - (me.embedding <=> :vector) AS similarity_score
                FROM "major_embeddings" me
                JOIN "majors" m ON me.major_id = m.id
                ORDER BY me.embedding <=> :vector
                LIMIT 5
            )
            SELECT
                t.major_name,
                t.description,
                t.similarity_score,
                t.group_name,
                ARRAY(
                    SELECT m2.name
                    FROM "majors" m2
                    WHERE m2.group_code = t.group_code AND m2.id != t.major_id
                ) AS related_majors
            FROM Top5Majors t
            ORDER BY t.similarity_score DESC;
        """)

        result = db.session.execute(sql_query, {"vector": vector_str})
        top_majors = []
        ai_majors_list = []

        for row in result:
            top_majors.append({
                "major_name": row.major_name,
                "description": row.description,
                "similarity_score": round(row.similarity_score, 4),
                "group_name": row.group_name,
                "related_majors": row.related_majors,
            })
            ai_majors_list.append(row.major_name)

        if not top_majors:
            return jsonify({"status": "error", "message": "Không tìm thấy ngành phù hợp trong CSDL"}), 404

        print("[RAG] Đang sinh lời khuyên tư vấn (Gemini)...")
        advice = generate_explainable_advice(user_text, top_majors)
        print("[RAG] Hoàn tất quá trình tư vấn!")

        ui_tags = advice.get("tags", [])

        return jsonify({
            "status": "success",
            "ui_tags": ui_tags,
            "top_majors": top_majors,
            "ai_majors_list": ai_majors_list,
            "advice": advice,
        })

    except Exception as e:
        print(f"[RAG ERROR] {str(e)}")
        return jsonify({"status": "error", "message": f"Lỗi hệ thống AI: {str(e)}"}), 500