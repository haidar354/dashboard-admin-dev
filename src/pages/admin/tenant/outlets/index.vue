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
    name: "Admin Outlets",
    rules: [{ action: "manage", subject: "default" }],
  },
});

interface Outlet {
  outletId: string;
  name: string;
  code: string;
  address: string;
  companyName: string;
  businessUnitName: string;
  isCentral: boolean;
  isActive: boolean;
  logo: string;
  phone: string;
  email: string;
  businessUnitId: string;
  companyId: string;
}

const isLoading = ref(false);
const outlets = ref<Outlet[]>([]);
const search = ref("");
const page = ref(1);
const perPage = ref(20);
const total = ref(0);
const lastPage = ref(1);

// Business Units for select
const businessUnits = ref<any[]>([]);
const isLoadingBusinessUnits = ref(false);

// Dialog states
const dialogDelete = ref(false);
const dialogForm = ref(false);
const dialogDetail = ref(false);
const selectedOutlet = ref<Outlet | null>(null);
const detailOutlet = ref<any>(null);

// Form refs
const refVForm = ref();

// Form data
const formData = ref({
  businessUnitId: "",
  name: "",
  logo: null as File | null,
  phone: "",
  email: "",
  address: "",
  provinceCode: "",
  cityCode: "",
  districtCode: "",
  villageCode: "",
  postalCode: "",
  latitude: "",
  longitude: "",
  isCentral: false,
  isActive: true,
});

const headers = [
  { title: "No", key: "index", width: "60px", sortable: false },
  { title: "Nama", key: "name", sortable: true },
  { title: "Company", key: "companyName", sortable: true },
  { title: "Business Unit", key: "businessUnitName", sortable: true },
  { title: "Code", key: "code", sortable: false },
  { title: "Tipe", key: "isCentral", sortable: false },
  { title: "Status", key: "isActive", sortable: false },
  { title: "Actions", key: "actions", sortable: false, width: "150px" },
];

// Fetch business units for select
const fetchBusinessUnits = async () => {
  isLoadingBusinessUnits.value = true;
  try {
    const response: any = await $rootAPI("/platform/tenant/business-units", {
      method: "GET",
      params: {
        perPage: 100,
      },
    });

    businessUnits.value = response.data.data.map((bu: any) => ({
      value: bu.businessUnitId,
      title: bu.name,
    }));
  } catch (error: any) {
    console.error("Error fetching business units:", error);
  } finally {
    isLoadingBusinessUnits.value = false;
  }
};

// Fetch outlets with pagination
const fetchOutlets = async () => {
  isLoading.value = true;
  try {
    const params: any = {
      page: page.value,
      perPage: perPage.value,
      include: "company,businessUnit",
    };

    if (search.value) {
      params.search = search.value;
    }

    const response: any = await $rootAPI("/platform/tenant/outlets", {
      method: "GET",
      params,
    });

    const apiData = response.data;
    const meta = response.meta;

    // Map API response to match component structure
    outlets.value = apiData.map((outlet: any) => ({
      outletId: outlet.outletId,
      name: outlet.name,
      code: outlet.code,
      address: outlet.address || "-",
      companyName: outlet.company?.name || "-",
      businessUnitName: outlet.businessUnit?.name || "-",
      isCentral: outlet.isCentral,
      isActive: outlet.isActive,
      logo: outlet.logo,
      phone: outlet.phone,
      email: outlet.email,
      businessUnitId: outlet.businessUnitId,
      companyId: outlet.companyId,
    }));

    total.value = meta.total;
    lastPage.value = meta.lastPage;
  } catch (error: any) {
    console.error("Error fetching outlets:", error);
    showToast("Gagal memuat data outlet", "error");
  } finally {
    isLoading.value = false;
  }
};

// Search with debounce
const handleSearch = customDebounce(() => {
  page.value = 1;
  fetchOutlets();
}, 500);

watch(search, () => {
  handleSearch();
});

// Watch page/perPage changes
watch(page, () => {
  fetchOutlets();
});

watch(perPage, () => {
  page.value = 1;
  fetchOutlets();
});

// Open create dialog
const openCreateDialog = () => {
  selectedOutlet.value = null;
  resetForm();
  dialogForm.value = true;
};

// Open detail dialog
const openDetailDialog = async (outlet: Outlet) => {
  try {
    isLoading.value = true;
    const response: any = await $rootAPI(
      `/platform/tenant/outlets/${outlet.outletId}`,
      {
        method: "GET",
      }
    );
    detailOutlet.value = response.data.data;
    dialogDetail.value = true;
  } catch (error: any) {
    console.error("Error fetching outlet detail:", error);
    showToast("Gagal memuat detail outlet", "error");
  } finally {
    isLoading.value = false;
  }
};

// Open edit dialog
const openEditDialog = async (outlet: Outlet) => {
  try {
    isLoading.value = true;
    const response: any = await $rootAPI(
      `/platform/tenant/outlets/${outlet.outletId}`,
      {
        method: "GET",
      }
    );
    const apiData = response.data.data;

    selectedOutlet.value = outlet;
    formData.value = {
      businessUnitId: apiData.businessUnitId,
      name: apiData.name,
      logo: null,
      phone: apiData.phone || "",
      email: apiData.email || "",
      address: apiData.address || "",
      provinceCode: apiData.provinceCode || "",
      cityCode: apiData.cityCode || "",
      districtCode: apiData.districtCode || "",
      villageCode: apiData.villageCode || "",
      postalCode: apiData.postalCode || "",
      latitude: apiData.latitude || "",
      longitude: apiData.longitude || "",
      isCentral: apiData.isCentral,
      isActive: apiData.isActive,
    };
    dialogForm.value = true;
  } catch (error: any) {
    console.error("Error fetching outlet detail:", error);
    showToast("Gagal memuat detail outlet", "error");
  } finally {
    isLoading.value = false;
  }
};

// Open delete dialog
const openDeleteDialog = (outlet: Outlet) => {
  selectedOutlet.value = outlet;
  dialogDelete.value = true;
};

// Reset form
const resetForm = () => {
  formData.value = {
    businessUnitId: "",
    name: "",
    logo: null,
    phone: "",
    email: "",
    address: "",
    provinceCode: "",
    cityCode: "",
    districtCode: "",
    villageCode: "",
    postalCode: "",
    latitude: "",
    longitude: "",
    isCentral: false,
    isActive: true,
  };
  refVForm.value?.reset();
  refVForm.value?.resetValidation();
};

// Submit form (create or update)
const submitForm = async () => {
  const { valid } = await refVForm.value?.validate();
  if (!valid) return;

  try {
    isLoading.value = true;
    const data = new FormData();

    data.append("businessUnitId", formData.value.businessUnitId);
    data.append("name", formData.value.name);
    if (formData.value.logo) {
      data.append("logo", formData.value.logo);
    }
    if (formData.value.phone) data.append("phone", formData.value.phone);
    if (formData.value.email) data.append("email", formData.value.email);
    if (formData.value.address) data.append("address", formData.value.address);
    if (formData.value.provinceCode)
      data.append("provinceCode", formData.value.provinceCode);
    if (formData.value.cityCode)
      data.append("cityCode", formData.value.cityCode);
    if (formData.value.districtCode)
      data.append("districtCode", formData.value.districtCode);
    if (formData.value.villageCode)
      data.append("villageCode", formData.value.villageCode);
    if (formData.value.postalCode)
      data.append("postalCode", formData.value.postalCode);
    if (formData.value.latitude)
      data.append("latitude", formData.value.latitude);
    if (formData.value.longitude)
      data.append("longitude", formData.value.longitude);
    data.append("isCentral", formData.value.isCentral ? "1" : "0");
    data.append("isActive", formData.value.isActive ? "1" : "0");

    if (selectedOutlet.value) {
      // Update
      await $rootAPI(
        `/platform/tenant/outlets/${selectedOutlet.value.outletId}`,
        {
          method: "PATCH",
          body: data,
        }
      );
      showToast("Outlet berhasil diupdate", "success");
    } else {
      // Create
      await $rootAPI("/platform/tenant/outlets", {
        method: "POST",
        body: data,
      });
      showToast("Outlet berhasil ditambahkan", "success");
    }

    dialogForm.value = false;
    fetchOutlets();
  } catch (error: any) {
    console.error("Error saving outlet:", error);
    showToast(
      error.response?.data?.message || "Gagal menyimpan outlet",
      "error"
    );
  } finally {
    isLoading.value = false;
  }
};

// Delete outlet
const deleteOutlet = async () => {
  if (!selectedOutlet.value) return;

  try {
    isLoading.value = true;
    await $rootAPI(
      `/platform/tenant/outlets/${selectedOutlet.value.outletId}`,
      {
        method: "DELETE",
      }
    );
    showToast("Outlet berhasil dihapus", "success");
    dialogDelete.value = false;
    fetchOutlets();
  } catch (error: any) {
    console.error("Error deleting outlet:", error);
    showToast(
      error.response?.data?.message || "Gagal menghapus outlet",
      "error"
    );
  } finally {
    isLoading.value = false;
  }
};

// Handle file upload
const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files.length > 0) {
    formData.value.logo = target.files[0];
  }
};

onMounted(() => {
  fetchOutlets();
  fetchBusinessUnits();
});
</script>

<template>
  <div data-testid="admin-outlets-page">
    <VCard>
      <VCardText
        class="d-flex flex-wrap justify-space-between align-center gap-4"
      >
        <h5 class="text-h5">Manajemen Outlet</h5>
        <VBtn
          color="primary"
          prepend-icon="tabler-plus"
          @click="openCreateDialog"
        >
          Tambah Outlet
        </VBtn>
      </VCardText>

      <VDivider />

      <VCardText>
        <VRow>
          <VCol cols="12" sm="4">
            <AppTextField
              v-model="search"
              placeholder="Cari outlet..."
              prepend-inner-icon="tabler-search"
              clearable
            />
          </VCol>
        </VRow>
      </VCardText>

      <VDataTable
        v-model:page="page"
        v-model:items-per-page="perPage"
        :headers="headers"
        :items="outlets"
        :items-length="total"
        :loading="isLoading"
        class="text-no-wrap"
      >
        <template #item.index="{ index }">
          {{ (page - 1) * perPage + index + 1 }}
        </template>

        <template #item.name="{ item }">
          <div class="d-flex align-center gap-3">
            <VAvatar color="primary" variant="tonal" size="38">
              <VImg v-if="item.logo" :src="item.logo" />
              <VIcon v-else icon="tabler-building-store" />
            </VAvatar>
            <div>
              <span class="font-weight-medium">{{ item.name }}</span>
              <div class="text-caption text-disabled">{{ item.address }}</div>
            </div>
          </div>
        </template>

        <template #item.companyName="{ item }">
          <span class="text-body-2">{{ item.companyName }}</span>
        </template>

        <template #item.businessUnitName="{ item }">
          <VChip size="small" color="secondary" variant="tonal">
            {{ item.businessUnitName }}
          </VChip>
        </template>

        <template #item.isCentral="{ item }">
          <VChip size="small" :color="item.isCentral ? 'primary' : 'info'">
            {{ item.isCentral ? "Pusat" : "Cabang" }}
          </VChip>
        </template>

        <template #item.isActive="{ item }">
          <VChip size="small" :color="item.isActive ? 'success' : 'error'">
            {{ item.isActive ? "Aktif" : "Tidak Aktif" }}
          </VChip>
        </template>

        <template #item.actions="{ item }">
          <div class="d-flex gap-1">
            <VBtn
              icon
              size="small"
              variant="text"
              color="info"
              @click="openDetailDialog(item)"
            >
              <VIcon icon="tabler-eye" size="22" />
              <VTooltip activator="parent" location="top">Detail</VTooltip>
            </VBtn>
            <VBtn
              icon
              size="small"
              variant="text"
              color="default"
              @click="openEditDialog(item)"
            >
              <VIcon icon="tabler-edit" size="22" />
              <VTooltip activator="parent" location="top">Edit</VTooltip>
            </VBtn>
            <VBtn
              icon
              size="small"
              variant="text"
              color="error"
              @click="openDeleteDialog(item)"
            >
              <VIcon icon="tabler-trash" size="22" />
              <VTooltip activator="parent" location="top">Hapus</VTooltip>
            </VBtn>
          </div>
        </template>
      </VDataTable>
    </VCard>

    <!-- Detail Dialog -->
    <VDialog v-model="dialogDetail" max-width="700px">
      <VCard v-if="detailOutlet">
        <VCardTitle class="d-flex justify-space-between align-center pa-4">
          <div class="d-flex align-center gap-2">
            <VIcon icon="tabler-building-store" size="24" />
            <span class="text-h5">Detail Outlet</span>
          </div>
          <IconBtn @click="dialogDetail = false">
            <VIcon icon="tabler-x" />
          </IconBtn>
        </VCardTitle>
        <VDivider />
        <VCardText class="pa-4">
          <VRow>
            <VCol cols="12" class="text-center pb-4">
              <VAvatar size="100" color="primary" variant="tonal">
                <VImg v-if="detailOutlet.logo" :src="detailOutlet.logo" />
                <VIcon v-else icon="tabler-building-store" size="50" />
              </VAvatar>
            </VCol>
            <VCol cols="12" md="6">
              <div class="text-caption text-disabled">Nama Outlet</div>
              <div class="font-weight-medium">{{ detailOutlet.name }}</div>
            </VCol>
            <VCol cols="12" md="6">
              <div class="text-caption text-disabled">Kode</div>
              <div class="font-weight-medium">{{ detailOutlet.code }}</div>
            </VCol>
            <VCol cols="12" md="6">
              <div class="text-caption text-disabled">Company</div>
              <div class="font-weight-medium">
                {{ detailOutlet.company?.name || "-" }}
              </div>
            </VCol>
            <VCol cols="12" md="6">
              <div class="text-caption text-disabled">Business Unit</div>
              <div class="font-weight-medium">
                {{ detailOutlet.businessUnit?.name || "-" }}
              </div>
            </VCol>
            <VCol cols="12" md="6">
              <div class="text-caption text-disabled">Telepon</div>
              <div class="font-weight-medium">
                {{ detailOutlet.phone || "-" }}
              </div>
            </VCol>
            <VCol cols="12" md="6">
              <div class="text-caption text-disabled">Email</div>
              <div class="font-weight-medium">
                {{ detailOutlet.email || "-" }}
              </div>
            </VCol>
            <VCol cols="12">
              <div class="text-caption text-disabled">Alamat</div>
              <div class="font-weight-medium">
                {{ detailOutlet.address || "-" }}
              </div>
            </VCol>
            <VCol cols="12" md="6">
              <div class="text-caption text-disabled">Provinsi</div>
              <div class="font-weight-medium">
                {{ detailOutlet.province?.name || "-" }}
              </div>
            </VCol>
            <VCol cols="12" md="6">
              <div class="text-caption text-disabled">Kota/Kabupaten</div>
              <div class="font-weight-medium">
                {{ detailOutlet.city?.name || "-" }}
              </div>
            </VCol>
            <VCol cols="12" md="6">
              <div class="text-caption text-disabled">Kecamatan</div>
              <div class="font-weight-medium">
                {{ detailOutlet.district?.name || "-" }}
              </div>
            </VCol>
            <VCol cols="12" md="6">
              <div class="text-caption text-disabled">Kelurahan</div>
              <div class="font-weight-medium">
                {{ detailOutlet.village?.name || "-" }}
              </div>
            </VCol>
            <VCol cols="12" md="6">
              <div class="text-caption text-disabled">Koordinat</div>
              <div class="font-weight-medium">
                {{
                  detailOutlet.latitude && detailOutlet.longitude
                    ? `${detailOutlet.latitude}, ${detailOutlet.longitude}`
                    : "-"
                }}
              </div>
            </VCol>
            <VCol cols="12" md="6">
              <div class="text-caption text-disabled">Tipe</div>
              <VChip
                size="small"
                :color="detailOutlet.isCentral ? 'primary' : 'info'"
              >
                {{ detailOutlet.isCentral ? "Pusat" : "Cabang" }}
              </VChip>
            </VCol>
            <VCol cols="12" md="6">
              <div class="text-caption text-disabled">Status</div>
              <VChip
                size="small"
                :color="detailOutlet.isActive ? 'success' : 'error'"
              >
                {{ detailOutlet.isActive ? "Aktif" : "Tidak Aktif" }}
              </VChip>
            </VCol>
          </VRow>
        </VCardText>
        <VDivider />
        <div class="d-flex justify-end gap-3 pa-4">
          <VBtn
            color="secondary"
            variant="outlined"
            @click="dialogDetail = false"
          >
            Tutup
          </VBtn>
        </div>
      </VCard>
    </VDialog>

    <!-- Form Dialog -->
    <VDialog v-model="dialogForm" max-width="800px" persistent>
      <VCard>
        <VCardTitle class="d-flex justify-space-between align-center pa-4">
          <span class="text-h5">
            {{ selectedOutlet ? "Edit Outlet" : "Tambah Outlet" }}
          </span>
          <IconBtn @click="dialogForm = false">
            <VIcon icon="tabler-x" />
          </IconBtn>
        </VCardTitle>
        <VDivider />
        <VCardText class="pa-4">
          <VForm ref="refVForm" @submit.prevent="submitForm">
            <VRow>
              <VCol cols="12">
                <AppTextField
                  v-model="formData.name"
                  label="Nama Outlet"
                  placeholder="Masukkan nama outlet"
                  :rules="[requiredValidator]"
                />
              </VCol>
              <VCol cols="12" md="6">
                <AppSelect
                  v-model="formData.businessUnitId"
                  label="Business Unit"
                  placeholder="Pilih Business Unit"
                  :items="businessUnits"
                  :loading="isLoadingBusinessUnits"
                  :rules="[requiredValidator]"
                />
              </VCol>
              <VCol cols="12" md="6">
                <VFileInput
                  label="Logo"
                  accept="image/*"
                  prepend-icon="tabler-camera"
                  @change="handleFileChange"
                />
              </VCol>
              <VCol cols="12" md="6">
                <AppTextField
                  v-model="formData.phone"
                  label="Telepon"
                  placeholder="08xxxxxxxxxx"
                />
              </VCol>
              <VCol cols="12" md="6">
                <AppTextField
                  v-model="formData.email"
                  label="Email"
                  type="email"
                  placeholder="email@example.com"
                />
              </VCol>
              <VCol cols="12">
                <AppTextarea
                  v-model="formData.address"
                  label="Alamat"
                  placeholder="Masukkan alamat lengkap"
                  rows="3"
                />
              </VCol>
              <VCol cols="12" md="6">
                <AppTextField
                  v-model="formData.provinceCode"
                  label="Kode Provinsi"
                  placeholder="Contoh: 31"
                />
              </VCol>
              <VCol cols="12" md="6">
                <AppTextField
                  v-model="formData.cityCode"
                  label="Kode Kota"
                  placeholder="Contoh: 3172"
                />
              </VCol>
              <VCol cols="12" md="6">
                <AppTextField
                  v-model="formData.districtCode"
                  label="Kode Kecamatan"
                  placeholder="Contoh: 317202"
                />
              </VCol>
              <VCol cols="12" md="6">
                <AppTextField
                  v-model="formData.villageCode"
                  label="Kode Kelurahan"
                  placeholder="Contoh: 3172021002"
                />
              </VCol>
              <VCol cols="12" md="6">
                <AppTextField
                  v-model="formData.postalCode"
                  label="Kode Pos"
                  placeholder="12345"
                />
              </VCol>
              <VCol cols="12" md="6">
                <AppTextField
                  v-model="formData.latitude"
                  label="Latitude"
                  placeholder="-6.1528676"
                />
              </VCol>
              <VCol cols="12" md="6">
                <AppTextField
                  v-model="formData.longitude"
                  label="Longitude"
                  placeholder="106.8721885"
                />
              </VCol>
              <VCol cols="12" md="6">
                <VSwitch
                  v-model="formData.isCentral"
                  label="Outlet Pusat"
                  color="primary"
                />
              </VCol>
              <VCol cols="12" md="6">
                <VSwitch
                  v-model="formData.isActive"
                  label="Status Aktif"
                  color="success"
                />
              </VCol>
            </VRow>

            <div class="d-flex justify-end gap-3 mt-4">
              <VBtn
                color="error"
                variant="outlined"
                @click="dialogForm = false"
              >
                Batal
              </VBtn>
              <VBtn color="primary" type="submit" :loading="isLoading">
                {{ selectedOutlet ? "Update" : "Simpan" }}
              </VBtn>
            </div>
          </VForm>
        </VCardText>
      </VCard>
    </VDialog>

    <!-- Delete Confirmation Dialog -->
    <VDialog v-model="dialogDelete" max-width="500px">
      <VCard>
        <VCardTitle class="d-flex justify-space-between align-center pa-4">
          <span class="text-h5">Konfirmasi Hapus</span>
          <IconBtn @click="dialogDelete = false">
            <VIcon icon="tabler-x" />
          </IconBtn>
        </VCardTitle>
        <VDivider />
        <VCardText class="pa-4">
          Apakah Anda yakin ingin menghapus outlet
          <strong>{{ selectedOutlet?.name }}</strong
          >?
        </VCardText>
        <VDivider />
        <div class="d-flex justify-end gap-3 pa-4">
          <VBtn
            color="secondary"
            variant="outlined"
            @click="dialogDelete = false"
          >
            Batal
          </VBtn>
          <VBtn color="error" @click="deleteOutlet" :loading="isLoading">
            Hapus
          </VBtn>
        </div>
      </VCard>
    </VDialog>
  </div>
</template>
