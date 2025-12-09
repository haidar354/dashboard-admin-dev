<script setup lang="ts">
import AppAutocomplete from "@/@core/components/app-form-elements/AppAutocomplete.vue";
import AppSelect from "@/@core/components/app-form-elements/AppSelect.vue";
import AppTextField from "@/@core/components/app-form-elements/AppTextField.vue";
import { requiredValidator } from "@/@core/utils/validators";
import { $rootAPI } from "@/utils/api";
import { showToast } from "@/utils/toaster";

definePage({
  meta: {
    name: "Platform Plan Capabilities",
    rules: [{ action: "manage", subject: "default" }],
  },
});

interface Plan {
  planId: string;
  packageId: string;
  key: string;
  name: string;
  currency: string;
  amount: number;
  interval: string;
  intervalCount: number;
  trialDays: number | null;
  isActive: boolean;
}

interface Module {
  moduleId: string;
  key: string;
  name: string;
}

interface Feature {
  featureId: string;
  key: string;
  name: string;
}

interface Permission {
  id: number;
  name: string;
}

interface PlanCapability {
  planCapabilityId: string;
  planId: string;
  capabilityType: "module" | "feature" | "permission";
  targetId: string;
  meta: Record<string, any>;
  createdAt: string;
  plan: {
    planId: string;
    name: string;
    key: string;
  };
  module?: Module;
  feature?: Feature;
  permission?: Permission;
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

const isLoading = ref(false);
const isLoadingPlans = ref(false);
const isLoadingModules = ref(false);
const isLoadingFeatures = ref(false);
const isLoadingPermissions = ref(false);

const plans = ref<Plan[]>([]);
const selectedPlanId = ref<string>("");
const modules = ref<Module[]>([]);
const features = ref<Feature[]>([]);
const permissions = ref<Permission[]>([]);

const capabilities = ref<PlanCapability[]>([]);
const paginationMeta = ref<PaginationMeta | null>(null);
const search = ref("");
const typeFilter = ref<"all" | "module" | "feature" | "permission">("all");

// Module Dialog
const moduleDialogVisible = ref(false);
const isLoadingModuleSubmit = ref(false);
const moduleForm = ref({
  moduleId: "",
  metaKey: "",
  metaValue: "",
});

// Feature Dialog
const featureDialogVisible = ref(false);
const isLoadingFeatureSubmit = ref(false);
const featureForm = ref({
  featureId: "",
  metaKey: "",
  metaValue: "",
});

// Permission Dialog
const permissionDialogVisible = ref(false);
const isLoadingPermissionSubmit = ref(false);
const permissionForm = ref({
  permissionId: "",
  metaKey: "",
  metaValue: "",
});

// Delete Dialog
const deleteDialogVisible = ref(false);
const isLoadingDelete = ref(false);
const capabilityToDelete = ref<PlanCapability | null>(null);

const headers = [
  { title: "No", key: "index", width: "60px", sortable: false },
  { title: "Tipe", key: "capabilityType", sortable: false },
  { title: "Nama", key: "name", sortable: false },
  { title: "Meta", key: "meta", sortable: false },
  { title: "Dibuat", key: "createdAt", sortable: false },
  { title: "Aksi", key: "actions", width: "80px", sortable: false },
];

// Fetch Plans
const fetchPlans = async () => {
  try {
    isLoadingPlans.value = true;

    const response = (await $rootAPI("/platform/billing/plans", {
      method: "GET",
    })) as any;

    plans.value = response.data || [];
  } catch (error) {
    console.error("Error fetching plans:", error);
    showToast("Gagal memuat data plans", "error");
  } finally {
    isLoadingPlans.value = false;
  }
};

// Fetch Modules
const fetchModules = async () => {
  try {
    isLoadingModules.value = true;

    const response = (await $rootAPI("/platform/system-config/modules", {
      method: "GET",
    })) as any;

    modules.value = response.data || [];
  } catch (error) {
    console.error("Error fetching modules:", error);
  } finally {
    isLoadingModules.value = false;
  }
};

// Fetch Features
const fetchFeatures = async () => {
  try {
    isLoadingFeatures.value = true;

    const response = (await $rootAPI("/platform/system-config/features", {
      method: "GET",
    })) as any;

    features.value = response.data || [];
  } catch (error) {
    console.error("Error fetching features:", error);
  } finally {
    isLoadingFeatures.value = false;
  }
};

// Fetch Permissions
const fetchPermissions = async () => {
  try {
    isLoadingPermissions.value = true;

    const response = (await $rootAPI("/platform/system-config/permissions", {
      method: "GET",
    })) as any;

    permissions.value = response.data || [];
  } catch (error) {
    console.error("Error fetching permissions:", error);
  } finally {
    isLoadingPermissions.value = false;
  }
};

// Fetch Plan Capabilities
const fetchPlanCapabilities = async () => {
  if (!selectedPlanId.value) return;

  try {
    isLoading.value = true;

    const response = (await $rootAPI(
      `/platform/system-config/plans/${selectedPlanId.value}/capabilities`,
      {
        method: "GET",
      }
    )) as any;

    capabilities.value = response.data || [];
    paginationMeta.value = response.meta || null;
  } catch (error) {
    console.error("Error fetching plan capabilities:", error);
    showToast("Gagal memuat data capabilities", "error");
  } finally {
    isLoading.value = false;
  }
};

// Module Functions
const openModuleDialog = () => {
  if (!selectedPlanId.value) {
    showToast("Pilih plan terlebih dahulu", "warning");
    return;
  }

  moduleForm.value = {
    moduleId: "",
    metaKey: "",
    metaValue: "",
  };
  moduleDialogVisible.value = true;
};

const closeModuleDialog = () => {
  moduleDialogVisible.value = false;
  moduleForm.value = {
    moduleId: "",
    metaKey: "",
    metaValue: "",
  };
};

const handleAddModule = async () => {
  try {
    isLoadingModuleSubmit.value = true;

    const meta: Record<string, any> = {};
    if (moduleForm.value.metaKey && moduleForm.value.metaValue) {
      meta[moduleForm.value.metaKey] = moduleForm.value.metaValue;
    }

    const payload = {
      moduleId: moduleForm.value.moduleId,
      meta,
    };

    await $rootAPI(
      `/platform/system-config/plans/${selectedPlanId.value}/capabilities/modules`,
      {
        method: "POST",
        body: payload,
      }
    );

    showToast("Module berhasil ditambahkan ke plan", "success");
    closeModuleDialog();

    // Refresh data
    await fetchPlanCapabilities();
  } catch (error: any) {
    console.error("Error adding module:", error);
    showToast(
      error?.data?.message || "Gagal menambahkan module ke plan",
      "error"
    );
  } finally {
    isLoadingModuleSubmit.value = false;
  }
};

// Feature Functions
const openFeatureDialog = () => {
  if (!selectedPlanId.value) {
    showToast("Pilih plan terlebih dahulu", "warning");
    return;
  }

  featureForm.value = {
    featureId: "",
    metaKey: "",
    metaValue: "",
  };
  featureDialogVisible.value = true;
};

const closeFeatureDialog = () => {
  featureDialogVisible.value = false;
  featureForm.value = {
    featureId: "",
    metaKey: "",
    metaValue: "",
  };
};

const handleAddFeature = async () => {
  try {
    isLoadingFeatureSubmit.value = true;

    const meta: Record<string, any> = {};
    if (featureForm.value.metaKey && featureForm.value.metaValue) {
      meta[featureForm.value.metaKey] = featureForm.value.metaValue;
    }

    const payload = {
      featureId: featureForm.value.featureId,
      meta,
    };

    await $rootAPI(
      `/platform/system-config/plans/${selectedPlanId.value}/capabilities/features`,
      {
        method: "POST",
        body: payload,
      }
    );

    showToast("Feature berhasil ditambahkan ke plan", "success");
    closeFeatureDialog();

    // Refresh data
    await fetchPlanCapabilities();
  } catch (error: any) {
    console.error("Error adding feature:", error);
    showToast(
      error?.data?.message || "Gagal menambahkan feature ke plan",
      "error"
    );
  } finally {
    isLoadingFeatureSubmit.value = false;
  }
};

// Permission Functions
const openPermissionDialog = () => {
  if (!selectedPlanId.value) {
    showToast("Pilih plan terlebih dahulu", "warning");
    return;
  }

  permissionForm.value = {
    permissionId: "",
    metaKey: "",
    metaValue: "",
  };
  permissionDialogVisible.value = true;
};

const closePermissionDialog = () => {
  permissionDialogVisible.value = false;
  permissionForm.value = {
    permissionId: "",
    metaKey: "",
    metaValue: "",
  };
};

const handleAddPermission = async () => {
  try {
    isLoadingPermissionSubmit.value = true;

    const meta: Record<string, any> = {};
    if (permissionForm.value.metaKey && permissionForm.value.metaValue) {
      meta[permissionForm.value.metaKey] = permissionForm.value.metaValue;
    }

    const payload = {
      permissionId: Number(permissionForm.value.permissionId),
      meta,
    };

    await $rootAPI(
      `/platform/system-config/plans/${selectedPlanId.value}/capabilities/permissions`,
      {
        method: "POST",
        body: payload,
      }
    );

    showToast("Permission berhasil ditambahkan ke plan", "success");
    closePermissionDialog();

    // Refresh data
    await fetchPlanCapabilities();
  } catch (error: any) {
    console.error("Error adding permission:", error);
    showToast(
      error?.data?.message || "Gagal menambahkan permission ke plan",
      "error"
    );
  } finally {
    isLoadingPermissionSubmit.value = false;
  }
};

// Delete Function
const confirmDelete = (capability: PlanCapability) => {
  capabilityToDelete.value = capability;
  deleteDialogVisible.value = true;
};

const closeDeleteDialog = () => {
  deleteDialogVisible.value = false;
  // Clear capabilityToDelete after dialog is closed to avoid render errors
  setTimeout(() => {
    capabilityToDelete.value = null;
  }, 300);
};

const handleDelete = async () => {
  if (!capabilityToDelete.value) return;

  // Save the capability ID before closing dialog
  const capabilityId = capabilityToDelete.value.planCapabilityId;

  try {
    isLoadingDelete.value = true;

    await $rootAPI(
      `/platform/system-config/plans/${selectedPlanId.value}/capabilities/${capabilityId}`,
      {
        method: "DELETE",
      }
    );

    showToast("Capability berhasil dihapus dari plan", "success");

    // Close dialog first (but keep capabilityToDelete until dialog closes)
    deleteDialogVisible.value = false;

    // Wait for Vue to process the dialog close, then refresh
    await nextTick();

    // Clear capabilityToDelete after dialog animation
    setTimeout(() => {
      capabilityToDelete.value = null;
    }, 300);

    // Refresh data after dialog is closed
    await fetchPlanCapabilities();
  } catch (error: any) {
    console.error("Error deleting capability:", error);
    showToast(error?.data?.message || "Gagal menghapus capability", "error");
    // Close dialog even on error, but keep data for retry
    deleteDialogVisible.value = false;
  } finally {
    isLoadingDelete.value = false;
  }
};

// Get capability name
const getCapabilityName = (capability: PlanCapability) => {
  if (capability.module) return capability.module.name;
  if (capability.feature) return capability.feature.name;
  if (capability.permission) return capability.permission.name;
  return "-";
};

// Get capability type color
const getTypeColor = (type: string) => {
  const colors: Record<string, string> = {
    module: "info",
    feature: "success",
    permission: "warning",
  };
  return colors[type] || "secondary";
};

// Get capability type text
const getTypeText = (type: string) => {
  const texts: Record<string, string> = {
    module: "Module",
    feature: "Feature",
    permission: "Permission",
  };
  return texts[type] || type;
};

// Filter data
const filteredCapabilities = computed(() => {
  let filtered = capabilities.value;

  // Filter by type
  if (typeFilter.value !== "all") {
    filtered = filtered.filter((c) => c.capabilityType === typeFilter.value);
  }

  // Filter by search
  if (search.value) {
    const searchLower = search.value.toLowerCase();
    filtered = filtered.filter((c) =>
      getCapabilityName(c).toLowerCase().includes(searchLower)
    );
  }

  return filtered;
});

// Watch plan selection
watch(selectedPlanId, async (newPlanId) => {
  if (newPlanId) {
    await fetchPlanCapabilities();
  } else {
    capabilities.value = [];
  }
});

onMounted(async () => {
  await Promise.all([
    fetchPlans(),
    fetchModules(),
    fetchFeatures(),
    fetchPermissions(),
  ]);
});
</script>

<template>
  <div data-testid="platform-plan-capabilities-page">
    <VCard>
      <VCardText
        class="d-flex flex-wrap justify-space-between align-center gap-4"
      >
        <h5 class="text-h5">Platform Plan Capabilities</h5>
      </VCardText>

      <VDivider />

      <VCardText>
        <VRow>
          <VCol cols="12" sm="6">
            <AppAutocomplete
              v-model="selectedPlanId"
              label="Pilih Plan"
              :items="
                plans.map((p) => ({
                  title: `${p.name} (${p.key})`,
                  value: p.planId,
                }))
              "
              :loading="isLoadingPlans"
              placeholder="Cari dan pilih plan"
              item-title="title"
              item-value="value"
            >
              <template #prepend-inner>
                <VIcon icon="tabler-package" />
              </template>
            </AppAutocomplete>
          </VCol>
        </VRow>

        <VAlert v-if="!selectedPlanId" type="info" variant="tonal" class="mt-4">
          Silakan pilih plan terlebih dahulu untuk melihat dan mengelola
          capabilities
        </VAlert>
      </VCardText>
    </VCard>

    <VCard v-if="selectedPlanId" class="mt-4">
      <VCardText
        class="d-flex flex-wrap justify-space-between align-center gap-4"
      >
        <h6 class="text-h6">
          Capabilities untuk:
          <span class="text-primary">{{
            plans.find((p) => p.planId === selectedPlanId)?.name
          }}</span>
        </h6>
        <div class="d-flex gap-2 flex-wrap">
          <VBtn
            color="info"
            prepend-icon="tabler-box"
            size="small"
            @click="openModuleDialog"
          >
            Tambah Module
          </VBtn>
          <VBtn
            color="success"
            prepend-icon="tabler-apps"
            size="small"
            @click="openFeatureDialog"
          >
            Tambah Feature
          </VBtn>
          <VBtn
            color="warning"
            prepend-icon="tabler-key"
            size="small"
            @click="openPermissionDialog"
          >
            Tambah Permission
          </VBtn>
        </div>
      </VCardText>

      <VDivider />

      <VCardText>
        <VRow>
          <VCol cols="12" sm="4">
            <AppTextField
              v-model="search"
              label="Search"
              placeholder="Cari capability..."
              prepend-inner-icon="tabler-search"
              clearable
            />
          </VCol>
          <VCol cols="12" sm="4">
            <AppSelect
              v-model="typeFilter"
              label="Filter Tipe"
              :items="[
                { title: 'Semua', value: 'all' },
                { title: 'Module', value: 'module' },
                { title: 'Feature', value: 'feature' },
                { title: 'Permission', value: 'permission' },
              ]"
            />
          </VCol>
        </VRow>
      </VCardText>

      <VDataTable
        :headers="headers"
        :items="filteredCapabilities"
        :loading="isLoading"
        class="text-no-wrap"
      >
        <template #item.index="{ index }">
          {{ index + 1 }}
        </template>

        <template #item.capabilityType="{ item }">
          <VChip
            size="small"
            :color="getTypeColor(item.capabilityType)"
            variant="tonal"
          >
            {{ getTypeText(item.capabilityType) }}
          </VChip>
        </template>

        <template #item.name="{ item }">
          <span class="text-body-2 font-weight-medium">{{
            getCapabilityName(item)
          }}</span>
        </template>

        <template #item.meta="{ item }">
          <VChip
            v-if="item.meta && Object.keys(item.meta).length > 0"
            size="small"
            variant="tonal"
          >
            {{ Object.keys(item.meta).length }} item(s)
          </VChip>
          <span v-else class="text-disabled">-</span>
        </template>

        <template #item.createdAt="{ item }">
          <span class="text-caption">{{
            new Date(item.createdAt).toLocaleDateString("id-ID")
          }}</span>
        </template>

        <template #item.actions="{ item }">
          <IconBtn size="small" @click="confirmDelete(item)">
            <VIcon icon="tabler-trash" color="error" />
          </IconBtn>
        </template>
      </VDataTable>
    </VCard>

    <!-- Add Module Dialog -->
    <VDialog v-model="moduleDialogVisible" max-width="500">
      <VCard>
        <VCardTitle class="d-flex justify-space-between align-center">
          <span>Tambah Module ke Plan</span>
          <IconBtn @click="closeModuleDialog">
            <VIcon icon="tabler-x" />
          </IconBtn>
        </VCardTitle>

        <VDivider />

        <VCardText>
          <VForm @submit.prevent="handleAddModule">
            <VRow>
              <VCol cols="12">
                <AppAutocomplete
                  v-model="moduleForm.moduleId"
                  label="Module"
                  :items="
                    modules.map((m) => ({ title: m.name, value: m.moduleId }))
                  "
                  :rules="[requiredValidator]"
                  placeholder="Cari dan pilih module"
                  item-title="title"
                  item-value="value"
                />
              </VCol>
              <VCol cols="12">
                <VDivider />
                <p class="text-caption text-disabled mt-2 mb-2">
                  Meta (opsional) - Tambahkan metadata jika diperlukan
                </p>
              </VCol>
              <VCol cols="12">
                <AppTextField
                  v-model="moduleForm.metaKey"
                  label="Meta Key"
                  placeholder="Contoh: grantedVia, maxUsers, etc"
                />
              </VCol>
              <VCol cols="12">
                <AppTextField
                  v-model="moduleForm.metaValue"
                  label="Meta Value"
                  placeholder="Contoh: admin, 100, etc"
                />
              </VCol>
            </VRow>

            <div class="d-flex justify-end gap-3 mt-4">
              <VBtn
                variant="outlined"
                color="secondary"
                @click="closeModuleDialog"
              >
                Batal
              </VBtn>
              <VBtn
                type="submit"
                color="primary"
                :loading="isLoadingModuleSubmit"
              >
                Tambahkan
              </VBtn>
            </div>
          </VForm>
        </VCardText>
      </VCard>
    </VDialog>

    <!-- Add Feature Dialog -->
    <VDialog v-model="featureDialogVisible" max-width="500">
      <VCard>
        <VCardTitle class="d-flex justify-space-between align-center">
          <span>Tambah Feature ke Plan</span>
          <IconBtn @click="closeFeatureDialog">
            <VIcon icon="tabler-x" />
          </IconBtn>
        </VCardTitle>

        <VDivider />

        <VCardText>
          <VForm @submit.prevent="handleAddFeature">
            <VRow>
              <VCol cols="12">
                <AppAutocomplete
                  v-model="featureForm.featureId"
                  label="Feature"
                  :items="
                    features.map((f) => ({ title: f.name, value: f.featureId }))
                  "
                  :rules="[requiredValidator]"
                  placeholder="Cari dan pilih feature"
                  item-title="title"
                  item-value="value"
                />
              </VCol>
              <VCol cols="12">
                <VDivider />
                <p class="text-caption text-disabled mt-2 mb-2">
                  Meta (opsional) - Tambahkan metadata jika diperlukan
                </p>
              </VCol>
              <VCol cols="12">
                <AppTextField
                  v-model="featureForm.metaKey"
                  label="Meta Key"
                  placeholder="Contoh: grantedVia, limit, etc"
                />
              </VCol>
              <VCol cols="12">
                <AppTextField
                  v-model="featureForm.metaValue"
                  label="Meta Value"
                  placeholder="Contoh: admin, 50, etc"
                />
              </VCol>
            </VRow>

            <div class="d-flex justify-end gap-3 mt-4">
              <VBtn
                variant="outlined"
                color="secondary"
                @click="closeFeatureDialog"
              >
                Batal
              </VBtn>
              <VBtn
                type="submit"
                color="primary"
                :loading="isLoadingFeatureSubmit"
              >
                Tambahkan
              </VBtn>
            </div>
          </VForm>
        </VCardText>
      </VCard>
    </VDialog>

    <!-- Add Permission Dialog -->
    <VDialog v-model="permissionDialogVisible" max-width="500">
      <VCard>
        <VCardTitle class="d-flex justify-space-between align-center">
          <span>Tambah Permission ke Plan</span>
          <IconBtn @click="closePermissionDialog">
            <VIcon icon="tabler-x" />
          </IconBtn>
        </VCardTitle>

        <VDivider />

        <VCardText>
          <VForm @submit.prevent="handleAddPermission">
            <VRow>
              <VCol cols="12">
                <AppAutocomplete
                  v-model="permissionForm.permissionId"
                  label="Permission"
                  :items="
                    permissions.map((p) => ({ title: p.name, value: p.id }))
                  "
                  :rules="[requiredValidator]"
                  placeholder="Cari dan pilih permission"
                  item-title="title"
                  item-value="value"
                />
              </VCol>
              <VCol cols="12">
                <VDivider />
                <p class="text-caption text-disabled mt-2 mb-2">
                  Meta (opsional) - Tambahkan metadata jika diperlukan
                </p>
              </VCol>
              <VCol cols="12">
                <AppTextField
                  v-model="permissionForm.metaKey"
                  label="Meta Key"
                  placeholder="Contoh: grantedVia, scope, etc"
                />
              </VCol>
              <VCol cols="12">
                <AppTextField
                  v-model="permissionForm.metaValue"
                  label="Meta Value"
                  placeholder="Contoh: admin, full, etc"
                />
              </VCol>
            </VRow>

            <div class="d-flex justify-end gap-3 mt-4">
              <VBtn
                variant="outlined"
                color="secondary"
                @click="closePermissionDialog"
              >
                Batal
              </VBtn>
              <VBtn
                type="submit"
                color="primary"
                :loading="isLoadingPermissionSubmit"
              >
                Tambahkan
              </VBtn>
            </div>
          </VForm>
        </VCardText>
      </VCard>
    </VDialog>

    <!-- Delete Confirmation -->
    <VDialog v-model="deleteDialogVisible" max-width="400">
      <VCard>
        <VCardTitle>Konfirmasi Hapus</VCardTitle>
        <VDivider />
        <VCardText>
          <template v-if="capabilityToDelete">
            <p>
              Apakah Anda yakin ingin menghapus
              {{ getTypeText(capabilityToDelete.capabilityType) }} "{{
                getCapabilityName(capabilityToDelete)
              }}" dari plan ini?
            </p>
          </template>

          <div class="d-flex justify-end gap-3 mt-4">
            <VBtn
              variant="outlined"
              color="secondary"
              :disabled="isLoadingDelete"
              @click="closeDeleteDialog"
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
