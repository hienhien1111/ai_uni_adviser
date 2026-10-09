# Báo Cáo Đóng Góp — Thành Viên B
### Dự án: AI University Adviser

> **Thành viên:** Tô Minh Hiến  
> **Vai trò:** AI Pipeline · Vector Search (pgvector) · LLM Integration (Groq & Gemini) · Caching & Performance (Redis)

---

## Mục lục

1. [Phân tích hệ thống và phân chia công việc](#1-phân-tích-hệ-thống-và-phân-chia-công-việc)
   - 1.1 [Cách tiếp cận phân tích](#11-cách-tiếp-cận-phân-tích)
   - 1.2 [Kiến trúc tổng thể sau phân tích](#12-kiến-trúc-tổng-thể-sau-phân-tích)
   - 1.3 [Phân chia công việc giữa 3 thành viên](#13-phân-chia-công-việc-giữa-3-thành-viên)
   - 1.4 [Điểm giao nhau giữa Thành viên B với các thành viên khác](#14-điểm-giao-nhau-giữa-thành-viên-b-với-các-thành-viên-khác)
2. [Cấu trúc thư mục — phần của Thành viên B](#2-cấu-trúc-thư-mục--phần-của-thành-viên-b)
   - 2.1 [Sơ đồ vị trí các file phụ trách](#21-sơ-đồ-vị-trí-các-file-phụ-trách)
   - 2.2 [Mô tả chi tiết và giải pháp kỹ thuật từng file](#22-mô-tả-chi-tiết-và-giải-pháp-kỹ-thuật-từng-file)
3. [Cách viết code](#3-cách-viết-code)
   - 3.1 [Quy trình phát triển tính năng AI / RAG](#31-quy-trình-phát-triển-tính-năng-ai--rag)
   - 3.2 [Nguyên tắc Clean Code và Best Practices cho hệ thống AI](#32-nguyên-tắc-clean-code-và-best-practices-cho-hệ-thống-ai)
   - 3.3 [Quy tắc commit và quản lý phiên bản](#33-quy-tắc-commit-và-quản-lý-phiên-bản)
4. [Công cụ hỗ trợ phát triển](#4-công-cụ-hỗ-trợ-phát-triển)
   - 4.1 [Lập trình và Type Checking](#41-lập-trình-và-type-checking)
   - 4.2 [Thử nghiệm Prompt và Kiểm thử LLM](#42-thử-nghiệm-prompt-và-kiểm-thử-llm)
   - 4.3 [Kiểm thử API và Hiệu năng](#43-kiểm-thử-api-và-hiệu-năng)
   - 4.4 [Quản lý CSDL Vector và Cache](#44-quản-lý-csdl-vector-và-cache)
   - 4.5 [Phân tích, Thiết kế và Diagram](#45-phân-tích-thiết-kế-và-diagram)
   - 4.6 [AI trợ lý lập trình](#46-ai-trợ-lý-lập-trình)
   - 4.7 [Quản lý môi trường Python và Model Weights](#47-quản-lý-môi-trường-python-và-model-weights)

---

## 1. Phân tích hệ thống và phân chia công việc

### 1.1 Cách tiếp cận phân tích

Để làm chủ hệ thống tư vấn tuyển sinh đại học ứng dụng AI và xây dựng tầng RAG (Retrieval-Augmented Generation) đạt độ chính xác cao, các phương pháp và công cụ sau đã được áp dụng:

| Phương pháp | Mục đích | Công cụ |
|---|---|---|
| **Đọc source code & Call Stack** | Rà soát toàn bộ luồng dữ liệu từ request người dùng đến tầng vector database và LLM response | VS Code, Pylance |
| **Vẽ workflow RAG đa chặng** | Phân rã quá trình định hướng nghề nghiệp thành các bước độc lập: HyDE -> Embedding -> Vector Search -> Synthesis | draw.io, Mermaid |
| **Xem lịch sử commit & Git Blame** | Nắm bắt quá trình tinh chỉnh prompt, xử lý lỗi mô hình LLM bị decommission/deprecate | GitHub, `git log` |
| **Nghiên cứu & Đối chiếu tài liệu AI** | Khảo sát thư viện mới `google-genai` (thay thế thư viện cũ `google-generativeai`), mô hình SentenceTransformer tiếng Việt | Google AI Docs, HuggingFace Hub |
| **Sử dụng AI hỗ trợ rà soát** | Tóm tắt các luồng xử lý phức tạp, sinh test case góc (edge-cases) cho prompt học sinh | Gemini / ChatGPT kết hợp kiểm chứng trực tiếp trên mã nguồn |

---

### 1.2 Kiến trúc tổng thể sau phân tích

Hệ thống được thiết kế theo mô hình client-server phân lớp rõ ràng, trong đó **Thành viên B** chịu trách nhiệm toàn bộ trái tim thông minh của ứng dụng — **AI Pipeline**:

```
+--------------------------------------------------------------------------+
|                        Frontend (React + Vite)                           | <- Thành viên C
|         PersonalitySection . SubjectSection . ResultPanel                |
|         Giao diện nhập sở thích -> Gọi REST API -> Hiển thị kết quả       |
+------------------------------------+-------------------------------------+
                                     |
                                     | POST /api/analyze-personality { text }
                                     v
+--------------------------------------------------------------------------+
|                          Flask Backend Core                              | <- Thành viên A
|         app.py (Factory, CORS) . config.py . extensions.py (db, limiter) |
+------------------------------------+-------------------------------------+
                                     |
                                     v
+--------------------------------------------------------------------------+
|                  AI PIPELINE & RAG (Thành viên B)                        |
|                                                                          |
|  [routes/analyze.py]                                                     |
|    - Rate Limiter (5 req/min) & Input Validation (< 2000 ký tự)          |
|    - Điều phối toàn bộ luồng RAG 4 chặng                                 |
|                                                                          |
|  Chặng 1: HyDE Intent Extraction (Groq Cloud)                            |
|    - Gọi LLaMA / Compound Mini qua Groq API (độ trễ ~300ms)              |
|    - Áp dụng 4 quy tắc Semantic Binding: Cấm tín hiệu âm, ép kỹ năng     |
|                                                                          |
|  Chặng 2: Dense Vector Encoding                                          |
|    - Model: bkai-foundation-models/vietnamese-bi-encoder (768 dims)       |
|    - Lazy loading Singleton tiết kiệm RAM, chuyển chuỗi pgvector         |
|                                                                          |
|  Chặng 3: Vector Similarity Search & Expansion (PostgreSQL pgvector)     |
|    - Truy vấn SQL CTE sử dụng toán tử Cosine Distance <=>                |
|    - Trích xuất Top 5 ngành lõi + ARRAY các ngành cùng nhóm liên quan    |
|                                                                          |
|  Chặng 4: Explainable Synthesis (Google Gemini 2.5 Flash)                |
|    - Sinh JSON có cấu trúc: tags[], summary, detailed_analysis           |
|    - Xử lý phòng vệ (Defensive parsing, fallback an toàn)                |
|                                                                          |
|  Tầng Tối ưu hóa: Cache Service (Redis)                                  |
|    - services/cache_service.py: SHA-256 key, TTL 24h, Graceful Fallback  |
+------------------------------------+-------------------------------------+
                                     |
                                     v
+--------------------------------------------------------------------------+
|                   PostgreSQL Database (pgvector)                         | <- Thành viên A
|     majors . major_embeddings (vector 768) . subject_groups ...          |
+--------------------------------------------------------------------------+
```

---

### 1.3 Phân chia công việc giữa 3 thành viên

Hệ thống được phân chia thành 3 phần độc lập, tương đương nhau về khối lượng công việc và độ phức tạp kỹ thuật:

#### Thành viên A — Flask Core & Database & Data Routes
- **Hạ tầng Flask:** `app.py` (Application Factory), `config.py` (quản lý biến môi trường tập trung), `extensions.py` (khởi tạo db, limiter).
- **Cơ sở dữ liệu:** `models.py` (7 ORM models), `database/schema.sql` (bảng, ràng buộc, pgvector), `database/seed.sql` (dữ liệu ngành, điểm chuẩn, khối thi).
- **Data Routes:** `routes/groups.py` (tính khối thi hợp lệ theo tổ hợp môn), `routes/universities.py` (lọc trường theo điểm chuẩn, khu vực và ngành gợi ý).
- **Script nạp vector:** `scripts/generate_embeddings.py` (chạy 1 lần khi khởi tạo DB để vector hóa mô tả các ngành).

#### Thành viên B (Tô Minh Hiến) — AI Pipeline & RAG *(Nội dung báo cáo này)*
- **AI Core Service (`services/ai_service.py`):**
  - Trích xuất ý định và kiến tạo hồ sơ năng lực học thuật bằng kỹ thuật **HyDE** qua Groq API.
  - Mã hóa văn bản thành Vector 768 chiều sử dụng **vietnamese-bi-encoder** với kiến trúc Singleton Lazy Loading.
  - Tổng hợp lời khuyên hướng nghiệp có tính giải thích (**Explainable Advice**) qua Google Gemini 2.5 Flash, ép định dạng JSON nghiêm ngặt.
- **Cache & Performance Service (`services/cache_service.py`):**
  - Xây dựng tầng đệm Redis với thuật toán sinh key SHA-256 rút gọn.
  - Hiện thực cơ chế **Graceful Degradation**: hệ thống vẫn hoạt động thông suốt ngay cả khi cụm Redis gặp sự cố.
- **AI Route Controller (`routes/analyze.py`):**
  - Endpoint `POST /api/analyze-personality`.
  - Thiết lập Rate Limiter chống cạn kiệt hạn ngạch LLM, kiểm tra độ dài input.
  - Tối ưu hóa câu truy vấn pgvector với toán tử `<=>` (Cosine Distance) kết hợp CTE và `ARRAY()` để mở rộng các ngành dự phòng cùng nhóm.

#### Thành viên C — Frontend (Toàn bộ thư mục `frontend/`)
- **Giao diện người dùng:** React 19, Vite, giao diện hiện đại hỗ trợ dark theme.
- **Các phân hệ tương tác:**
  - `PersonalitySection`: Nhập đoạn văn mô tả bản thân, gọi API phân tích AI.
  - `SubjectSection`: Chọn tổ hợp môn thi, nhập điểm thực tế.
  - `ResultPanel`: Hiển thị radar/tags tính cách, danh sách ngành đề xuất, chi tiết điểm chuẩn từng trường qua các năm.
- **Quản lý trạng thái & Hooks:** `usePersonalityAnalysis`, `useSubjectGroups`, `useUniversityFilter`.

---

### 1.4 Điểm giao nhau giữa Thành viên B với các thành viên khác

Để đảm bảo các thành viên làm việc song song mà không bị phụ thuộc lẫn nhau (block/conflict), các **hợp đồng kỹ thuật (Contracts)** được xác định trước:

```
                  +----------------------------------------+
                  |         Thành viên B (AI Core)         |
                  +-------------------+--------------------+
                                      |
         +----------------------------+----------------------------+
         | (Data Contract)                                         | (API Contract)
         v                                                         v
+-------------------------------+                         +-------------------------------+
|    Thành viên A (Database)    |                         |    Thành viên C (Frontend)    |
| Bảng majors & major_embeddings|                         | POST /api/analyze-personality |
+-------------------------------+                         +-------------------------------+
```

#### 1. Giao tiếp với Thành viên A (Data Contract):
Thành viên B chỉ cần thống nhất trước với Thành viên A về schema của 2 bảng vector trên PostgreSQL:
```sql
-- Thành viên A tạo bảng và nạp dữ liệu:
majors(id, ministry_code, name, group_code, group_name)
major_embeddings(id, major_id FK, embedding vector(768), description)

-- Thành viên B viết câu lệnh SQL Cosine Distance:
SELECT m.name, 1 - (me.embedding <=> :vector) AS similarity_score
FROM major_embeddings me JOIN majors m ON me.major_id = m.id
ORDER BY me.embedding <=> :vector LIMIT 5;
```

#### 2. Giao tiếp với Thành viên C (API Contract):
Thành viên B cung cấp endpoint `POST /api/analyze-personality` với quy chuẩn định dạng JSON rõ ràng:
- **Request Body:**
  ```json
  {
    "text": "Em thích lập trình, thích tìm tòi thuật toán và logic, giao tiếp hướng nội..."
  }
  ```
- **Response Body (200 OK):**
  ```json
  {
    "status": "success",
    "ui_tags": ["#Tư_duy_logic", "#Thích_lập_trình", "#Hướng_nội"],
    "top_majors": [
      {
        "major_name": "Công nghệ thông tin",
        "description": "Đào tạo kỹ sư phần mềm, hệ thống...",
        "similarity_score": 0.8924,
        "group_name": "Máy tính và công nghệ thông tin",
        "related_majors": ["Khoa học máy tính", "Kỹ thuật phần mềm", "Hệ thống thông tin"]
      }
    ],
    "ai_majors_list": ["Công nghệ thông tin", "Kỹ thuật phần mềm"],
    "advice": {
      "tags": ["#Tư_duy_logic", "#Thích_lập_trình", "#Hướng_nội"],
      "summary": "Bạn sở hữu tư duy phân tích chặt chẽ, rất phù hợp với nhóm ngành Công nghệ...",
      "detailed_analysis": "**1. Công nghệ thông tin:** Phù hợp vì..."
    }
  }
  ```

---

## 2. Cấu trúc thư mục — phần của Thành viên B

### 2.1 Sơ đồ vị trí các file phụ trách

Trong toàn bộ dự án, các file do **Thành viên B** trực tiếp thiết kế, hiện thực và làm chủ được đánh dấu `[B]`:

```
ai_university_adviser/
|
+-- app.py                       [A] Flask app factory
+-- config.py                    [A] Cấu hình chung (B bổ sung: GEMINI_API_KEY, GROQ_API_KEY, CACHE_TTL)
+-- extensions.py                [A] Extensions (B sử dụng: db, limiter, redis_client)
+-- models.py                    [A] ORM Models
+-- requirements.txt             [A+B] Dependencies (B yêu cầu: google-genai, groq, sentence-transformers)
|
+-- routes/
|   +-- __init__.py              [A] Đăng ký blueprints
|   +-- analyze.py               [B] Controller: POST /api/analyze-personality (RAG orchestrator)
|   +-- groups.py                [A] Route tính khối thi
|   +-- universities.py          [A] Route lọc trường
|
+-- services/
|   +-- ai_service.py            [B] Trọng tâm AI: Groq HyDE + Bi-Encoder + Gemini Advice
|   +-- cache_service.py         [B] Redis Cache wrapper: SHA-256 hashing, graceful fallback
|
+-- scripts/
|   +-- generate_embeddings.py   [A] Nạp embedding mẫu cho CSDL ban đầu
|
+-- database/                    [A] Schema và Seed data
+-- frontend/                    [C] Ứng dụng giao diện người dùng
+-- docs/
    +-- readme/
        +-- README_ToMinhHien.md [B] Tài liệu báo cáo đóng góp cá nhân (file này)
```

---

### 2.2 Mô tả chi tiết và giải pháp kỹ thuật từng file

#### File 1: `services/ai_service.py` — Module lõi xử lý AI
File này hiện thực toàn bộ quy trình biến đổi từ văn bản tự nhiên của học sinh thành phân tích hướng nghiệp học thuật, bao gồm 3 chức năng chính:

1. **Lazy Loading Singleton cho Mô hình Embedding (`_get_embedding_model`):**
   - **Vấn đề:** Model `bkai-foundation-models/vietnamese-bi-encoder` có kích thước ~500MB. Nếu nạp ngay khi import module, ứng dụng Flask sẽ khởi động rất chậm, tốn RAM không cần thiết nếu route AI chưa được gọi.
   - **Giải pháp:** Sử dụng mô hình Singleton trì hoãn (Lazy loading). Model chỉ được tải vào bộ nhớ trong lần gọi hàm đầu tiên và tái sử dụng cho tất cả các request tiếp theo:
   ```python
   _embedding_model = None

   def _get_embedding_model():
       global _embedding_model
       if _embedding_model is None:
           from sentence_transformers import SentenceTransformer
           _embedding_model = SentenceTransformer("bkai-foundation-models/vietnamese-bi-encoder")
       return _embedding_model
   ```

2. **HyDE Intent Extraction (`extract_intent`):**
   - **Vấn đề:** Học sinh phổ thông thường viết sở thích bằng ngôn ngữ đời thường ("em thích đi đây đi đó", "em ghét học toán"). Nếu vector hóa trực tiếp đoạn văn này để đối chiếu với mô tả ngành học thuật trong CSDL, khoảng cách ngữ nghĩa (semantic gap) sẽ rất lớn, dẫn đến gợi ý sai lệch.
   - **Giải pháp:** Sử dụng kỹ thuật **HyDE (Hypothetical Document Embeddings)** thông qua Groq Cloud với các nguyên tắc nghiêm ngặt:
     - **Cấm tín hiệu âm:** Loại bỏ hoàn toàn các môn/ngành học sinh ghét hoặc sợ (tránh việc vector bị kéo về phía từ khóa bị ghét).
     - **Semantic Mapping (Chuyển đổi ngữ nghĩa ẩn):** Tự động quy đổi các cụm từ đời thường sang khối ngành tương ứng (ví dụ: "thích đi đây đi đó" -> khối ngành Du lịch / Khách sạn / Dịch vụ lữ hành).
     - **Ép kỹ năng mềm vào chuyên môn:** Biến "thích cái đẹp" thành "tư duy thẩm mỹ trong thiết kế đồ họa".
     - **Khuếch đại tên ngành:** Nêu trực diện các danh xưng chuyên ngành đại học trong hồ sơ giả lập.

3. **Mã hóa Vector (`vectorize_text`):**
   - Biến đổi hồ sơ năng lực thành vector 768 chiều và ép về chuỗi định dạng PostgreSQL pgvector: `"[0.0123,-0.0456,...]"`.
   - Lưu trữ kết quả vào Redis để tránh tính toán lại.

4. **Tư vấn giải thích chuyên sâu (`generate_explainable_advice`):**
   - Sử dụng **Google Gemini 2.5 Flash** thông qua SDK chính thức mới `google-genai`.
   - Ép kiểu định dạng đầu ra bằng cấu hình `types.GenerateContentConfig(response_mime_type="application/json")`.
   - Trả về cấu trúc 3 phần rõ ràng:
     - `tags`: 3-5 hashtag tố chất nổi bật (`#Tư_duy_logic`, `#Thích_công_nghệ`).
     - `summary`: Tóm tắt tổng quan 3-4 câu.
     - `detailed_analysis`: Phân tích sâu từng ngành trong 5 ngành được đề xuất, chỉ rõ tại sao phù hợp với năng lực của học sinh và gợi ý các ngành dự phòng cùng nhóm.
   - **Phòng thủ dữ liệu:** Tự động loại bỏ Markdown code fences (````json ... ````) nếu LLM vô tình trả về, bọc `try...except` và cung cấp fallback an toàn khi gặp sự cố mạng hoặc vượt hạn ngạch.

---

#### File 2: `services/cache_service.py` — Tầng đệm Redis & Graceful Degradation
Hệ thống AI chịu áp lực lớn về độ trễ và chi phí token. `cache_service.py` đóng vai trò giảm thiểu 80-90% các lệnh gọi trùng lặp:

1. **Thuật toán sinh khóa SHA-256 (`make_key`):**
   - Đầu vào văn bản của người dùng có thể rất dài (lên đến hàng trăm ký tự). Việc dùng trực tiếp text làm Redis key gây lãng phí bộ nhớ và khó quản lý.
   - Hàm `make_key` băm văn bản bằng SHA-256 và cắt lấy 24 ký tự hex đầu tiên kết hợp với tiền tố (`"hyde:"` hoặc `"embed:"`):
   ```python
   def make_key(prefix: str, text: str) -> str:
       h = hashlib.sha256(text.encode("utf-8")).hexdigest()[:24]
       return f"{prefix}:{h}"
   ```

2. **Cơ chế Graceful Degradation (Suy giảm tính năng an toàn):**
   - Redis là một thành phần phụ trợ tối ưu hiệu năng, **không được phép trở thành Single Point of Failure**.
   - Nếu máy chủ Redis bị ngắt kết nối, timeout, hoặc chưa được cài đặt:
     - `get_cached()` bắt lỗi và trả về `None` (coi như cache miss).
     - `set_cached()` bắt lỗi và bỏ qua trong im lặng (không throw exception).
     - Ứng dụng Flask vẫn phục vụ người dùng trơn tru thông qua luồng gọi trực tiếp LLM.

---

#### File 3: `routes/analyze.py` — Bộ điều phối Pipeline (RAG Orchestrator)
Đóng vai trò là controller kết nối giữa HTTP Request, AI Service và Cơ sở dữ liệu Vector:

1. **Bảo vệ hệ thống (Validation & Rate Limiting):**
   - `@limiter.limit(Config.RATELIMIT_ANALYZE)`: Giới hạn tối đa 5 lượt phân tích/phút trên mỗi địa chỉ IP để bảo vệ quota LLM.
   - Kiểm tra dữ liệu đầu vào: Không cho phép văn bản rỗng, chặn các văn bản vượt quá 2000 ký tự để chống tràn context window.

2. **Tìm kiếm Vector Cosine Distance kết hợp CTE:**
   - Thực thi truy vấn SQL nguyên bản (Raw SQL) thông qua SQLAlchemy để khai thác tối đa sức mạnh của chỉ mục vector:
   ```sql
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
   ```
   - **Điểm sáng kỹ thuật:** Sử dụng toán tử `<=>` (Cosine Distance) của pgvector. Tận dụng subquery `ARRAY()` gom toàn bộ các ngành cùng `group_code` trong một lượt truy vấn duy nhất, triệt tiêu hoàn toàn vấn đề N+1 query.

---

## 3. Cách viết code

### 3.1 Quy trình phát triển tính năng AI / RAG

Quy trình phát triển một tính năng AI trong dự án tuân thủ nghiêm ngặt 5 bước:

```
[1. Đặc tả API Contract]  ---> Xác định rõ Input (text) & Output JSON schema
             |
             v
[2. Prompt Engineering]   ---> Thử nghiệm trên Playground (Groq Console, Google AI Studio)
             |                 Khóa chặt quy tắc semantic mapping, chống ảo giác
             v
[3. Caching & Tối ưu]     ---> Thiết kế Redis cache key cho từng chặng tính toán nặng
             |
             v
[4. Vector DB Query]      ---> Viết truy vấn SQL pgvector với toán tử <=>, kiểm tra index
             |
             v
[5. Defensive Coding]     ---> Bọc try-catch, làm sạch chuỗi JSON, fallback an toàn
```

**Ví dụ thực tế khi hiện thực bước tổng hợp lời khuyên (`generate_explainable_advice`):**
1. Nhận thấy LLM đôi khi trả lời kèm Markdown ````json ... ```` làm hàm `json.loads()` bị crash.
2. Viết logic làm sạch chuỗi (string stripping) trước khi parse JSON.
3. Nếu LLM gặp lỗi quota hoặc JSON không hợp lệ, trả về một đối tượng fallback chuẩn mực để giao diện người dùng không bị vỡ giao diện.

---

### 3.2 Nguyên tắc Clean Code và Best Practices cho hệ thống AI

#### Nguyên tắc 1 — Lazy Loading Singleton cho mô hình Machine Learning nặng
Không bao giờ nạp trọng số mô hình lớn tại thời điểm import file:
```python
# SAI: Khiến server mất 5-10 giây khởi động, tốn 500MB RAM dù không ai gọi route AI
from sentence_transformers import SentenceTransformer
model = SentenceTransformer("bkai-foundation-models/vietnamese-bi-encoder")

# ĐÚNG: Nạp theo yêu cầu (On-demand) và lưu giữ instance duy nhất
_embedding_model = None
def _get_embedding_model():
    global _embedding_model
    if _embedding_model is None:
        _embedding_model = SentenceTransformer("bkai-foundation-models/vietnamese-bi-encoder")
    return _embedding_model
```

#### Nguyên tắc 2 — Tách biệt hoàn toàn Prompt Template khỏi Logic thực thi
Không viết chuỗi prompt nối chuỗi phức tạp ngay giữa logic xử lý. Đặt prompt template thành hằng số rõ ràng ở đầu file:
```python
# ĐÚNG: Tách biệt template, dễ tinh chỉnh tham số và tái sử dụng
_INTENT_PROMPT = """
Bạn là một kỹ sư xử lý dữ liệu AI...
Đoạn chia sẻ của học sinh: "{user_text}"
...
"""

def extract_intent(user_text: str) -> str:
    prompt = _INTENT_PROMPT.format(user_text=user_text)
    ...
```

#### Nguyên tắc 3 — Ép kiểu có cấu trúc (Structured Outputs) và Xử lý phòng vệ
Không tin tưởng tuyệt đối vào định dạng trả về của LLM:
```python
# Cấu hình SDK ép trả về JSON chuẩn
config = types.GenerateContentConfig(response_mime_type="application/json")

# Loại bỏ code block fences nếu có
raw_text = response.text.strip()
if raw_text.startswith("```json"):
    raw_text = raw_text[7:-3].strip()
advice_data = json.loads(raw_text)

# Đảm bảo trường bắt buộc luôn tồn tại
if "tags" not in advice_data or not isinstance(advice_data["tags"], list):
    advice_data["tags"] = ["#Phân_tích_AI"]
```

#### Nguyên tắc 4 — Graceful Degradation cho các dịch vụ phụ trợ
Mọi dịch vụ tăng tốc (Cache, Logging) phải có khả năng suy giảm âm thầm khi gặp sự cố, không kéo sập ứng dụng chính:
```python
def get_cached(key: str) -> str | None:
    if redis_client is None:
        return None
    try:
        return redis_client.get(key)
    except Exception as e:
        print(f"[Cache] Error: {e}")
        return None
```

#### Hướng dẫn cụ thể theo từng file phụ trách:

| File | Nguyên tắc ưu tiên hàng đầu |
|---|---|
| `services/ai_service.py` | Kiểm soát timeout, bắt ngoại lệ API key/hạn ngạch, không để lộ raw exception ra ngoài |
| `services/cache_service.py` | Không throw exception; đặt TTL hợp lý (24h) để tránh phình bộ nhớ Redis |
| `routes/analyze.py` | Luôn kiểm tra tính hợp lệ của input trước khi gọi AI; dùng tham số hóa (parameterized query) chống SQL Injection |

---

### 3.3 Quy tắc commit và quản lý phiên bản

Áp dụng quy chuẩn **Conventional Commits** với phạm vi cụ thể cho mảng AI & RAG:

```bash
# Format: <type>(<scope>): <mô tả ngắn bằng tiếng Anh hoặc tiếng Việt>
feat(ai): integrate Groq compound-mini for low-latency HyDE extraction
feat(rag): implement cosine distance search with related majors expansion
perf(cache): add SHA-256 Redis caching for embeddings and HyDE profiles
fix(ai): strip markdown fences when parsing Gemini JSON advice
refactor(embedding): apply singleton lazy loading for vietnamese-bi-encoder
docs(readme): add detailed technical report for Member B
```

---

## 4. Công cụ hỗ trợ phát triển

### 4.1 Lập trình và Type Checking

| Công cụ | Vai trò | Lý do lựa chọn |
|---|---|---|
| **VS Code** | IDE chính | Hệ sinh thái extension phong phú, tích hợp Git và Debugger mạnh mẽ |
| **Pylance** | Type Checking & Linting | Kiểm tra kiểu dữ liệu tĩnh cho Python, phát hiện sớm các lỗi sai tên thuộc tính SDK |
| **Black & Ruff** | Định dạng mã nguồn tự động | Giữ chuẩn code PEP8 đồng nhất trong toàn bộ nhóm |

```bash
# Cài đặt và định dạng code
pip install black ruff
black services/ routes/analyze.py
```

---

### 4.2 Thử nghiệm Prompt và Kiểm thử LLM

| Công cụ | Vai trò | Lý do lựa chọn |
|---|---|---|
| **Groq Cloud Console** | Thử nghiệm mô hình HyDE | Độ trễ xử lý cực nhanh (~300ms), theo dõi trực quan số lượng token và tốc độ suy luận |
| **Google AI Studio** | Tinh chỉnh Prompt cho Gemini | Giao diện trực quan để test System Instructions, điều chỉnh Temperature và kiểm tra cấu trúc JSON trả về |
| **Jupyter Notebook** | Môi trường thử nghiệm AI độc lập | Thử nghiệm tải mô hình HuggingFace, kiểm tra kích thước vector 768 chiều trước khi tích hợp vào Flask |

---

### 4.3 Kiểm thử API và Hiệu năng

| Công cụ | Vai trò | Lý do lựa chọn |
|---|---|---|
| **curl** | Kiểm thử trực tiếp từ Terminal | Nhanh chóng, kiểm tra tức thì mã phản hồi HTTP và headers |
| **Thunder Client** | REST Client tích hợp VS Code | Lưu trữ bộ sưu tập API test case, kiểm tra payload trả về ngay trong IDE |
| **Postman** | Kiểm thử luồng tích hợp | Chia sẻ collection API giữa các thành viên trong nhóm |

```bash
# Lệnh curl kiểm thử nhanh luồng phân tích tính cách:
curl -s -X POST http://127.0.0.1:5000/api/analyze-personality \
  -H "Content-Type: application/json" \
  -d '{"text": "Em rất thích lập trình web, thích tư duy logic và giải quyết bài toán khó."}' \
  | python3 -m json.tool
```

---

### 4.4 Quản lý CSDL Vector và Cache

| Công cụ | Vai trò | Lý do lựa chọn |
|---|---|---|
| **DBeaver** | Quản lý PostgreSQL & pgvector | Hỗ trợ xem trực quan cột kiểu dữ liệu `vector(768)`, chạy thử nghiệm các truy vấn toán tử `<=>` |
| **RedisInsight / redis-cli** | Giám sát bộ nhớ đệm Redis | Kiểm tra các key SHA-256 được tạo ra, kiểm tra thời gian sống TTL và tỷ lệ cache hit/miss |

```bash
# Kiểm tra cache keys được sinh ra trong Redis:
redis-cli KEYS "hyde:*"
redis-cli KEYS "embed:*"
redis-cli TTL "hyde:e3b0c44298fc1c149afbf4c8"
```

---

### 4.5 Phân tích, Thiết kế và Diagram

| Công cụ | Vai trò | Lý do lựa chọn |
|---|---|---|
| **draw.io** | Vẽ sơ đồ kiến trúc RAG | Trực quan hóa quy trình xử lý dữ liệu qua từng bước |
| **Mermaid** | Vẽ sơ đồ trong Markdown | Nhúng trực tiếp vào tài liệu kỹ thuật, dễ dàng cập nhật cùng mã nguồn |
| **GitHub** | Quản lý mã nguồn và Pull Requests | Đánh giá chéo code (Code Review), theo dõi tiến độ công việc |

---

### 4.6 AI trợ lý lập trình

| Công cụ | Vai trò trong quá trình làm việc | Lưu ý quan trọng |
|---|---|---|
| **Antigravity (AI IDE)** | Hỗ trợ refactor, tìm kiếm context toàn dự án, cập nhật tài liệu kỹ thuật chuẩn xác | Hiểu toàn bộ cây thư mục và môi trường dự án |
| **Gemini / ChatGPT** | Hỗ trợ viết prompt ban đầu, đề xuất ý tưởng semantic mapping | Không dán khóa bí mật (API Keys) vào khung chat |
| **GitHub Copilot** | Tự động hoàn thiện code boilerplate và docstrings | Luôn review kỹ logic do AI sinh ra trước khi commit |

> **Nguyên tắc cốt lõi:** Các công cụ AI chỉ đóng vai trò hỗ trợ tăng tốc. Mọi quyết định kiến trúc, tối ưu prompt, kiểm tra độ chính xác của vector search và xử lý ngoại lệ đều được tự tay kiểm chứng và chịu trách nhiệm.

---

### 4.7 Quản lý môi trường Python và Model Weights

```bash
# Khởi tạo và kích hoạt môi trường ảo:
python3 -m venv venv
source venv/bin/activate          # Trên macOS / Linux
.\venv\Scripts\activate           # Trên Windows

# Cài đặt các thư viện cần thiết cho AI Pipeline:
pip install google-genai groq sentence-transformers redis flask-limiter

# Kiểm tra thư mục cache lưu trữ trọng số mô hình HuggingFace:
ls -lh ~/.cache/huggingface/hub/models--bkai-foundation-models--vietnamese-bi-encoder/
```

---

*Tô Minh Hiến — AI University Adviser 2026*
