<script setup lang="ts">
import AppTextField from "@/@core/components/app-form-elements/AppTextField.vue";
import { emailValidator, requiredValidator } from "@/@core/utils/validators";
import { $rootAPI } from "@/utils/api";
import { customDebounce } from "@/utils/common";
import { showToast } from "@/utils/toaster";
import dayjs from "dayjs";

definePage({
  meta: {
    name: "Platform Users",
    rules: [{ action: "manage", subject: "default" }],
  },
});

interface User {
  userId: string;
  name: string;
  email: string;
  phone: string | null;
  avatar: string | null;
  lastLoginAt: string | null;
  emailVerifiedAt: string | null;
  accountVerifiedAt: string | null;
  accountBlockedAt: string | null;
  status: string;
  loginByEmail: boolean;
  loginByPin: boolean;
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

interface PaginateData {
  data: User[];
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
const dialogMode = ref<"create" | "edit" | "view">("create");
const isLoadingSubmit = ref(false);
const isLoadingDelete = ref(false);
const deleteDialogVisible = ref(false);
const userToDelete = ref<string | null>(null);
const selectedUserId = ref<string | null>(null);

const form = ref({
  name: "",
  email: "",
  phone: "",
  password: "",
  status: "active",
});

const userDetail = ref<User | null>(null);

const headers = [
  { title: "No", key: "index", width: "60px", sortable: false },
  { title: "Nama", key: "name", sortable: false },
  { title: "Email", key: "email", sortable: false },
  { title: "Status", key: "status", sortable: false },
  { title: "Email Verified", key: "emailVerifiedAt", sortable: false },
  { title: "Login Terakhir", key: "lastLoginAt", sortable: false },
  { title: "Aksi", key: "actions", width: "120px", sortable: false },
];

const fetchUsers = async () => {
  try {
    isLoading.value = true;

    const params: Record<string, any> = {
      perPage: requestQuery.value.perPage,
      page: requestQuery.value.page,
    };

    if (requestQuery.value.search)
      params["filter[name]"] = requestQuery.value.search;

    const response = await $rootAPI("/platform/iam/users", {
      method: "GET",
      params,
    });

    paginateData.value = {
      data: response.data,
      meta: response.meta,
    };
  } catch (error) {
    console.error("Error fetching users:", error);
    showToast("Gagal mengambil data user", "error");
  } finally {
    isLoading.value = false;
  }
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
    await fetchUsers();
  },
  { deep: true }
);

onMounted(async () => {
  await fetchUsers();
});

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    active: "success",
    inactive: "secondary",
    suspended: "error",
    blocked: "error",
  };

  return colors[status] || "secondary";
};

const getStatusText = (status: string) => {
  const texts: Record<string, string> = {
    active: "Aktif",
    inactive: "Tidak Aktif",
    suspended: "Suspended",
    blocked: "Diblokir",
  };

  return texts[status] || status;
};

const openDialog = async (mode: "create" | "edit" | "view", user?: User) => {
  dialogMode.value = mode;
  selectedUserId.value = user?.userId || null;

  if (mode === "create") {
    form.value = {
      name: "",
      email: "",
      phone: "",
      password: "",
      status: "active",
    };
    userDetail.value = null;
    dialogVisible.value = true;
  } else if (mode === "view" && user) {
    // Fetch detail user
    try {
      const response = await $rootAPI(`/platform/iam/users/${user.userId}`, {
        method: "GET",
      });

      userDetail.value = response.data;
      form.value = {
        name: response.data.name,
        email: response.data.email,
        phone: response.data.phone || "",
        password: "",
        status: response.data.status,
      };
      dialogVisible.value = true;
    } catch (error) {
      console.error("Error fetching user detail:", error);
    }
  } else if (mode === "edit" && user) {
    form.value = {
      name: user.name,
      email: user.email,
      phone: user.phone || "",
      password: "",
      status: user.status,
    };
    userDetail.value = null;
    dialogVisible.value = true;
  }
};

const closeDialog = () => {
  dialogVisible.value = false;
  selectedUserId.value = null;
  userDetail.value = null;
  form.value = {
    name: "",
    email: "",
    phone: "",
    password: "",
    status: "active",
  };
};

const confirmDelete = (userId: string) => {
  userToDelete.value = userId;
  deleteDialogVisible.value = true;
};

const handleDelete = async () => {
  if (userToDelete.value) {
    try {
      isLoadingDelete.value = true;
      await $rootAPI(`/platform/iam/users/${userToDelete.value}`, {
        method: "DELETE",
      });
      showToast("User berhasil dihapus", "success");
      deleteDialogVisible.value = false;
      userToDelete.value = null;

      // Refresh data
      await fetchUsers();
    } catch (error: any) {
      console.error("Error deleting user:", error);
      showToast(error?.data?.message || "Gagal menyimpan data user", "error");
    } finally {
      isLoadingDelete.value = false;
    }
  }
};

const handleSubmit = async () => {
  try {
    isLoadingSubmit.value = true;

    // Bangun payload mentah
    const rawPayload = {
      name: form.value.name,
      email: form.value.email,
      phone: form.value.phone,
      status: form.value.status,
      password: form.value.password,
    };

    // Hapus field dengan nilai null, undefined, atau string kosong
    const payload = Object.fromEntries(
      Object.entries(rawPayload).filter(
        ([, value]) => value != null && value !== ""
      )
    );

    if (dialogMode.value === "create") {
      await $rootAPI("/platform/iam/users", {
        method: "POST",
        body: payload,
      });
      showToast("User berhasil ditambahkan", "success");
    } else if (dialogMode.value === "edit" && selectedUserId.value) {
      await $rootAPI(`/platform/iam/users/${selectedUserId.value}`, {
        method: "PATCH",
        body: payload,
      });
      showToast("User berhasil diupdate", "success");
    }

    closeDialog();
    await fetchUsers();
  } catch (error: any) {
    console.error("Error submitting form:", error.data);
    showToast(error?.data?.message || "Gagal menyimpan data user", "error");
  } finally {
    isLoadingSubmit.value = false;
  }
};
</script>

<template>
  <div data-testid="platform-users-page">
    <VCard>
      <VCardText
        class="d-flex flex-wrap justify-space-between align-center gap-4"
      >
        <h5 class="text-h5">Platform Users</h5>
        <VBtn
          color="primary"
          prepend-icon="tabler-plus"
          @click="openDialog('create')"
        >
          Tambah User
        </VBtn>
      </VCardText>

      <VDivider />

      <VCardText>
        <VRow>
          <VCol cols="12" sm="4">
            <AppTextField
              v-model="search"
              label="Search"
              placeholder="Cari berdasarkan nama..."
              prepend-inner-icon="tabler-search"
              clearable
            />
          </VCol>
        </VRow>
      </VCardText>

      <VDataTable
        :headers="headers"
        :items="paginateData.data"
        :loading="isLoading"
        :items-per-page="requestQuery.perPage"
        :items-length="paginateData.meta?.total || 0"
        class="text-no-wrap"
      >
        <template #item.index="{ index }">
          {{ (requestQuery.page - 1) * requestQuery.perPage + index + 1 }}
        </template>

        <template #item.name="{ item }">
          <div class="d-flex align-center gap-3">
            <VAvatar color="primary" variant="tonal" size="38">
              <VImg v-if="item.avatar" :src="item.avatar" />
              <span v-else class="text-sm">{{
                item.name.charAt(0).toUpperCase()
              }}</span>
            </VAvatar>
            <div>
              <div class="font-weight-medium">
                {{ item.name }}
              </div>
              <div class="text-caption text-disabled">
                {{ item.phone || "-" }}
              </div>
            </div>
          </div>
        </template>

        <template #item.status="{ item }">
          <VChip size="small" :color="getStatusColor(item.status)">
            {{ getStatusText(item.status) }}
          </VChip>
        </template>

        <template #item.emailVerifiedAt="{ item }">
          <VChip
            size="small"
            :color="item.emailVerifiedAt ? 'success' : 'secondary'"
          >
            {{ item.emailVerifiedAt ? "Terverifikasi" : "Belum Verifikasi" }}
          </VChip>
        </template>

        <template #item.lastLoginAt="{ item }">
          {{
            item.lastLoginAt
              ? dayjs(item.lastLoginAt).format("DD/MM/YYYY HH:mm")
              : "-"
          }}
        </template>

        <template #item.actions="{ item }">
          <div class="d-flex gap-1">
            <IconBtn size="small" @click="openDialog('view', item)">
              <VIcon icon="tabler-eye" color="info" />
            </IconBtn>
            <IconBtn size="small" @click="openDialog('edit', item)">
              <VIcon icon="tabler-edit" color="warning" />
            </IconBtn>
            <IconBtn size="small" @click="confirmDelete(item.userId)">
              <VIcon icon="tabler-trash" color="error" />
            </IconBtn>
          </div>
        </template>

        <template #bottom>
          <VCardText class="pt-2">
            <div class="d-flex justify-end">
              <VPagination
                v-model="requestQuery.page"
                :length="paginateData.meta?.lastPage || 1"
                :total-visible="5"
              />
            </div>
          </VCardText>
        </template>
      </VDataTable>
    </VCard>

    <!-- User Dialog -->
    <VDialog v-model="dialogVisible" max-width="600">
      <VCard>
        <VCardTitle class="d-flex justify-space-between align-center">
          <span>{{
            dialogMode === "create"
              ? "Tambah User"
              : dialogMode === "edit"
              ? "Edit User"
              : "Detail User"
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
                  v-model="form.name"
                  label="Nama"
                  placeholder="Masukkan nama"
                  :rules="[requiredValidator]"
                  :readonly="dialogMode === 'view'"
                />
              </VCol>
              <VCol cols="12">
                <AppTextField
                  v-model="form.email"
                  label="Email"
                  type="email"
                  placeholder="Masukkan email"
                  :rules="[requiredValidator, emailValidator]"
                  :readonly="dialogMode === 'view'"
                />
              </VCol>
              <VCol cols="12">
                <AppTextField
                  v-model="form.phone"
                  label="Telepon"
                  placeholder="Masukkan nomor telepon"
                  :readonly="dialogMode === 'view'"
                />
              </VCol>
              <VCol
                v-if="dialogMode === 'create' || dialogMode === 'edit'"
                cols="12"
              >
                <AppTextField
                  v-model="form.password"
                  label="Password"
                  type="password"
                  :placeholder="
                    dialogMode === 'edit'
                      ? 'Kosongkan jika tidak ingin mengubah password'
                      : 'Masukkan password'
                  "
                  :rules="dialogMode === 'create' ? [requiredValidator] : []"
                />
              </VCol>
              <VCol cols="12">
                <AppSelect
                  v-model="form.status"
                  label="Status"
                  :items="[
                    { title: 'Aktif', value: 'active' },
                    { title: 'Tidak Aktif', value: 'inactive' },
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
          </VForm>
        </VCardText>
      </VCard>
    </VDialog>

    <!-- Delete Confirmation -->
    <VDialog v-model="deleteDialogVisible" max-width="400">
      <VCard>
        <VCardTitle>Konfirmasi Hapus</VCardTitle>
        <VCardText>Apakah Anda yakin ingin menghapus user ini?</VCardText>
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
