<script lang="ts" setup>
import { useConfirmDialog } from '@/stores/confirmDialogStore'
import DialogCloseBtn from '@core/components/DialogCloseBtn.vue'
const deleteDialog = useConfirmDialog()

const { isDialogVisible, isLoading, content, icon, title, subtitle } = storeToRefs(deleteDialog)
</script>

<template>
  <VDialog v-model="isDialogVisible" persistent class="v-dialog-sm">
    <DialogCloseBtn @click="deleteDialog.close(false)" />
    <VCard>
      <VCardItem class="d-flex justify-center">
        <VIcon :size="140" :icon="icon" color="warning" />
      </VCardItem>
      <VCardTitle class="text-h4 d-flex justify-center">
        <b>{{ title }}</b>
      </VCardTitle>
      <VCardText class="d-flex justify-center">
        <span v-if="content" class="text-center font-weight-small">
          Setelah Anda menghapus, Data <b>{{ content }}</b> ini tidak dapat diakses kembali
        </span>
        <span v-else class="text-center font-weight-small">
          {{ subtitle }}
        </span>
      </VCardText>
      <VCardText class="d-flex justify-center gap-3 flex-wrap">
        <VBtn color="secondary" variant="outlined" @click="deleteDialog.close(false)">
          Batal
        </VBtn>
        <VBtn :loading="isLoading" color="error" @click="deleteDialog.close(true)">
          Hapus
        </VBtn>
      </VCardText>
    </VCard>
  </VDialog>
</template>
