import os
import json

from google import genai
from google.genai import types
from groq import Groq

from config import Config
import services.cache_service as cache_service

gemini_client = genai.Client(api_key=Config.GEMINI_API_KEY)
groq_client   = Groq(api_key=Config.GROQ_API_KEY)

_embedding_model = None


def _get_embedding_model():
    global _embedding_model
    if _embedding_model is None:
        from sentence_transformers import SentenceTransformer
        print("[AI] Đang nạp vietnamese-bi-encoder lần đầu... (~500MB, vui lòng đợi)")
        _embedding_model = SentenceTransformer("bkai-foundation-models/vietnamese-bi-encoder")
        print("[AI] Nạp model thành công!")
    return _embedding_model


# ── Prompt templates ──────────────────────────────────────────────────────────
_INTENT_PROMPT = """
Bạn là một kỹ sư xử lý dữ liệu AI. Nhiệm vụ của bạn là dịch đoạn chia sẻ của học sinh thành một "Hồ sơ năng lực học thuật" (2-3 câu) để tìm kiếm các ngành đại học bằng thuật toán Vector.

Đoạn chia sẻ của học sinh: "{user_text}"

NGUYÊN TẮC TỐI THƯỢNG (BẮT BUỘC TUÂN THỦ 100%):
1. CẤM TÍN HIỆU ÂM: Bỏ qua hoàn toàn những môn học/công việc mà học sinh ghét, sợ.

2. CHUYỂN ĐỔI NGỮ NGHĨA ẨN (Semantic Mapping):
   - Nếu thấy "đi đây đi đó", "khám phá nền văn hóa", "hướng ngoại", "chăm sóc người khác vui vẻ" -> Bắt buộc hiểu đây là khối ngành Dịch vụ / Du lịch.
   - TUYỆT ĐỐI KHÔNG dịch thành nghiên cứu văn hóa hàn lâm, y tế, hay giáo dục đặc biệt.

3. ÉP KỸ NĂNG MỀM VÀO NGỮ CẢNH CHUYÊN MÔN (Rất quan trọng):
   - Không liệt kê kỹ năng mềm trơ trọi. Phải gắn chặt nó vào chuyên môn của ngành mục tiêu.
   - VD 1 (Dịch vụ): Thay vì "Thích chăm sóc người khác và kết nối con người", HÃY VIẾT "Có năng lực cung cấp dịch vụ xuất sắc, chăm sóc khách hàng, quản trị trải nghiệm du khách và lữ hành".
   - VD 2 (Nghệ thuật): Thay vì "Thích cái đẹp", HÃY VIẾT "Tư duy thẩm mỹ cao trong thiết kế đồ họa, truyền thông".

4. KHUẾCH ĐẠI TÊN NGÀNH: Trực tiếp gọi tên các khối ngành đại học liên quan (VD: Quản trị khách sạn, Quản trị dịch vụ du lịch và lữ hành, Ngôn ngữ học...) trong đoạn văn.

Chỉ trả về đoạn văn Hồ sơ đã được tối ưu, KHÔNG giải thích gì thêm.
"""


def extract_intent(user_text: str) -> str:
    cache_key = cache_service.make_key("hyde", user_text)
    cached = cache_service.get_cached(cache_key)
    if cached:
        print("[Cache] HyDE profile hit")
        return cached

    prompt = _INTENT_PROMPT.format(user_text=user_text)
    response = groq_client.chat.completions.create(
        model=Config.GROQ_MODEL,
        messages=[{"role": "user", "content": prompt}],
        max_tokens=400,
        temperature=0.3,
    )
    result = response.choices[0].message.content.strip()
    cache_service.set_cached(cache_key, result)
    return result


# ── vectorize_text ────────────────────────────────────────────────────
def vectorize_text(text: str) -> str:
    """Mã hóa chuỗi → vector 768 chiều (pgvector format).
    Kết quả được cache Redis 24h.
    """
    cache_key = cache_service.make_key("embed", text)
    cached = cache_service.get_cached(cache_key)
    if cached:
        print("[Cache] Embedding hit")
        return cached

    model = _get_embedding_model()
    vector_list = model.encode(text).tolist()
    vector_str = f"[{','.join(map(str, vector_list))}]"
    cache_service.set_cached(cache_key, vector_str)
    return vector_str

def generate_explainable_advice(user_text: str, top_majors: list) -> dict:
    """Sinh tags + summary + detailed_analysis dưới dạng JSON.
    Giữ Gemini cho bước này vì cần reasoning phức tạp + chất lượng tiếng Việt cao.
    """
    context_lines = []
    for m in top_majors:
        related_str = ", ".join(m["related_majors"]) if m["related_majors"] else "Không có dữ liệu mở rộng"
        context_lines.append(f"- NGÀNH ĐỀ XUẤT CHÍNH: {m['major_name']}")
        context_lines.append(f"  + Mô tả ngành: {m['description']}")
        context_lines.append(f"  + Thuộc nhóm ngành lớn: {m['group_name']}")
        context_lines.append(f"  + Các ngành liên quan cùng nhóm: {related_str}\n")
    majors_context = "\n".join(context_lines)

    prompt = f"""
    Bạn là chuyên gia tư vấn hướng nghiệp tận tâm. Học sinh có chia sẻ ban đầu: "{user_text}".
    Hệ thống AI đã quét dữ liệu và tìm ra 5 NGÀNH HỌC (Mã 7 số) phù hợp nhất, kèm theo thông tin Nhóm ngành của chúng:

    {majors_context}

    Nhiệm vụ:
    Bạn BẮT BUỘC phải trả kết quả về dưới dạng đối tượng JSON với đúng 3 trường sau:
    1. "tags": Một mảng (array) chứa 3 đến 5 từ khóa cực ngắn (tối đa 2-3 chữ/từ khóa) tóm tắt chính xác nhất tố chất nổi bật của học sinh này (Ví dụ: ["#Nhạy_bén", "#Số_liệu", "#Thích_lãnh_đạo"]).

    2. "summary": Một đoạn văn ngắn gọn (tối đa 3-4 câu). Chỉ tóm tắt tính cách học sinh và gọi tên 5 NGÀNH ĐỀ XUẤT CHÍNH. Tuyệt đối không nhắc đến các ngành liên quan ở đây.

    3. "detailed_analysis": Đoạn tư vấn chi tiết, chia bố cục rõ ràng cho từng ngành trong 5 NGÀNH CHÍNH.
       - Trọng tâm: Phân tích TẠI SAO ngành đó lại phù hợp với tính cách/kỹ năng học sinh đã chia sẻ.
       - Mở rộng: Ở cuối phần phân tích của MỖI ngành, hãy thêm một dòng "Mở rộng góc nhìn:" để giới thiệu nhanh về nhóm ngành lớn của nó, đồng thời gợi ý nhẹ nhàng các "ngành liên quan cùng nhóm" để học sinh có thêm lựa chọn tham khảo dự phòng.
       - Có thể dùng ký tự xuống dòng (\\n) và in đậm để làm đẹp định dạng.

    Trả lời bằng giọng văn gần gũi, chuyên nghiệp, xưng "chuyên gia" hoặc "anh/chị" và gọi học sinh là "bạn".
    """

    response = None
    try:
        response = gemini_client.models.generate_content(
            model=Config.GEMINI_MODEL,
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
            ),
        )

        raw_text = response.text.strip()
        if raw_text.startswith("```json"):
            raw_text = raw_text[7:-3].strip()
        elif raw_text.startswith("```"):
            raw_text = raw_text[3:-3].strip()

        advice_data = json.loads(raw_text)

        if "tags" not in advice_data or not isinstance(advice_data["tags"], list):
            advice_data["tags"] = ["#Phân_tích_AI"]

        return advice_data

    except Exception as e:
        print(f"[AI] generate_explainable_advice error: {e}")
        return {
            "tags": ["#Lỗi_định_dạng", "#Đang_xử_lý"],
            "summary": "Hệ thống đã phân tích thành công. Vui lòng xem chi tiết 5 ngành được đề xuất bên dưới.",
            "detailed_analysis": response.text if response else "Rất tiếc, đã có lỗi xảy ra khi kết nối với AI.",
        }
