import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// 5173: el origen que el servidor permite por defecto (Grafana usa el 3000)
export default defineConfig({
  plugins: [react()],
  server: { port: 5173 },
});
