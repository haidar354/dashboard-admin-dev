<script setup lang="ts">
import AppAutocomplete from "@/@core/components/app-form-elements/AppAutocomplete.vue";
import AppSelect from "@/@core/components/app-form-elements/AppSelect.vue";
import AppTextarea from "@/@core/components/app-form-elements/AppTextarea.vue";
import AppTextField from "@/@core/components/app-form-elements/AppTextField.vue";
import { requiredValidator } from "@/@core/utils/validators";
import { showToast } from "@/utils/toaster";

definePage({
  meta: {
    name: "Platform Features",
    rules: [{ action: "manage", subject: "default" }],
  },
});

interface Module {
  moduleId: string;
  key: string;
  name: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

interface Feature {
  featureId: string;
  moduleId: string;
  key: string;
  name: string;
  description: string;
  isActive: boolean;
  module: Module;
}

interface PaginationMeta {
  page: number;
  perPage: number;
  from: number;
  to: number;
  total: number;
  lastPage: number;
  hasMore: boolean;
}

interface PaginateData {
  data: Feature[];
  meta: PaginationMeta | null;
}

const isLoading = ref(false);
const isLoadingModules = ref(false);

const paginateData = ref<PaginateData>({
  data: [],
  meta: null,
});

const modules = ref<Module[]>([]);
const search = ref("");
const selectedModule = ref("");

const dialogVisible = ref(false);
const dialogMode = ref<"create" | "edit" | "view">("create");
const isLoadingSubmit = ref(false);
const isLoadingDelete = ref(false);
const deleteDialogVisible = ref(false);
const featureToDelete = ref<string | null>(null);
const selectedFeatureId = ref<string | null>(null);

const form = ref({
  moduleId: "",
  key: "",
  name: "",
  description: "",
  isActive: true,
});

const headers = [
  { title: "No", key: "index", width: "60px", sortable: false },
  { title: "Key", key: "key", sortable: false },
  { title: "Nama", key: "name", sortable: false },
  { title: "Deskripsi", key: "description", sortable: false },
  { title: "Module", key: "module", sortable: false },
  { title: "Status", key: "isActive", sortable: false },
  { title: "Aksi", key: "actions", width: "120px", sortable: false },
];

const fetchFeatures = async () => {
  try {
    isLoading.value = true;

    const params: Record<string, any> = {};

    if (selectedModule.value) params["filter[moduleId]"] = selectedModule.value;

    const response = await $rootAPI("/platform/system-config/features", {
      method: "GET",
      params,
    });

    paginateData.value = {
      data: response.data,
      meta: response.meta,
    };
  } catch (error) {
    console.error("Error fetching features:", error);
  } finally {
    isLoading.value = false;
  }
};

const fetchModules = async () => {
  try {
    isLoadingModules.value = true;

    const response = await $rootAPI("/platform/system-config/modules", {
      method: "GET",
    });

    modules.value = response.data;
  } catch (error) {
    console.error("Error fetching modules:", error);
  } finally {
    isLoadingModules.value = false;
  }
};

const fetchFeatureDetail = async (featureId: string) => {
  try {
    const response = await $rootAPI("/platform/system-config/features", {
      method: "GET",
      params: {
        "filter[featureId]": featureId,
      },
    });

    if (response.data && response.data.length > 0) {
      const feature = response.data[0];

      form.value = {
        moduleId: feature.moduleId,
        key: feature.key,
        name: feature.name,
        description: feature.description || "",
        isActive: feature.isActive,
      };
      dialogVisible.value = true;
    }
  } catch (error) {
    console.error("Error fetching feature detail:", error);
  }
};

const openDialog = async (
  mode: "create" | "edit" | "view",
  feature?: Feature
) => {
  dialogMode.value = mode;
  selectedFeatureId.value = feature?.featureId || null;

  if (mode === "create") {
    form.value = {
      moduleId: "",
      key: "",
      name: "",
      description: "",
      isActive: true,
    };
    dialogVisible.value = true;
  } else if (mode === "view" && feature) {
    await fetchFeatureDetail(feature.featureId);
  } else if (mode === "edit" && feature) {
    form.value = {
      moduleId: feature.moduleId,
      key: feature.key,
      name: feature.name,
      description: feature.description || "",
      isActive: feature.isActive,
    };
    dialogVisible.value = true;
  }
};

const closeDialog = () => {
  dialogVisible.value = false;
  selectedFeatureId.value = null;
  form.value = {
    moduleId: "",
    key: "",
    name: "",
    description: "",
    isActive: true,
  };
};

const confirmDelete = (featureId: string) => {
  featureToDelete.value = featureId;
  deleteDialogVisible.value = true;
};

const handleDelete = async () => {
  if (featureToDelete.value) {
    try {
      isLoadingDelete.value = true;
      await $rootAPI(
        `/platform/system-config/features/${featureToDelete.value}`,
        {
          method: "DELETE",
        }
      );
      showToast("Feature berhasil dihapus", "success");
      deleteDialogVisible.value = false;
      featureToDelete.value = null;

      // Refresh data
      await fetchFeatures();
    } catch (error: any) {
      console.error("Error deleting feature:", error);
      showToast(error?.data?.message || "Gagal menghapus feature", "error");
    } finally {
      isLoadingDelete.value = false;
    }
  }
};

const handleSubmit = async () => {
  try {
    isLoadingSubmit.value = true;

    if (dialogMode.value === "create") {
      const payload = {
        moduleId: form.value.moduleId,
        key: form.value.key,
        name: form.value.name,
        description: form.value.description,
        isActive: form.value.isActive,
      };

      await $rootAPI("/platform/system-config/features", {
        method: "POST",
        body: payload,
      });
      showToast("Feature berhasil ditambahkan", "success");
    } else if (dialogMode.value === "edit" && selectedFeatureId.value) {
      // Untuk edit, moduleId tidak dikirim
      const payload = {
        key: form.value.key,
        name: form.value.name,
        description: form.value.description,
        isActive: form.value.isActive,
      };

      await $rootAPI(
        `/platform/system-config/features/${selectedFeatureId.value}`,
        {
          method: "PATCH",
          body: payload,
        }
      );
      showToast("Feature berhasil diupdate", "success");
    }

    closeDialog();

    // Refresh data
    await fetchFeatures();
  } catch (error: any) {
    console.error("Error submitting form:", error);
    showToast(error?.data?.message || "Gagal menyimpan data feature", "error");
  } finally {
    isLoadingSubmit.value = false;
  }
};

const getStatusColor = (isActive: boolean) => {
  return isActive ? "success" : "secondary";
};

const getStatusText = (isActive: boolean) => {
  return isActive ? "Active" : "Inactive";
};

// Filter data berdasarkan search (client-side)
const filteredData = computed(() => {
  if (!search.value) return paginateData.value.data;

  const searchLower = search.value.toLowerCase();

  return paginateData.value.data.filter(
    (feature) =>
      feature.name.toLowerCase().includes(searchLower) ||
      feature.key.toLowerCase().includes(searchLower) ||
      feature.module.name.toLowerCase().includes(searchLower)
  );
});

watch(selectedModule, async () => {
  await fetchFeatures();
});

onMounted(async () => {
  await Promise.all([fetchFeatures(), fetchModules()]);
});
</script>

<template>
  <div data-testid="platform-features-page">
    <VCard>
      <VCardText
        class="d-flex flex-wrap justify-space-between align-center gap-4"
      >
        <h5 class="text-h5">Platform Features</h5>
        <VBtn
          color="primary"
          prepend-icon="tabler-plus"
          @click="openDialog('create')"
        >
          Tambah Feature
        </VBtn>
      </VCardText>

      <VDivider />

      <VCardText>
        <VRow>
          <VCol cols="12" sm="4">
            <AppTextField
              v-model="search"
              label="Search"
              placeholder="Cari feature..."
              prepend-inner-icon="tabler-search"
              clearable
            />
          </VCol>
          <VCol cols="12" sm="4">
            <AppAutocomplete
              v-model="selectedModule"
              label="Filter Module"
              :items="[
                { title: 'Semua Module', value: '' },
                ...modules.map((m) => ({ title: m.name, value: m.moduleId })),
              ]"
              placeholder="Cari dan pilih module"
              item-title="title"
              item-value="value"
            />
          </VCol>
        </VRow>
      </VCardText>

      <VDataTable
        :headers="headers"
        :items="filteredData"
        :loading="isLoading"
        class="text-no-wrap"
      >
        <template #item.index="{ index }">
          {{ index + 1 }}
        </template>

        <template #item.key="{ item }">
          <code class="text-sm">{{ item.key }}</code>
        </template>

        <template #item.module="{ item }">
          <VChip size="small" color="primary" variant="tonal">
            {{ item.module.name }}
          </VChip>
        </template>

        <template #item.isActive="{ item }">
          <VChip size="small" :color="getStatusColor(item.isActive)">
            {{ getStatusText(item.isActive) }}
          </VChip>
        </template>

        <template #item.actions="{ item }">
          <div class="d-flex gap-1">
            <IconBtn size="small" @click="openDialog('edit', item)">
              <VIcon icon="tabler-edit" color="warning" />
            </IconBtn>
            <IconBtn size="small" @click="confirmDelete(item.featureId)">
              <VIcon icon="tabler-trash" color="error" />
            </IconBtn>
          </div>
        </template>
      </VDataTable>
    </VCard>

    <!-- Feature Dialog -->
    <VDialog v-model="dialogVisible" max-width="500">
      <VCard>
        <VCardTitle class="d-flex justify-space-between align-center">
          <span>{{
            dialogMode === "create"
              ? "Tambah Feature"
              : dialogMode === "edit"
              ? "Edit Feature"
              : "Detail Feature"
          }}</span>
          <IconBtn @click="closeDialog">
            <VIcon icon="tabler-x" />
          </IconBtn>
        </VCardTitle>

        <VDivider />

        <VCardText>
          <VForm @submit.prevent="handleSubmit">
            <VRow>
              <VCol cols="12">
                <AppAutocomplete
                  v-model="form.moduleId"
                  label="Module"
                  :items="
                    modules.map((m) => ({ title: m.name, value: m.moduleId }))
                  "
                  :rules="[requiredValidator]"
                  :readonly="dialogMode === 'view'"
                  placeholder="Cari dan pilih module"
                  item-title="title"
                  item-value="value"
                />
              </VCol>
              <VCol cols="12">
                <AppTextField
                  v-model="form.key"
                  label="Key"
                  placeholder="Masukkan key"
                  :rules="[requiredValidator]"
                  :readonly="dialogMode === 'view'"
                />
              </VCol>
              <VCol cols="12">
                <AppTextField
                  v-model="form.name"
                  label="Nama"
                  placeholder="Masukkan nama feature"
                  :rules="[requiredValidator]"
                  :readonly="dialogMode === 'view'"
                />
              </VCol>
              <VCol cols="12">
                <AppTextarea
                  v-model="form.description"
                  label="Deskripsi"
                  placeholder="Masukkan deskripsi"
                  rows="3"
                  :rules="[requiredValidator]"
                  :readonly="dialogMode === 'view'"
                />
              </VCol>
              <VCol cols="12">
                <AppSelect
                  v-model="form.isActive"
                  label="Status"
                  :items="[
                    { title: 'Active', value: true },
                    { title: 'Inactive', value: false },
                  ]"
                  :rules="[requiredValidator]"
                  :readonly="dialogMode === 'view'"
                />
              </VCol>
            </VRow>

            <div
              v-if="dialogMode !== 'view'"
              class="d-flex justify-end gap-3 mt-4"
            >
              <VBtn variant="outlined" color="secondary" @click="closeDialog">
                Batal
              </VBtn>
              <VBtn type="submit" color="primary" :loading="isLoadingSubmit">
                {{ dialogMode === "create" ? "Simpan" : "Update" }}
              </VBtn>
            </div>

            <div v-else class="d-flex justify-end gap-3 mt-4">
              <VBtn color="secondary" @click="closeDialog"> Tutup </VBtn>
            </div>
          </VForm>
        </VCardText>
      </VCard>
    </VDialog>

    <!-- Delete Confirmation -->
    <VDialog v-model="deleteDialogVisible" max-width="400">
      <VCard>
        <VCardTitle>Konfirmasi Hapus</VCardTitle>
        <VCardText>Apakah Anda yakin ingin menghapus feature ini?</VCardText>
        <VCardActions>
          <VSpacer />
          <VBtn variant="outlined" @click="deleteDialogVisible = false">
            Batal
          </VBtn>
          <VBtn
            variant="outlined"
            color="error"
            :loading="isLoadingDelete"
            @click="handleDelete"
          >
            Hapus
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </div>
</template>
