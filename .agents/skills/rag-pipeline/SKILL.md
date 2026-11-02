---
name: rag-pipeline
description: Kiểm thử, phân tích và debug luồng RAG (HyDE, pgvector similarity search, Groq/Gemini synthesis) trong hệ thống tư vấn hướng nghiệp. Kích hoạt khi cần tối ưu hóa hoặc kiểm tra chất lượng kết quả tư vấn AI.
---

# Kỹ năng: Kiểm thử & Vận hành RAG Pipeline (RAG Pipeline)

Kỹ năng này hướng dẫn Agent phân tích, debug và tối ưu hóa luồng RAG tư vấn hướng nghiệp tại route `POST /api/analyze-personality`.

---

## 1. Luồng xử lý chi tiết (Pipeline Architecture)

1. **Input**: Văn bản tự sự từ học sinh (sở thích, điểm mạnh, môn học yêu thích, định hướng tương lai).
2. **HyDE (Hypothetical Document Embeddings)**:
   - LLM (Groq: `qwen/qwen3.8-27b` hoặc Gemini Flash) phân tích văn bản học sinh để tạo ra một hồ sơ lý tưởng (Ideal Profile) chứa các từ khóa chuyên môn và nhóm ngành phù hợp.
3. **Dense Vector Encoding**:
   - Sử dụng mô hình `bkai-foundation-models/vietnamese-bi-encoder` mã hóa profile thành vector 768 chiều.
4. **Vector Similarity Search (pgvector)**:
   - Truy vấn CSDL PostgreSQL tính khoảng cách cosine (`<=>`) với bảng `major_embeddings` để tìm Top-K ngành có độ tương đồng cao nhất.
5. **Synthesis & Advising (LLM)**:
   - LLM tổng hợp thông tin học sinh cùng các ngành đã match để đưa ra phân tích chi tiết:
     - Tags tính cách & năng lực.
     - Tóm tắt đánh giá (Summary).
     - Phân tích chi tiết từng ngành phù hợp cùng lý do.

---

## 2. Quy trình Kiểm thử Endpoint

### A. Kiểm tra nhanh bằng cURL
```bash
curl -X POST http://localhost:5001/api/analyze-personality \
  -H "Content-Type: application/json" \
  -d '{
    "personality_text": "Em rất thích lập trình web, toán học giải tích và muốn phát triển các hệ thống phần mềm hoặc ứng dụng trí tuệ nhân tạo."
  }'
```

### B. Kiểm tra cấu trúc phản hồi mong đợi
Response JSON cần có:
- `tags`: Mảng các từ khóa (VD: `["Logic", "Công nghệ thông tin", "Sáng tạo"]`)
- `summary`: Đoạn văn ngắn đánh giá tổng quan tính cách và thiên hướng.
- `detailed_analysis`: Phân tích sâu theo từng nhóm ngành đề xuất kèm mã ngành.

---

## 3. Các lỗi thường gặp & Cách khắc phục

1. **Lỗi `Model does not exist` (Groq API)**:
   - Nguyên nhân: Tên model trong `config.py` (`GROQ_MODEL`) không còn được hỗ trợ trên Groq account hiện tại.
   - Giải pháp: Sử dụng `qwen/qwen3.8-27b` hoặc `llama-3.3-70b-versatile`.
2. **Curl bị timeout lần đầu gọi**:
   - Nguyên nhân: Backend cần tải model `vietnamese-bi-encoder` (~500MB) từ HuggingFace trong lần chạy đầu tiên.
   - Giải pháp: Chờ hoàn tất và kiểm tra cache volume `hf_cache`.
3. **Vector distance trả về không liên quan**:
   - Kiểm tra xem dữ liệu trong `major_embeddings` đã được seed chuẩn và có mô tả thực tế hay chưa.
