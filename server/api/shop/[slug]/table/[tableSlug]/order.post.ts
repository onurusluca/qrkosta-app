import { serverSupabaseClient } from '#supabase/server'

const SHORT_ID_REGEX = /^[A-Za-z0-9]{4,6}$/

interface OrderItemBody { menu_item_id: string, quantity: number }

/** Create order for table (get/create session, insert order + items) */
export default defineEventHandler(async (event) => {
  const slugParam = getRouterParam(event, 'slug')
  const tableSlug = getRouterParam(event, 'tableSlug')
  if (!slugParam || slugParam === 's' || !tableSlug) {
    throw createError({ statusCode: 400, message: 'Shop and table are required' })
  }

  const body = await readBody<{ items?: OrderItemBody[] }>(event)
  const items = Array.isArray(body?.items) ? body.items : []
  if (items.length === 0) {
    throw createError({ statusCode: 400, message: 'At least one item is required' })
  }
  for (const it of items) {
    if (!it?.menu_item_id || typeof it.quantity !== 'number' || it.quantity < 1) {
      throw createError({ statusCode: 400, message: 'Invalid item: menu_item_id and quantity required' })
    }
  }

  const supabase = await serverSupabaseClient(event)

  const { data: bySlug } = await supabase
    .from('shops')
    .select('id')
    .eq('slug', slugParam)
    .eq('is_active', true)
    .maybeSingle()
  let shopId: string | null = bySlug?.id ?? null
  if (!shopId && SHORT_ID_REGEX.test(slugParam)) {
    const { data: byShort } = await supabase
      .from('shops')
      .select('id')
      .eq('short_id', slugParam)
      .eq('is_active', true)
      .maybeSingle()
    shopId = byShort?.id ?? null
  }
  if (!shopId) throw createError({ statusCode: 404, message: 'Shop not found' })

  const { data: table } = await supabase
    .from('tables')
    .select('id')
    .eq('shop_id', shopId)
    .eq('short_id', tableSlug)
    .eq('is_active', true)
    .maybeSingle()
  if (!table) throw createError({ statusCode: 404, message: 'Table not found' })

  const { data: sessionId, error: rpcErr } = await supabase.rpc('get_or_create_session', {
    p_shop_id: shopId,
    p_table_id: table.id
  })
  if (rpcErr || !sessionId) {
    throw createError({
      statusCode: 500,
      message: rpcErr?.message ?? 'Could not create or get session'
    })
  }

  const { data: order, error: orderErr } = await supabase
    .from('orders')
    .insert({
      session_id: sessionId,
      shop_id: shopId,
      table_id: table.id,
      status: 'pending',
      total_amount: null
    })
    .select('id')
    .single()

  if (orderErr || !order) {
    throw createError({
      statusCode: 500,
      message: orderErr?.message ?? 'Could not create order'
    })
  }

  const orderItemRows = items.map(it => ({
    order_id: order.id,
    menu_item_id: it.menu_item_id,
    quantity: it.quantity,
    status: 'pending'
  }))
  const { error: itemsErr } = await supabase.from('order_items').insert(orderItemRows)
  if (itemsErr) {
    throw createError({ statusCode: 500, message: itemsErr.message })
  }

  return { order_id: order.id, status: 'pending' }
})
