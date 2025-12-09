<script lang="ts" setup>
import { defineProps, getCurrentInstance, ref } from 'vue'

import type { MultipleImageUpload } from '@/types/components/fileUpload'

// Define props
const props = defineProps({
  fileType: {
    type: String,
    required: true,
    default: 'image/*',
  },
  subTitle: {
    type: String,
    required: false,
    default: 'Maksimal 5 MB',
  },
  modelValue: {
    type: Array as () => MultipleImageUpload[],
    required: true,
  },
  isLoading: {
    type: Boolean,
    required: false,
    default: false,
  },
  readonly: {
    type: Boolean,
    required: false,
    default: false,
  },
})

// Define emits
const emits = defineEmits(['update:modelValue', 'new-file', 'delete-file'])
const thisInstance = getCurrentInstance()

// Define reactive state
const files = ref(props.modelValue || [])
const fileUpload = ref(null)
const fileUploadModel = ref(null)

// on drag and drop
const onDragOver = (e: any) => {
  e.preventDefault()

  if (!e.currentTarget.classList.contains('bg-primary'))
    e.currentTarget.classList.add('bg-primary')
}

// on drag leave
const onDragLeave = (e: any) => {
  e.preventDefault()

  // Clean up
  e.currentTarget.classList.remove('bg-primary')
}

const onDrop = (e: any) => {
  e.preventDefault()

  // Clean up
  e.currentTarget.classList.remove('bg-primary')
  Array.from<File>(e.dataTransfer.files as FileList).forEach((element: File) => {
    const newFile: MultipleImageUpload = {
      id: undefined,
      file: element,
      url: URL.createObjectURL(element),
    }

    addFile(newFile)
  })
}

// on click
const onClick = () => {
  if (fileUpload.value)
    (fileUpload.value as HTMLInputElement).click()
}

// on file change
const onFileChange = (e: any) => {
  Array.from<File>(e.target.files as FileList).forEach((element: File) => {
    const newFile: MultipleImageUpload = {
      id: undefined,
      file: element,
      url: URL.createObjectURL(element),
    }

    if (thisInstance?.vnode?.props?.onNewFile) {
      addFile(newFile)
    }
    else {
      files.value.push(newFile)
      emits('update:modelValue', files.value)
    }
  })
}

const ellipsis = (text = '', length: number) => {
  if (text === null || text === undefined || text === '')
    return 'Default'
  if (text?.length > length)
    return `${text.substring(0, length)}...`

  return text
}

const addFile = (file: MultipleImageUpload) => {
  emits('new-file', file)
}

const removeFile = (index: number, file: MultipleImageUpload) => {
  if (thisInstance?.vnode?.props?.onDeleteFile) {
    emits('delete-file', index, file)
  }
  else {
    files.value.splice(index, 1)
    emits('update:modelValue', files.value)
  }
  fileUploadModel.value = null
}
</script>

<template>
  <VCard
    class="mt-2 pa-4 d-flex align-stretch justify-center align-center"
    variant="outlined"
  >
    <VRow>
      <VCol
        v-for="(file, index) in files"
        :key="index"
        cols="12"
        sm="4"
        md="3"
        lg="3"
        xl="2"
      >
        <VFadeTransition leave-absolute>
          <VCardItem class="rounded-lg border-secondary border-dash bg-light-primary pa-2">
            <a
              :href="file.url"
              target="_blank"
              rel="noopener noreferrer"
            >
              <VImg
                :src="file.url"
                class="rounded-lg"
                width="100%"
                :aspect-ratio="16 / 9"
              />
            </a>

            <VAlert
              v-if="!props.readonly"
              color="warning"
              variant="tonal"
              class="text-center px-1 mt-4"
            >
              <div class="align-center">
                <div class="text-sm">
                  {{ file.file ? ellipsis((file.file as File).name, 17) : ellipsis(file.url, 17) }}
                </div>

                <VBtn
                  color="error"
                  size="small"
                  class="text-white"
                  @click="removeFile(index, file)"
                >
                  <VIcon
                    icon="tabler-trash"
                    size="small"
                  />
                  Hapus
                </VBtn>
              </div>
            </VAlert>
          </VCardItem>
        </VFadeTransition>
      </VCol>
      <VCol
        v-if="(files?.length || 0) <= 10 && !props.readonly"
        cols="12"
        sm="4"
        md="3"
        lg="3"
        xl="2"
      >
        <VCard
          class="dropzone d-flex flex-column pa-2 ma-0 bg-light-primary"
          style="block-size: unset"
          @dragover="onDragOver"
          @dragleave="onDragLeave"
          @drop="onDrop"
          @click="onClick"
        >
          <VCardItem class="rounded-lg border-dashed">
            <VImg
              class="rounded-lg mb-4"
              width="200"
              :aspect-ratio="16 / 9"
            >
              <template v-if="!isLoading">
                <VFileInput
                  v-show="false"
                  ref="fileUpload"
                  v-model="fileUploadModel"
                  :accept="props.fileType"
                  hidden
                  multiple
                  @change="onFileChange"
                />
                <div class="text-center">
                  <VBtn
                    color="primary"
                    variant="tonal"
                    icon="tabler-photo-plus"
                    size="x-large"
                  />
                  <div class="mt-3">
                    Tambahkan Foto
                  </div>
                  <div>({{ subTitle }})</div>
                </div>
              </template>
              <div
                v-else
                class="text-center pt-3"
              >
                <VProgressCircular
                  color="primary"
                  indeterminate
                />
              </div>
            </VImg>
          </VCardItem>
        </VCard>
      </VCol>
    </VRow>
  </VCard>
</template>

<style>
.player-enter,
.player-leave-to {
  opacity: 0;
}

.player-enter {
  transform: translateY(30%);
}

.player-leave-to {
  transform: translateX(300%);
}

.player-leave-active {
  position: absolute;
}
</style>
