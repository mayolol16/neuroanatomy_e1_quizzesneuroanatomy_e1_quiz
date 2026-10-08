import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/neuroanatomy_e1_quizzesneuroanatomy_e1_quiz/',
})
