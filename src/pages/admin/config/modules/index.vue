<script setup lang="ts">
import AppSelect from "@/@core/components/app-form-elements/AppSelect.vue";
import AppTextarea from "@/@core/components/app-form-elements/AppTextarea.vue";
import AppTextField from "@/@core/components/app-form-elements/AppTextField.vue";
import { requiredValidator } from "@/@core/utils/validators";
import { $rootAPI } from "@/utils/api";
import { showToast } from "@/utils/toaster";
definePage({
  meta: {
    name: "Platform Modules",
    rules: [{ action: "manage", subject: "default" }],
  },
});

interface Module {
  moduleId: string;
  key: string;
  name: string;
  description: string;
  isActive: boolean;
}

interface Feature {
  featureId: string;
  moduleId: string;
  key: string;
  name: string;
  description: string;
  isActive: boolean;
  module?: Module;
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
  data: Module[];
  meta: PaginationMeta | null;
}

interface FeaturePaginateData {
  data: Feature[];
  meta: PaginationMeta | null;
}

const isLoading = ref(false);

const paginateData = ref<PaginateData>({
  data: [],
  meta: null,
});

const dialogVisible = ref(false);
const dialogMode = ref<"create" | "edit" | "view">("create");
const isLoadingSubmit = ref(false);
const isLoadingDelete = ref(false);
const deleteDialogVisible = ref(false);
const moduleToDelete = ref<string | null>(null);
const selectedModuleId = ref<string | null>(null);

// Features dialog state
const featuresDialogVisible = ref(false);
const isLoadingFeatures = ref(false);
const featuresData = ref<FeaturePaginateData>({
  data: [],
  meta: null,
});
const selectedModuleName = ref("");

const form = ref({
  key: "",
  name: "",
  description: "",
  isActive: true,
});

const expandedDescriptions = ref<Record<string, boolean>>({});

const fetchModules = async () => {
  try {
    isLoading.value = true;

    const response = await $rootAPI("/platform/system-config/modules", {
      method: "GET",
    });

    paginateData.value = {
      data: response.data,
      meta: response.meta,
    };
  } catch (error) {
    console.error("Error fetching modules:", error);
  } finally {
    isLoading.value = false;
  }
};

const fetchModuleDetail = async (moduleId: string) => {
  try {
    const response = await $rootAPI("/platform/system-config/modules", {
      method: "GET",
      params: {
        perPage: 1,
        "filter[moduleId]": moduleId,
      },
    });

    if (response.data && response.data.length > 0) {
      const module = response.data[0];

      form.value = {
        key: module.key,
        name: module.name,
        description: module.description || "",
        isActive: module.isActive,
      };
      dialogVisible.value = true;
    }
  } catch (error) {
    console.error("Error fetching module detail:", error);
  }
};

const fetchModuleFeatures = async (moduleId: string, moduleName: string) => {
  try {
    isLoadingFeatures.value = true;
    selectedModuleName.value = moduleName;

    const response = await $rootAPI("/platform/system-config/features", {
      method: "GET",
      params: {
        "filter[moduleId]": moduleId,
      },
    });

    featuresData.value = {
      data: response.data,
      meta: response.meta,
    };

    featuresDialogVisible.value = true;
  } catch (error) {
    console.error("Error fetching module features:", error);
    showToast("Gagal mengambil data features", "error");
  } finally {
    isLoadingFeatures.value = false;
  }
};

const openDialog = async (
  mode: "create" | "edit" | "view",
  module?: Module
) => {
  dialogMode.value = mode;
  selectedModuleId.value = module?.moduleId || null;

  if (mode === "create") {
    form.value = {
      key: "",
      name: "",
      description: "",
      isActive: true,
    };
    dialogVisible.value = true;
  } else if (mode === "view" && module) {
    // Open features dialog instead of module detail
    await fetchModuleFeatures(module.moduleId, module.name);
  } else if (mode === "edit" && module) {
    form.value = {
      key: module.key,
      name: module.name,
      description: module.description || "",
      isActive: module.isActive,
    };
    dialogVisible.value = true;
  }
};

const closeDialog = () => {
  dialogVisible.value = false;
  selectedModuleId.value = null;
  form.value = {
    key: "",
    name: "",
    description: "",
    isActive: true,
  };
};

const closeFeaturesDialog = () => {
  featuresDialogVisible.value = false;
  featuresData.value = {
    data: [],
    meta: null,
  };
  selectedModuleName.value = "";
};

const confirmDelete = (moduleId: string) => {
  moduleToDelete.value = moduleId;
  deleteDialogVisible.value = true;
};

const handleDelete = async () => {
  if (moduleToDelete.value) {
    try {
      isLoadingDelete.value = true;
      await $rootAPI(
        `/platform/system-config/modules/${moduleToDelete.value}`,
        {
          method: "DELETE",
        }
      );
      showToast("Module berhasil dihapus", "success");
      deleteDialogVisible.value = false;
      moduleToDelete.value = null;

      // Refresh data
      await fetchModules();
    } catch (error: any) {
      console.error("Error deleting module:", error);
      showToast(error?.data?.message || "Gagal menghapus module", "error");
    } finally {
      isLoadingDelete.value = false;
    }
  }
};

const handleSubmit = async () => {
  try {
    isLoadingSubmit.value = true;

    const payload = {
      key: form.value.key,
      name: form.value.name,
      description: form.value.description,
      isActive: form.value.isActive,
    };

    if (dialogMode.value === "create") {
      await $rootAPI("/platform/system-config/modules", {
        method: "POST",
        body: payload,
      });
      showToast("Module berhasil ditambahkan", "success");
    } else if (dialogMode.value === "edit" && selectedModuleId.value) {
      await $rootAPI(
        `/platform/system-config/modules/${selectedModuleId.value}`,
        {
          method: "PATCH",
          body: payload,
        }
      );
      showToast("Module berhasil diupdate", "success");
    }

    closeDialog();

    // Refresh data
    await fetchModules();
  } catch (error: any) {
    console.error("Error submitting form:", error);
    showToast(error?.data?.message || "Gagal menyimpan data module", "error");
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

const toggleDescription = (moduleId: string) => {
  expandedDescriptions.value[moduleId] = !expandedDescriptions.value[moduleId];
};

const getDisplayDescription = (module: Module) => {
  const maxLength = 60;
  if (!module.description) return "-";

  if (
    expandedDescriptions.value[module.moduleId] ||
    module.description.length <= maxLength
  )
    return module.description;

  return `${module.description.substring(0, maxLength)}...`;
};

const shouldShowToggle = (description: string) => {
  return description && description.length > 60;
};

onMounted(async () => {
  await fetchModules();
});
</script>

<template>
  <div data-testid="platform-modules-page">
    <VCard>
      <VCardText
        class="d-flex flex-wrap justify-space-between align-center gap-4"
      >
        <h5 class="text-h5">Platform Modules</h5>
        <VBtn
          color="primary"
          prepend-icon="tabler-plus"
          @click="openDialog('create')"
        >
          Tambah Module
        </VBtn>
      </VCardText>
    </VCard>

    <VRow v-if="isLoading" class="mt-4">
      <VCol cols="12" class="text-center py-10">
        <VProgressCircular indeterminate color="primary" />
      </VCol>
    </VRow>

    <VRow v-else class="mt-4">
      <VCol
        v-for="mod in paginateData.data"
        :key="mod.moduleId"
        cols="12"
        sm="6"
        md="4"
        lg="3"
      >
        <VCard class="h-100 d-flex flex-column">
          <VCardText class="text-center flex-grow-1 d-flex flex-column">
            <VAvatar
              color="primary"
              variant="tonal"
              size="64"
              class="mb-3 mx-auto"
            >
              <VIcon icon="tabler-box" size="32" />
            </VAvatar>
            <h6 class="text-h6 mb-1">
              {{ mod.name }}
            </h6>
            <p class="text-caption text-disabled mb-2">
              {{ mod.key }}
            </p>
            <VChip
              size="small"
              :color="getStatusColor(mod.isActive)"
              class="mb-3"
              style="
                display: flex;
                justify-content: center;
                align-items: center;
              "
            >
              {{ getStatusText(mod.isActive) }}
            </VChip>
            <div class="text-body-2 mb-0 flex-grow-1">
              {{ getDisplayDescription(mod) }}
              <VBtn
                v-if="shouldShowToggle(mod.description)"
                variant="text"
                size="small"
                color="primary"
                class="pa-0 mt-1"
                style="min-width: auto; height: auto"
                @click="toggleDescription(mod.moduleId)"
              >
                {{
                  expandedDescriptions[mod.moduleId]
                    ? "Sembunyikan"
                    : "Selengkapnya"
                }}
              </VBtn>
            </div>
          </VCardText>
          <VDivider />
          <VCardActions class="justify-center">
            <IconBtn @click="openDialog('view', mod)">
              <VIcon icon="tabler-eye" color="info" />
            </IconBtn>
            <IconBtn @click="openDialog('edit', mod)">
              <VIcon icon="tabler-edit" color="warning" />
            </IconBtn>
            <IconBtn @click="confirmDelete(mod.moduleId)">
              <VIcon icon="tabler-trash" color="error" />
            </IconBtn>
          </VCardActions>
        </VCard>
      </VCol>
    </VRow>

    <!-- Module Dialog -->
    <VDialog v-model="dialogVisible" max-width="500">
      <VCard>
        <VCardTitle class="d-flex justify-space-between align-center">
          <span>{{
            dialogMode === "create"
              ? "Tambah Module"
              : dialogMode === "edit"
              ? "Edit Module"
              : "Detail Module"
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
                  placeholder="Masukkan nama module"
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

    <!-- Features Dialog -->
    <VDialog v-model="featuresDialogVisible" max-width="800">
      <VCard>
        <VCardTitle class="d-flex justify-space-between align-center">
          <span>Features - {{ selectedModuleName }}</span>
          <IconBtn @click="closeFeaturesDialog">
            <VIcon icon="tabler-x" />
          </IconBtn>
        </VCardTitle>

        <VDivider />

        <VCardText>
          <div v-if="isLoadingFeatures" class="text-center py-10">
            <VProgressCircular indeterminate color="primary" />
          </div>

          <div
            v-else-if="featuresData.data.length === 0"
            class="text-center py-10"
          >
            <VIcon
              icon="tabler-folder-open"
              size="64"
              color="disabled"
              class="mb-3"
            />
            <p class="text-body-1 text-disabled">
              Tidak ada features untuk module ini
            </p>
          </div>

          <VList v-else>
            <VListItem
              v-for="(feature, index) in featuresData.data"
              :key="feature.featureId"
            >
              <template #prepend>
                <VAvatar color="primary" variant="tonal" size="40">
                  <VIcon icon="tabler-puzzle" />
                </VAvatar>
              </template>

              <VListItemTitle class="font-weight-medium">
                {{ feature.name }}
              </VListItemTitle>

              <VListItemSubtitle class="text-caption">
                {{ feature.key }}
              </VListItemSubtitle>

              <template v-if="feature.description">
                <div class="text-body-2 mt-1">
                  {{ feature.description }}
                </div>
              </template>

              <template #append>
                <VChip size="small" :color="getStatusColor(feature.isActive)">
                  {{ getStatusText(feature.isActive) }}
                </VChip>
              </template>

              <VDivider
                v-if="index < featuresData.data.length - 1"
                class="mt-3"
              />
            </VListItem>
          </VList>

          <div
            v-if="featuresData.meta"
            class="mt-4 text-center text-caption text-disabled"
          >
            Menampilkan {{ featuresData.meta.from }} -
            {{ featuresData.meta.to }} dari
            {{ featuresData.meta.total }} features
          </div>
        </VCardText>

        <VDivider />

        <VCardActions>
          <VSpacer />
          <VBtn color="secondary" @click="closeFeaturesDialog"> Tutup </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>

    <!-- Delete Confirmation -->
    <VDialog v-model="deleteDialogVisible" max-width="400">
      <VCard>
        <VCardTitle>Konfirmasi Hapus</VCardTitle>
        <VCardText>Apakah Anda yakin ingin menghapus module ini?</VCardText>
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
