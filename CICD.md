# CI/CD Pipeline Documentation

## 🚀 CI/CD cho Frontend React + Vite

Project này hỗ trợ 2 loại CI/CD pipeline:
1. **GitLab CI/CD** - Sử dụng `.gitlab-ci.yml`
2. **GitHub Actions** - Sử dụng `.github/workflows/ci-cd.yml`

---

## 📋 GitLab CI/CD Pipeline

### Cấu trúc Pipeline

```
install → lint → build → test → deploy
```

### Stages

#### 1. **Install Dependencies** 
- Cài đặt `node_modules`
- Cache để tăng tốc độ
- Tạo artifacts cho các stage tiếp theo

#### 2. **Lint Code**
- Chạy ESLint kiểm tra code quality
- Fail nếu có lỗi lint
- Chạy cho cả `main` và `merge_requests`

#### 3. **Build Production**
- Build production với `npm run build`
- Tạo thư mục `dist/`
- Lưu artifacts 1 tuần

#### 4. **Test** (Optional)
- Chạy unit tests
- Có thể enable bằng cách uncomment

#### 5. **Deploy Production**
- Deploy lên production server
- **Manual trigger** - cần confirm thủ công
- Chỉ chạy trên branch `main`

### Merge Request Validation
- Tự động kiểm tra MR
- Chạy lint
- Kiểm tra conflict với `main`

### Cách sử dụng

1. Push code lên GitLab
2. Pipeline tự động chạy
3. Xem kết quả tại: **CI/CD > Pipelines**
4. Deploy production: Click **Play** ở stage deploy

---

## 📋 GitHub Actions Pipeline

### Cấu trúc Workflow

```
lint → build → test → deploy
```

### Jobs

#### 1. **Lint** 🔍
- Checkout code
- Setup Node.js 20
- Install dependencies với cache
- Chạy ESLint

#### 2. **Build** 🏗️
- Build production
- Upload artifacts (dist/)
- Lưu 7 ngày

#### 3. **Test** 🧪 (Optional)
- Run unit tests
- Có thể enable bằng cách uncomment

#### 4. **Deploy** 🚀
- Download build artifacts
- Deploy lên production
- Chỉ chạy khi push lên `main`
- Hỗ trợ Vercel, Netlify, custom server

### Triggers

- **Push** vào `main` hoặc `develop`
- **Pull Request** vào `main` hoặc `develop`

### Cách sử dụng

1. Push code lên GitHub
2. Xem workflow tại: **Actions** tab
3. Workflow tự động chạy theo branch

---

## 🔧 Cấu hình

### Variables (GitLab)

Thêm trong **Settings > CI/CD > Variables**:
- `DEPLOY_SERVER` - IP server
- `DEPLOY_USER` - SSH user
- `SSH_PRIVATE_KEY` - Private key để SSH

### Secrets (GitHub)

Thêm trong **Settings > Secrets and variables > Actions**:
- `VERCEL_TOKEN` - Token Vercel (nếu dùng Vercel)
- `NETLIFY_AUTH_TOKEN` - Token Netlify (nếu dùng Netlify)
- `SSH_PRIVATE_KEY` - Private key để deploy

---

## 📦 Deploy Options

### 1. Deploy lên VPS/Server

**GitLab CI:**
```yaml
deploy_production:
  script:
    - scp -r dist/* $DEPLOY_USER@$DEPLOY_SERVER:/var/www/html/
    - ssh $DEPLOY_USER@$DEPLOY_SERVER "sudo systemctl restart nginx"
```

**GitHub Actions:**
```yaml
- name: Deploy via SSH
  uses: easingthemes/ssh-deploy@main
  with:
    SSH_PRIVATE_KEY: ${{ secrets.SSH_PRIVATE_KEY }}
    REMOTE_HOST: ${{ secrets.REMOTE_HOST }}
    REMOTE_USER: ${{ secrets.REMOTE_USER }}
    SOURCE: "dist/"
    TARGET: "/var/www/html/"
```

### 2. Deploy lên Vercel

Uncomment phần Vercel trong GitHub Actions workflow.

### 3. Deploy lên Netlify

Uncomment phần Netlify trong GitHub Actions workflow.

---

## 🎯 Best Practices

### 1. **Branch Strategy**
- `main` - Production
- `develop` - Development
- `feature/*` - Features

### 2. **Merge Request/Pull Request**
- Luôn tạo MR/PR trước khi merge
- CI tự động validate
- Review code trước khi approve

### 3. **Testing**
- Thêm unit tests
- Enable test stage
- Đảm bảo coverage > 80%

### 4. **Security**
- Không commit secrets
- Dùng Variables/Secrets
- Rotate keys định kỳ

---

## 📊 Pipeline Status

### GitLab Badges

Thêm vào README.md:
```markdown
[![pipeline status](https://gitlab.com/username/project/badges/main/pipeline.svg)](https://gitlab.com/username/project/-/commits/main)
```

### GitHub Badges

Thêm vào README.md:
```markdown
[![CI/CD](https://github.com/username/repo/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/username/repo/actions/workflows/ci-cd.yml)
```

---

## 🐛 Troubleshooting

### Pipeline fails ở Install
- Kiểm tra `package.json`
- Xóa `node_modules` và `package-lock.json`
- Chạy `npm install` locally

### Lint errors
- Chạy `npm run lint` locally
- Fix lỗi trước khi push

### Build fails
- Kiểm tra dependencies
- Thử build local: `npm run build`

### Deploy fails
- Kiểm tra credentials
- Test SSH connection
- Verify server permissions

---

## 📚 References

- [GitLab CI/CD Docs](https://docs.gitlab.com/ee/ci/)
- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Vite Build Docs](https://vitejs.dev/guide/build.html)
