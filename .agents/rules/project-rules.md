# Quy tắc & Tiêu chuẩn Dự án: AI University Adviser

Tài liệu này định nghĩa các quy tắc kiến trúc, quy chuẩn mã nguồn và vận hành cho hệ thống AI University Adviser. Mọi Agent khi làm việc trên repository này cần tuân thủ nghiêm ngặt.

---

## 1. Kiến trúc Hệ thống (Architecture Overview)

Dự án gồm 3 thành phần chính:
1. **Frontend**: React 19 + Vite 8 + TailwindCSS v4 + Framer Motion (Port mặc định: `3000`).
2. **Backend**: Flask 3.1 + SQLAlchemy + Flask-CORS + Flask-Limiter (Port container: `5000`, Port host: `5001`).
3. **Database**: PostgreSQL 16 tích hợp extension `pgvector` (Port container: `5432`, Port host: `5433`).
4. **AI Services**:
   - **Embedding Model**: `bkai-foundation-models/vietnamese-bi-encoder` (768 chiều, chạy local trong backend container).
   - **LLM Pipeline**: Groq API (`qwen/qwen3.8-27b`) cho trích xuất Intent (HyDE) và tổng hợp kết quả tư vấn; Gemini Flash (`gemini-2.5-flash`) làm fallback.

---

## 2. Quy chuẩn Môi trường & Cổng Kết nối (Ports & Docker)

- **Tránh xung đột Port 5000 trên macOS**:
  - macOS Monterey trở lên mặc định sử dụng port `5000` cho dịch vụ **AirPlay Receiver**.
  - **Bắt buộc**: Mapping port backend trong `docker-compose.yml` là `"5001:5000"`.
  - Frontend gọi backend qua `http://localhost:5001/api` hoặc proxy Vite trỏ tới `http://127.0.0.1:5001`.
- **Database Port**: Map `"5433:5432"` trên host để không trùng với các phiên bản PostgreSQL cài đặt cục bộ trên máy host.
- **HuggingFace Cache**: Model bi-encoder tải về nặng ~500MB, bắt buộc map volume `hf_cache:/root/.cache/huggingface` để tránh tải lại mỗi khi container khởi động lại.
- **Docker Socket trên macOS**: Khi chạy lệnh Docker từ agent CLI, sử dụng `DOCKER_HOST=unix:///var/run/docker.sock`.

---

## 3. Quy tắc Dữ liệu & pgvector

- Cấu trúc bảng `major_embeddings`:
  - `id`: SERIAL PRIMARY KEY
  - `major_id`: INTEGER REFERENCES majors(id)
  - `description`: TEXT
  - `embedding`: vector(768)
- **Vector Cosine Similarity**:
  - Khi lưu vector vào database, luôn chuẩn hóa L2 (normalize vector) nếu cần so sánh cosine.
  - Toán tử tìm kiếm tương đồng vector trong PostgreSQL: `<=>` (cosine distance).
  - Trong SQLAlchemy, không dùng `:embedding::vector` kết hợp parameter binding của psycopg2 để tránh lỗi cú pháp trộn `%(name)s`. Hãy format chuỗi vector nhúng an toàn qua text template.
- **Dữ liệu giả lập**: Nếu cần test độc lập, chạy script `seed.py` để sinh schema và dữ liệu mẫu đầy đủ các trường ĐH, ngành học, tổ hợp môn và điểm chuẩn.

---

## 4. Quy tắc Codebase Backend

- **Cấu trúc module hóa**:
  - `app.py`: Entrypoint cấu hình Flask, CORS, Limiter, DB init và đăng ký blueprints.
  - `routes/`: Chứa các Blueprint tách biệt theo chức năng (`analyze.py`, `universities.py`, `subjects.py`, `test.py`). Không viết logic xử lý nặng trực tiếp trong `app.py`.
  - `services/`: Chứa nghiệp vụ ngoại vi như `cache_service.py` (hỗ trợ graceful fallback khi không có Redis).
  - `config.py`: Đọc cấu hình từ biến môi trường qua `python-dotenv`. Không hardcode API key, mật khẩu DB trong code.
- **CORS Handling**: Cấu hình CORS chấp nhận regex `http://(localhost|127\.0\.0\.1):\d+` để hỗ trợ linh hoạt các port phía frontend.

---

## 5. Quy tắc Codebase Frontend

- Hooks quản lý state & API call: `usePersonalityAnalysis`, `useUniversitySearch`, `useSubjectGroups`.
- Luôn ưu tiên biến môi trường `VITE_API_BASE` khi gọi API backend.
- Xử lý trạng thái loading, timeout (do model AI lần đầu khởi động có thể mất thời gian) và thông báo lỗi thân thiện bằng tiếng Việt.
