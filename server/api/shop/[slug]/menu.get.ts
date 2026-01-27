import { serverSupabaseClient } from '#supabase/server'

const SHORT_ID_REGEX = /^[A-Za-z0-9]{4,6}$/

/** Menu (categories + items) for shop by slug or short_id */
export default defineEventHandler(async (event) => {
  const param = getRouterParam(event, 'slug')
  if (!param || param === 's') {
    throw createError({ statusCode: 400, message: 'Slug or short_id is required' })
  }

  const supabase = await serverSupabaseClient(event)

  const { data: bySlug } = await supabase
    .from('shops')
    .select('id')
    .eq('slug', param)
    .eq('is_active', true)
    .maybeSingle()
  let shopId: string | null = bySlug?.id ?? null
  if (!shopId && SHORT_ID_REGEX.test(param)) {
    const { data: byShort } = await supabase
      .from('shops')
      .select('id')
      .eq('short_id', param)
      .eq('is_active', true)
      .maybeSingle()
    shopId = byShort?.id ?? null
  }
  if (!shopId) throw createError({ statusCode: 404, message: 'Shop not found' })

  const { data: menu } = await supabase
    .from('menus')
    .select('id')
    .eq('shop_id', shopId)
    .eq('is_active', true)
    .order('sort_order', { ascending: true })
    .limit(1)
    .maybeSingle()

  if (!menu) {
    return { categories: [], items: [] }
  }

  const { data: categories } = await supabase
    .from('menu_categories')
    .select('id, name, sort_order')
    .eq('menu_id', menu.id)
    .eq('is_visible', true)
    .order('sort_order', { ascending: true })

  const { data: items } = await supabase
    .from('menu_items')
    .select('id, category_id, name, description, price, discount_price, photo_urls, sort_order')
    .eq('shop_id', shopId)
    .eq('is_available', true)
    .order('sort_order', { ascending: true })

  return { categories: categories ?? [], items: items ?? [] }
})
