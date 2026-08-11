import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

const dirname = import.meta.dirname ?? path.dirname(new URL(import.meta.url).pathname)

// GitHub Pages deploys under /<repo-name>/ — set VITE_BASE at build time if repo name differs.
export default defineConfig({
  base: process.env.VITE_BASE ?? '/devops-university/',
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg'],
      manifest: {
        name: 'Visual DevOps University',
        short_name: 'DevOps University',
        description: 'Interactive, animated DevOps learning: Docker, Kubernetes, Helm, Terraform, Ansible, Jenkins, ArgoCD, AWS.',
        theme_color: '#05070d',
        background_color: '#05070d',
        display: 'standalone',
        icons: [{ src: 'icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any maskable' }],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg}'],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    // Route-level code splitting is already in place (src/modules/registry.ts
    // lazy-loads each topic). Vendor chunking to revisit once reactflow/mermaid
    // are actually wired into a module — no point splitting unused code.
    chunkSizeWarningLimit: 1000,
  },
})
