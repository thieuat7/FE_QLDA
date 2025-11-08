# Báo cáo Bài tập Nhóm - CI/CD Demo (Nhóm X)

## 1. Giới thiệu

Repo này là sản phẩm cho bài tập CI/CD, bao gồm một ứng dụng backend đơn giản và một pipeline tự động hóa của GitLab.

* **Công nghệ sử dụng:**
    * **Backend:** Node.js, Express.js
    * **Database:** File JSON (`db.json`)
    * **Testing:** Jest, Supertest
    * **Linting:** ESLint
    * **CI/CD:** GitLab CI/CD

## 2. Mô tả Pipeline

Pipeline của nhóm được cấu hình trong file `.gitlab-ci.yml` và bao gồm 4 giai đoạn (stages):

1.  **`feature_test`**:
    * **Mục đích:** Đảm bảo code mới trên các nhánh "feature" (đang chờ merge) tuân thủ chuẩn code và không gây conflict.
    * **Công việc (Job):** `feature_test_job`
    * **Hành động:** Chạy `npm run lint` (dùng ESLint) và `git diff --check origin/main` (kiểm tra conflict).
    * **Kích hoạt:** Chỉ chạy khi có **Merge Request**.

2.  **`unit_test`**:
    * **Mục đích:** Xác minh code mới trên nhánh `main` vượt qua tất cả các bài kiểm tra logic (unit test).
    * **Công việc (Job):** `unit_test_job`
    * **Hành động:** Chạy `npm run test` (dùng Jest).
    * **Kích hoạt:** Chỉ chạy khi có **Commit lên nhánh `main`**.

3.  **`build_and_health_check`**:
    * **Mục đích:** Đảm bảo ứng dụng có thể build (cài đặt) và khởi động thành công.
    * **Công việc (Job):** `build_check_job`
    * **Hành động:** Chạy `npm install`, khởi động server (`npm run start &`), và dùng `curl` để kiểm tra `GET /health`.
    * **Kích hoạt:** Chỉ chạy khi có **Commit lên nhánh `main`** (và `unit_test` thành công).

4.  **`deploy`**:
    * **Mục đích:** (Mô phỏng) Triển khai ứng dụng lên môi trường production.
    * **Công việc (Job):** `deploy_job`
    * **Hành động:** Chỉ `echo` ra thông báo "Deployed successfully!".
    * **Kích hoạt:** Chỉ chạy khi có **Commit lên nhánh `main`** (và `build_and_health_check` thành công).

## 3. Minh chứng Pipeline

*(Dán ảnh chụp màn hình pipeline chạy thành công ở đây)*

**Hình 1: Pipeline tổng quan chạy thành công trên nhánh `main`**


**Hình 2: Chi tiết job `unit_test_job` chạy thành công**


## 4. Phân công công việc

| Thành viên | Nhiệm vụ |
| :--- | :--- |
| Nguyễn Văn A | Xây dựng 3 API backend (Express.js) |
| Trần Thị B | Viết Unit Test (Jest) và Cấu hình Linter (ESLint) |
| Lê Văn C | Cấu hình file `.gitlab-ci.yml` (Stages 1 & 2) |
| Phạm Thị D | Cấu hình file `.gitlab-ci.yml` (Stages 3 & 4) và viết `README.md` |