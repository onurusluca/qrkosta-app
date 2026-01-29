/**
 * Top 10 currencies from top 10 countries by tourist arrivals to Japan.
 * DB amounts are in JPY. Rates from /api/rates (Frankfurter + open.er-api.com fallback).
 */
export const CURRENCIES = [
  'JPY',
  'USD', // United States
  'CNY', // China
  'KRW', // South Korea
  'TWD', // Taiwan
  'HKD', // Hong Kong
  'THB', // Thailand
  'AUD', // Australia
  'SGD', // Singapore
  'GBP', // United Kingdom
  'EUR' // Euro
] as const
export type Currency = (typeof CURRENCIES)[number]

const BASE_ONLY: Record<Currency, number> = { JPY: 1 } as Record<Currency, number>

export function useCurrency() {
  const currency = useCookie<Currency>('currency', {
    default: () => 'JPY',
    maxAge: 60 * 60 * 24 * 365
  })

  const { data: ratesData } = useAsyncData(
    'currency-rates',
    () => $fetch<{ rates: Record<string, number>, date: string }>('/api/rates'),
    { server: true, lazy: true }
  )

  const rates = computed(() => {
    const r = ratesData.value?.rates
    if (!r) return BASE_ONLY
    return { JPY: 1, ...r } as Record<Currency, number>
  })

  function setCurrency(value: Currency) {
    currency.value = value
  }

  /** Format amount stored in JPY into selected currency. No static rates; missing rate => show as JPY. */
  function formatPrice(amountInJPY: number): string {
    const code = currency.value ?? 'JPY'
    const rate = rates.value[code] ?? 1
    const amount = amountInJPY * rate
    const noDecimals = ['JPY', 'KRW', 'VND', 'IDR'].includes(code)
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: code,
      maximumFractionDigits: noDecimals ? 0 : 2,
      minimumFractionDigits: noDecimals ? 0 : undefined
    }).format(amount)
  }

  return { currency, setCurrency, formatPrice, CURRENCIES, rates, ratesDate: computed(() => ratesData.value?.date) }
}
