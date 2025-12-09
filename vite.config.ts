import VueI18nPlugin from '@intlify/unplugin-vue-i18n/vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import { fileURLToPath } from 'node:url'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { VueRouterAutoImports, getPascalCaseRouteName } from 'unplugin-vue-router'
import VueRouter from 'unplugin-vue-router/vite'
import { defineConfig } from 'vite'
import VueDevTools from 'vite-plugin-vue-devtools'
import MetaLayouts from 'vite-plugin-vue-meta-layouts'
import vuetify from 'vite-plugin-vuetify'
import svgLoader from 'vite-svg-loader'

export default defineConfig({
  plugins: [
    VueRouter({
      getRouteName: routeNode => {
        return getPascalCaseRouteName(routeNode)
          .replace(/([a-z\d])([A-Z])/g, '$1-$2')
          .toLowerCase()
      },
      beforeWriteFiles: () => {},
    }),
    vue({
      template: {
        compilerOptions: {
          isCustomElement: tag => tag === 'swiper-container' || tag === 'swiper-slide',
        },
      },
    }),
    VueDevTools(),
    vueJsx(),
    vuetify({
      styles: {
        configFile: 'src/assets/styles/variables/_vuetify.scss',
      },
    }),
    MetaLayouts({
      target: './src/layouts',
      defaultLayout: 'default',
    }),
    Components({
      dirs: ['src/@core/components', 'src/views/demos', 'src/components', 'src/@core/components/dialogs'],
      dts: true,
      resolvers: [
        componentName => {
          if (componentName === 'VueApexCharts')
            return { name: 'default', from: 'vue3-apexcharts', as: 'VueApexCharts' }
        },
      ],
    }),
    AutoImport({
      imports: [
        'vue',
        VueRouterAutoImports,
        '@vueuse/core',
        '@vueuse/math',
        'vue-i18n',
        'pinia',
        // 👇 TAMBAHKAN MANUAL IMPORTS UNTUK API
        {
          '@/utils/api': [
            '$rootAPI',
            '$hrAPI',
            '$globalAPI',
            '$inventoryAPI',
            '$orgAPI',
            '$productAPI',
            '$publicAPI',
            '$purchaseAPI',
            '$salesAPI',
            '$settingAPI',
            'createAPIClient',
            'getPendingRequestsCount',
            'isTokenRefreshing',
            'resetRetryAttempts',
          ],
          '@/utils/api-axios': [
            '$rootAPIx',
            '$hrAPIx',
            '$globalAPIx',
            '$inventoryAPIx',
            '$orgAPIx',
            '$productAPIx',
            '$publicAPIx',
            '$purchaseAPIx',
            '$salesAPIx',
            '$settingAPIx',
            'createAxiosClient',
          ],
        },
      ],
      dirs: [
        './src/@core/utils',
        './src/@core/composable/',
        './src/composables/',
        './src/utils/**',  // 👈 Gunakan ** untuk scan semua subfolder
        './src/plugins/*/composables/*',
        'src/@core/components/app-form-elements',
      ],
      vueTemplate: true,
      dts: true,
      eslintrc: {
        enabled: true,
        filepath: './.eslintrc-auto-import.json',
        globalsPropValue: true,
      },
      include: [
        /\.[tj]sx?$/,
        /\.vue$/,
        /\.vue\?vue/,
        /\.md$/,
      ],
      defaultExportByFilename: false,
      injectAtEnd: true,
      ignore: ['useCookies', 'useStorage'],
    }),
    VueI18nPlugin({
      runtimeOnly: true,
      compositionOnly: true,
      include: [
        fileURLToPath(new URL('./src/plugins/i18n/locales/**', import.meta.url)),
      ],
    }),
    svgLoader(),
  ],
  define: { 'process.env': {} },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@themeConfig': fileURLToPath(new URL('./themeConfig.ts', import.meta.url)),
      '@core': fileURLToPath(new URL('./src/@core', import.meta.url)),
      '@layouts': fileURLToPath(new URL('./src/@layouts', import.meta.url)),
      '@images': fileURLToPath(new URL('./src/assets/images/', import.meta.url)),
      '@styles': fileURLToPath(new URL('./src/assets/styles/', import.meta.url)),
      '@configured-variables': fileURLToPath(new URL('./src/assets/styles/variables/_template.scss', import.meta.url)),
      '@db': fileURLToPath(new URL('./src/plugins/fake-api/handlers/', import.meta.url)),
      '@api-utils': fileURLToPath(new URL('./src/plugins/fake-api/utils/', import.meta.url)),
      '@utils': fileURLToPath(new URL('./src/utils/', import.meta.url)),
      '@constants': fileURLToPath(new URL('./src/constants/', import.meta.url)),
      '@model-types': fileURLToPath(new URL('./src/types/models/', import.meta.url)),
    },
  },
  build: {
    chunkSizeWarningLimit: 5000,
  },
  optimizeDeps: {
    exclude: ['vuetify'],
    entries: [
      './src/**/*.vue',
    ],
  },
  esbuild: {
    target: 'esnext',
  },
})
