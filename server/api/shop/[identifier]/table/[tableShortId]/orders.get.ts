import type { Database } from '~/types/database.types'
import { serverSupabaseServiceRole } from '#supabase/server'

type OrderRow = Database['public']['Tables']['orders']['Row']
type OrderItemRow = Database['public']['Tables']['order_items']['Row'] & {
  menu_items: { name: Database['public']['Tables']['menu_items']['Row']['name'] } | null
}
type OrderWithItems = OrderRow & {
  order_items: OrderItemRow[]
}

function isShortId(id: string) {
  return /^[A-Za-z0-9]{5}$/.test(id)
}

export default defineEventHandler(async (event) => {
  const identifier = getRouterParam(event, 'identifier')
  const tableShortId = getRouterParam(event, 'tableShortId')
  if (!identifier || !tableShortId) {
    throw createError({ statusCode: 404, statusMessage: 'Not found' })
  }

  const supabase = serverSupabaseServiceRole(event)

  let shop: { id: string } | null = null
  if (isShortId(identifier)) {
    const { data: s } = await supabase.from('shops').select('id').eq('short_id', identifier.toUpperCase()).maybeSingle()
    if (!s) throw createError({ statusCode: 404, statusMessage: 'Shop not found' })
    shop = s
  } else {
    const { data: s } = await supabase.from('shops').select('id').eq('slug', identifier).eq('is_active', true).maybeSingle()
    if (!s) throw createError({ statusCode: 404, statusMessage: 'Shop not found' })
    shop = s
  }

  const { data: table, error: tableError } = await supabase
    .from('tables')
    .select('id')
    .eq('shop_id', shop.id)
    .eq('short_id', tableShortId.toUpperCase())
    .eq('is_active', true)
    .maybeSingle()

  if (tableError || !table) {
    throw createError({ statusCode: 404, statusMessage: 'Table not found' })
  }

  const { data: orders, error: ordersError } = await supabase
    .from('orders')
    .select(`
      id,
      session_id,
      created_at,
      total_amount,
      status,
      order_items (
        id,
        quantity,
        menu_item_id,
        menu_items ( name )
      )
    `)
    .eq('table_id', table.id)
    .order('created_at', { ascending: false })

  if (ordersError) {
    throw createError({ statusCode: 500, statusMessage: 'Failed to fetch orders' })
  }

  return { orders: (orders ?? []) as OrderWithItems[] }
})
