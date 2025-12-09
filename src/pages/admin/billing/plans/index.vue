<script setup lang="ts">
import AppAutocomplete from "@/@core/components/app-form-elements/AppAutocomplete.vue";
import AppSelect from "@/@core/components/app-form-elements/AppSelect.vue";
import AppTextField from "@/@core/components/app-form-elements/AppTextField.vue";
import { requiredValidator } from "@/@core/utils/validators";
import { $rootAPI } from "@/utils/api";
import { showToast } from "@/utils/toaster";
definePage({
  meta: {
    name: "Platform Plans",
    rules: [{ action: "manage", subject: "default" }],
  },
});

interface Package {
  packageId: string;
  key: string;
  name: string;
  description: string;
  isActive: boolean;
}

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
  package?: Package;
}

interface Capability {
  planCapabilityId: string;
  capabilityType: "module" | "feature" | "permission";
  module?: { name: string };
  feature?: { name: string };
  permission?: { name: string };
}

const isLoading = ref(false);
const isLoadingPackages = ref(false);
const plans = ref<Plan[]>([]);
const packages = ref<Package[]>([]);

const dialogVisible = ref(false);
const dialogMode = ref<"create" | "edit">("create");
const isLoadingSubmit = ref(false);
const selectedPlanId = ref<string | null>(null);

const deleteDialogVisible = ref(false);
const isLoadingDelete = ref(false);
const planToDelete = ref<string | null>(null);

const capabilitiesDialogVisible = ref(false);
const selectedPlanCapabilities = ref<Capability[]>([]);
const isLoadingCapabilities = ref(false);

const form = ref({
  packageId: "",
  key: "",
  name: "",
  currency: "IDR",
  amount: 0,
  interval: "month",
  intervalCount: 1,
  trialDays: null as number | null,
  isActive: true,
  meta: {} as Record<string, any>,
});

const metaKey = ref("");
const metaValue = ref("");

const fetchPlans = async () => {
  try {
    isLoading.value = true;

    const response = await $rootAPI("/platform/billing/plans", {
      method: "GET",
    });

    plans.value = response.data || [];

    // Fetch package details for each plan
    for (const plan of plans.value) {
      await fetchPackageForPlan(plan);
    }
  } catch (error) {
    console.error("Error fetching plans:", error);
  } finally {
    isLoading.value = false;
  }
};

const fetchPackageForPlan = async (plan: Plan) => {
  try {
    const response = await $rootAPI("/platform/system-config/packages", {
      method: "GET",
      params: {
        "filter[packageId]": plan.packageId,
      },
    });

    if (response.data && response.data.length > 0) {
      plan.package = response.data[0];
    }
  } catch (error) {
    console.error("Error fetching package:", error);
  }
};

const fetchPackages = async () => {
  try {
    isLoadingPackages.value = true;

    const response = await $rootAPI("/platform/system-config/packages", {
      method: "GET",
    });

    packages.value = response.data || [];
  } catch (error) {
    console.error("Error fetching packages:", error);
  } finally {
    isLoadingPackages.value = false;
  }
};

const fetchPlanCapabilities = async (planId: string) => {
  try {
    isLoadingCapabilities.value = true;

    const response = await $rootAPI(
      `/platform/system-config/plans/${planId}/capabilities`,
      {
        method: "GET",
      }
    );

    selectedPlanCapabilities.value = response.data || [];
    capabilitiesDialogVisible.value = true;
  } catch (error) {
    console.error("Error fetching capabilities:", error);
    showToast("Gagal memuat capabilities");
  } finally {
    isLoadingCapabilities.value = false;
  }
};

const openDialog = (mode: "create" | "edit", plan?: Plan) => {
  dialogMode.value = mode;
  selectedPlanId.value = plan?.planId || null;

  if (mode === "create") {
    form.value = {
      packageId: "",
      key: "",
      name: "",
      currency: "IDR",
      amount: 0,
      interval: "month",
      intervalCount: 1,
      trialDays: null,
      isActive: true,
      meta: {},
    };
  } else if (plan) {
    form.value = {
      packageId: plan.packageId,
      key: plan.key,
      name: plan.name,
      currency: plan.currency,
      amount: plan.amount,
      interval: plan.interval,
      intervalCount: plan.intervalCount,
      trialDays: plan.trialDays,
      isActive: plan.isActive,
      meta: {},
    };
  }

  dialogVisible.value = true;
};

const closeDialog = () => {
  dialogVisible.value = false;
  selectedPlanId.value = null;
  form.value = {
    packageId: "",
    key: "",
    name: "",
    currency: "IDR",
    amount: 0,
    interval: "month",
    intervalCount: 1,
    trialDays: null,
    isActive: true,
    meta: {},
  };
  metaKey.value = "";
  metaValue.value = "";
};

const addMeta = () => {
  if (metaKey.value.trim() && metaValue.value.trim()) {
    form.value.meta[metaKey.value.trim()] = metaValue.value.trim();
    metaKey.value = "";
    metaValue.value = "";
  }
};

const removeMeta = (key: string) => {
  delete form.value.meta[key];
};

const confirmDelete = (planId: string) => {
  planToDelete.value = planId;
  deleteDialogVisible.value = true;
};

const handleDelete = async () => {
  if (planToDelete.value) {
    try {
      isLoadingDelete.value = true;
      await $rootAPI(`/platform/billing/plans/${planToDelete.value}`, {
        method: "DELETE",
      });
      showToast("Plan berhasil dihapus", "success");
      deleteDialogVisible.value = false;
      planToDelete.value = null;
      await fetchPlans();
    } catch (error: any) {
      console.error("Error deleting plan:", error);
      showToast(error?.data?.message || "Gagal menghapus plan", "error");
    } finally {
      isLoadingDelete.value = false;
    }
  }
};

const handleSubmit = async () => {
  try {
    isLoadingSubmit.value = true;

    const payload = {
      packageId: form.value.packageId,
      key: form.value.key,
      name: form.value.name,
      currency: form.value.currency,
      amount: form.value.amount,
      interval: form.value.interval,
      intervalCount: form.value.intervalCount,
      trialDays: form.value.trialDays,
      isActive: form.value.isActive,
      meta: form.value.meta,
    };

    if (dialogMode.value === "create") {
      await $rootAPI("/platform/billing/plans", {
        method: "POST",
        body: payload,
      });
      showToast("Plan berhasil ditambahkan", "success");
    }

    closeDialog();
    await fetchPlans();
  } catch (error: any) {
    console.error("Error submitting form:", error);
    showToast(error?.data?.message || "Gagal menyimpan data plan", "error");
  } finally {
    isLoadingSubmit.value = false;
  }
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);
};

const getIntervalText = (interval: string) => {
  const texts: Record<string, string> = {
    day: "hari",
    week: "minggu",
    month: "bulan",
    year: "tahun",
  };
  return texts[interval] || interval;
};

const getCapabilityName = (capability: Capability) => {
  if (capability.module) return capability.module.name;
  if (capability.feature) return capability.feature.name;
  if (capability.permission) return capability.permission.name;
  return "-";
};

const getCapabilityType = (type: string) => {
  const types: Record<string, string> = {
    module: "Module",
    feature: "Feature",
    permission: "Permission",
  };
  return types[type] || type;
};

const getCapabilityColor = (type: string) => {
  const colors: Record<string, string> = {
    module: "info",
    feature: "success",
    permission: "warning",
  };
  return colors[type] || "secondary";
};

onMounted(async () => {
  await Promise.all([fetchPlans(), fetchPackages()]);
});
</script>

<template>
  <div data-testid="platform-plans-page">
    <VCard>
      <VCardText
        class="d-flex flex-wrap justify-space-between align-center gap-4"
      >
        <h5 class="text-h5">Platform Plans</h5>
        <VBtn
          color="primary"
          prepend-icon="tabler-plus"
          @click="openDialog('create')"
        >
          Tambah Plan
        </VBtn>
      </VCardText>
    </VCard>

    <VRow v-if="isLoading" class="mt-4">
      <VCol cols="12" class="text-center py-10">
        <VProgressCircular indeterminate color="primary" />
      </VCol>
    </VRow>

    <VRow v-else class="mt-4">
      <VCol v-for="plan in plans" :key="plan.planId" cols="12" md="4">
        <VCard class="h-100 d-flex flex-column">
          <VCardText class="text-center pb-0 flex-grow-1 d-flex flex-column">
            <h4 class="text-h4 mb-1">{{ plan.name }}</h4>
            <p class="text-body-2 text-disabled mb-2">
              {{ plan.package?.name || "-" }}
            </p>
            <p class="text-caption mb-4" style="min-height: 40px">
              {{ plan.package?.description || "-" }}
            </p>

            <div class="d-flex align-center justify-center gap-1 mb-4">
              <h3 class="text-h3 text-primary">
                {{ formatCurrency(plan.amount) }}
              </h3>
              <span class="text-body-2"
                >/{{ getIntervalText(plan.interval) }}</span
              >
            </div>

            <div class="d-flex justify-center gap-2 mb-3 flex-wrap">
              <VChip size="small" :color="plan.isActive ? 'success' : 'error'">
                {{ plan.isActive ? "Aktif" : "Tidak Aktif" }}
              </VChip>
              <VChip
                v-if="plan.trialDays"
                size="small"
                color="info"
                variant="tonal"
              >
                Trial {{ plan.trialDays }} hari
              </VChip>
            </div>

            <VBtn
              variant="text"
              size="small"
              color="primary"
              class="mt-auto"
              @click="fetchPlanCapabilities(plan.planId)"
            >
              Lihat Capabilities
            </VBtn>
          </VCardText>

          <VDivider />

          <VCardActions class="justify-center pb-4">
            <VBtn
              variant="outlined"
              color="warning"
              size="small"
              @click="openDialog('edit', plan)"
            >
              <VIcon icon="tabler-edit" class="me-1" size="18" />
              Edit
            </VBtn>
            <VBtn
              variant="outlined"
              color="error"
              size="small"
              @click="confirmDelete(plan.planId)"
            >
              <VIcon icon="tabler-trash" class="me-1" size="18" />
              Hapus
            </VBtn>
          </VCardActions>
        </VCard>
      </VCol>
    </VRow>

    <!-- Plan Dialog -->
    <VDialog v-model="dialogVisible" max-width="700">
      <VCard>
        <VCardTitle class="d-flex justify-space-between align-center">
          <span>{{
            dialogMode === "create" ? "Tambah Plan" : "Edit Plan"
          }}</span>
          <IconBtn @click="closeDialog">
            <VIcon icon="tabler-x" />
          </IconBtn>
        </VCardTitle>

        <VDivider />

        <VCardText>
          <VForm @submit.prevent="handleSubmit">
            <VRow>
              <VCol cols="12" md="6">
                <AppAutocomplete
                  v-model="form.packageId"
                  label="Package"
                  :items="
                    packages.map((p) => ({ title: p.name, value: p.packageId }))
                  "
                  :rules="[requiredValidator]"
                  placeholder="Pilih package"
                  item-title="title"
                  item-value="value"
                />
              </VCol>
              <VCol cols="12" md="6">
                <AppTextField
                  v-model="form.key"
                  label="Key"
                  placeholder="basic-monthly"
                  :rules="[requiredValidator]"
                />
              </VCol>
              <VCol cols="12">
                <AppTextField
                  v-model="form.name"
                  label="Nama Plan"
                  placeholder="Basic Monthly"
                  :rules="[requiredValidator]"
                />
              </VCol>
              <VCol cols="12" md="4">
                <AppSelect
                  v-model="form.currency"
                  label="Currency"
                  :items="[
                    { title: 'IDR', value: 'IDR' },
                    { title: 'USD', value: 'USD' },
                  ]"
                  :rules="[requiredValidator]"
                />
              </VCol>
              <VCol cols="12" md="4">
                <AppTextField
                  v-model.number="form.amount"
                  label="Amount"
                  type="number"
                  placeholder="100000"
                  :rules="[requiredValidator]"
                />
              </VCol>
              <VCol cols="12" md="4">
                <AppTextField
                  v-model.number="form.trialDays"
                  label="Trial Days"
                  type="number"
                  placeholder="7"
                />
              </VCol>
              <VCol cols="12" md="6">
                <AppSelect
                  v-model="form.interval"
                  label="Interval"
                  :items="[
                    { title: 'Day', value: 'day' },
                    { title: 'Week', value: 'week' },
                    { title: 'Month', value: 'month' },
                    { title: 'Year', value: 'year' },
                  ]"
                  :rules="[requiredValidator]"
                />
              </VCol>
              <VCol cols="12" md="6">
                <AppTextField
                  v-model.number="form.intervalCount"
                  label="Interval Count"
                  type="number"
                  :rules="[requiredValidator]"
                />
              </VCol>
              <VCol cols="12">
                <VSwitch
                  v-model="form.isActive"
                  label="Plan Aktif"
                  color="primary"
                />
              </VCol>

              <VCol cols="12">
                <VDivider />
                <p class="text-body-2 font-weight-medium mt-3 mb-2">
                  Meta (opsional) - Data tambahan dalam format key-value
                </p>
                <div class="d-flex gap-2 mb-3">
                  <AppTextField
                    v-model="metaKey"
                    placeholder="Key (contoh: maxUsers, storage)"
                    density="compact"
                  />
                  <AppTextField
                    v-model="metaValue"
                    placeholder="Value (contoh: 100, 10GB)"
                    density="compact"
                  />
                  <VBtn color="primary" size="small" @click="addMeta"
                    >Tambah</VBtn
                  >
                </div>
                <div
                  v-if="Object.keys(form.meta).length > 0"
                  class="d-flex flex-wrap gap-2"
                >
                  <VChip
                    v-for="(value, key) in form.meta"
                    :key="key"
                    closable
                    color="primary"
                    variant="tonal"
                    @click:close="removeMeta(String(key))"
                  >
                    <strong>{{ key }}:</strong>&nbsp;{{ value }}
                  </VChip>
                </div>
                <p v-else class="text-caption text-disabled">
                  Belum ada meta ditambahkan
                </p>
              </VCol>
            </VRow>

            <div class="d-flex justify-end gap-3 mt-4">
              <VBtn variant="outlined" color="secondary" @click="closeDialog">
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

    <!-- Capabilities Dialog -->
    <VDialog v-model="capabilitiesDialogVisible" max-width="600">
      <VCard>
        <VCardTitle class="d-flex justify-space-between align-center">
          <span>Plan Capabilities</span>
          <IconBtn @click="capabilitiesDialogVisible = false">
            <VIcon icon="tabler-x" />
          </IconBtn>
        </VCardTitle>

        <VDivider />

        <VCardText>
          <div v-if="isLoadingCapabilities" class="text-center py-8">
            <VProgressCircular indeterminate color="primary" />
          </div>
          <div
            v-else-if="selectedPlanCapabilities.length === 0"
            class="text-center py-8"
          >
            <p class="text-body-2 text-disabled">Tidak ada capabilities</p>
          </div>
          <VList v-else>
            <VListItem
              v-for="capability in selectedPlanCapabilities"
              :key="capability.planCapabilityId"
            >
              <template #prepend>
                <VChip
                  size="small"
                  :color="getCapabilityColor(capability.capabilityType)"
                  variant="tonal"
                >
                  {{ getCapabilityType(capability.capabilityType) }}
                </VChip>
              </template>
              <VListItemTitle class="ms-2">{{
                getCapabilityName(capability)
              }}</VListItemTitle>
            </VListItem>
          </VList>
        </VCardText>

        <VCardActions>
          <VSpacer />
          <VBtn variant="outlined" @click="capabilitiesDialogVisible = false">
            Tutup
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>

    <!-- Delete Confirmation -->
    <VDialog v-model="deleteDialogVisible" max-width="400">
      <VCard>
        <VCardTitle>Konfirmasi Hapus</VCardTitle>
        <VCardText>Apakah Anda yakin ingin menghapus plan ini?</VCardText>
        <VCardActions>
          <VSpacer />
          <VBtn variant="outlined" @click="deleteDialogVisible = false">
            Batal
          </VBtn>
          <VBtn color="error" :loading="isLoadingDelete" @click="handleDelete">
            Hapus
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </div>
</template>
