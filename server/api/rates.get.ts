/**
 * Live JPY rates. Primary: Frankfurter (free, no key).
 * Fallback: open.er-api.com (free, no key, has TWD and more).
 * Cache 1 hour.
 */
const FRANKFURTER_URL = 'https://api.frankfurter.dev/v1/latest?base=JPY'
const OPEN_ER_API_URL = 'https://open.er-api.com/v6/latest/JPY'

async function fetchFrankfurter(): Promise<{ rates: Record<string, number>, date: string } | null> {
  const response = await fetch(FRANKFURTER_URL)
  if (!response.ok) return null
  const data = (await response.json()) as { base: string, date: string, rates: Record<string, number> }
  return { rates: { JPY: 1, ...data.rates }, date: data.date }
}

async function fetchOpenErApi(): Promise<{ rates: Record<string, number>, date: string } | null> {
  const response = await fetch(OPEN_ER_API_URL)
  if (!response.ok) return null
  const data = (await response.json()) as { result: string, rates: Record<string, number>, time_last_update_utc: string }
  if (data.result !== 'success' || !data.rates) return null
  return { rates: data.rates, date: data.time_last_update_utc }
}

const NEEDED = ['JPY', 'USD', 'CNY', 'KRW', 'TWD', 'HKD', 'THB', 'AUD', 'SGD', 'GBP', 'EUR']

function hasMissing(rates: Record<string, number>): boolean {
  return NEEDED.some(code => rates[code] == null)
}

export default defineEventHandler(async (event) => {
  const primary = await fetchFrankfurter()
  if (primary && !hasMissing(primary.rates)) {
    setHeader(event, 'Cache-Control', 'public, max-age=3600, s-maxage=3600')
    return { rates: primary.rates, date: primary.date }
  }
  const fallback = await fetchOpenErApi()
  if (!fallback?.rates) {
    throw createError({ statusCode: 502, statusMessage: 'Rates unavailable' })
  }
  const rates: Record<string, number> = primary
    ? { ...primary.rates }
    : { ...fallback.rates }
  for (const code of NEEDED) {
    if (rates[code] == null && fallback.rates[code] != null) {
      rates[code] = fallback.rates[code]
    }
  }
  setHeader(event, 'Cache-Control', 'public, max-age=3600, s-maxage=3600')
  return { rates, date: (primary ?? fallback).date }
})
