<script lang="ts" setup>
import { computed, defineProps, getCurrentInstance, ref } from 'vue'
import { useImageUploader } from '@/composables/product/useImageUploader'
import type { ItemImage } from '@/types/models/product/item-image'

// ==== Pending (lokal) ====
type PendingStatus = 'uploading' | 'error'
interface PendingEntry {
  tempId: string
  file: File
  name: string
  objectUrl: string
  progress: number
  status: PendingStatus
  error?: string
}

interface ServerCard {
  kind: 'server'
  key: string
  url: string
  name: string
  idx: number
  img: ItemImage
}

interface PendingCard {
  kind: 'pending'
  key: string
  url: string
  name: string
  p: PendingEntry
}

type UploaderFn = (
  file: File,
  extra?: Record<string, any>,
  onProgress?: (p: number) => void
) => Promise<ItemImage>

type Card = ServerCard | PendingCard

// ==== Props ====
const props = defineProps({
  modelValue: {
    type: Array as () => ItemImage[],
    required: false,
    default: () => [],
  },
  uploader: {
    // (file, extra?, onProgress?) => Promise<ItemImage>
    type: Function as unknown as () => UploaderFn,
    required: false,
  },
  fileType: { type: String, default: 'image/*' },
  subTitle: { type: String, default: 'Maksimal 2 MB' },
  readonly: { type: Boolean, default: false },
  isLoading: { type: Boolean, default: false },
  uploadBatchId: { type: String, default: undefined },
  maxFiles: { type: Number, default: 5 },
  maxSizeMb: { type: Number, default: 2 },
  resolveUrl: {
    type: Function as unknown as () => (img: ItemImage) => string,
    default: (img: ItemImage) => img.imageUrlOriginal ?? img.imageKeyMedium ?? img.imageKeySmall ?? img.imageKeyOriginal,
  },
})

// ==== Emits ====
const emits = defineEmits<{
  (e: 'update:modelValue', v: ItemImage[]): void
  (e: 'newFile', server: ItemImage): void
  (e: 'deleteFile', index: number, file: ItemImage): void
  (e: 'uploadError', err: unknown): void
}>()

const thisInstance = getCurrentInstance()

const { uploadItemImage } = useImageUploader()

const effectiveUploader: UploaderFn = (file, extra, onProgress) =>
  (props.uploader ?? uploadItemImage)(file, extra, onProgress)

// ==== State lokal ====
const pending = ref<PendingEntry[]>([])
const fileInput = ref<HTMLInputElement | null>(null)
const fileInputModel = ref<File[] | null>(null)

// daftar gabungan untuk ditampilkan (server dulu, lalu pending)
const cards = computed<Card[]>(() => {
  const serverCards: ServerCard[] = (props.modelValue || []).map((img, idx) => ({
    kind: 'server',
    key: img.itemImageId ?? `server-${idx}`,
    url: props.resolveUrl(img),
    name: img.title ?? img.itemImageId ?? 'image',
    idx,
    img,
  }))

  const pendingCards: PendingCard[] = pending.value.map(p => ({
    kind: 'pending',
    key: p.tempId,
    url: p.objectUrl,
    name: p.name,
    p,
  }))

  return [...serverCards, ...pendingCards]
})

// ==== Helpers ====

const revoke = (p?: PendingEntry) => {
  if (p?.objectUrl)
    URL.revokeObjectURL(p.objectUrl)
}

// ==== DnD / input ====
function onDragOver(e: DragEvent) {
  e.preventDefault();
  (e.currentTarget as HTMLElement)?.classList.add('bg-light-primary')
}
function onDragLeave(e: DragEvent) {
  e.preventDefault();
  (e.currentTarget as HTMLElement)?.classList.remove('bg-light-primary')
}
function onDrop(e: DragEvent) {
  e.preventDefault();
  (e.currentTarget as HTMLElement)?.classList.remove('bg-light-primary')
  if (props.readonly)
    return
  if (e.dataTransfer?.files)
    processFiles(e.dataTransfer.files)
}
function onClick() {
  if (!props.readonly)
    fileInput.value?.click()
}
function onFileChange(e: Event) {
  if (props.readonly)
    return
  const input = e.target as HTMLInputElement
  if (input.files)
    processFiles(input.files)
  input.value = ''
  fileInputModel.value = null
}

// ==== Proses & upload ====
function processFiles(list: FileList) {
  const current = props.modelValue.length + pending.value.length
  const capacity = Math.max(0, (props.maxFiles ?? Number.POSITIVE_INFINITY) - current)

  const queue = Array.from(list)
  const toUpload = capacity ? queue.slice(0, capacity) : []
  const overflow = queue.slice(toUpload.length)

  // kasih tahu user kalau ada yang kelebihan kuota
  if (overflow.length) {
    overflow.forEach(f =>
      emits('uploadError', new Error(`Maksimal ${props.maxFiles} file. Lewati: ${f.name}`)),
    )
  }

  for (const file of toUpload) {
    // size/type guard kamu di sini...
    const objectUrl = URL.createObjectURL(file)

    const entry = {
      tempId: crypto.randomUUID?.() ?? `${Date.now()}-${Math.random()}`,
      file,
      name: file.name,
      objectUrl,
      progress: 0,
      status: 'uploading' as const,
    }

    pending.value.push(entry)
    uploadOne(entry).catch(console.error)
  }
}

async function uploadOne(entry: PendingEntry) {
  try {
    const img = await effectiveUploader(
      entry.file,
      { uploadBatchId: props.uploadBatchId },
      (p: number) => { entry.progress = p },
    )

    // sukses → keluarkan dari pending, append ke v-model
    const idx = pending.value.findIndex(p => p.tempId === entry.tempId)
    if (idx !== -1) {
      revoke(pending.value[idx])
      pending.value.splice(idx, 1)
    }
    const next = [...props.modelValue, img]

    emits('update:modelValue', next)
    emits('newFile', img)
  }
  catch (err: any) {
    entry.status = 'error'
    entry.error = err?.message ?? 'Upload gagal'
    emits('uploadError', err)
  }
}

// ==== Hapus ====
function removeCard(card: Card) {
  if (card.kind === 'pending') {
    const i = pending.value.findIndex(p => p.tempId === card.p.tempId)
    if (i !== -1) {
      revoke(pending.value[i])
      pending.value.splice(i, 1)
    }
  }
  else {
    if (thisInstance?.vnode?.props?.onDeleteFile) {
      emits('deleteFile', card.idx, card.img)
    }
    else {
      const next = props.modelValue.slice()

      next.splice(card.idx, 1)
      emits('update:modelValue', next)
    }
  }
}
</script>

<template>
  <VCard
    class="mt-2 pa-4"
    variant="outlined"
  >
    <div class="d-flex gap-4 flex-wrap">
      <VCard
        v-for="card in cards"
        :key="card.key"
        :image="card.url"
        class="img-prdct-preview position-relative rounded-lg"
        :href="card.url"
        target="_blank"
        rel="noopener noreferrer"
      >
        <VBtn
          v-if="!readonly"
          icon="tabler-x"
          color="error"
          variant="flat"
          size="small"
          style="position:absolute; top:4px; right:4px; z-index:10;"
          rounded
          aria-label="Hapus gambar"
          @click.stop.prevent="removeCard(card)"
          @mousedown.stop.prevent
          @touchstart.stop.prevent
        />
      </VCard>

      <div v-if="(modelValue.length + pending.length) < maxFiles && !readonly">
        <VCard
          class="dropzone rounded-lg border-dashed"
          variant="outlined"
          role="button"
          tabindex="0"
          @dragover.prevent="onDragOver"
          @dragleave="onDragLeave"
          @drop.prevent="onDrop"
          @click="onClick"
          @keyup.enter="onClick"
          @keyup.space.prevent="onClick"
        >
          <VCardText
            class="d-flex flex-column align-center justify-center text-center py-8"
            style="min-height: 220px;"
          >
            <input
              ref="fileInput"
              type="file"
              hidden
              :accept="fileType"
              multiple
              @change="onFileChange"
            >

            <template v-if="!isLoading">
              <VBtn
                color="primary"
                variant="tonal"
                icon="tabler-photo-plus"
                size="large"
              />
              <div class="mt-3 text-primary font-weight-medium">
                Tambahkan Foto
              </div>
              <div class="text-medium-emphasis text-caption">
                ({{ subTitle }})
              </div>
              <div class="text-disabled text-caption mt-1">
                Seret & lepas, atau klik untuk memilih
              </div>
            </template>

            <template v-else>
              <VProgressCircular
                color="primary"
                indeterminate
                class="mt-2"
              />
              <div class="text-medium-emphasis text-caption mt-2">
                Mengunggah…
              </div>
            </template>
          </VCardText>
        </VCard>
      </div>
    </div>
  </VCard>
</template>

<style>
.player-enter, .player-leave-to { opacity: 0; }
.player-enter { transform: translateY(30%); }
.player-leave-to { transform: translateX(300%); }
.player-leave-active { position: absolute; }

.dropzone, .img-prdct-preview {
  width: 200px!important;
  height: 200px!important;
}

.dropzone {
  border: 2px dashed rgba(var(--v-theme-primary), 0.4);
  transition: border-color .2s ease, background-color .2s ease;
}
.dropzone--active {
  border-color: rgb(var(--v-theme-primary));
  background-color: rgba(var(--v-theme-primary), 0.06);
}
</style>
