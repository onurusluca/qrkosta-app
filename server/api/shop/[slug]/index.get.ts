import { serverSupabaseClient } from '#supabase/server'

const SHORT_ID_REGEX = /^[A-Za-z0-9]{4,6}$/

/** Shop by slug or short_id (from link /{slug} or /{shortId}) */
export default defineEventHandler(async (event) => {
  const param = getRouterParam(event, 'slug')
  if (!param || param === 's') {
    throw createError({ statusCode: 400, message: 'Slug or short_id is required' })
  }

  const config = useRuntimeConfig(event)
  console.log('[api/shop] param:', param, 'supabase url set:', !!config.public.supabase?.url)

  const supabase = await serverSupabaseClient(event)
  const select = 'id, short_id, slug, name, logo_url, shop_type, brand_color, theme_settings, languages, settings, address, phone, email, google_maps_url, website_url'

  // Try slug first, then short_id (e.g. 42XLW from QR)
  const { data: bySlug, error: slugError } = await supabase
    .from('shops')
    .select(select)
    .eq('slug', param)
    .eq('is_active', true)
    .maybeSingle()

  console.log('[api/shop] bySlug:', bySlug ? 'found' : 'null', slugError ? `error: ${slugError.message}` : '')

  if (bySlug) return bySlug

  if (SHORT_ID_REGEX.test(param)) {
    const { data: byShortId, error: shortIdError } = await supabase
      .from('shops')
      .select(select)
      .ilike('short_id', param)
      .eq('is_active', true)
      .maybeSingle()

    console.log('[api/shop] byShortId:', byShortId ? 'found' : 'null', shortIdError ? `error: ${shortIdError.message}` : '')

    if (byShortId) return byShortId
  }

  console.log('[api/shop] 404 no shop for param:', param)
  throw createError({ statusCode: 404, message: 'Shop not found' })
})
