// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ['@nuxt/eslint', '@nuxt/ui', '@nuxt/image', '@nuxtjs/i18n', '@nuxtjs/supabase'],

  devtools: {
    enabled: false
  },

  css: ['~/assets/css/main.css'],
  ui: { colorMode: false },

  runtimeConfig: {
    public: {
      SUPABASE_URL: process.env.SUPABASE_URL,
      SUPABASE_KEY: process.env.SUPABASE_KEY
    }
  },

  routeRules: {
    '/**': { ssr: true }
  },

  compatibilityDate: '2025-01-15',

  nitro: {
    preset: 'cloudflare_module'
  },

  vite: {
    optimizeDeps: {
      // Pre-bundle these dependencies for faster dev server startup
      include: [
        'prosemirror-state',
        'prosemirror-transform',
        'prosemirror-model',
        'prosemirror-view',
        'prosemirror-gapcursor',
        '@supabase/postgrest-js',
        '@supabase/supabase-js',
        'prismjs'
      ]
    }
  },

  telemetry: {
    enabled: false
  },

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

  icon: {
    customCollections: [
      {
        prefix: 'custom',
        dir: './app/assets/icons'
      }
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
