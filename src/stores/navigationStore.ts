import { defineStore } from 'pinia'
import type { VerticalNavItems } from '@/@layouts/types'
import type { Module } from '@/types/utils'

export const useNavigationStore = defineStore('navigationStore', {
  state: () => ({
    navigation: [] as VerticalNavItems,
    activeModule: {
      name: 'Produk',
      icon: 'tabler-box',
      value: 'product',
      status: 'active',
      redirect: '/dashboards/product',
    } as Module,
  }),
  getters: {
    getNavigation: state => state.navigation,
    getActiveModuleValue: state => state.activeModule.value,
  },
  actions: {
    setNavigation(navigation: VerticalNavItems) {
      this.navigation = navigation
    },
    setActiveModule(module: Module) {
      this.activeModule = module
    },
    resetActiveModule() {
      this.activeModule = {
        name: 'Produk',
        icon: 'tabler-box',
        value: 'product',
        status: 'active',
        redirect: '/dashboards/product',
      } as Module
    },
  },
  persist: true,
})
