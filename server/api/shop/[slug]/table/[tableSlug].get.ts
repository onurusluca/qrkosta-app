import { serverSupabaseClient } from '#supabase/server'

const SHORT_ID_REGEX = /^[A-Za-z0-9]{4,6}$/

/** Table by shop slug/short_id and table short_id */
export default defineEventHandler(async (event) => {
  const slugParam = getRouterParam(event, 'slug')
  const tableSlug = getRouterParam(event, 'tableSlug')
  if (!slugParam || slugParam === 's' || !tableSlug) {
    throw createError({ statusCode: 400, message: 'Shop and table are required' })
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

  const { data: table, error } = await supabase
    .from('tables')
    .select('id, short_id, table_number, shop_id, is_active')
    .eq('shop_id', shopId)
    .eq('short_id', tableSlug)
    .eq('is_active', true)
    .maybeSingle()

  if (error) throw createError({ statusCode: 500, message: error.message })
  if (!table) throw createError({ statusCode: 404, message: 'Table not found' })

  return table
})
