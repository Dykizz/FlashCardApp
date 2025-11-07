# FlashCard App 📚

Một ứng dụng flash card hiện đại được xây dựng bằng Next.js, giúp bạn ôn tập lý thuyết một cách hiệu quả và thú vị. Ứng dụng hỗ trợ theo dõi tiến độ học tập, giao diện thân thiện với dark mode, và sẽ được mở rộng thêm nhiều chức năng trong tương lai.

## ✨ Tính năng chính

- **Ôn tập flash card**: Hiển thị câu hỏi và đáp án theo dạng flash card truyền thống
- **Theo dõi tiến độ**: Lưu trữ và theo dõi tiến độ học tập của từng bộ flash card
- **Hệ thống tài khoản**: Đăng nhập/đăng ký để lưu trữ dữ liệu cá nhân
- **Dark mode**: Chuyển đổi giữa chế độ sáng/tối
- **Responsive design**: Hoạt động tốt trên mọi thiết bị
- **Giao diện thân thiện**: Sử dụng shadcn/ui components cho trải nghiệm mượt mà

## 🚀 Công nghệ sử dụng

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui
- **State Management**: React Query (TanStack Query)
- **Authentication**: JWT tokens
- **Database**: MongoDB với Mongoose
- **Caching**: Upstash Redis
- **Deployment**: Vercel
- **Icons**: Lucide React

## 📋 Yêu cầu hệ thống

- Node.js 18+
- npm hoặc yarn
- MongoDB Atlas account
- Upstash Redis account (optional)

## 🛠️ Cài đặt và chạy

### 1. Clone repository

```bash
git clone https://github.com/your-username/flash-card-app.git
cd flash-card-app
```

### 2. Cài đặt dependencies

```bash
npm install
```

### 3. Cấu hình environment variables

Tạo file `.env.local` trong thư mục gốc:

```env
# Database
MONGODB_URI=mongodb+srv://your-connection-string

# Authentication
ACCESS_TOKEN_SECRET=your-access-token-secret
REFRESH_TOKEN_SECRET=your-refresh-token-secret
EXPIRES_ACCESS_TOKEN=1h
EXPIRES_REFRESH_TOKEN=7d

# Redis (optional)
UPSTASH_REDIS_REST_URL=https://your-redis-url
UPSTASH_REDIS_REST_TOKEN=your-redis-token
```

### 4. Chạy development server

```bash
npm run dev
```

Mở [http://localhost:3000](http://localhost:3000) để xem ứng dụng.

## 📁 Cấu trúc dự án

```
flash-card-app/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── api/            # API routes
│   │   ├── flashcards/     # Flash card pages
│   │   ├── login/          # Login page
│   │   └── register/       # Register page
│   ├── components/         # Reusable components
│   │   ├── ui/            # shadcn/ui components
│   │   ├── FlashCard.tsx  # Flash card component
│   │   ├── Header.tsx     # Header component
│   │   └── ThemeToggle.tsx # Theme toggle
│   ├── hooks/             # Custom hooks
│   ├── lib/               # Utilities
│   ├── models/            # MongoDB models
│   ├── types/             # TypeScript types
│   └── utils/             # Helper functions
├── public/                # Static assets
└── README.md
```

## 🚀 Deploy lên Vercel

### Tự động deploy

1. Push code lên GitHub
2. Import project vào Vercel từ [vercel.com/new](https://vercel.com/new)
3. Thêm environment variables trong Vercel dashboard
4. Deploy!

### Manual deploy

```bash
# Cài đặt Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

## 🎯 Cách sử dụng

1. **Đăng ký tài khoản** hoặc đăng nhập nếu đã có
2. **Chọn bộ flash card** từ thư viện
3. **Ôn tập**: Đọc câu hỏi, suy nghĩ đáp án, click để xem đáp án
4. **Theo dõi tiến độ**: Ứng dụng tự động lưu tiến độ học tập
5. **Lặp lại**: Ôn tập lại những câu trả lời sai

**Học tập hiệu quả với FlashCard App! 🎓✨**
