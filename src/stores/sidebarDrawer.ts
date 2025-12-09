import { defineStore } from "pinia";

export const useSidebarDrawerStore = defineStore("sidebarDrawer", {
  state: () => ({
    isOpen: false,
  }),
  actions: {
    toggle() {
      this.isOpen = !this.isOpen;
    },
    reset() {
      this.isOpen = false;
    },
  },
});
