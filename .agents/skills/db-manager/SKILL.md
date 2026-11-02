---
name: db-manager
description: Quản lý cơ sở dữ liệu PostgreSQL + pgvector, khởi tạo schema, chạy seed dữ liệu mẫu hoặc query kiểm tra vector embeddings cho dự án AI University Adviser.
---

# Kỹ năng: Quản lý Cơ sở dữ liệu & Seed Data (DB Manager)

Kỹ năng này hướng dẫn Agent thao tác với PostgreSQL và pgvector trong container `ai_uni_db`.

---

## 1. Thông tin Kết nối Mặc định

- **Host (ngoài container)**: `localhost` / `127.0.0.1`
- **Port (ngoài container)**: `5433` (được map từ `5432` trong container)
- **Database**: `ai_uni_adviser`
- **User**: `adviser`
- **Password**: `adviser_pass`
- **URI kết nối từ container backend**: `postgresql://adviser:adviser_pass@db:5432/ai_uni_adviser`

---

## 2. Các quy trình tác vụ thường gặp

### A. Kiểm tra trạng thái Database
```bash
DOCKER_HOST=unix:///var/run/docker.sock docker compose exec db pg_isready -U adviser -d ai_uni_adviser
```

### B. Chạy Seed dữ liệu mẫu (Khởi tạo Schema & Dữ liệu)
Khi cần tạo mới schema từ đầu kèm dữ liệu trường, ngành, điểm chuẩn và vector embeddings:
```bash
DOCKER_HOST=unix:///var/run/docker.sock docker compose exec backend python seed.py
```
> **Lưu ý**: File `seed.py` tự động:
> - Cài đặt extension `vector`.
> - Tạo tất cả các bảng theo `models.py` + bảng `major_embeddings`.
> - Nạp dữ liệu các trường đại học (HUST, NEU, UET...), các tổ hợp môn (A00, A01, D01, B00...), điểm chuẩn các năm.
> - Tạo vector ngẫu nhiên 768 chiều được chuẩn hóa (normalized) cho từng ngành học.

### C. Truy vấn kiểm tra dữ liệu bằng psql
```bash
DOCKER_HOST=unix:///var/run/docker.sock docker compose exec db psql -U adviser -d ai_uni_adviser -c "
  SELECT count(*) AS total_majors FROM majors;
  SELECT count(*) AS total_embeddings FROM major_embeddings;
  SELECT count(*) AS total_scores FROM admission_scores;
"
```

### D. Kiểm tra Vector Similarity Query
```bash
DOCKER_HOST=unix:///var/run/docker.sock docker compose exec db psql -U adviser -d ai_uni_adviser -c "
  SELECT m.name, me.description, (me.embedding <=> (SELECT embedding FROM major_embeddings LIMIT 1)) AS distance
  FROM major_embeddings me
  JOIN majors m ON me.major_id = m.id
  ORDER BY distance ASC
  LIMIT 5;
"
```
*(Khoảng cách cosine càng nhỏ tương ứng độ tương đồng càng cao).*
