<script setup lang="ts">
import AppAutocomplete from "@/@core/components/app-form-elements/AppAutocomplete.vue";
import AppTextField from "@/@core/components/app-form-elements/AppTextField.vue";
import { requiredValidator } from "@/@core/utils/validators";
import { $rootAPI } from "@/utils/api";
import { showToast } from "@/utils/toaster";
definePage({
  meta: {
    name: "Platform Permissions",
    rules: [{ action: "manage", subject: "default" }],
  },
});

interface Feature {
  featureId: string;
  moduleId: string;
  key: string;
  name: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

interface Permission {
  id: number;
  name: string;
  display_name: string;
  guard_name: string;
  resource: string;
  featureId: string;
  feature: Feature;
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
  data: Permission[];
  meta: PaginationMeta | null;
}

const isLoading = ref(false);
const isLoadingFeatures = ref(false);

const paginateData = ref<PaginateData>({
  data: [],
  meta: null,
});

const features = ref<Feature[]>([]);
const search = ref("");
const selectedFeature = ref("");

const dialogVisible = ref(false);
const dialogMode = ref<"create" | "edit" | "view">("create");
const isLoadingSubmit = ref(false);
const isLoadingDelete = ref(false);
const deleteDialogVisible = ref(false);
const permissionToDelete = ref<number | null>(null);
const selectedPermissionId = ref<number | null>(null);

const form = ref({
  name: "",
  display_name: "",
  resource: "",
  featureId: "",
  guard_name: "platform",
});

const headers = [
  { title: "No", key: "index", width: "60px", sortable: false },
  { title: "Name", key: "name", sortable: false },
  { title: "Display Name", key: "display_name", sortable: false },
  { title: "Resource", key: "resource", sortable: false },
  { title: "Feature", key: "feature", sortable: false },
  { title: "Guard Name", key: "guard_name", sortable: false },
  { title: "Aksi", key: "actions", width: "120px", sortable: false },
];

const fetchPermissions = async () => {
  try {
    isLoading.value = true;

    const params: Record<string, any> = {};

    if (selectedFeature.value)
      params["filter[featureId]"] = selectedFeature.value;

    const response = await $rootAPI("/platform/system-config/permissions", {
      method: "GET",
      params,
    });

    paginateData.value = {
      data: response.data,
      meta: response.meta,
    };
  } catch (error) {
    console.error("Error fetching permissions:", error);
  } finally {
    isLoading.value = false;
  }
};

const fetchFeatures = async () => {
  try {
    isLoadingFeatures.value = true;

    const response = await $rootAPI("/platform/system-config/features", {
      method: "GET",
    });

    features.value = response.data;
  } catch (error) {
    console.error("Error fetching features:", error);
  } finally {
    isLoadingFeatures.value = false;
  }
};

const fetchPermissionDetail = async (permissionId: number) => {
  try {
    const response = await $rootAPI("/platform/system-config/permissions", {
      method: "GET",
      params: {
        perPage: 1,
        "filter[id]": permissionId,
      },
    });

    if (response.data && response.data.length > 0) {
      const permission = response.data[0];

      form.value = {
        name: permission.name,
        display_name: permission.display_name,
        resource: permission.resource,
        featureId: permission.featureId,
        guard_name: permission.guard_name,
      };
      dialogVisible.value = true;
    }
  } catch (error) {
    console.error("Error fetching permission detail:", error);
  }
};

const openDialog = async (
  mode: "create" | "edit" | "view",
  permission?: Permission
) => {
  dialogMode.value = mode;
  selectedPermissionId.value = permission?.id || null;

  if (mode === "create") {
    form.value = {
      name: "",
      display_name: "",
      resource: "",
      featureId: "",
      guard_name: "platform",
    };
    dialogVisible.value = true;
  } else if (mode === "view" && permission) {
    await fetchPermissionDetail(permission.id);
  } else if (mode === "edit" && permission) {
    form.value = {
      name: permission.name,
      display_name: permission.display_name,
      resource: permission.resource,
      featureId: permission.featureId,
      guard_name: permission.guard_name,
    };
    dialogVisible.value = true;
  }
};

const closeDialog = () => {
  dialogVisible.value = false;
  selectedPermissionId.value = null;
  form.value = {
    name: "",
    display_name: "",
    resource: "",
    featureId: "",
    guard_name: "",
  };
};

const confirmDelete = (permissionId: number) => {
  permissionToDelete.value = permissionId;
  deleteDialogVisible.value = true;
};

const handleDelete = async () => {
  if (permissionToDelete.value) {
    try {
      isLoadingDelete.value = true;
      await $rootAPI(
        `/platform/system-config/permissions/${permissionToDelete.value}`,
        {
          method: "DELETE",
        }
      );
      showToast("Permission berhasil dihapus", "success");
      deleteDialogVisible.value = false;
      permissionToDelete.value = null;

      // Refresh data
      await fetchPermissions();
    } catch (error: any) {
      console.error("Error deleting permission:", error);
      showToast(error?.data?.message || "Gagal menghapus permission", "error");
    } finally {
      isLoadingDelete.value = false;
    }
  }
};

const handleSubmit = async () => {
  try {
    isLoadingSubmit.value = true;

    const payload = {
      name: form.value.name,
      display_name: form.value.display_name,
      resource: form.value.resource,
      featureId: form.value.featureId,
      guard_name: form.value.guard_name,
    };

    if (dialogMode.value === "create") {
      await $rootAPI("/platform/system-config/permissions", {
        method: "POST",
        body: payload,
      });
      showToast("Permission berhasil ditambahkan", "success");
    } else if (dialogMode.value === "edit" && selectedPermissionId.value) {
      await $rootAPI(
        `/platform/system-config/permissions/${selectedPermissionId.value}`,
        {
          method: "PATCH",
          body: payload,
        }
      );
      showToast("Permission berhasil diupdate", "success");
    }

    closeDialog();

    // Refresh data
    await fetchPermissions();
  } catch (error: any) {
    console.error("Error submitting form:", error);
    showToast(
      error?.data?.message || "Gagal menyimpan data permission",
      "error"
    );
  } finally {
    isLoadingSubmit.value = false;
  }
};

// Filter data berdasarkan search (client-side)
const filteredData = computed(() => {
  if (!search.value) return paginateData.value.data;

  const searchLower = search.value.toLowerCase();

  return paginateData.value.data.filter(
    (permission) =>
      permission.name.toLowerCase().includes(searchLower) ||
      permission.display_name.toLowerCase().includes(searchLower) ||
      permission.resource.toLowerCase().includes(searchLower) ||
      permission.feature.name.toLowerCase().includes(searchLower)
  );
});

watch(selectedFeature, async () => {
  await fetchPermissions();
});

onMounted(async () => {
  await Promise.all([fetchPermissions(), fetchFeatures()]);
});
</script>

<template>
  <div data-testid="platform-permissions-page">
    <VCard>
      <VCardText
        class="d-flex flex-wrap justify-space-between align-center gap-4"
      >
        <h5 class="text-h5">Platform Permissions</h5>
        <VBtn
          color="primary"
          prepend-icon="tabler-plus"
          @click="openDialog('create')"
        >
          Tambah Permission
        </VBtn>
      </VCardText>

      <VDivider />

      <VCardText>
        <VRow>
          <VCol cols="12" sm="4">
            <AppTextField
              v-model="search"
              label="Search"
              placeholder="Cari permission..."
              prepend-inner-icon="tabler-search"
              clearable
            />
          </VCol>
          <VCol cols="12" sm="4">
            <AppAutocomplete
              v-model="selectedFeature"
              label="Filter Feature"
              :items="[
                { title: 'Semua Feature', value: '' },
                ...features.map((f) => ({ title: f.name, value: f.featureId })),
              ]"
              item-title="title"
              item-value="value"
              clearable
            >
              <template #prepend-inner>
                <VIcon icon="tabler-search" />
              </template>
            </AppAutocomplete>
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

        <template #item.name="{ item }">
          <code class="text-sm">{{ item.name }}</code>
        </template>

        <template #item.resource="{ item }">
          <span class="text-body-2">{{ item.resource }}</span>
        </template>

        <template #item.feature="{ item }">
          <VChip size="small" color="primary" variant="tonal">
            {{ item.feature.name }}
          </VChip>
        </template>

        <template #item.guard_name="{ item }">
          <VChip size="small" color="secondary" variant="tonal">
            {{ item.guard_name }}
          </VChip>
        </template>

        <template #item.actions="{ item }">
          <div class="d-flex gap-1">
            <IconBtn size="small" @click="openDialog('edit', item)">
              <VIcon icon="tabler-edit" color="warning" />
            </IconBtn>
            <IconBtn size="small" @click="confirmDelete(item.id)">
              <VIcon icon="tabler-trash" color="error" />
            </IconBtn>
          </div>
        </template>
      </VDataTable>
    </VCard>

    <!-- Permission Dialog -->
    <VDialog v-model="dialogVisible" max-width="500">
      <VCard>
        <VCardTitle class="d-flex justify-space-between align-center">
          <span>{{
            dialogMode === "create"
              ? "Tambah Permission"
              : dialogMode === "edit"
              ? "Edit Permission"
              : "Detail Permission"
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
                  v-model="form.featureId"
                  label="Feature"
                  :items="
                    features.map((f) => ({ title: f.name, value: f.featureId }))
                  "
                  :rules="[requiredValidator]"
                  :readonly="dialogMode === 'view'"
                  placeholder="Cari dan pilih feature"
                  item-title="title"
                  item-value="value"
                />
              </VCol>
              <VCol cols="12">
                <AppTextField
                  v-model="form.name"
                  label="Name"
                  placeholder="users.edit"
                  :rules="[requiredValidator]"
                  :readonly="dialogMode === 'view'"
                />
              </VCol>
              <VCol cols="12">
                <AppTextField
                  v-model="form.display_name"
                  label="Display Name"
                  placeholder="Edit Users"
                  :rules="[requiredValidator]"
                  :readonly="dialogMode === 'view'"
                />
              </VCol>
              <VCol cols="12">
                <AppTextField
                  v-model="form.resource"
                  label="Resource"
                  placeholder="users"
                  :rules="[requiredValidator]"
                  :readonly="dialogMode === 'view'"
                />
              </VCol>
              <VCol cols="12">
                <AppTextField
                  v-model="form.guard_name"
                  label="Guard Name"
                  placeholder="platform"
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
        <VCardText>Apakah Anda yakin ingin menghapus permission ini?</VCardText>
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
