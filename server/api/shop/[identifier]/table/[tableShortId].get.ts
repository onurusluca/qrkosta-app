import type { Database } from '~/types/database.types'
import { serverSupabaseServiceRole } from '#supabase/server'

type Shop = Database['public']['Tables']['shops']['Row']
type MenuCategory = Database['public']['Tables']['menu_categories']['Row']
type MenuItem = Database['public']['Tables']['menu_items']['Row']
type MenuItemVariant = Database['public']['Tables']['menu_item_variants']['Row']
type TableRow = Database['public']['Tables']['tables']['Row']

function isShortId(id: string) {
  return /^[A-Za-z0-9]{5}$/.test(id)
}

const VISIT_LOG_DELAY_MS = 2000

export default defineEventHandler(async (event) => {
  const identifier = getRouterParam(event, 'identifier')
  const tableShortId = getRouterParam(event, 'tableShortId')
  if (!identifier || !tableShortId) {
    throw createError({ statusCode: 404, statusMessage: 'Not found' })
  }

  const query = getQuery(event)
  const utm_source = typeof query.utm_source === 'string' ? query.utm_source : null
  const visitor_id = typeof query.visitor_id === 'string' ? query.visitor_id : null

  const supabase = serverSupabaseServiceRole(event)

  function scheduleVisit(row: { shop_id: string, table_id: string, path: 'table', identifier: string, visit_type: string, utm_source: string | null, visitor_id: string | null }) {
    setTimeout(() => {
      (supabase as any).from('visits').insert(row).then(() => {}).catch(() => {})
    }, VISIT_LOG_DELAY_MS)
  }

  let shop: Shop | null = null
  if (isShortId(identifier)) {
    const { data: s } = await supabase.from('shops').select('*').eq('short_id', identifier.toUpperCase()).maybeSingle()
    if (!s) throw createError({ statusCode: 404, statusMessage: 'Shop not found' })
    shop = s as Shop
  } else {
    const { data: s } = await supabase.from('shops').select('*').eq('slug', identifier).eq('is_active', true).maybeSingle()
    if (!s) throw createError({ statusCode: 404, statusMessage: 'Shop not found' })
    shop = s as Shop
  }

  const { data: table, error: tableError } = await supabase
    .from('tables')
    .select('*')
    .eq('shop_id', shop.id)
    .eq('short_id', tableShortId.toUpperCase())
    .eq('is_active', true)
    .maybeSingle()

  if (tableError || !table) {
    throw createError({ statusCode: 404, statusMessage: 'Table not found' })
  }

  const { data: sessionId, error: rpcError } = await supabase.rpc('get_or_create_session', {
    p_shop_id: shop.id,
    p_table_id: table.id
  })

  if (rpcError || !sessionId) {
    throw createError({ statusCode: 500, statusMessage: 'Failed to get session' })
  }

  const { data: menu } = await supabase
    .from('menus')
    .select('*')
    .eq('shop_id', shop.id)
    .eq('is_active', true)
    .order('sort_order', { ascending: true, nullsFirst: false })
    .limit(1)
    .maybeSingle()

  let categories: MenuCategory[] = []
  let items: MenuItem[] = []
  let variants: MenuItemVariant[] = []

  if (menu) {
    const { data: cats } = await supabase
      .from('menu_categories')
      .select('*')
      .eq('menu_id', menu.id)
      .eq('is_visible', true)
      .order('sort_order', { ascending: true, nullsFirst: false })
      .order('created_at', { ascending: true })
    categories = (cats ?? []) as MenuCategory[]

    const categoryIds = categories.map(c => c.id)
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
  }

  const visit_type = isShortId(identifier) ? 'redirect' : (utm_source === 'qr-code' ? 'qr' : 'direct')
  scheduleVisit({ shop_id: shop.id, table_id: table.id, path: 'table', identifier, visit_type, utm_source, visitor_id })

  return {
    shop: shop as Shop,
    table: table as TableRow,
    sessionId: sessionId as string,
    categories,
    items,
    variants
  }
})
