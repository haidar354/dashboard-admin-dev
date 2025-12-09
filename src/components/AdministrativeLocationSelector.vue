<script setup lang="ts">
import { useAdministrativeStore } from '@/stores/administrativeStore'
import type { City, District, Province, Village } from '@/types/models/administrative'

// 🧱 Props
interface Props {
  modelValue?: string
  provinceCode?: string
  cityCode?: string
  districtCode?: string
  villageCode?: string

  readonly?: boolean
  required?: boolean
  errorMessages?: string | string[]
  label?: string
  placeholder?: string

  // Opsional preselect (edit mode)
  initialProvinceCode?: string
  initialCityCode?: string
  initialDistrictCode?: string
}

interface Emits {
  (e: 'update:modelValue', value: string): void
  (e: 'update:province-code', code: string): void
  (e: 'update:city-code', code: string): void
  (e: 'update:district-code', code: string): void
  (e: 'update:village-code', code: string): void
  (e: 'update:province', province: Province | null): void
  (e: 'update:city', city: City | null): void
  (e: 'update:district', district: District | null): void
  (e: 'update:village', village: Village | null): void
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  readonly: false,
  required: false,
  errorMessages: '',
  label: 'Lokasi Administratif',
  placeholder: 'Pilih lokasi administratif',
})

const emit = defineEmits<Emits>()
const administrativeStore = useAdministrativeStore()

const {
  provinces,
  cities,
  districts,
  villages,
  isLoadingFetchProvinces,
  isLoadingFetchCities,
  isLoadingFetchDistricts,
  isLoadingFetchVillages,
} = storeToRefs(administrativeStore)

// Local reactive state
const selectedProvinceCode = ref('')
const selectedCityCode = ref('')
const selectedDistrictCode = ref('')
const selectedVillageCode = ref('')

// Computed selections
const selectedProvince = computed(() =>
  provinces.value.find(p => p.code === selectedProvinceCode.value) || null,
)

const selectedCity = computed(() =>
  cities.value.find(c => c.code === selectedCityCode.value) || null,
)

const selectedDistrict = computed(() =>
  districts.value.find(d => d.code === selectedDistrictCode.value) || null,
)

const selectedVillage = computed(() =>
  villages.value.find(v => v.code === selectedVillageCode.value) || null,
)

// === Emit Syncers ===
watch(selectedProvinceCode, code => emit('update:province-code', code))
watch(selectedCityCode, code => emit('update:city-code', code))
watch(selectedDistrictCode, code => emit('update:district-code', code))
watch(selectedVillageCode, code => emit('update:village-code', code))

watch(selectedProvince, val => emit('update:province', val))
watch(selectedCity, val => emit('update:city', val))
watch(selectedDistrict, val => emit('update:district', val))
watch(selectedVillage, val => {
  emit('update:village', val)
  emit('update:modelValue', val?.code || '')
})

// === Handlers ===
const onProvinceChange = async (provinceCode: string | null) => {
  selectedProvinceCode.value = provinceCode || ''
  selectedCityCode.value = ''
  selectedDistrictCode.value = ''
  selectedVillageCode.value = ''
  cities.value = []
  districts.value = []
  villages.value = []

  if (provinceCode) {
    await administrativeStore.fetchCity(provinceCode, {
      page: 1, perPage: 99999999, orderField: 'name', orderDirection: 'asc',
    })
  }
}

const onCityChange = async (cityCode: string | null) => {
  selectedCityCode.value = cityCode || ''
  selectedDistrictCode.value = ''
  selectedVillageCode.value = ''
  districts.value = []
  villages.value = []

  if (cityCode) {
    await administrativeStore.fetchDistrict(cityCode, {
      page: 1, perPage: 99999999, orderField: 'name', orderDirection: 'asc',
    })
  }
}

const onDistrictChange = async (districtCode: string | null) => {
  selectedDistrictCode.value = districtCode || ''
  selectedVillageCode.value = ''
  villages.value = []

  if (districtCode) {
    await administrativeStore.fetchVillage(districtCode, {
      page: 1, perPage: 99999999, orderField: 'name', orderDirection: 'asc',
    })
  }
}

const onVillageChange = (villageCode: string | null) => {
  selectedVillageCode.value = villageCode || ''
}

// === Watchers for external model binding ===
watch(() => props.provinceCode, async code => {
  if (code && code !== selectedProvinceCode.value) {
    selectedProvinceCode.value = code
    await administrativeStore.fetchCity(code, { perPage: 99999999, orderField: 'name', orderDirection: 'asc' })
  }
})
watch(() => props.cityCode, async code => {
  if (code && code !== selectedCityCode.value) {
    selectedCityCode.value = code
    await administrativeStore.fetchDistrict(code, { perPage: 99999999, orderField: 'name', orderDirection: 'asc' })
  }
})
watch(() => props.districtCode, async code => {
  if (code && code !== selectedDistrictCode.value) {
    selectedDistrictCode.value = code
    await administrativeStore.fetchVillage(code, { perPage: 99999999, orderField: 'name', orderDirection: 'asc' })
  }
})
watch(() => props.villageCode, code => {
  if (code && code !== selectedVillageCode.value)
    selectedVillageCode.value = code || ''
})

// === Validation ===
const requiredRule = (value: string) => {
  if (props.required && !value)
    return 'Field ini wajib diisi'

  return true
}

// === Lifecycle ===
onMounted(async () => {
  if (!provinces.value.length)
    await administrativeStore.fetchProvince({ perPage: 99999999, orderField: 'name', orderDirection: 'asc' })

  const fetches = []
  if (props.initialProvinceCode)
    fetches.push(administrativeStore.fetchCity(props.initialProvinceCode, { perPage: 99999999, orderField: 'name', orderDirection: 'asc' }))
  if (props.initialCityCode)
    fetches.push(administrativeStore.fetchDistrict(props.initialCityCode, { perPage: 99999999, orderField: 'name', orderDirection: 'asc' }))
  if (props.initialDistrictCode)
    fetches.push(administrativeStore.fetchVillage(props.initialDistrictCode, { perPage: 99999999, orderField: 'name', orderDirection: 'asc' }))

  await Promise.all(fetches)

  selectedProvinceCode.value = props.initialProvinceCode || props.provinceCode || ''
  selectedCityCode.value = props.initialCityCode || props.cityCode || ''
  selectedDistrictCode.value = props.initialDistrictCode || props.districtCode || ''
  selectedVillageCode.value = props.modelValue || props.villageCode || ''
})
</script>

<template>
  <div class="administrative-location-selector">
    <label
      v-if="label"
      class="mb-2 d-block"
    >
      {{ label }}
      <span
        v-if="required"
        class="text-error"
      >*</span>
    </label>

    <VRow>
      <VCol
        cols="12"
        md="6"
        lg="3"
      >
        <AppSelect
          v-model="selectedProvinceCode"
          :items="provinces"
          item-title="name"
          item-value="code"
          :loading="isLoadingFetchProvinces"
          :readonly="readonly"
          :rules="required ? [requiredRule] : []"
          label="Provinsi"
          placeholder="Pilih Provinsi"
          prepend-inner-icon="tabler-map"
          clearable
          :hide-details="!required ? 'auto' : false"
          density="comfortable"
          @update:model-value="onProvinceChange"
        />
      </VCol>

      <VCol
        cols="12"
        md="6"
        lg="3"
      >
        <AppSelect
          v-model="selectedCityCode"
          :items="cities"
          item-title="name"
          item-value="code"
          :loading="isLoadingFetchCities"
          :readonly="readonly"
          :disabled="!selectedProvinceCode"
          :rules="required ? [requiredRule] : []"
          label="Kota/Kabupaten"
          placeholder="Pilih Kota/Kabupaten"
          prepend-inner-icon="tabler-building-community"
          clearable
          :hide-details="!required ? 'auto' : false"
          density="comfortable"
          @update:model-value="onCityChange"
        />
      </VCol>

      <VCol
        cols="12"
        md="6"
        lg="3"
      >
        <AppSelect
          v-model="selectedDistrictCode"
          :items="districts"
          item-title="name"
          item-value="code"
          :loading="isLoadingFetchDistricts"
          :readonly="readonly"
          :disabled="!selectedCityCode"
          :rules="required ? [requiredRule] : []"
          label="Kecamatan"
          placeholder="Pilih Kecamatan"
          prepend-inner-icon="tabler-building-estate"
          clearable
          :hide-details="!required ? 'auto' : false"
          density="comfortable"
          @update:model-value="onDistrictChange"
        />
      </VCol>

      <VCol
        cols="12"
        md="6"
        lg="3"
      >
        <AppSelect
          v-model="selectedVillageCode"
          :items="villages"
          item-title="name"
          item-value="code"
          :loading="isLoadingFetchVillages"
          :readonly="readonly"
          :disabled="!selectedDistrictCode"
          :rules="required ? [requiredRule] : []"
          :error-messages="errorMessages"
          label="Desa/Kelurahan"
          placeholder="Pilih Desa/Kelurahan"
          prepend-inner-icon="tabler-home"
          clearable
          :hide-details="!required ? 'auto' : false"
          density="comfortable"
          @update:model-value="onVillageChange"
        />
      </VCol>
    </VRow>

    <!-- Lokasi Terpilih -->
    <VAlert
      v-if="selectedVillage"
      type="info"
      variant="tonal"
      class="mt-4"
      icon="tabler-map-pin"
    >
      <strong>Lokasi Terpilih:</strong>
      {{ selectedVillage.name }}, {{ selectedDistrict?.name }}, {{ selectedCity?.name }}, {{ selectedProvince?.name }}
    </VAlert>

    <VAlert
      v-if="!readonly"
      type="info"
      variant="outlined"
      density="compact"
      icon="tabler-info-circle"
      class="mt-3"
    >
      <span class="text-caption">
        Pilih lokasi secara berurutan: Provinsi → Kota/Kabupaten → Kecamatan → Desa/Kelurahan
      </span>
    </VAlert>
  </div>
</template>

<style scoped lang="scss">
.administrative-location-selector {
  .v-alert { transition: all 0.3s ease; }
  .v-select .v-field__input { transition: all 0.2s ease; }
}
</style>
