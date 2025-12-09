<script setup lang="ts">
import AppTextField from "@/@core/components/app-form-elements/AppTextField.vue";
import AppTextarea from "@/@core/components/app-form-elements/AppTextarea.vue";
import { requiredValidator } from "@/@core/utils/validators";
import { $rootAPI } from "@/utils/api";
import { customDebounce } from "@/utils/common";
import { showToast } from "@/utils/toaster";
definePage({
  meta: {
    name: "Platform Companies",
    rules: [{ action: "manage", subject: "default" }],
  },
});

interface Company {
  companyId: string;
  code: string;
  name: string;
  logo: string | null;
  isActive: boolean;
  ownerId: string;
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

const isLoading = ref(false);
const paginateData = ref<{ data: Company[]; meta: PaginationMeta | null }>({
  data: [],
  meta: null,
});

const requestQuery = ref({
  page: 1,
  perPage: 20,
  search: "",
});

const search = ref("");
const dialogVisible = ref(false);
const dialogMode = ref<"create" | "edit">("create");
const isLoadingSubmit = ref(false);
const isLoadingAction = ref(false);
const deleteDialogVisible = ref(false);
const suspendDialogVisible = ref(false);
const companyToDelete = ref<string | null>(null);
const companyToSuspend = ref<string | null>(null);
const selectedCompanyId = ref<string | null>(null);
const suspendReason = ref("");

const form = ref({
  name: "",
  ownerId: "",
  code: "",
  isActive: true,
  provinceCode: "",
  cityCode: "",
  logo: null as File | null,
});

const logoPreview = ref<string | null>(null);

const headers = [
  { title: "No", key: "index", width: "60px", sortable: false },
  { title: "Company", key: "name", sortable: false },
  { title: "Code", key: "code", sortable: false },
  { title: "Status", key: "isActive", sortable: false },
  { title: "Province", key: "provinceCode", sortable: false },
  { title: "City", key: "cityCode", sortable: false },
  { title: "Aksi", key: "actions", width: "150px", sortable: false },
];

const logoInput = ref<HTMLInputElement | null>(null);

const fetchCompanies = async () => {
  try {
    isLoading.value = true;

    const params: Record<string, any> = {
      page: requestQuery.value.page,
      perPage: requestQuery.value.perPage,
    };

    if (requestQuery.value.search) {
      params["filter[name]"] = requestQuery.value.search;
    }

    const response: any = await $rootAPI("/platform/tenant/companies", {
      method: "GET",
      params,
    });

    paginateData.value = {
      data: response.data || [],
      meta: response.meta || null,
    };
  } catch (error) {
    console.error("Error fetching companies:", error);
  } finally {
    isLoading.value = false;
  }
};

const openDialog = (mode: "create" | "edit", company?: Company) => {
  dialogMode.value = mode;
  selectedCompanyId.value = company?.companyId || null;

  if (mode === "create") {
    form.value = {
      name: "",
      ownerId: "",
      code: "",
      isActive: true,
      provinceCode: "",
      cityCode: "",
      logo: null,
    };
    logoPreview.value = null;
  } else if (company) {
    form.value = {
      name: company.name,
      ownerId: company.ownerId,
      code: company.code,
      isActive: company.isActive,
      provinceCode: company.provinceCode || "",
      cityCode: company.cityCode || "",
      logo: null,
    };
    logoPreview.value = company.logo;
  }

  dialogVisible.value = true;
};

const closeDialog = () => {
  dialogVisible.value = false;
  selectedCompanyId.value = null;
  form.value = {
    name: "",
    ownerId: "",
    code: "",
    isActive: true,
    provinceCode: "",
    cityCode: "",
    logo: null,
  };
  logoPreview.value = null;
};

const handleLogoChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    form.value.logo = target.files[0];

    // Create preview
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
    formData.append("name", form.value.name);
    formData.append("ownerId", form.value.ownerId);
    formData.append("code", form.value.code);
    formData.append("isActive", form.value.isActive ? "1" : "0");

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
      await $rootAPI("/platform/tenant/companies", {
        method: "POST",
        body: formData,
      });
      showToast("Company berhasil ditambahkan", "success");
    } else if (dialogMode.value === "edit" && selectedCompanyId.value) {
      await $rootAPI(`/platform/tenant/companies/${selectedCompanyId.value}`, {
        method: "PATCH",
        body: formData,
      });
      showToast("Company berhasil diupdate", "success");
    }

    closeDialog();
    await fetchCompanies();
  } catch (error: any) {
    console.error("Error submitting form:", error);
    showToast(error?.message || "Gagal menyimpan data company", "error");
  } finally {
    isLoadingSubmit.value = false;
  }
};

const confirmDelete = (companyId: string) => {
  companyToDelete.value = companyId;
  deleteDialogVisible.value = true;
};

const handleDelete = async () => {
  if (companyToDelete.value) {
    try {
      isLoadingAction.value = true;
      await $rootAPI(`/platform/tenant/companies/${companyToDelete.value}`, {
        method: "DELETE",
      });
      showToast("Company berhasil dihapus", "success");
      deleteDialogVisible.value = false;
      companyToDelete.value = null;
      await fetchCompanies();
    } catch (error: any) {
      console.error("Error deleting company:", error);
      showToast(error?.message || "Gagal menghapus company", "error");
    } finally {
      isLoadingAction.value = false;
    }
  }
};

const openSuspendDialog = (companyId: string) => {
  companyToSuspend.value = companyId;
  suspendReason.value = "";
  suspendDialogVisible.value = true;
};

const handleSuspend = async () => {
  if (companyToSuspend.value) {
    try {
      isLoadingAction.value = true;
      await $rootAPI(
        `/platform/tenant/companies/${companyToSuspend.value}/suspend`,
        {
          method: "POST",
        }
      );
      showToast("Company berhasil disuspend", "success");
      suspendDialogVisible.value = false;
      companyToSuspend.value = null;
      suspendReason.value = "";
      await fetchCompanies();
    } catch (error: any) {
      console.error("Error suspending company:", error);
      showToast(error?.message || "Gagal suspend company", "error");
    } finally {
      isLoadingAction.value = false;
    }
  }
};

const handleResume = async (companyId: string) => {
  try {
    isLoadingAction.value = true;
    await $rootAPI(`/platform/tenant/companies/${companyId}/resume`, {
      method: "POST",
    });
    showToast("Company berhasil diresume", "success");
    await fetchCompanies();
  } catch (error: any) {
    console.error("Error resuming company:", error);
    showToast(error?.message || "Gagal resume company", "error");
  } finally {
    isLoadingAction.value = false;
  }
};

const getStatusColor = (isActive: boolean) => {
  return isActive ? "success" : "error";
};

const getStatusText = (isActive: boolean) => {
  return isActive ? "Active" : "Suspended";
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
    await fetchCompanies();
  },
  { deep: true }
);

onMounted(async () => {
  await fetchCompanies();
});
</script>

<template>
  <div data-testid="platform-companies-page">
    <VCard>
      <VCardText
        class="d-flex flex-wrap justify-space-between align-center gap-4"
      >
        <h5 class="text-h5">Platform Companies (Tenant)</h5>
        <VBtn
          color="primary"
          prepend-icon="tabler-plus"
          @click="openDialog('create')"
        >
          Tambah Company
        </VBtn>
      </VCardText>

      <VDivider />

      <VCardText>
        <VRow>
          <VCol cols="12" sm="4">
            <AppTextField
              v-model="search"
              label="Search"
              placeholder="Cari company..."
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
              <span v-else class="text-sm">{{
                item.name.charAt(0).toUpperCase()
              }}</span>
            </VAvatar>
            <div>
              <div class="font-weight-medium">{{ item.name }}</div>
              <div class="text-caption text-disabled">
                Owner: {{ item.ownerId }}
              </div>
            </div>
          </div>
        </template>

        <template #item.code="{ item }">
          <code class="text-caption">{{ item.code }}</code>
        </template>

        <template #item.isActive="{ item }">
          <VChip size="small" :color="getStatusColor(item.isActive)">
            {{ getStatusText(item.isActive) }}
          </VChip>
        </template>

        <template #item.provinceCode="{ item }">
          {{ item.provinceCode || "-" }}
        </template>

        <template #item.cityCode="{ item }">
          {{ item.cityCode || "-" }}
        </template>

        <template #item.actions="{ item }">
          <div class="d-flex gap-1">
            <IconBtn size="small" @click="openDialog('edit', item)">
              <VIcon icon="tabler-edit" color="warning" />
            </IconBtn>
            <IconBtn
              v-if="item.isActive"
              size="small"
              @click="openSuspendDialog(item.companyId)"
            >
              <VIcon icon="tabler-ban" color="error" />
              <VTooltip activator="parent">Suspend</VTooltip>
            </IconBtn>
            <IconBtn
              v-else
              size="small"
              :loading="isLoadingAction"
              @click="handleResume(item.companyId)"
            >
              <VIcon icon="tabler-player-play" color="success" />
              <VTooltip activator="parent">Resume</VTooltip>
            </IconBtn>
            <IconBtn size="small" @click="confirmDelete(item.companyId)">
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
            dialogMode === "create" ? "Tambah Company" : "Edit Company"
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
                      <VIcon v-else icon="tabler-building" size="40" />
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
                  v-model="form.name"
                  label="Nama Company"
                  placeholder="Perusahaan Baru"
                  :rules="[requiredValidator]"
                />
              </VCol>
              <VCol cols="12" md="6">
                <AppTextField
                  v-model="form.code"
                  label="Code"
                  placeholder="COMP-JKT-01"
                  :rules="[requiredValidator]"
                />
              </VCol>
              <VCol cols="12" md="6">
                <AppTextField
                  v-model="form.ownerId"
                  label="Owner ID"
                  placeholder="019aedcb-45a9-7223-ad8a-929a58fb6432"
                  :rules="[requiredValidator]"
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
                  placeholder="3172"
                />
              </VCol>
              <VCol cols="12">
                <VSwitch
                  v-model="form.isActive"
                  label="Active"
                  color="success"
                />
              </VCol>
            </VRow>
          </VForm>
          <div class="d-flex justify-end gap-3 mt-4">
            <VBtn variant="outlined" color="secondary" @click="closeDialog">
              Batal
            </VBtn>
            <VBtn
              color="primary"
              :loading="isLoadingSubmit"
              @click="handleSubmit"
            >
              {{ dialogMode === "create" ? "Simpan" : "Update" }}
            </VBtn>
          </div>
        </VCardText>
      </VCard>
    </VDialog>

    <!-- Suspend Dialog -->
    <VDialog v-model="suspendDialogVisible" max-width="500">
      <VCard>
        <VCardTitle>Suspend Company</VCardTitle>
        <VDivider />
        <VCardText>
          <VForm @submit.prevent="handleSuspend">
            <p class="mb-4">Apakah Anda yakin ingin suspend company ini?</p>
            <AppTextarea
              v-model="suspendReason"
              label="Alasan (optional)"
              placeholder="Masukkan alasan suspend"
              rows="3"
            />
          </VForm>
        </VCardText>
        <div class="d-flex justify-end gap-3 mt-4">
          <VBtn
            variant="outlined"
            color="secondary"
            @click="suspendDialogVisible = false"
          >
            Batal
          </VBtn>
          <VBtn color="error" :loading="isLoadingAction" @click="handleSuspend">
            Suspend
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
          <p>
            Apakah Anda yakin ingin menghapus company ini? Semua data terkait
            akan ikut terhapus.
          </p>
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
