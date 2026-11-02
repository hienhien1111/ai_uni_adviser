---
name: docker-runner
description: Quản lý vòng đời dịch vụ Docker Compose (build, start, stop, view logs, exec command) cho dự án AI University Adviser.
---

# Kỹ năng: Vận hành Môi trường Docker (Docker Runner)

Kỹ năng này hướng dẫn Agent điều khiển và xử lý sự cố môi trường container hóa của dự án.

---

## 1. Lưu ý quan trọng về Docker Host trên macOS

Khi chạy lệnh Docker trong terminal của agent trên macOS, luôn gán biến môi trường socket:
```bash
DOCKER_HOST=unix:///var/run/docker.sock docker compose <command>
```

---

## 2. Các lệnh thông dụng

### Khởi động toàn bộ dịch vụ ở chế độ background
```bash
DOCKER_HOST=unix:///var/run/docker.sock docker compose up -d
```

### Build lại image khi thay đổi mã nguồn hoặc dependencies
```bash
DOCKER_HOST=unix:///var/run/docker.sock docker compose up -d --build
```

### Xem trạng thái các container
```bash
DOCKER_HOST=unix:///var/run/docker.sock docker compose ps
```

### Xem log theo thời gian thực
- Toàn bộ services:
  ```bash
  DOCKER_HOST=unix:///var/run/docker.sock docker compose logs -f --tail=50
  ```
- Riêng backend:
  ```bash
  DOCKER_HOST=unix:///var/run/docker.sock docker compose logs backend -f --tail=50
  ```
- Riêng database:
  ```bash
  DOCKER_HOST=unix:///var/run/docker.sock docker compose logs db -f --tail=50
  ```

### Dừng các dịch vụ
```bash
DOCKER_HOST=unix:///var/run/docker.sock docker compose down
```

---

## 3. Xử lý xung đột cổng (Port Conflicts)

- **Port 5000**: Nếu gặp lỗi `bind: address already in use` trên port 5000, kiểm tra xem Control Center / AirPlay Receiver của macOS có đang chạy không:
  ```bash
  lsof -i :5000
  ```
  Dự án đã cấu hình map ra port **`5001`** trên host (`5001:5000`) để tránh xung đột này.
- **Port 5432**: Dự án đã map ra port **`5433`** trên host (`5433:5432`) để tránh xung đột với các phiên bản PostgreSQL cục bộ.
