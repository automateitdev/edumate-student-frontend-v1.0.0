// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    typescript: false,

    vite: {
        // server: {
        //     hmr: {
        //         clientPort: 3000
        //     }
        // },
        css: {
            preprocessorOptions: {
                scss: {
                    api: 'modern-compiler', // Adding the SCSS preprocessor option
                },
            },
        }
    },

    alias: {
        'quill': process.dev ? 'quill/dist/quill.js' : 'quill'
    },

    app: {
        head: {
            title: 'Payment Portal',
          link: [
              { rel: 'icon', type: 'image/x-icon', href: `/academy.ico` },
                {
                    id: 'theme-css',
                    rel: 'stylesheet',
                    type: 'text/css',
                    href: '/themes/aura-light-green-custom/theme.css'
                },
                { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
                { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&family=Noto+Sans+Arabic:wght@400;500;600;700&display=swap' }
            ]
        }
    },

    modules: ['nuxt-primevue', '@pinia/nuxt', 'pinia-plugin-persistedstate/nuxt', '@nuxt/image', '@nuxtjs/i18n'],

    // English, Bangla and Arabic. No URL prefixes: the choice is kept in the
    // edumate_locale cookie, first visits follow the browser language.
    i18n: {
        strategy: 'no_prefix',
        defaultLocale: 'en',
        lazy: true,
        langDir: 'locales',
        vueI18n: './i18n.config.js',
        locales: [
            { code: 'en', language: 'en-US', name: 'English', file: 'en.js', dir: 'ltr' },
            { code: 'bn', language: 'bn-BD', name: 'বাংলা', file: 'bn.js', dir: 'ltr' },
            { code: 'ar', language: 'ar', name: 'العربية', file: 'ar.js', dir: 'rtl' }
        ],
        detectBrowserLanguage: {
            useCookie: true,
            cookieKey: 'edumate_locale',
            redirectOn: 'root',
            fallbackLocale: 'en'
        }
    },

    primevue: {
        options: { ripple: true },
        components: {
            exclude: ['Editor']
        }
    },

    image: {
        inject: true,
        quality: 80,
        formats: ['webp', 'jpg', 'png', 'avif'],
    },

    build: {
        transpile: ['primevue']
    },

    script: [
        {
            strategy: 'lazyOnload',
            src: 'https://www.googletagmanager.com/gtag/js?id=UA-93461466-1'
        },
        {
            id: 'ga-analytics',
            strategy: 'lazyOnload',
            children: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'UA-93461466-1');
          `
        }
    ],

    hooks: {
        'pages:extend'(pages) {
            function setMiddleware(pages) {
                const pagesToApplyMiddleware = [
                    '',
                    '/',
                    '/users',
                    '/wallets',
                    '/wallets/add',
                    '/wallets/mapping',
                    '/Institutes',
                    '/Institutes/create',
                    'Institutes/admission/setup',
                    '/transactions',
                    '/reports',
                    '/global',
                    '/global/categories',
                    '/global/subjects',
                    '/reversal',
                    '/reversal/requests',
                    '/users/roles',
                    '/users/permissions',
                    '/payments/ssl',
                    '/payments/spg',
                ];

                function applyMiddlewareRecursively(pages) {
                    // console.log(pages)
                    for (const page of pages) {
                        if (pagesToApplyMiddleware.includes(page.path)) {
                            page.meta = page.meta || {};
                            page.meta.middleware = ['auth-required'];
                        }

                        if (page.children) {
                            applyMiddlewareRecursively(page.children);
                        }
                    }
                }

                applyMiddlewareRecursively(pages);
            }

            setMiddleware(pages);
        }
    },

    runtimeConfig: {
        public: {
            BASE_URL: process.env.BASE_URL,
            API_BASE_URL: process.env.API_BASE_URL,
            FRONTEND_URL: process.env.FRONTEND_URL,
        },
    },

    plugins: ['~/plugins/axios.js', '~/plugins/i18n-bridge.js'],

    pinia: {
        autoImports: ['defineStore'],
        imports: {
            dirs: ['./stores']
        }
    },

    imports: {
        dirs: ['composables', 'composables/**']
    },

    css: ['primeicons/primeicons.css', 'primeflex/primeflex.scss', 'primevue/resources/primevue.min.css', '@/assets/styles.scss', '@/assets/rtl.scss'],
    compatibilityDate: '2024-10-07',
    ssr: false
});