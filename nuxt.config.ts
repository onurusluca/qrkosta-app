// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ['@nuxt/eslint', '@nuxt/ui', '@nuxt/image', '@nuxtjs/i18n', '@nuxtjs/supabase'],

  devtools: {
    enabled: false
  },

  css: ['~/assets/css/main.css'],
  ui: { colorMode: false },

  routeRules: {
    '/**': { ssr: true }
  },

  compatibilityDate: '2025-01-15',

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  },

  i18n: {
    defaultLocale: 'en',
    strategy: 'no_prefix',
    langDir: 'locales',
    locales: [
      { code: 'en', name: 'English', file: 'en.json' },
      { code: 'ja', name: '日本語', file: 'ja.json' }
    ]
  },

  image: {
    quality: 80,
    bunny: {
      baseURL: 'https://qrkosta.b-cdn.net'
    }
  },

  supabase: {
    redirect: false
  }
})
