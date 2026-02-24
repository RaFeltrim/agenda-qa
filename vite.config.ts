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
                  // Target modern browsers for smaller output - no IE11 baggage
          target: ['es2020', 'edge88', 'firefox78', 'chrome87', 'safari14'],
                  rollupOptions: {
                              output: {
                                            manualChunks: {
                                                            'react-vendor': ['react', 'react-dom', 'react-router-dom'],
                                                            'antd-core': ['antd'],
                                                            'antd-pro': ['@ant-design/pro-components', '@ant-design/pro-utils'],
                                                            'icons-vendor': ['lucide-react'],
                                                            // NOTE(v3): react-beautiful-dnd removed - deprecated, migrate fully to @dnd-kit
                                                            'dnd-vendor': ['@dnd-kit/core', '@dnd-kit/utilities'],
                                                            'supabase-vendor': ['@supabase/supabase-js'],
                                                            // NOTE(v3): ai-vendor intentionally kept small - Gemini key must be
                                                            // moved to an Edge Function proxy before V3 goes to wider audience.
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
                                            // Additional V3 compression improvements
                                            pure_funcs: ['console.log', 'console.info', 'console.debug'],
                              },
                  },
        },
        server: {
                  port: 3001,
        },
})
