#!/usr/bin/env python3
"""
seed.py — Khởi tạo schema và seed dữ liệu ảo để test backend.

Chạy lệnh:
    docker compose exec backend python seed.py

Dữ liệu seed gồm:
- pgvector extension + major_embeddings table
- Subjects, SubjectGroups (A00, A01, B00, C00, D01)
- 5 Universities (Bắc/Trung/Nam)
- 10 Majors với major_embeddings vectors ngẫu nhiên
- UniversityMajors và AdmissionScores (2022-2024)
"""

import os
import sys
import random
import numpy as np

# Thêm thư mục gốc vào path để import được app
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import app
from extensions import db
from models import (
    University, Major, UniversityMajor,
    Subject, SubjectGroup, AdmissionScore
)
from sqlalchemy import text

# ─────────────────────────────────────────────
# Dữ liệu seed
# ─────────────────────────────────────────────

SUBJECTS_DATA = [
    {"id": 1, "name": "Toán"},
    {"id": 2, "name": "Vật lý"},
    {"id": 3, "name": "Hóa học"},
    {"id": 4, "name": "Sinh học"},
    {"id": 5, "name": "Ngữ văn"},
    {"id": 6, "name": "Lịch sử"},
    {"id": 7, "name": "Địa lý"},
    {"id": 8, "name": "Tiếng Anh"},
]

GROUPS_DATA = [
    {"code": "A00", "description": "Toán, Vật lý, Hóa học",    "subject_ids": [1, 2, 3]},
    {"code": "A01", "description": "Toán, Vật lý, Tiếng Anh",  "subject_ids": [1, 2, 8]},
    {"code": "B00", "description": "Toán, Hóa học, Sinh học",  "subject_ids": [1, 3, 4]},
    {"code": "C00", "description": "Ngữ văn, Lịch sử, Địa lý", "subject_ids": [5, 6, 7]},
    {"code": "D01", "description": "Ngữ văn, Toán, Tiếng Anh", "subject_ids": [5, 1, 8]},
]

UNIVERSITIES_DATA = [
    {"code": "BKA", "name": "Đại học Bách Khoa Hà Nội",               "region": "Bắc"},
    {"code": "HUS", "name": "Đại học Khoa học Tự nhiên - ĐHQGHN",     "region": "Bắc"},
    {"code": "HUE", "name": "Đại học Huế",                             "region": "Trung"},
    {"code": "UIT", "name": "Đại học Công nghệ Thông tin - ĐHQG HCM", "region": "Nam"},
    {"code": "FTU", "name": "Đại học Ngoại thương TP.HCM",            "region": "Nam"},
]

MAJORS_DATA = [
    {"ministry_code": "7480201", "name": "Công nghệ thông tin",          "group_code": "CNTT", "group_name": "Nhóm ngành Công nghệ thông tin"},
    {"ministry_code": "7480202", "name": "Kỹ thuật phần mềm",           "group_code": "CNTT", "group_name": "Nhóm ngành Công nghệ thông tin"},
    {"ministry_code": "7480104", "name": "Hệ thống thông tin",          "group_code": "CNTT", "group_name": "Nhóm ngành Công nghệ thông tin"},
    {"ministry_code": "7520201", "name": "Kỹ thuật điện",               "group_code": "KT",   "group_name": "Nhóm ngành Kỹ thuật"},
    {"ministry_code": "7520301", "name": "Kỹ thuật cơ khí",             "group_code": "KT",   "group_name": "Nhóm ngành Kỹ thuật"},
    {"ministry_code": "7340101", "name": "Quản trị kinh doanh",         "group_code": "KT2",  "group_name": "Nhóm ngành Kinh tế"},
    {"ministry_code": "7340201", "name": "Tài chính - Ngân hàng",       "group_code": "KT2",  "group_name": "Nhóm ngành Kinh tế"},
    {"ministry_code": "7810201", "name": "Quản trị dịch vụ du lịch",   "group_code": "DL",   "group_name": "Nhóm ngành Du lịch - Dịch vụ"},
    {"ministry_code": "7220201", "name": "Ngôn ngữ Anh",               "group_code": "NN",   "group_name": "Nhóm ngành Ngôn ngữ"},
    {"ministry_code": "7480301", "name": "Khoa học máy tính",           "group_code": "CNTT", "group_name": "Nhóm ngành Công nghệ thông tin"},
]

# (university_code, ministry_code, admission_code, group_code, year, score)
SCORES_DATA = [
    # BKA
    ("BKA", "7480201", "BK-CNTT", "A00", 2024, 27.5),
    ("BKA", "7480201", "BK-CNTT", "A01", 2024, 27.0),
    ("BKA", "7480202", "BK-SE",   "A00", 2024, 26.5),
    ("BKA", "7520201", "BK-DT",   "A00", 2024, 24.0),
    ("BKA", "7480201", "BK-CNTT", "A00", 2023, 27.0),
    ("BKA", "7480202", "BK-SE",   "A00", 2023, 26.0),
    # HUS
    ("HUS", "7480301", "HUS-CS",  "A00", 2024, 25.5),
    ("HUS", "7480104", "HUS-IS",  "A00", 2024, 24.5),
    ("HUS", "7480301", "HUS-CS",  "A01", 2024, 25.0),
    ("HUS", "7480301", "HUS-CS",  "A00", 2023, 25.0),
    # UIT
    ("UIT", "7480201", "UIT-IT",  "A00", 2024, 26.0),
    ("UIT", "7480202", "UIT-SE",  "A00", 2024, 25.5),
    ("UIT", "7480201", "UIT-IT",  "A01", 2024, 25.5),
    ("UIT", "7480201", "UIT-IT",  "A00", 2023, 25.5),
    # FTU
    ("FTU", "7340101", "FTU-BA",  "A00", 2024, 23.5),
    ("FTU", "7340101", "FTU-BA",  "D01", 2024, 24.0),
    ("FTU", "7340201", "FTU-FIN", "A00", 2024, 22.5),
    ("FTU", "7810201", "FTU-TM",  "D01", 2024, 21.5),
    ("FTU", "7220201", "FTU-EN",  "D01", 2024, 26.5),
    # HUE
    ("HUE", "7340101", "HUE-BA",  "A00", 2024, 19.5),
    ("HUE", "7480201", "HUE-IT",  "A00", 2024, 20.5),
    ("HUE", "7810201", "HUE-TM",  "C00", 2024, 18.0),
    ("HUE", "7220201", "HUE-EN",  "D01", 2024, 21.0),
]

MAJOR_DESCRIPTIONS = {
    "7480201": "Ngành Công nghệ thông tin đào tạo kỹ sư lập trình, phát triển phần mềm, an toàn thông tin và trí tuệ nhân tạo.",
    "7480202": "Ngành Kỹ thuật phần mềm tập trung vào quy trình phát triển phần mềm chuyên nghiệp, kiểm thử và quản lý dự án.",
    "7480104": "Hệ thống thông tin đào tạo chuyên gia phân tích dữ liệu, quản trị CSDL và xây dựng hệ thống ERP.",
    "7520201": "Kỹ thuật điện đào tạo về hệ thống điện, điện tử công suất và tự động hóa công nghiệp.",
    "7520301": "Kỹ thuật cơ khí đào tạo thiết kế, chế tạo máy móc, tự động hóa và công nghệ sản xuất.",
    "7340101": "Quản trị kinh doanh đào tạo nhà quản lý, lãnh đạo doanh nghiệp, marketing và chiến lược kinh doanh.",
    "7340201": "Tài chính - Ngân hàng đào tạo chuyên gia phân tích tài chính, đầu tư, ngân hàng và bảo hiểm.",
    "7810201": "Quản trị dịch vụ du lịch và lữ hành đào tạo quản lý khách sạn, tổ chức tour, chăm sóc khách hàng và marketing du lịch.",
    "7220201": "Ngôn ngữ Anh đào tạo phiên dịch, biên dịch, giảng dạy tiếng Anh và giao tiếp quốc tế chuyên nghiệp.",
    "7480301": "Khoa học máy tính nghiên cứu thuật toán, trí tuệ nhân tạo, học máy và lý thuyết tính toán.",
}


def setup_pgvector(session):
    """Kích hoạt pgvector extension và tạo bảng major_embeddings."""
    print("[Setup] Kích hoạt pgvector extension...")
    session.execute(text("CREATE EXTENSION IF NOT EXISTS vector;"))
    session.execute(text("""
        CREATE TABLE IF NOT EXISTS major_embeddings (
            id SERIAL PRIMARY KEY,
            major_id INTEGER NOT NULL REFERENCES majors(id) ON DELETE CASCADE,
            description TEXT,
            embedding VECTOR(768),
            CONSTRAINT major_embeddings_major_id_key UNIQUE (major_id)
        );
    """))
    session.execute(text("""
        CREATE INDEX IF NOT EXISTS major_embeddings_embedding_idx
        ON major_embeddings USING ivfflat (embedding vector_cosine_ops)
        WITH (lists = 10);
    """))
    session.commit()
    print("[Setup] pgvector OK!")


def seed_data():
    with app.app_context():
        print("=" * 60)
        print("[Seed] Bắt đầu khởi tạo schema...")
        db.create_all()
        print("[Seed] Schema đã được tạo.")

        # ── Subjects
        subject_map = {}
        for s in SUBJECTS_DATA:
            existing = Subject.query.filter_by(name=s["name"]).first()
            if not existing:
                obj = Subject(id=s["id"], name=s["name"])
                db.session.add(obj)
                db.session.flush()
                subject_map[s["id"]] = obj
            else:
                subject_map[s["id"]] = existing
        db.session.commit()
        print(f"[Seed] ✓ {len(SUBJECTS_DATA)} Subjects")

        # ── SubjectGroups
        group_map = {}
        for g in GROUPS_DATA:
            existing = SubjectGroup.query.filter_by(code=g["code"]).first()
            if not existing:
                subjects = [subject_map[sid] for sid in g["subject_ids"]]
                obj = SubjectGroup(code=g["code"], description=g["description"])
                obj.subjects = subjects
                db.session.add(obj)
                db.session.flush()
                group_map[g["code"]] = obj
            else:
                group_map[g["code"]] = existing
        db.session.commit()
        print(f"[Seed] ✓ {len(GROUPS_DATA)} SubjectGroups")

        # ── Universities
        uni_map = {}
        for u in UNIVERSITIES_DATA:
            existing = University.query.filter_by(code=u["code"]).first()
            if not existing:
                obj = University(code=u["code"], name=u["name"], region=u["region"])
                db.session.add(obj)
                db.session.flush()
                uni_map[u["code"]] = obj
            else:
                uni_map[u["code"]] = existing
        db.session.commit()
        print(f"[Seed] ✓ {len(UNIVERSITIES_DATA)} Universities")

        # ── Majors
        major_map = {}
        for m in MAJORS_DATA:
            existing = Major.query.filter_by(ministry_code=m["ministry_code"]).first()
            if not existing:
                obj = Major(
                    ministry_code=m["ministry_code"],
                    name=m["name"],
                    group_code=m["group_code"],
                    group_name=m["group_name"],
                )
                db.session.add(obj)
                db.session.flush()
                major_map[m["ministry_code"]] = obj
            else:
                major_map[m["ministry_code"]] = existing
        db.session.commit()
        print(f"[Seed] ✓ {len(MAJORS_DATA)} Majors")

        # ── pgvector + major_embeddings
        setup_pgvector(db.session)

        # Seed embeddings (vector ngẫu nhiên 768 chiều, normalize để cosine similarity hoạt động)
        for m in MAJORS_DATA:
            major_obj = major_map[m["ministry_code"]]
            existing = db.session.execute(
                text("SELECT id FROM major_embeddings WHERE major_id = :mid"),
                {"mid": major_obj.id}
            ).fetchone()
            if not existing:
                vec = np.random.randn(768).astype(np.float32)
                vec = vec / np.linalg.norm(vec)  # normalize
                vec_str = f"[{','.join(map(str, vec.tolist()))}]"
                desc = MAJOR_DESCRIPTIONS.get(m["ministry_code"], m["name"])
                # Nhúng vector trực tiếp vào SQL string (an toàn vì vec_str là số thực)
                db.session.execute(
                    text(f"""
                        INSERT INTO major_embeddings (major_id, description, embedding)
                        VALUES (:major_id, :description, '{vec_str}'::vector)
                    """),
                    {"major_id": major_obj.id, "description": desc}
                )
        db.session.commit()
        print(f"[Seed] ✓ {len(MAJORS_DATA)} major_embeddings (random vectors)")

        # ── UniversityMajors + AdmissionScores
        score_count = 0
        for (uni_code, min_code, adm_code, grp_code, year, score) in SCORES_DATA:
            uni = uni_map.get(uni_code)
            major = major_map.get(min_code)
            group = group_map.get(grp_code)
            if not uni or not major or not group:
                print(f"  [WARN] Bỏ qua: {uni_code}/{min_code}/{grp_code} — không tìm thấy")
                continue

            # UniversityMajor
            um = UniversityMajor.query.filter_by(
                university_id=uni.id, major_id=major.id
            ).first()
            if not um:
                um = UniversityMajor(
                    university_id=uni.id,
                    major_id=major.id,
                    admission_code=adm_code,
                )
                db.session.add(um)
                db.session.flush()

            # AdmissionScore
            existing_score = AdmissionScore.query.filter_by(
                university_major_id=um.id,
                subject_group_id=group.id,
                year=year
            ).first()
            if not existing_score:
                s_obj = AdmissionScore(
                    university_major_id=um.id,
                    subject_group_id=group.id,
                    year=year,
                    base_score=score,
                    special_conditions=None,
                )
                db.session.add(s_obj)
                score_count += 1

        db.session.commit()
        print(f"[Seed] ✓ UniversityMajors và {score_count} AdmissionScores")
        print("=" * 60)
        print("[Seed] HOÀN TẤT! Database đã sẵn sàng để test.")
        print()
        print("Test nhanh các endpoint:")
        print("  GET  http://localhost:5000/api/test")
        print("  POST http://localhost:5000/api/get-valid-groups")
        print('       Body: {"subject_ids": [1, 2, 3]}')
        print("  POST http://localhost:5000/api/find-universities")
        print('       Body: {"ai_majors": ["Công nghệ thông tin"], "user_groups": [{"group_id": 1, "score": 28}]}')
        print("  POST http://localhost:5000/api/analyze-personality")
        print('       Body: {"text": "Tôi thích lập trình, giải thuật toán và làm việc với dữ liệu"}')
        print("=" * 60)


if __name__ == "__main__":
    seed_data()
