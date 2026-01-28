/** Hit GET /api/debug-env on production to see if Worker has Build env at runtime. */
export default defineEventHandler(() => ({
  hasSupabaseUrl: Boolean(process.env.SUPABASE_URL),
  hasSupabaseKey: Boolean(process.env.SUPABASE_KEY)
}))
