<script setup lang="ts">
import { useAdminTenantCapabilityStore } from "@/stores/admin/systemConfigStore";
import dayjs from "dayjs";

definePage({
  meta: {
    name: "Admin Tenant Capability",
    rules: [{ action: "manage", subject: "default" }],
  },
});

const capabilityStore = useAdminTenantCapabilityStore();
const { capabilities, isLoading } = storeToRefs(capabilityStore);

const deleteDialogVisible = ref(false);
const capabilityToDelete = ref<string | null>(null);

onMounted(async () => {
  await capabilityStore.fetchCapabilities();
});

const getTypeColor = (type: string) => {
  const colors: Record<string, string> = {
    module: "primary",
    feature: "success",
    permission: "info",
    limit: "warning",
  };
  return colors[type] || "secondary";
};

const getActionColor = (action: string) => {
  const colors: Record<string, string> = {
    add: "success",
    remove: "error",
    modify: "warning",
  };
  return colors[action] || "secondary";
};

const confirmDelete = (capabilityId: string) => {
  capabilityToDelete.value = capabilityId;
  deleteDialogVisible.value = true;
};

const handleDelete = async () => {
  if (capabilityToDelete.value) {
    await capabilityStore.deleteCapability(capabilityToDelete.value);
    deleteDialogVisible.value = false;
    capabilityToDelete.value = null;
  }
};
</script>

<template>
  <div data-testid="admin-tenant-capability-page">
    <VCard>
      <VCardText
        class="d-flex flex-wrap justify-space-between align-center gap-4"
      >
        <div>
          <h5 class="text-h5">Tenant Capability</h5>
          <p class="text-body-2 text-disabled mb-0">
            Konfigurasi capability khusus untuk tenant tertentu
          </p>
        </div>
      </VCardText>

      <VDivider />

      <VDataTable
        :headers="[
          { title: 'Company', key: 'companyName' },
          { title: 'Plan', key: 'planName' },
          { title: 'Tipe', key: 'type' },
          { title: 'Target', key: 'targetName' },
          { title: 'Aksi', key: 'action' },
          { title: 'Alasan', key: 'reason' },
          { title: 'Berlaku Sampai', key: 'expiresAt' },
          { title: 'Dibuat', key: 'createdAt' },
          { title: '', key: 'actions', width: '80px' },
        ]"
        :items="capabilities"
        :loading="isLoading"
        class="text-no-wrap"
      >
        <template #item.companyName="{ item }">
          <span class="font-weight-medium">{{ item.companyName }}</span>
        </template>

        <template #item.planName="{ item }">
          <VChip size="small" color="primary" variant="tonal">
            {{ item.planName }}
          </VChip>
        </template>

        <template #item.type="{ item }">
          <VChip size="small" :color="getTypeColor(item.type)">
            {{ item.type }}
          </VChip>
        </template>

        <template #item.action="{ item }">
          <VChip
            size="small"
            :color="getActionColor(item.action)"
            variant="tonal"
          >
            {{ item.action }}
          </VChip>
        </template>

        <template #item.reason="{ item }">
          <div style="max-width: 200px" class="text-truncate">
            {{ item.reason }}
          </div>
        </template>

        <template #item.expiresAt="{ item }">
          <span v-if="item.expiresAt">{{
            dayjs(item.expiresAt).format("DD/MM/YYYY")
          }}</span>
          <span v-else class="text-disabled">Permanen</span>
        </template>

        <template #item.createdAt="{ item }">
          {{ dayjs(item.createdAt).format("DD/MM/YYYY") }}
        </template>

        <template #item.actions="{ item }">
          <IconBtn size="small" @click="confirmDelete(item.id)">
            <VIcon icon="tabler-trash" color="error" />
          </IconBtn>
        </template>
      </VDataTable>
    </VCard>

    <!-- Delete Confirmation -->
    <VDialog v-model="deleteDialogVisible" max-width="400">
      <VCard>
        <VCardTitle>Konfirmasi Hapus</VCardTitle>
        <VDivider />
        <VCardText>
          <p>Apakah Anda yakin ingin menghapus capability ini?</p>

          <div class="d-flex justify-end gap-3 mt-4">
            <VBtn
              variant="outlined"
              color="secondary"
              @click="deleteDialogVisible = false"
            >
              Batal
            </VBtn>
            <VBtn variant="outlined" color="error" @click="handleDelete">
              Hapus
            </VBtn>
          </div>
        </VCardText>
      </VCard>
    </VDialog>
  </div>
</template>
