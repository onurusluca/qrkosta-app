import type { Database } from '~/types/database.types'
import { serverSupabaseServiceRole } from '#supabase/server'

type Shop = Database['public']['Tables']['shops']['Row']
type Menu = Database['public']['Tables']['menus']['Row']
type MenuCategory = Database['public']['Tables']['menu_categories']['Row']
type MenuItem = Database['public']['Tables']['menu_items']['Row']
type MenuItemVariant = Database['public']['Tables']['menu_item_variants']['Row']

/** 5-char alphanumeric = short_id (QR code); otherwise slug */
function isShortId(identifier: string): boolean {
  return /^[A-Za-z0-9]{5}$/.test(identifier)
}

export default defineEventHandler(async (event) => {
  const identifier = getRouterParam(event, 'identifier')
  if (!identifier) {
    throw createError({ statusCode: 404, statusMessage: 'Not found' })
  }

  const supabase = serverSupabaseServiceRole(event)

  if (isShortId(identifier)) {
    const { data: shop, error } = await supabase
      .from('shops')
      .select('slug')
      .eq('short_id', identifier.toUpperCase())
      .maybeSingle()

    if (error) {
      throw createError({ statusCode: 500, statusMessage: 'Failed to resolve shop' })
    }
    if (!shop) {
      throw createError({ statusCode: 404, statusMessage: 'Shop not found' })
    }
    return { slug: shop.slug }
  }

  const { data: shop, error: shopError } = await supabase
    .from('shops')
    .select('*')
    .eq('slug', identifier)
    .eq('is_active', true)
    .maybeSingle()

  if (shopError) {
    throw createError({ statusCode: 500, statusMessage: 'Failed to load shop' })
  }
  if (!shop) {
    throw createError({ statusCode: 404, statusMessage: 'Shop not found' })
  }

  const { data: menu } = await supabase
    .from('menus')
    .select('*')
    .eq('shop_id', shop.id)
    .eq('is_active', true)
    .order('sort_order', { ascending: true, nullsFirst: false })
    .limit(1)
    .maybeSingle()

  if (!menu) {
    return {
      shop: shop as Shop,
      menu: null as Menu | null,
      categories: [] as MenuCategory[],
      items: [] as MenuItem[],
      variants: [] as MenuItemVariant[]
    }
  }

  const { data: categories } = await supabase
    .from('menu_categories')
    .select('*')
    .eq('menu_id', menu.id)
    .eq('is_visible', true)
    .order('sort_order', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: true })

  const categoryIds = (categories ?? []).map(c => c.id)
  let items: MenuItem[] = []
  let variants: MenuItemVariant[] = []

  if (categoryIds.length > 0) {
    const { data: itemsData } = await supabase
      .from('menu_items')
      .select('*')
      .in('category_id', categoryIds)
      .eq('is_available', true)
      .order('sort_order', { ascending: true, nullsFirst: false })
      .order('created_at', { ascending: true })

    items = (itemsData ?? []) as MenuItem[]

    if (items.length > 0) {
      const { data: variantsData } = await supabase
        .from('menu_item_variants')
        .select('*')
        .in('menu_item_id', items.map(i => i.id))
        .order('sort_order', { ascending: true, nullsFirst: false })
      variants = (variantsData ?? []) as MenuItemVariant[]
    }
  }

  return {
    shop: shop as Shop,
    menu: menu as Menu,
    categories: (categories ?? []) as MenuCategory[],
    items,
    variants
  }
})
