from flask import Blueprint, jsonify, request
from sqlalchemy.orm import joinedload
from models import SubjectGroup

groups_bp = Blueprint('groups', __name__)


@groups_bp.route('/api/get-valid-groups', methods=['POST'])
def get_valid_groups():
    data = request.get_json()
    if not data or 'subject_ids' not in data:
        return jsonify({"status": "error", "message": "Vui lòng cung cấp mảng subject_ids"}), 400

    user_subject_ids = set(data['subject_ids'])  # dùng set để O(1) lookup

    if not user_subject_ids:
        return jsonify({"status": "success", "valid_groups": []})

    # joinedload: tải toàn bộ subjects trong 1 JOIN query thay vì N lazy queries
    all_groups = SubjectGroup.query.options(joinedload(SubjectGroup.subjects)).all()
    valid_groups = []

    for group in all_groups:
        group_subject_ids = [s.id for s in group.subjects]
        if group_subject_ids and all(sid in user_subject_ids for sid in group_subject_ids):
            valid_groups.append({
                "id": group.id,
                "code": group.code,
                "description": group.description,
                "subject_ids": group_subject_ids,
            })

    return jsonify({
        "status": "success",
        "valid_groups": valid_groups,
    })
