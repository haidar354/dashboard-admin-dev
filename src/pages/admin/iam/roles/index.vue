<script setup lang="ts">
import AppTextField from "@/@core/components/app-form-elements/AppTextField.vue";
import { requiredValidator } from "@/@core/utils/validators";
import { $rootAPI } from "@/utils/api";
import { showToast } from "@/utils/toaster";

definePage({
  meta: {
    name: "Platform Roles",
    rules: [{ action: "manage", subject: "default" }],
  },
});

interface Role {
  id: number;
  name: string;
  guard_name: string;
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
  data: Role[];
  meta: PaginationMeta | null;
}

const isLoading = ref(false);
const search = ref("");

const paginateData = ref<PaginateData>({
  data: [],
  meta: null,
});

const requestQuery = ref({
  page: 1,
  perPage: 20,
  search: "",
});

const dialogVisible = ref(false);
const dialogMode = ref<"create" | "view">("view");
const selectedRole = ref<Role | null>(null);
const isLoadingSubmit = ref(false);

const form = ref({
  name: "",
  guard_name: "platform",
});

const headers = [
  { title: "No", key: "index", width: "60px", sortable: false },
  { title: "Nama Role", key: "name", sortable: false },
  { title: "Guard Name", key: "guard_name", sortable: false },
  { title: "Aksi", key: "actions", width: "80px", sortable: false },
];

const fetchRoles = async () => {
  try {
    isLoading.value = true;

    const response = await $rootAPI("/platform/iam/roles/all", {
      method: "GET",
    });

    paginateData.value = {
      data: response.data,
      meta: null,
    };
  } catch (error) {
    console.error("Error fetching roles:", error?.data);
    showToast("Gagal mengambil data roles", "error");
  } finally {
    isLoading.value = false;
  }
};

const fetchRoleDetail = async (roleId: number) => {
  try {
    isLoading.value = true;

    const response = await $rootAPI("/platform/iam/roles", {
      method: "GET",
      params: {
        "filter[id]": roleId,
      },
    });

    if (response.data && response.data.length > 0) {
      selectedRole.value = response.data[0];
      dialogVisible.value = true;
    }
  } catch (error) {
    console.error("Error fetching role detail:", error?.data);
    showToast(error?.data?.message || "Gagal mengambil detail role", "error");
  } finally {
    isLoading.value = false;
  }
};

const closeDialog = () => {
  dialogVisible.value = false;
  selectedRole.value = null;
  form.value = {
    name: "",
    guard_name: "platform",
  };
};

const openCreateDialog = () => {
  dialogMode.value = "create";
  form.value = {
    name: "",
    guard_name: "",
  };
  selectedRole.value = null;
  dialogVisible.value = true;
};

const viewRole = (role: Role) => {
  dialogMode.value = "view";
  fetchRoleDetail(role.id);
};

const handleSubmit = async () => {
  try {
    isLoadingSubmit.value = true;

    const payload = {
      name: form.value.name,
      guard_name: form.value.guard_name,
    };

    await $rootAPI("/platform/iam/roles", {
      method: "POST",
      body: payload,
    });

    showToast("Role berhasil ditambahkan", "success");
    closeDialog();

    // Refresh data
    await fetchRoles();
  } catch (error: any) {
    console.error("Error creating role:", error?.data);
    showToast(error?.data?.message || "Gagal menambahkan role", "error");
  } finally {
    isLoadingSubmit.value = false;
  }
};

// Filter data berdasarkan search
const filteredData = computed(() => {
  if (!search.value) return paginateData.value.data;

  return paginateData.value.data.filter(
    (role) =>
      role.name.toLowerCase().includes(search.value.toLowerCase()) ||
      role.guard_name.toLowerCase().includes(search.value.toLowerCase())
  );
});

// Pagination untuk filtered data
const paginatedFilteredData = computed(() => {
  const start = (requestQuery.value.page - 1) * requestQuery.value.perPage;
  const end = start + requestQuery.value.perPage;

  return filteredData.value.slice(start, end);
});

const totalPages = computed(() => {
  return Math.ceil(filteredData.value.length / requestQuery.value.perPage);
});

watch(search, () => {
  requestQuery.value.page = 1;
});

onMounted(async () => {
  await fetchRoles();
});
</script>

<template>
  <div data-testid="platform-roles-page">
    <VCard>
      <VCardText
        class="d-flex flex-wrap justify-space-between align-center gap-4"
      >
        <h5 class="text-h5">Platform Roles</h5>
        <VBtn
          color="primary"
          prepend-icon="tabler-plus"
          @click="openCreateDialog"
        >
          Tambah Role
        </VBtn>
      </VCardText>

      <VDivider />

      <VCardText>
        <VRow>
          <VCol cols="12" sm="4">
            <AppTextField
              v-model="search"
              label="Search"
              placeholder="Cari role..."
              prepend-inner-icon="tabler-search"
              clearable
            />
          </VCol>
        </VRow>
      </VCardText>

      <VDataTable
        :headers="headers"
        :items="paginatedFilteredData"
        :loading="isLoading"
        :items-per-page="requestQuery.perPage"
        :items-length="filteredData.length"
        class="text-no-wrap"
      >
        <template #item.index="{ index }">
          {{ (requestQuery.page - 1) * requestQuery.perPage + index + 1 }}
        </template>

        <template #item.actions="{ item }">
          <div class="d-flex gap-1">
            <IconBtn size="small" @click="viewRole(item)">
              <VIcon icon="tabler-eye" color="info" />
            </IconBtn>
          </div>
        </template>

        <template #bottom>
          <VCardText class="pt-2">
            <div class="d-flex justify-end">
              <VPagination
                v-model="requestQuery.page"
                :length="totalPages || 1"
                :total-visible="5"
              />
            </div>
          </VCardText>
        </template>
      </VDataTable>
    </VCard>

    <!-- Create / View Role Dialog -->
    <VDialog v-model="dialogVisible" max-width="500">
      <VCard>
        <VCardTitle class="d-flex justify-space-between align-center">
          <span>{{
            dialogMode === "create" ? "Tambah Role" : "Detail Role"
          }}</span>
          <IconBtn @click="closeDialog">
            <VIcon icon="tabler-x" />
          </IconBtn>
        </VCardTitle>

        <VDivider />

        <VCardText>
          <!-- Create Form -->
          <VForm v-if="dialogMode === 'create'" @submit.prevent="handleSubmit">
            <VRow>
              <VCol cols="12">
                <AppTextField
                  v-model="form.name"
                  label="Nama Role"
                  placeholder="Masukkan nama role"
                  :rules="[requiredValidator]"
                />
              </VCol>
              <VCol cols="12">
                <AppTextField
                  v-model="form.guard_name"
                  label="Guard Name"
                  placeholder="Masukkan guard name"
                  :rules="[requiredValidator]"
                />
              </VCol>
            </VRow>

            <div class="d-flex justify-end gap-3 mt-4">
              <VBtn variant="outlined" color="secondary" @click="closeDialog">
                Batal
              </VBtn>
              <VBtn type="submit" color="primary" :loading="isLoadingSubmit">
                Simpan
              </VBtn>
            </div>
          </VForm>

          <!-- View Detail -->
          <div v-else>
            <VRow v-if="selectedRole">
              <VCol cols="12">
                <div class="mb-2">
                  <span class="text-sm text-disabled">ID</span>
                  <div class="text-body-1 font-weight-medium">
                    {{ selectedRole.id }}
                  </div>
                </div>
              </VCol>
              <VCol cols="12">
                <div class="mb-2">
                  <span class="text-sm text-disabled">Nama Role</span>
                  <div class="text-body-1 font-weight-medium">
                    {{ selectedRole.name }}
                  </div>
                </div>
              </VCol>
              <VCol cols="12">
                <div class="mb-2">
                  <span class="text-sm text-disabled">Guard Name</span>
                  <div class="text-body-1 font-weight-medium">
                    {{ selectedRole.guard_name }}
                  </div>
                </div>
              </VCol>
            </VRow>

            <div class="d-flex justify-end gap-3 mt-4">
              <VBtn color="secondary" @click="closeDialog"> Tutup </VBtn>
            </div>
          </div>
        </VCardText>
      </VCard>
    </VDialog>
  </div>
</template>
