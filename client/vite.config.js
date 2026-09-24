import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/shadowtourpackage/', // Replace with your exact GitHub repository name
})