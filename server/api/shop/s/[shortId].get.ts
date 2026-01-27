import { serverSupabaseClient } from '#supabase/server'

/** Shop by short_id (from QR /s/{shortId}) */
export default defineEventHandler(async (event) => {
  const shortId = getRouterParam(event, 'shortId')
  if (!shortId) {
    throw createError({ statusCode: 400, message: 'short_id is required' })
  }

  const supabase = await serverSupabaseClient(event)
  const { data: shop, error } = await supabase
    .from('shops')
    .select('id, short_id, slug, name, logo_url, shop_type, brand_color, theme_settings, languages, settings')
    .eq('short_id', shortId)
    .eq('is_active', true)
    .single()

  if (error || !shop) {
    throw createError({ statusCode: 404, message: 'Shop not found' })
  }
  return shop
})
