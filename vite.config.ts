import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

const projectId = process.env.VITE_SUPABASE_PROJECT_ID || "zndnwmnfmsxdqisdwnkt";
const fallbackSupabaseUrl = `https://${projectId}.supabase.co`;
const fallbackPublishableKey =
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpuZG53bW5mbXN4ZHFpc2R3bmt0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI4OTcyMjQsImV4cCI6MjA4ODQ3MzIyNH0.ztVSDCoQDAaDfQe0hFyFkxVifCnUhQD_uPGmFLLbkkI";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: {
    "import.meta.env.VITE_SUPABASE_URL": JSON.stringify(process.env.VITE_SUPABASE_URL || fallbackSupabaseUrl),
    "import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY": JSON.stringify(fallbackPublishableKey),
  },
}));
