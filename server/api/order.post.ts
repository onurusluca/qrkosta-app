import { serverSupabaseServiceRole } from '#supabase/server'

type Body = {
  session_id: string
  table_id: string
  shop_id: string
  items: Array<{ menu_item_id: string, quantity: number, notes?: string }>
}

export default defineEventHandler(async (event) => {
  const body = await readBody<Body>(event)
  if (!body?.session_id || !body?.table_id || !body?.shop_id || !Array.isArray(body.items) || body.items.length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid request' })
  }

  const supabase = serverSupabaseServiceRole(event)

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      shop_id: body.shop_id,
      table_id: body.table_id,
      session_id: body.session_id,
      status: 'pending'
    })
    .select('id')
    .single()

  if (orderError || !order) {
    throw createError({ statusCode: 500, statusMessage: 'Failed to create order' })
  }

  const orderItems = body.items.map((item) => ({
    order_id: order.id,
    menu_item_id: item.menu_item_id,
    quantity: Math.max(1, Math.min(99, item.quantity)),
    notes: item.notes ?? null
  }))

  const { error: itemsError } = await supabase.from('order_items').insert(orderItems)
  if (itemsError) {
    await supabase.from('orders').delete().eq('id', order.id)
    throw createError({ statusCode: 500, statusMessage: 'Failed to add items' })
  }

  return { orderId: order.id }
})
