---
name: unit-tester
description: Tự động tạo mã kiểm thử (Unit Test) cho các hàm, class hoặc component được chỉ định. Kích hoạt khi người dùng yêu cầu viết test, unit test, hoặc kiểm thử mã nguồn.
---

# Kỹ năng: Tạo Unit Test Chuyên Sâu (Unit Tester)

## Quy trình xử lý của Agent:
Khi người dùng yêu cầu viết unit test cho một đoạn mã, hãy thực hiện nghiêm ngặt theo các bước sau:

1. **Phân tích Ngôn ngữ & Framework:** 
   - Xác định ngôn ngữ lập trình của đoạn mã (TypeScript, Python, Go...).
   - Tìm kiếm các file cấu hình trong dự án để xác định Test Framework đang dùng (ví dụ: `jest`, `vitest`, `pytest`, `mocha`). Nếu không tìm thấy, hãy dùng framework phổ biến nhất của ngôn ngữ đó.

2. **Xác định các Trường hợp Biên (Edge Cases):**
   - Phải tạo tối thiểu 3 test cases thông thường (Happy Path).
   - Phải tạo tối thiểu 3 test cases cho trường hợp biên nguy hiểm: Dữ liệu vào bị `null`/`undefined`, chuỗi rỗng, số âm, mảng rỗng, hoặc dữ liệu quá lớn.

3. **Tạo cấu trúc mã Test:**
   - Sử dụng khối `describe` (nếu framework hỗ trợ) để gom nhóm các test case rõ ràng.
   - Mỗi test case phải có mô tả rõ ràng bằng tiếng Anh hoặc tiếng Việt về mục đích kiểm thử (ví dụ: `should return 0 when input is negative`).

4. **Đầu ra yêu cầu (Output Format):**
   - Sử dụng công cụ ghi file (Write File Tool) để tạo và lưu trực tiếp mã nguồn vào file test phù hợp (ví dụ: `tests/test_auth.py` hoặc `tests/auth.service.spec.ts`).
   - Sau khi ghi file thành công, hiển thị đường dẫn file đã tạo và cung cấp lệnh Terminal chính xác để người dùng chạy test đó.

