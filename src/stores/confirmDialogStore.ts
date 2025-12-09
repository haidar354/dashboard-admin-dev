import { defineStore } from "pinia";

export const useConfirmDialog = defineStore("confirmDialog", {
  state: () => ({
    isDialogVisible: false,
    isLoading: false,
    title: "Apakah Anda Yakin?" as string | undefined,
    subtitle: "Setelah Anda menghapus, Data ini tidak dapat diakses kembali" as
      | string
      | undefined,
    content: "" as string | undefined,
    icon: "tabler-question-circle" as string | undefined,
    resolveFn: null as ((value: boolean) => void) | null, // Define the type of resolveFn
  }),
  actions: {
    openDialog(content?: string, icon?: string) {
      this.content = content;
      if (icon) this.icon = icon;

      this.isDialogVisible = true;

      return new Promise((resolve) => {
        this.resolveFn = resolve; // Assign resolve function to resolveFn
      });
    },
    close(isConfirmed: boolean) {
      this.isDialogVisible = false;
      if (this.resolveFn) {
        this.resolveFn(isConfirmed); // Call the resolve function
        this.resolveFn = null;
      }
    },
  },
});
