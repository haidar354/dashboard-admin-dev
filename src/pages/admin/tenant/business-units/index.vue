<script setup lang="ts">
import AppSelect from "@/@core/components/app-form-elements/AppSelect.vue";
import AppTextField from "@/@core/components/app-form-elements/AppTextField.vue";
import AppTextarea from "@/@core/components/app-form-elements/AppTextarea.vue";
import { requiredValidator } from "@/@core/utils/validators";
import { $rootAPI } from "@/utils/api";
import { customDebounce } from "@/utils/common";
import { showToast } from "@/utils/toaster";
definePage({
  meta: {
    name: "Platform Business Units",
    rules: [{ action: "manage", subject: "default" }],
  },
});

interface BusinessUnit {
  businessUnitId: string;
  companyId: string;
  code: string;
  name: string;
  logo: string | null;
  description: string | null;
  isActive: boolean;
  costMethod: string;
  provinceCode: string | null;
  cityCode: string | null;
  createdAt: string;
  updatedAt: string;
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

const logoInput = ref<HTMLInputElement | null>(null);

const isLoading = ref(false);
const paginateData = ref<{ data: BusinessUnit[]; meta: PaginationMeta | null }>(
  {
    data: [],
    meta: null,
  }
);

const requestQuery = ref({
  page: 1,
  perPage: 20,
  search: "",
});

const search = ref("");
const dialogVisible = ref(false);
const dialogMode = ref<"create" | "edit" | "view">("create");
const isLoadingSubmit = ref(false);
const isLoadingAction = ref(false);
const deleteDialogVisible = ref(false);
const businessUnitToDelete = ref<string | null>(null);
const selectedBusinessUnitId = ref<string | null>(null);
const selectedBusinessUnit = ref<any>(null);
const detailDialogVisible = ref(false);

const form = ref({
  companyId: "",
  name: "",
  description: "",
  logo: null as File | null,
  provinceCode: "",
  cityCode: "",
  costMethod: "fifo",
  isActive: true,
});

const logoPreview = ref<string | null>(null);

const headers = [
  { title: "No", key: "index", width: "60px", sortable: false },
  { title: "Business Unit", key: "name", sortable: false },
  { title: "Code", key: "code", sortable: false },
  { title: "Company", key: "companyId", sortable: false },
  { title: "Cost Method", key: "costMethod", sortable: false },
  { title: "Status", key: "isActive", sortable: false },
  { title: "Aksi", key: "actions", width: "120px", sortable: false },
];

const fetchBusinessUnits = async () => {
  try {
    isLoading.value = true;

    const params: Record<string, any> = {
      page: requestQuery.value.page,
      perPage: requestQuery.value.perPage,
    };

    if (requestQuery.value.search) {
      params["filter[name]"] = requestQuery.value.search;
    }

    const response: any = await $rootAPI("/platform/tenant/business-units", {
      method: "GET",
      params,
    });

    paginateData.value = {
      data: response.data || [],
      meta: response.meta || null,
    };
  } catch (error) {
    console.error("Error fetching business units:", error);
  } finally {
    isLoading.value = false;
  }
};

const fetchBusinessUnitDetail = async (businessUnitId: string) => {
  try {
    const response: any = await $rootAPI(
      `/platform/tenant/business-units/${businessUnitId}`,
      {
        method: "GET",
      }
    );
    selectedBusinessUnit.value = response.data;
    detailDialogVisible.value = true;
  } catch (error) {
    console.error("Error fetching business unit detail:", error);
    showToast("Gagal memuat detail business unit", "error");
  }
};

const openDialog = (
  mode: "create" | "edit" | "view",
  businessUnit?: BusinessUnit
) => {
  dialogMode.value = mode;
  selectedBusinessUnitId.value = businessUnit?.businessUnitId || null;

  if (mode === "create") {
    form.value = {
      companyId: "",
      name: "",
      description: "",
      logo: null,
      provinceCode: "",
      cityCode: "",
      costMethod: "fifo",
      isActive: true,
    };
    logoPreview.value = null;
  } else if (mode === "view" && businessUnit) {
    fetchBusinessUnitDetail(businessUnit.businessUnitId);
    return;
  } else if (mode === "edit" && businessUnit) {
    form.value = {
      companyId: businessUnit.companyId,
      name: businessUnit.name,
      description: businessUnit.description || "",
      logo: null,
      provinceCode: businessUnit.provinceCode || "",
      cityCode: businessUnit.cityCode || "",
      costMethod: businessUnit.costMethod,
      isActive: businessUnit.isActive,
    };
    logoPreview.value = businessUnit.logo;
  }

  dialogVisible.value = true;
};

const closeDialog = () => {
  dialogVisible.value = false;
  selectedBusinessUnitId.value = null;
  form.value = {
    companyId: "",
    name: "",
    description: "",
    logo: null,
    provinceCode: "",
    cityCode: "",
    costMethod: "fifo",
    isActive: true,
  };
  logoPreview.value = null;
};

const handleLogoChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    form.value.logo = target.files[0];

    const reader = new FileReader();
    reader.onload = (e) => {
      logoPreview.value = e.target?.result as string;
    };
    reader.readAsDataURL(target.files[0]);
  }
};

const handleSubmit = async () => {
  try {
    isLoadingSubmit.value = true;

    const formData = new FormData();
    formData.append("companyId", form.value.companyId);
    formData.append("name", form.value.name);
    formData.append("costMethod", form.value.costMethod);
    formData.append("isActive", form.value.isActive ? "1" : "0");

    if (form.value.description) {
      formData.append("description", form.value.description);
    }
    if (form.value.provinceCode) {
      formData.append("provinceCode", form.value.provinceCode);
    }
    if (form.value.cityCode) {
      formData.append("cityCode", form.value.cityCode);
    }
    if (form.value.logo) {
      formData.append("logo", form.value.logo);
    }

    if (dialogMode.value === "create") {
      await $rootAPI("/platform/tenant/business-units", {
        method: "POST",
        body: formData,
      });
      showToast("Business Unit berhasil ditambahkan", "success");
    } else if (dialogMode.value === "edit" && selectedBusinessUnitId.value) {
      await $rootAPI(
        `/platform/tenant/business-units/${selectedBusinessUnitId.value}`,
        {
          method: "PATCH",
          body: formData,
        }
      );
      showToast("Business Unit berhasil diupdate", "success");
    }

    closeDialog();
    await fetchBusinessUnits();
  } catch (error: any) {
    console.error("Error submitting form:", error);
    showToast(error?.message || "Gagal menyimpan data business unit", "error");
  } finally {
    isLoadingSubmit.value = false;
  }
};

const confirmDelete = (businessUnitId: string) => {
  businessUnitToDelete.value = businessUnitId;
  deleteDialogVisible.value = true;
};

const handleDelete = async () => {
  if (businessUnitToDelete.value) {
    try {
      isLoadingAction.value = true;
      await $rootAPI(
        `/platform/tenant/business-units/${businessUnitToDelete.value}`,
        {
          method: "DELETE",
        }
      );
      showToast("Business Unit berhasil dihapus", "success");
      deleteDialogVisible.value = false;
      businessUnitToDelete.value = null;
      await fetchBusinessUnits();
    } catch (error: any) {
      console.error("Error deleting business unit:", error);
      showToast(error?.message || "Gagal menghapus business unit", "error");
    } finally {
      isLoadingAction.value = false;
    }
  }
};

const getStatusColor = (isActive: boolean) => {
  return isActive ? "success" : "secondary";
};

const getStatusText = (isActive: boolean) => {
  return isActive ? "Active" : "Inactive";
};

const getCostMethodColor = (method: string) => {
  const colors: Record<string, string> = {
    fifo: "primary",
    lifo: "info",
    weighted: "success",
    average: "warning",
  };
  return colors[method] || "secondary";
};

watch(
  search,
  customDebounce((val: string) => {
    requestQuery.value.search = val;
    requestQuery.value.page = 1;
  }, 500)
);

watch(
  requestQuery,
  async () => {
    await fetchBusinessUnits();
  },
  { deep: true }
);

onMounted(async () => {
  await fetchBusinessUnits();
});
</script>

<template>
  <div data-testid="platform-business-units-page">
    <VCard>
      <VCardText
        class="d-flex flex-wrap justify-space-between align-center gap-4"
      >
        <h5 class="text-h5">Platform Business Units</h5>
        <VBtn
          color="primary"
          prepend-icon="tabler-plus"
          @click="openDialog('create')"
        >
          Tambah Business Unit
        </VBtn>
      </VCardText>

      <VDivider />

      <VCardText>
        <VRow>
          <VCol cols="12" sm="4">
            <AppTextField
              v-model="search"
              label="Search"
              placeholder="Cari business unit..."
              prepend-inner-icon="tabler-search"
              clearable
            />
          </VCol>
        </VRow>
      </VCardText>

      <VDataTable
        v-model:page="requestQuery.page"
        v-model:items-per-page="requestQuery.perPage"
        :headers="headers"
        :items="paginateData.data"
        :items-length="paginateData.meta?.total || 0"
        :loading="isLoading"
        class="text-no-wrap"
      >
        <template #item.index="{ index }">
          {{ (requestQuery.page - 1) * requestQuery.perPage + index + 1 }}
        </template>

        <template #item.name="{ item }">
          <div class="d-flex align-center gap-3">
            <VAvatar size="38">
              <VImg v-if="item.logo" :src="item.logo" />
              <VIcon v-else icon="tabler-hierarchy-2" />
            </VAvatar>
            <div>
              <div class="font-weight-medium">{{ item.name }}</div>
              <div class="text-caption text-disabled">
                {{ item.description || "-" }}
              </div>
            </div>
          </div>
        </template>

        <template #item.code="{ item }">
          <code class="text-caption">{{ item.code }}</code>
        </template>

        <template #item.companyId="{ item }">
          <span class="text-caption text-disabled">{{ item.companyId }}</span>
        </template>

        <template #item.costMethod="{ item }">
          <VChip
            size="small"
            :color="getCostMethodColor(item.costMethod)"
            variant="tonal"
          >
            {{ item.costMethod.toUpperCase() }}
          </VChip>
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
            <IconBtn size="small" @click="confirmDelete(item.businessUnitId)">
              <VIcon icon="tabler-trash" color="error" />
            </IconBtn>
          </div>
        </template>
      </VDataTable>
    </VCard>

    <!-- Create/Edit Dialog -->
    <VDialog v-model="dialogVisible" max-width="700" persistent scrollable>
      <VCard>
        <VCardTitle class="d-flex justify-space-between align-center">
          <span>{{
            dialogMode === "create"
              ? "Tambah Business Unit"
              : "Edit Business Unit"
          }}</span>
          <IconBtn @click="closeDialog">
            <VIcon icon="tabler-x" />
          </IconBtn>
        </VCardTitle>

        <VDivider />

        <VCardText style="max-height: 60vh">
          <VForm @submit.prevent="handleSubmit">
            <VRow>
              <VCol cols="12">
                <div class="mb-4">
                  <p class="text-body-2 mb-2">Logo</p>
                  <div class="d-flex align-center gap-4">
                    <VAvatar size="80">
                      <VImg v-if="logoPreview" :src="logoPreview" />
                      <VIcon v-else icon="tabler-hierarchy-2" size="40" />
                    </VAvatar>
                    <VBtn
                      color="primary"
                      variant="outlined"
                      size="small"
                      @click="logoInput?.click()"
                    >
                      Upload Logo
                    </VBtn>
                    <input
                      ref="logoInput"
                      type="file"
                      accept="image/*"
                      hidden
                      @change="handleLogoChange"
                    />
                  </div>
                </div>
              </VCol>
              <VCol cols="12">
                <AppTextField
                  v-model="form.companyId"
                  label="Company ID"
                  placeholder="019949f6-6d61-72d8-bf60-ae143e387010"
                  :rules="[requiredValidator]"
                />
              </VCol>
              <VCol cols="12">
                <AppTextField
                  v-model="form.name"
                  label="Nama Business Unit"
                  placeholder="My Business Unit"
                  :rules="[requiredValidator]"
                />
              </VCol>
              <VCol cols="12">
                <AppTextarea
                  v-model="form.description"
                  label="Deskripsi"
                  placeholder="Optional description here"
                  rows="3"
                />
              </VCol>
              <VCol cols="12" md="6">
                <AppSelect
                  v-model="form.costMethod"
                  label="Cost Method"
                  :items="[
                    { title: 'FIFO', value: 'fifo' },
                    { title: 'LIFO', value: 'lifo' },
                    { title: 'Weighted', value: 'weighted' },
                    { title: 'Average', value: 'average' },
                  ]"
                  :rules="[requiredValidator]"
                />
              </VCol>
              <VCol cols="12" md="6">
                <VSwitch
                  v-model="form.isActive"
                  label="Active"
                  color="success"
                />
              </VCol>
              <VCol cols="12" md="6">
                <AppTextField
                  v-model="form.provinceCode"
                  label="Province Code"
                  placeholder="31"
                />
              </VCol>
              <VCol cols="12" md="6">
                <AppTextField
                  v-model="form.cityCode"
                  label="City Code"
                  placeholder="3174"
                />
              </VCol>
            </VRow>

            <div class="d-flex justify-end gap-3 mt-4">
              <VBtn variant="outlined" color="secondary" @click="closeDialog">
                Batal
              </VBtn>
              <VBtn color="primary" :loading="isLoadingSubmit" type="submit">
                {{ dialogMode === "create" ? "Simpan" : "Update" }}
              </VBtn>
            </div>
          </VForm>
        </VCardText>
      </VCard>
    </VDialog>

    <!-- Detail Dialog -->
    <VDialog v-model="detailDialogVisible" max-width="800" scrollable>
      <VCard v-if="selectedBusinessUnit">
        <VCardTitle class="d-flex justify-space-between align-center">
          <span>Detail Business Unit</span>
          <IconBtn @click="detailDialogVisible = false">
            <VIcon icon="tabler-x" />
          </IconBtn>
        </VCardTitle>

        <VDivider />

        <VCardText style="max-height: 60vh">
          <VRow>
            <VCol cols="12" class="text-center">
              <VAvatar size="100" class="mb-3">
                <VImg
                  v-if="selectedBusinessUnit.logo"
                  :src="selectedBusinessUnit.logo"
                />
                <VIcon v-else icon="tabler-hierarchy-2" size="50" />
              </VAvatar>
              <h5 class="text-h5 mb-1">{{ selectedBusinessUnit.name }}</h5>
              <p class="text-caption text-disabled">
                {{ selectedBusinessUnit.code }}
              </p>
            </VCol>

            <VCol cols="12"><VDivider /></VCol>

            <VCol cols="12" md="6">
              <p class="text-caption text-disabled mb-1">Company</p>
              <p class="font-weight-medium" v-if="selectedBusinessUnit.company">
                {{ selectedBusinessUnit.company.name }}
              </p>
            </VCol>
            <VCol cols="12" md="6">
              <p class="text-caption text-disabled mb-1">Cost Method</p>
              <VChip
                size="small"
                :color="getCostMethodColor(selectedBusinessUnit.costMethod)"
                variant="tonal"
              >
                {{ selectedBusinessUnit.costMethod.toUpperCase() }}
              </VChip>
            </VCol>
            <VCol cols="12" md="6">
              <p class="text-caption text-disabled mb-1">Status</p>
              <VChip
                size="small"
                :color="getStatusColor(selectedBusinessUnit.isActive)"
              >
                {{ getStatusText(selectedBusinessUnit.isActive) }}
              </VChip>
            </VCol>
            <VCol cols="12" md="6">
              <p class="text-caption text-disabled mb-1">Location</p>
              <p>
                {{ selectedBusinessUnit.provinceCode || "-" }} /
                {{ selectedBusinessUnit.cityCode || "-" }}
              </p>
            </VCol>

            <VCol v-if="selectedBusinessUnit.description" cols="12">
              <p class="text-caption text-disabled mb-1">Description</p>
              <p>{{ selectedBusinessUnit.description }}</p>
            </VCol>

            <VCol
              v-if="
                selectedBusinessUnit.outlets &&
                selectedBusinessUnit.outlets.length > 0
              "
              cols="12"
            >
              <VDivider class="mb-3" />
              <h6 class="text-h6 mb-3">
                Outlets ({{ selectedBusinessUnit.outlets.length }})
              </h6>
              <VList density="compact">
                <VListItem
                  v-for="outlet in selectedBusinessUnit.outlets"
                  :key="outlet.outletId"
                >
                  <template #prepend>
                    <VAvatar size="32">
                      <VImg v-if="outlet.logo" :src="outlet.logo" />
                      <VIcon v-else icon="tabler-building-store" size="18" />
                    </VAvatar>
                  </template>
                  <VListItemTitle>{{ outlet.name }}</VListItemTitle>
                  <VListItemSubtitle>{{
                    outlet.address || "-"
                  }}</VListItemSubtitle>
                </VListItem>
              </VList>
            </VCol>
          </VRow>
        </VCardText>

        <div class="d-flex justify-end gap-3 mt-4">
          <VBtn
            variant="outlined"
            color="secondary"
            @click="detailDialogVisible = false"
          >
            Tutup
          </VBtn>
        </div>
      </VCard>
    </VDialog>

    <!-- Delete Confirmation -->
    <VDialog v-model="deleteDialogVisible" max-width="400">
      <VCard>
        <VCardTitle>Konfirmasi Hapus</VCardTitle>
        <VDivider />
        <VCardText>
          <p>Apakah Anda yakin ingin menghapus business unit ini?</p>
        </VCardText>
        <div class="d-flex justify-end gap-3 mt-4">
          <VBtn
            variant="outlined"
            color="secondary"
            @click="deleteDialogVisible = false"
          >
            Batal
          </VBtn>
          <VBtn color="error" :loading="isLoadingAction" @click="handleDelete">
            Hapus
          </VBtn>
        </div>
      </VCard>
    </VDialog>
  </div>
</template>
