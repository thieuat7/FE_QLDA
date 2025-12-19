import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        port: 5173,
        proxy: {
            '/api': {
                // Thay đổi target từ localhost sang đường dẫn Render của bạn
                target: 'https://be-qlda.onrender.com', 
                
                // Cần thiết để đánh lừa Backend rằng request đến từ cùng nguồn
                changeOrigin: true, 
                
                // Quan trọng: Tắt kiểm tra SSL vì bạn đang gọi từ localhost (http) sang Render (https)
                secure: false, 
            }
        }
    }
})