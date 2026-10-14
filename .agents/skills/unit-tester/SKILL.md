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
   - Chỉ trả về block mã nguồn của file Test (không giải thích lý thuyết dông dài).
   - Gợi ý tên file test phù hợp (ví dụ: `auth.service.spec.ts` hoặc `test_auth.py`) và lệnh Terminal để chạy test đó.
