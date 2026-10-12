from flask import Blueprint, jsonify, request
from sqlalchemy import or_, and_
from extensions import db
from models import University, Major, UniversityMajor, AdmissionScore, SubjectGroup

universities_bp = Blueprint('universities', __name__)

REGION_MAP = {'Bắc': 'Bắc', 'Trung': 'Trung', 'Nam': 'Nam'}


@universities_bp.route('/api/find-universities', methods=['POST'])
def find_universities():
    data = request.json
    ai_suggested_majors = data.get('ai_majors', [])
    region = data.get('region', 'ALL')
    user_groups = data.get('user_groups', [])
                    
    if not ai_suggested_majors or not user_groups:
        return jsonify({"status": "error", "message": "Thiếu thông tin ngành học hoặc điểm số khối thi!"}), 400

    try:
        query = db.session.query(
            University.name.label('uni_name'),
            University.code.label('uni_code'),
            Major.name.label('major_name'),
            SubjectGroup.code.label('group_code'),
            AdmissionScore.year,
            AdmissionScore.base_score,
            UniversityMajor.admission_code
        ).join(UniversityMajor, University.id == UniversityMajor.university_id) \
         .join(Major, Major.id == UniversityMajor.major_id) \
         .join(AdmissionScore, AdmissionScore.university_major_id == UniversityMajor.id) \
         .join(SubjectGroup, SubjectGroup.id == AdmissionScore.subject_group_id)

        query = query.filter(Major.name.in_(ai_suggested_majors))

        if region and region != 'ALL':
            db_region = REGION_MAP.get(region, region)
            query = query.filter(University.region.ilike(f"%{db_region}%"))

        score_conditions = []
        for group in user_groups:
            score_conditions.append(and_(
                AdmissionScore.subject_group_id == group.get('group_id'),
                AdmissionScore.base_score <= group.get('score')
            ))
        if score_conditions:
            query = query.filter(or_(*score_conditions))

        query = query.order_by(AdmissionScore.year.desc(), AdmissionScore.base_score.desc())
        results = query.all()

        data_out = [{
            "university_name": r.uni_name,
            "university_code": r.uni_code,
            "major_name": r.major_name,
            "admission_code": r.admission_code,
            "subject_group": r.group_code,
            "required_score": float(r.base_score),
            "year": r.year
        } for r in results]

        return jsonify({"status": "success", "count": len(data_out), "data": data_out})

    except Exception as e:
        print(f"[DB ERROR] find_universities: {e}")
        return jsonify({"status": "error", "message": "Lỗi hệ thống khi tìm kiếm trường Đại học."}), 500


@universities_bp.route('/api/test', methods=['GET'])
def test_connection():
    return jsonify({"status": "success", "message": "Backend RAG Pipeline đang hoạt động!"})
