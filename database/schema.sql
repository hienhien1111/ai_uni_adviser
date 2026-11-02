-- ==============================================================================
-- AI University Adviser - Database Schema (PostgreSQL + pgvector)
-- ==============================================================================

-- 1. Kích hoạt extension pgvector phục vụ Semantic Search
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Dọn dẹp cấu trúc cũ nếu tồn tại (Drop theo thứ tự phụ thuộc khóa ngoại)
DROP TABLE IF EXISTS "major_embeddings" CASCADE;
DROP TABLE IF EXISTS "admission_scores" CASCADE;
DROP TABLE IF EXISTS "group_subject_mapping" CASCADE;
DROP TABLE IF EXISTS "university_majors" CASCADE;
DROP TABLE IF EXISTS "majors" CASCADE;
DROP TABLE IF EXISTS "universities" CASCADE;
DROP TABLE IF EXISTS "subject_groups" CASCADE;
DROP TABLE IF EXISTS "subjects" CASCADE;

-- 3. Bảng Môn thi (Subjects)
CREATE TABLE "subjects" (
    "id" SERIAL PRIMARY KEY,
    "name" VARCHAR(100) UNIQUE NOT NULL
);

-- 4. Bảng Tổ hợp khối thi (Subject Groups)
CREATE TABLE "subject_groups" (
    "id" SERIAL PRIMARY KEY,
    "code" VARCHAR(10) UNIQUE NOT NULL,
    "description" VARCHAR(255)
);

-- 5. Bảng liên kết Khối thi - Môn thi (Many-to-Many Mapping)
CREATE TABLE "group_subject_mapping" (
    "group_id" INTEGER NOT NULL REFERENCES "subject_groups"("id") ON DELETE CASCADE,
    "subject_id" INTEGER NOT NULL REFERENCES "subjects"("id") ON DELETE CASCADE,
    PRIMARY KEY ("group_id", "subject_id")
);

-- 6. Bảng Trường Đại học (Universities)
CREATE TABLE "universities" (
    "id" SERIAL PRIMARY KEY,
    "code" VARCHAR(20) UNIQUE NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "region" VARCHAR(50)
);
CREATE INDEX IF NOT EXISTS "idx_universities_region" ON "universities"("region");

-- 7. Bảng Ngành học (Majors)
CREATE TABLE "majors" (
    "id" SERIAL PRIMARY KEY,
    "ministry_code" VARCHAR(20) UNIQUE,
    "name" VARCHAR(255) NOT NULL,
    "group_code" VARCHAR(20),
    "group_name" VARCHAR(255)
);
CREATE INDEX IF NOT EXISTS "idx_majors_group_code" ON "majors"("group_code");
CREATE INDEX IF NOT EXISTS "idx_majors_name" ON "majors"("name");

-- 8. Bảng liên kết Trường - Ngành (University Majors)
CREATE TABLE "university_majors" (
    "id" SERIAL PRIMARY KEY,
    "university_id" INTEGER NOT NULL REFERENCES "universities"("id") ON DELETE CASCADE,
    "major_id" INTEGER NOT NULL REFERENCES "majors"("id") ON DELETE CASCADE,
    "admission_code" VARCHAR(20),
    CONSTRAINT "_university_major_uc" UNIQUE ("university_id", "major_id")
);
CREATE INDEX IF NOT EXISTS "idx_uni_majors_uni_id" ON "university_majors"("university_id");
CREATE INDEX IF NOT EXISTS "idx_uni_majors_major_id" ON "university_majors"("major_id");

-- 9. Bảng Điểm chuẩn (Admission Scores)
CREATE TABLE "admission_scores" (
    "id" SERIAL PRIMARY KEY,
    "university_major_id" INTEGER NOT NULL REFERENCES "university_majors"("id") ON DELETE CASCADE,
    "subject_group_id" INTEGER NOT NULL REFERENCES "subject_groups"("id") ON DELETE CASCADE,
    "year" INTEGER NOT NULL,
    "base_score" NUMERIC(5, 2) NOT NULL,
    "special_conditions" JSONB,
    CONSTRAINT "_score_uc" UNIQUE ("university_major_id", "subject_group_id", "year")
);
CREATE INDEX IF NOT EXISTS "idx_scores_year" ON "admission_scores"("year");
CREATE INDEX IF NOT EXISTS "idx_scores_base_score" ON "admission_scores"("base_score");
CREATE INDEX IF NOT EXISTS "idx_scores_group_id" ON "admission_scores"("subject_group_id");
CREATE INDEX IF NOT EXISTS "idx_scores_uni_major_id" ON "admission_scores"("university_major_id");

-- 10. Bảng Vector nhúng Ngành (Major Embeddings) phục vụ AI / RAG
CREATE TABLE "major_embeddings" (
    "id" SERIAL PRIMARY KEY,
    "major_id" INTEGER NOT NULL REFERENCES "majors"("id") ON DELETE CASCADE,
    "description" TEXT NOT NULL,
    "embedding" vector(768) NOT NULL
);
CREATE INDEX IF NOT EXISTS "idx_major_embeddings_major_id" ON "major_embeddings"("major_id");

-- Index tìm kiếm tương đồng vector (HNSW với cosine distance <=> phù hợp cho 768 chiều)
CREATE INDEX IF NOT EXISTS "idx_major_embeddings_vector" 
ON "major_embeddings" USING hnsw ("embedding" vector_cosine_ops);
