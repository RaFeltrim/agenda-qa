import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
    build: {
          rollupOptions: {
                  output: {
                            manualChunks: {
                                        'react-vendor': ['react', 'react-dom', 'react-router-dom'],
                                        'antd-vendor': ['antd', '@ant-design/pro-components', '@ant-design/pro-utils'],
                                        'icons-vendor': ['lucide-react'],
                                        'dnd-vendor': ['react-beautiful-dnd'],
                                        'supabase-vendor': ['@supabase/supabase-js'],
                            },
                  },
          },
          chunkSizeWarningLimit: 1000,
          sourcemap: false,
          minify: 'terser',
          terserOptions: {
                  compress: {
                            drop_console: true,
                            drop_debugger: true,
                  },
          },
    },
    server: {
          port: 3000,
    },
})
