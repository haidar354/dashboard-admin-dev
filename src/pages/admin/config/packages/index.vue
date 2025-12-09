<script setup lang="ts">
import AppSelect from "@/@core/components/app-form-elements/AppSelect.vue";
import AppTextField from "@/@core/components/app-form-elements/AppTextField.vue";
import AppTextarea from "@/@core/components/app-form-elements/AppTextarea.vue";
import { requiredValidator } from "@/@core/utils/validators";
import { $rootAPI } from "@/utils/api";
import { showToast } from "@/utils/toaster";

definePage({
  meta: {
    name: "Platform Packages",
    rules: [{ action: "manage", subject: "default" }],
  },
});

interface Plan {
  planId: string;
  name: string;
  key: string;
  amount: number;
  currency: string;
}

interface Module {
  moduleId: string;
  name: string;
  key: string;
}

interface Feature {
  featureId: string;
  name: string;
  key: string;
}

interface Package {
  packageId: string;
  key: string;
  name: string;
  description: string;
  isActive: boolean;
  plans?: Plan[];
  modules?: Module[];
  features?: Feature[];
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
  data: Package[];
  meta: PaginationMeta | null;
}

const isLoading = ref(false);
const paginateData = ref<PaginateData>({
  data: [],
  meta: null,
});

const search = ref("");
const dialogVisible = ref(false);
const dialogMode = ref<"create" | "edit" | "view">("create");
const isLoadingSubmit = ref(false);
const isLoadingDelete = ref(false);
const deleteDialogVisible = ref(false);
const packageToDelete = ref<string | null>(null);
const selectedPackageId = ref<string | null>(null);

const detailDialogVisible = ref(false);
const selectedPackage = ref<Package | null>(null);
const isLoadingDetail = ref(false);

const form = ref({
  key: "",
  name: "",
  description: "",
  isActive: true,
});

const headers = [
  { title: "No", key: "index", width: "60px", sortable: false },
  { title: "Key", key: "key", sortable: false },
  { title: "Nama Package", key: "name", sortable: false },
  { title: "Deskripsi", key: "description", sortable: false },
  { title: "Status", key: "isActive", sortable: false },
  { title: "Aksi", key: "actions", width: "150px", sortable: false },
];

const fetchPackages = async () => {
  try {
    isLoading.value = true;

    const response = await $rootAPI("/platform/system-config/packages", {
      method: "GET",
    });

    paginateData.value = {
      data: response.data || [],
      meta: response.meta || null,
    };
  } catch (error) {
    console.error("Error fetching packages:", error);
  } finally {
    isLoading.value = false;
  }
};

const fetchPackageDetail = async (packageId: string) => {
  try {
    isLoadingDetail.value = true;

    const response = await $rootAPI("/platform/system-config/packages", {
      method: "GET",
      params: {
        include: "plans,modules,features",
        "filter[packageId]": packageId,
      },
    });

    if (response.data && response.data.length > 0) {
      selectedPackage.value = response.data[0];
      detailDialogVisible.value = true;
    }
  } catch (error) {
    console.error("Error fetching package detail:", error);
    showToast("Gagal memuat detail package", "error");
  } finally {
    isLoadingDetail.value = false;
  }
};

const openDialog = (mode: "create" | "edit" | "view", pkg?: Package) => {
  dialogMode.value = mode;
  selectedPackageId.value = pkg?.packageId || null;

  if (mode === "create") {
    form.value = {
      key: "",
      name: "",
      description: "",
      isActive: true,
    };
  } else if (mode === "view" && pkg) {
    fetchPackageDetail(pkg.packageId);
    return;
  } else if (mode === "edit" && pkg) {
    form.value = {
      key: pkg.key,
      name: pkg.name,
      description: pkg.description,
      isActive: pkg.isActive,
    };
  }

  dialogVisible.value = true;
};

const closeDialog = () => {
  dialogVisible.value = false;
  selectedPackageId.value = null;
  form.value = {
    key: "",
    name: "",
    description: "",
    isActive: true,
  };
};

const confirmDelete = (packageId: string) => {
  packageToDelete.value = packageId;
  deleteDialogVisible.value = true;
};

const handleDelete = async () => {
  if (packageToDelete.value) {
    try {
      isLoadingDelete.value = true;
      await $rootAPI(
        `/platform/system-config/packages/${packageToDelete.value}`,
        {
          method: "DELETE",
        }
      );
      showToast("Package berhasil dihapus", "success");
      deleteDialogVisible.value = false;
      packageToDelete.value = null;
      await fetchPackages();
    } catch (error: any) {
      console.error("Error deleting package:", error);
      showToast(error?.data?.message || "Gagal menghapus package", "error");
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
      await $rootAPI("/platform/system-config/packages", {
        method: "POST",
        body: payload,
      });
      showToast("Package berhasil ditambahkan", "success");
    } else if (dialogMode.value === "edit" && selectedPackageId.value) {
      await $rootAPI(
        `/platform/system-config/packages/${selectedPackageId.value}`,
        {
          method: "PATCH",
          body: payload,
        }
      );
      showToast("Package berhasil diupdate", "success");
    }

    closeDialog();
    await fetchPackages();
  } catch (error: any) {
    console.error("Error submitting form:", error);
    showToast(error?.data?.message || "Gagal menyimpan data package", "error");
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

const formatCurrency = (amount: number, currency: string) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: currency || "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
};

// Filter data berdasarkan search (client-side)
const filteredData = computed(() => {
  if (!search.value) {
    return paginateData.value.data;
  }

  const searchLower = search.value.toLowerCase();
  return paginateData.value.data.filter(
    (pkg) =>
      pkg.name.toLowerCase().includes(searchLower) ||
      pkg.key.toLowerCase().includes(searchLower) ||
      pkg.description.toLowerCase().includes(searchLower)
  );
});

onMounted(async () => {
  await fetchPackages();
});
</script>

<template>
  <div data-testid="platform-packages-page">
    <VCard>
      <VCardText
        class="d-flex flex-wrap justify-space-between align-center gap-4"
      >
        <h5 class="text-h5">Platform Packages</h5>

        <VBtn
          color="primary"
          prepend-icon="tabler-plus"
          @click="openDialog('create')"
        >
          Tambah Package
        </VBtn>
      </VCardText>

      <VDivider />

      <VCardText>
        <VRow>
          <VCol cols="12" sm="4">
            <AppTextField
              v-model="search"
              placeholder="Cari package..."
              prepend-inner-icon="tabler-search"
              clearable
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
          <code class="text-caption">{{ item.key }}</code>
        </template>

        <template #item.description="{ item }">
          <div style="max-width: 350px" class="text-truncate">
            {{ item.description }}
          </div>
        </template>

        <template #item.isActive="{ item }">
          <VChip size="small" :color="getStatusColor(item.isActive)">
            {{ getStatusText(item.isActive) }}
          </VChip>
        </template>

        <template #item.actions="{ item }">
          <div class="d-flex gap-1">
            <IconBtn size="small" @click="openDialog('view', item)">
              <VIcon icon="tabler-eye" color="info" />
            </IconBtn>
            <IconBtn size="small" @click="openDialog('edit', item)">
              <VIcon icon="tabler-edit" color="warning" />
            </IconBtn>
            <IconBtn size="small" @click="confirmDelete(item.packageId)">
              <VIcon icon="tabler-trash" color="error" />
            </IconBtn>
          </div>
        </template>
      </VDataTable>
    </VCard>

    <!-- Create/Edit Dialog -->
    <VDialog v-model="dialogVisible" max-width="500">
      <VCard>
        <VCardTitle class="d-flex justify-space-between align-center">
          <span>{{
            dialogMode === "create" ? "Tambah Package" : "Edit Package"
          }}</span>
          <IconBtn @click="closeDialog()">
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
                  placeholder="community"
                  :rules="[requiredValidator]"
                />
              </VCol>
              <VCol cols="12">
                <AppTextField
                  v-model="form.name"
                  label="Nama Package"
                  placeholder="Community"
                  :rules="[requiredValidator]"
                />
              </VCol>
              <VCol cols="12">
                <AppTextarea
                  v-model="form.description"
                  label="Deskripsi"
                  placeholder="Forever-free access to foundational features."
                  rows="3"
                  :rules="[requiredValidator]"
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
                />
              </VCol>
            </VRow>

            <div class="d-flex justify-end gap-3 mt-4">
              <VBtn variant="outlined" color="secondary" @click="closeDialog()">
                Batal
              </VBtn>
              <VBtn type="submit" color="primary" :loading="isLoadingSubmit">
                {{ dialogMode === "create" ? "Simpan" : "Update" }}
              </VBtn>
            </div>
          </VForm>
        </VCardText>
      </VCard>
    </VDialog>

    <!-- Detail Dialog -->
    <VDialog v-model="detailDialogVisible" max-width="800">
      <VCard v-if="selectedPackage">
        <VCardTitle class="d-flex justify-space-between align-center">
          <div class="d-flex align-center gap-2">
            <span>Detail Package</span>
            <VChip
              size="small"
              :color="getStatusColor(selectedPackage.isActive)"
            >
              {{ getStatusText(selectedPackage.isActive) }}
            </VChip>
          </div>
          <IconBtn @click="detailDialogVisible = false">
            <VIcon icon="tabler-x" />
          </IconBtn>
        </VCardTitle>

        <VDivider />

        <VCardText>
          <div v-if="isLoadingDetail" class="text-center py-8">
            <VProgressCircular indeterminate color="primary" />
          </div>
          <VRow v-else>
            <VCol cols="12">
              <p class="text-body-2 text-disabled mb-1">Key</p>
              <code class="text-body-2">{{ selectedPackage.key }}</code>
            </VCol>
            <VCol cols="12">
              <p class="text-body-2 text-disabled mb-1">Nama Package</p>
              <p class="text-h6 mb-0">{{ selectedPackage.name }}</p>
            </VCol>
            <VCol cols="12">
              <p class="text-body-2 text-disabled mb-1">Deskripsi</p>
              <p class="text-body-2 mb-0">{{ selectedPackage.description }}</p>
            </VCol>

            <!-- Plans -->
            <VCol
              v-if="selectedPackage.plans && selectedPackage.plans.length > 0"
              cols="12"
            >
              <VDivider class="my-2" />
              <p class="text-body-2 text-disabled mb-2">
                Plans ({{ selectedPackage.plans.length }})
              </p>
              <VList density="compact">
                <VListItem
                  v-for="plan in selectedPackage.plans"
                  :key="plan.planId"
                  class="px-0"
                >
                  <template #prepend>
                    <VIcon
                      icon="tabler-file-invoice"
                      color="primary"
                      size="20"
                      class="me-2"
                    />
                  </template>
                  <VListItemTitle class="text-body-2">
                    {{ plan.name }}
                    <span class="text-disabled text-caption"
                      >({{ plan.key }})</span
                    >
                  </VListItemTitle>
                  <VListItemSubtitle class="text-caption">
                    {{ formatCurrency(plan.amount, plan.currency) }}
                  </VListItemSubtitle>
                </VListItem>
              </VList>
            </VCol>

            <!-- Modules -->
            <VCol
              v-if="
                selectedPackage.modules && selectedPackage.modules.length > 0
              "
              cols="12"
            >
              <VDivider class="my-2" />
              <p class="text-body-2 text-disabled mb-2">
                Modules ({{ selectedPackage.modules.length }})
              </p>
              <div class="d-flex flex-wrap gap-2">
                <VChip
                  v-for="module in selectedPackage.modules"
                  :key="module.moduleId"
                  size="small"
                  color="info"
                  variant="tonal"
                >
                  {{ module.name }}
                </VChip>
              </div>
            </VCol>

            <!-- Features -->
            <VCol
              v-if="
                selectedPackage.features && selectedPackage.features.length > 0
              "
              cols="12"
            >
              <VDivider class="my-2" />
              <p class="text-body-2 text-disabled mb-2">
                Features ({{ selectedPackage.features.length }})
              </p>
              <VExpansionPanels>
                <VExpansionPanel>
                  <VExpansionPanelTitle>
                    Lihat semua features ({{ selectedPackage.features.length }})
                  </VExpansionPanelTitle>
                  <VExpansionPanelText>
                    <div class="d-flex flex-wrap gap-2">
                      <VChip
                        v-for="feature in selectedPackage.features"
                        :key="feature.featureId"
                        size="small"
                        color="success"
                        variant="tonal"
                      >
                        {{ feature.name }}
                      </VChip>
                    </div>
                  </VExpansionPanelText>
                </VExpansionPanel>
              </VExpansionPanels>
            </VCol>
          </VRow>
        </VCardText>

        <VCardActions>
          <VSpacer />
          <VBtn variant="outlined" @click="detailDialogVisible = false">
            Tutup
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>

    <!-- Delete Confirmation -->
    <VDialog v-model="deleteDialogVisible" max-width="400">
      <VCard>
        <VCardTitle>Konfirmasi Hapus</VCardTitle>
        <VDivider />
        <VCardText>
          <p>Apakah Anda yakin ingin menghapus package ini?</p>

          <div class="d-flex justify-end gap-3 mt-4">
            <VBtn
              variant="outlined"
              color="secondary"
              @click="deleteDialogVisible = false"
            >
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
          </div>
        </VCardText>
      </VCard>
    </VDialog>
  </div>
</template>
