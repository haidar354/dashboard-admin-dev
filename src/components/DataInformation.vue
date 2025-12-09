<script setup lang="ts">
import dayjs from 'dayjs'

import type { Editor } from '@/types/models/user'

defineProps<{
  createdAt: string | null
  createdBy?: Editor | null
  updatedAt: string | null
  updatedBy?: Editor | null
}>()
</script>

<template>
  <VRow>
    <VCol cols="12">
      <div class="d-flex my-auto">
        <div class="font-weight-bold no-wrap-text">
          Informasi Data
        </div>
        <VDivider
          class="ms-3 my-auto"
          thickness="1"
        />
      </div>
    </VCol>
    <VCol
      v-if="createdBy"
      cols="12"
      md="6"
    >
      <label for="">Ditambah Oleh</label>
      <VTextField
        :value="createdBy?.email || '-'"
        readonly
      />
    </VCol>
    <VCol
      cols="12"
      md="6"
    >
      <label for="">Ditambah Pada</label>
      <VTextField
        :value="createdAt ? dayjs(createdAt).format('DD-MM-YYYY HH:mm') : '-'"
        readonly
      />
    </VCol>
    <VCol
      v-if="updatedBy"
      cols="12"
      md="6"
    >
      <label for="">Diedit Oleh</label>
      <VTextField
        :value="updatedBy?.email || '-'"
        readonly
      />
    </VCol>
    <VCol
      v-if="updatedAt"
      cols="12"
      md="6"
    >
      <label for="">Diedit Pada</label>
      <VTextField
        :value="updatedAt ? dayjs(updatedAt).format('DD-MM-YYYY HH:mm') : '-'"
        readonly
      />
    </VCol>
  </VRow>
</template>

<style lang="scss" scoped>
.no-wrap-text {
  /* Prevents text from wrapping */
  flex-shrink: 0;
  white-space: nowrap;

  /* Prevents the text from shrinking */
}
</style>
