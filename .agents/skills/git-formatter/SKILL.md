---
name: git-formatter
description: Formats git commit messages using the Conventional Commits specification. Use this when the user asks to commit changes or write a commit message.
---

# Git Commit Formatter Quy trình:

Khi người dùng yêu cầu tạo commit hoặc viết thông điệp commit, hãy làm theo quy trình sau:
1. Đọc các thay đổi bằng công cụ kiểm tra mã nguồn (git diff).
2. Xác định loại thay đổi (type):
   - `feat`: Tính năng mới.
   - `fix`: Sửa lỗi.
   - `docs`: Thay đổi tài liệu.
   - `style`: Định dạng mã nguồn (space, format...).
   - `refactor`: Tái cấu trúc code.
3. Viết commit message theo cấu trúc chuẩn: `<type>(<scope>): <mô tả ngắn bằng tiếng Anh>`
4. Không tự ý tạo thêm các type ngoài danh sách trên.
