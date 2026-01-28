import { serverSupabaseClient } from '#supabase/server'

const SHORT_ID_REGEX = /^[A-Za-z0-9]{4,6}$/

/** Shop by slug or short_id (from link /{slug} or /{shortId}) */
export default defineEventHandler(async (event) => {
  const param = getRouterParam(event, 'slug')
  if (!param || param === 's') {
    throw createError({ statusCode: 400, message: 'Slug or short_id is required' })
  }

  const supabase = await serverSupabaseClient(event)
  const select = 'id, short_id, slug, name, logo_url, shop_type, brand_color, theme_settings, languages, settings, address, phone, email, google_maps_url, website_url'

  // Try slug first, then short_id (e.g. 42XLW from QR)
  const { data: bySlug } = await supabase
    .from('shops')
    .select(select)
    .eq('slug', param)
    .eq('is_active', true)
    .maybeSingle()

  if (bySlug) return bySlug

  if (SHORT_ID_REGEX.test(param)) {
    const { data: byShortId } = await supabase
      .from('shops')
      .select(select)
      .eq('short_id', param)
      .eq('is_active', true)
      .maybeSingle()
    if (byShortId) return byShortId
  }

  throw createError({ statusCode: 404, message: 'Shop not found' })
})
