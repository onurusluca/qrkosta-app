import type { Database } from '~/types/database.types'
import { serverSupabaseServiceRole } from '#supabase/server'

type Shop = Database['public']['Tables']['shops']['Row']
type Menu = Database['public']['Tables']['menus']['Row']

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

    if (error) throw createError({ statusCode: 500, statusMessage: 'Failed to resolve shop' })
    if (!shop) throw createError({ statusCode: 404, statusMessage: 'Shop not found' })
    return { slug: shop.slug }
  }

  const { data: shop, error: shopError } = await supabase
    .from('shops')
    .select('*')
    .eq('slug', identifier)
    .eq('is_active', true)
    .maybeSingle()

  if (shopError) throw createError({ statusCode: 500, statusMessage: 'Failed to load shop' })
  if (!shop) throw createError({ statusCode: 404, statusMessage: 'Shop not found' })

  const { data: menus, error: menusError } = await supabase
    .from('menus')
    .select('id, short_id, name, type, sort_order')
    .eq('shop_id', shop.id)
    .eq('is_active', true)
    .not('short_id', 'is', null)
    .order('sort_order', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: true })

  if (menusError) throw createError({ statusCode: 500, statusMessage: 'Failed to load menus' })

  return {
    shop: shop as Shop,
    menus: (menus ?? []) as Menu[]
  }
})
