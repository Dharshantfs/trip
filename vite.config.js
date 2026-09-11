import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  // Support both VITE_SUPABASE_* and SUPABASE_* (which the user added in Vercel)
  const supabaseUrl = env.VITE_SUPABASE_URL || env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || 'https://sixeivqwdbusqbkxrvdh.supabase.co';
  const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY || env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';

  return {
    plugins: [react()],
    define: {
      'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(supabaseUrl),
      'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(supabaseAnonKey),
      'import.meta.env.SUPABASE_URL': JSON.stringify(supabaseUrl),
      'import.meta.env.SUPABASE_ANON_KEY': JSON.stringify(supabaseAnonKey),
    },
    server: {
      host: true,
      port: 5173
    }
  };
});
