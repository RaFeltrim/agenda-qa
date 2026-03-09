import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
      plugins: [react()],
      optimizeDeps: {
            include: [
                  'react',
                  'react-dom',
                  'react/jsx-runtime',
                  'zustand',
                  'use-sync-external-store/shim/with-selector',
            ],
      },
      resolve: {
            dedupe: ['react', 'react-dom'],
      },
      build: {
            rollupOptions: {
                  output: {
                        manualChunks: {
                              'react-vendor': ['react', 'react-dom', 'react-router-dom'],
                              'antd-core': ['antd'],
                              'antd-pro': ['@ant-design/pro-components', '@ant-design/pro-utils'],
                              'icons-vendor': ['lucide-react'],
                              'dnd-vendor': ['react-beautiful-dnd', '@dnd-kit/core', '@dnd-kit/utilities'],
                              'supabase-vendor': ['@supabase/supabase-js'],
                              'ai-vendor': ['@google/generative-ai'],
                        },
                  },
            },
            chunkSizeWarningLimit: 600,
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
            port: 3001,
      },
})
