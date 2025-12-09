<script setup lang="ts">
import AppSelect from "@/@core/components/app-form-elements/AppSelect.vue";
import AppTextField from "@/@core/components/app-form-elements/AppTextField.vue";
import AppTextarea from "@/@core/components/app-form-elements/AppTextarea.vue";
import { requiredValidator } from "@/@core/utils/validators";
import { $rootAPI } from "@/utils/api";
import { customDebounce } from "@/utils/common";
import { showToast } from "@/utils/toaster";
import dayjs from "dayjs";

definePage({
  meta: {
    name: "Platform Tickets",
    rules: [{ action: "manage", subject: "default" }],
  },
});

interface Attachment {
  fileName: string;
  fileUrl: string;
}

interface Reply {
  replyId: string;
  ticketId: string;
  message: string;
  attachments: Attachment[] | null;
  createdByUserId: string;
  userType: "support" | "customer" | "system";
  isInternal: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Ticket {
  ticketId: string;
  ticketNumber: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  companyId: string | null;
  businessUnitId: string | null;
  outletId: string | null;
  createdByUserId: string;
  assignedToUserId: string | null;
  assignedAt: string | null;
  resolvedByUserId: string | null;
  resolvedAt: string | null;
  resolutionNotes: string | null;
  closedAt: string | null;
  firstResponseAt: string | null;
  dueDate: string | null;
  satisfactionRating: number | null;
  satisfactionComment: string | null;
  attachments: Attachment[];
  metadata: any;
  createdAt: string;
  updatedAt: string;
  replies?: Reply[];
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
const paginateData = ref<{ data: Ticket[]; meta: PaginationMeta | null }>({
  data: [],
  meta: null,
});

const requestQuery = ref({
  page: 1,
  perPage: 20,
  search: "",
});

const additionalFilter = ref({
  status: "",
  priority: "",
  category: "",
});

const search = ref("");
const detailDialogVisible = ref(false);
const createDialogVisible = ref(false);
const closeDialogVisible = ref(false);
const selectedTicket = ref<Ticket | null>(null);
const isLoadingAction = ref(false);
const replyMessage = ref("");

const closeForm = ref({
  resolutionNotes: "",
  satisfactionRating: null as number | null,
  satisfactionComment: "",
});

const createForm = ref({
  title: "",
  description: "",
  category: "technical",
  priority: "medium",
  companyId: "",
  businessUnitId: "",
  outletId: "",
  attachments: [] as Attachment[],
  metadata: {} as Record<string, any>,
});

const attachmentForm = ref({
  fileName: "",
  fileUrl: "",
});

const metaKey = ref("");
const metaValue = ref("");

const headers = [
  { title: "No", key: "index", width: "60px", sortable: false },
  { title: "Ticket", key: "ticketNumber", sortable: false },
  { title: "Title", key: "title", sortable: false },
  { title: "Kategori", key: "category", sortable: false },
  { title: "Prioritas", key: "priority", sortable: false },
  { title: "Status", key: "status", sortable: false },
  { title: "Created", key: "createdAt", sortable: false },
  { title: "Aksi", key: "actions", width: "120px", sortable: false },
];

const fetchTickets = async () => {
  try {
    isLoading.value = true;

    const params: Record<string, any> = {
      page: requestQuery.value.page,
      perPage: requestQuery.value.perPage,
      include: "replies",
    };

    if (requestQuery.value.search) {
      params["filter[title]"] = requestQuery.value.search;
    }

    if (additionalFilter.value.status) {
      params["filter[status]"] = additionalFilter.value.status;
    }

    if (additionalFilter.value.priority) {
      params["filter[priority]"] = additionalFilter.value.priority;
    }

    if (additionalFilter.value.category) {
      params["filter[category]"] = additionalFilter.value.category;
    }

    const response = await $rootAPI("/platform/support/tickets", {
      method: "GET",
      params,
    });

    paginateData.value = {
      data: response.data || [],
      meta: response.meta || null,
    };
  } catch (error) {
    console.error("Error fetching tickets:", error);
  } finally {
    isLoading.value = false;
  }
};

const fetchTicketDetail = async (ticketId: string) => {
  try {
    const response = await $rootAPI(`/platform/support/tickets/${ticketId}`, {
      method: "GET",
    });

    selectedTicket.value = response.data;
  } catch (error) {
    console.error("Error fetching ticket detail:", error);
    showToast(error?.data?.message || "Gagal memuat detail ticket", "error");
  }
};

const viewTicket = async (ticketId: string) => {
  await fetchTicketDetail(ticketId);
  detailDialogVisible.value = true;
};

const resetFilter = () => {
  search.value = "";
  requestQuery.value.search = "";
  requestQuery.value.page = 1;
  additionalFilter.value.status = "";
  additionalFilter.value.priority = "";
  additionalFilter.value.category = "";
};

const openCreateDialog = () => {
  createForm.value = {
    title: "",
    description: "",
    category: "technical",
    priority: "medium",
    companyId: "",
    businessUnitId: "",
    outletId: "",
    attachments: [],
    metadata: {},
  };
  attachmentForm.value = {
    fileName: "",
    fileUrl: "",
  };
  metaKey.value = "";
  metaValue.value = "";
  createDialogVisible.value = true;
};

const closeCreateDialog = () => {
  createDialogVisible.value = false;
  createForm.value = {
    title: "",
    description: "",
    category: "technical",
    priority: "medium",
    companyId: "",
    businessUnitId: "",
    outletId: "",
    attachments: [],
    metadata: {},
  };
  attachmentForm.value = {
    fileName: "",
    fileUrl: "",
  };
};

const addAttachment = () => {
  if (
    attachmentForm.value.fileName.trim() &&
    attachmentForm.value.fileUrl.trim()
  ) {
    createForm.value.attachments.push({
      fileName: attachmentForm.value.fileName.trim(),
      fileUrl: attachmentForm.value.fileUrl.trim(),
    });
    attachmentForm.value.fileName = "";
    attachmentForm.value.fileUrl = "";
  }
};

const removeAttachment = (index: number) => {
  createForm.value.attachments.splice(index, 1);
};

const addMeta = () => {
  if (metaKey.value.trim() && metaValue.value.trim()) {
    createForm.value.metadata[metaKey.value.trim()] = metaValue.value.trim();
    metaKey.value = "";
    metaValue.value = "";
  }
};

const removeMeta = (key: string) => {
  delete createForm.value.metadata[key];
};

const handleCreateTicket = async () => {
  try {
    isLoadingAction.value = true;

    const payload: any = {
      title: createForm.value.title,
      description: createForm.value.description,
      category: createForm.value.category,
      priority: createForm.value.priority,
      attachments: createForm.value.attachments,
      metadata: createForm.value.metadata,
    };

    // Hanya tambahkan jika diisi oleh user
    if (createForm.value.companyId && createForm.value.companyId.trim()) {
      payload.companyId = createForm.value.companyId.trim();
    }
    if (
      createForm.value.businessUnitId &&
      createForm.value.businessUnitId.trim()
    ) {
      payload.businessUnitId = createForm.value.businessUnitId.trim();
    }
    if (createForm.value.outletId && createForm.value.outletId.trim()) {
      payload.outletId = createForm.value.outletId.trim();
    }

    await $rootAPI("/platform/support/tickets", {
      method: "POST",
      body: payload,
    });

    showToast("Ticket berhasil dibuat", "success");
    closeCreateDialog();
    await fetchTickets();
  } catch (error: any) {
    console.error("Error creating ticket:", error);
    showToast(error?.data?.message || "Gagal membuat ticket", "error");
  } finally {
    isLoadingAction.value = false;
  }
};

const handleReply = async () => {
  if (!selectedTicket.value || !replyMessage.value.trim()) return;

  try {
    isLoadingAction.value = true;

    await $rootAPI(
      `/platform/support/tickets/${selectedTicket.value.ticketId}/reply`,
      {
        method: "POST",
        body: {
          message: replyMessage.value,
          userType: "support",
          isInternal: false,
          attachments: [],
        },
      }
    );

    showToast("Balasan berhasil dikirim", "success");
    replyMessage.value = "";
    await fetchTicketDetail(selectedTicket.value.ticketId);
  } catch (error: any) {
    console.error("Error replying ticket:", error);
    showToast(error?.data?.message || "Gagal mengirim balasan", "error");
  } finally {
    isLoadingAction.value = false;
  }
};

const openCloseDialog = () => {
  closeForm.value = {
    resolutionNotes: "",
    satisfactionRating: null,
    satisfactionComment: "",
  };
  closeDialogVisible.value = true;
};

const handleCloseTicket = async () => {
  if (!selectedTicket.value) return;

  try {
    isLoadingAction.value = true;

    await $rootAPI(
      `/platform/support/tickets/${selectedTicket.value.ticketId}/close`,
      {
        method: "POST",
        body: {
          resolutionNotes: closeForm.value.resolutionNotes,
          satisfactionRating: closeForm.value.satisfactionRating,
          satisfactionComment: closeForm.value.satisfactionComment,
        },
      }
    );

    showToast("Ticket berhasil ditutup", "success");
    closeDialogVisible.value = false;
    detailDialogVisible.value = false;
    await fetchTickets();
  } catch (error: any) {
    console.error("Error closing ticket:", error);
    showToast(error?.data?.message || "Gagal menutup ticket", "error");
  } finally {
    isLoadingAction.value = false;
  }
};

const getCategoryText = (cat: string) => {
  const texts: Record<string, string> = {
    technical: "Teknis",
    billing: "Billing",
    feature_request: "Fitur",
    bug_report: "Bug",
    account: "Akun",
    other: "Lainnya",
  };
  return texts[cat] || cat;
};

const getCategoryColor = (cat: string) => {
  const colors: Record<string, string> = {
    technical: "error",
    billing: "warning",
    feature_request: "info",
    bug_report: "error",
    account: "secondary",
    other: "secondary",
  };
  return colors[cat] || "secondary";
};

const getPriorityColor = (priority: string) => {
  const colors: Record<string, string> = {
    low: "success",
    medium: "info",
    high: "warning",
    urgent: "error",
  };
  return colors[priority] || "secondary";
};

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    open: "error",
    in_progress: "warning",
    waiting_response: "info",
    resolved: "success",
    closed: "secondary",
  };
  return colors[status] || "secondary";
};

const getStatusText = (status: string) => {
  const texts: Record<string, string> = {
    open: "Open",
    in_progress: "In Progress",
    waiting_response: "Menunggu Response",
    resolved: "Resolved",
    closed: "Closed",
  };
  return texts[status] || status;
};

watch(
  search,
  customDebounce((val: string) => {
    requestQuery.value.search = val;
    requestQuery.value.page = 1;
  }, 500)
);

watch(
  [requestQuery, additionalFilter],
  async () => {
    await fetchTickets();
  },
  { deep: true }
);

onMounted(async () => {
  await fetchTickets();
});
</script>

<template>
  <div data-testid="platform-tickets-page">
    <VCard>
      <VCardText
        class="d-flex flex-wrap justify-space-between align-center gap-4"
      >
        <h5 class="text-h5">Platform Tickets</h5>
        <VBtn
          color="primary"
          prepend-icon="tabler-plus"
          @click="openCreateDialog"
        >
          Buat Ticket
        </VBtn>
      </VCardText>

      <VDivider />

      <VCardText>
        <VRow>
          <VCol cols="12" sm="3">
            <AppTextField
              v-model="search"
              label="Search"
              placeholder="Cari ticket..."
              prepend-inner-icon="tabler-search"
              clearable
            />
          </VCol>
          <VCol cols="12" sm="2">
            <AppSelect
              v-model="additionalFilter.status"
              label="Status"
              :items="[
                { title: 'Semua', value: '' },
                { title: 'Open', value: 'open' },
                { title: 'In Progress', value: 'in_progress' },
                { title: 'Menunggu Response', value: 'waiting_response' },
                { title: 'Resolved', value: 'resolved' },
                { title: 'Closed', value: 'closed' },
              ]"
              clearable
            />
          </VCol>
          <VCol cols="12" sm="2">
            <AppSelect
              v-model="additionalFilter.priority"
              label="Prioritas"
              :items="[
                { title: 'Semua', value: '' },
                { title: 'Urgent', value: 'urgent' },
                { title: 'High', value: 'high' },
                { title: 'Medium', value: 'medium' },
                { title: 'Low', value: 'low' },
              ]"
              clearable
            />
          </VCol>
          <VCol cols="12" sm="2">
            <AppSelect
              v-model="additionalFilter.category"
              label="Kategori"
              :items="[
                { title: 'Semua', value: '' },
                { title: 'Teknis', value: 'technical' },
                { title: 'Billing', value: 'billing' },
                { title: 'Fitur', value: 'feature_request' },
                { title: 'Bug', value: 'bug_report' },
                { title: 'Akun', value: 'account' },
                { title: 'Lainnya', value: 'other' },
              ]"
              clearable
            />
          </VCol>
          <VCol cols="12" sm="2" class="d-flex align-center mt-6">
            <VBtn variant="outlined" @click="resetFilter"> Reset </VBtn>
          </VCol>
        </VRow>
      </VCardText>

      <VDataTable
        :headers="headers"
        :items="paginateData.data"
        :loading="isLoading"
        v-model:page="requestQuery.page"
        v-model:items-per-page="requestQuery.perPage"
        :items-length="paginateData.meta?.total || 0"
        class="text-no-wrap"
      >
        <template #item.index="{ index }">
          {{ (requestQuery.page - 1) * requestQuery.perPage + index + 1 }}
        </template>

        <template #item.ticketNumber="{ item }">
          <span
            class="font-weight-medium text-primary cursor-pointer"
            @click="viewTicket(item.ticketId)"
          >
            {{ item.ticketNumber }}
          </span>
        </template>

        <template #item.title="{ item }">
          <div style="max-width: 250px" class="text-truncate">
            {{ item.title }}
          </div>
        </template>

        <template #item.category="{ item }">
          <VChip
            size="small"
            :color="getCategoryColor(item.category)"
            variant="tonal"
          >
            {{ getCategoryText(item.category) }}
          </VChip>
        </template>

        <template #item.priority="{ item }">
          <VChip size="small" :color="getPriorityColor(item.priority)">
            {{ item.priority }}
          </VChip>
        </template>

        <template #item.status="{ item }">
          <VChip size="small" :color="getStatusColor(item.status)">
            {{ getStatusText(item.status) }}
          </VChip>
        </template>

        <template #item.createdAt="{ item }">
          {{ dayjs(item.createdAt).format("DD/MM/YY HH:mm") }}
        </template>

        <template #item.actions="{ item }">
          <IconBtn size="small" @click="viewTicket(item.ticketId)">
            <VIcon icon="tabler-eye" color="info" />
          </IconBtn>
        </template>
      </VDataTable>
    </VCard>

    <!-- Create Ticket Dialog -->
    <VDialog v-model="createDialogVisible" max-width="800" scrollable>
      <VCard>
        <VCardTitle class="d-flex justify-space-between align-center">
          <span>Buat Ticket Baru</span>
          <IconBtn @click="closeCreateDialog">
            <VIcon icon="tabler-x" />
          </IconBtn>
        </VCardTitle>

        <VDivider />

        <VCardText style="max-height: 65vh">
          <VForm @submit.prevent="handleCreateTicket">
            <VRow>
              <VCol cols="12">
                <AppTextField
                  v-model="createForm.title"
                  label="Title *"
                  placeholder="Masukkan judul ticket"
                  :rules="[requiredValidator]"
                />
              </VCol>
              <VCol cols="12">
                <AppTextarea
                  v-model="createForm.description"
                  label="Description *"
                  placeholder="Jelaskan masalah Anda"
                  rows="4"
                  :rules="[requiredValidator]"
                />
              </VCol>
              <VCol cols="12" md="6">
                <AppSelect
                  v-model="createForm.category"
                  label="Kategori *"
                  :items="[
                    { title: 'Teknis', value: 'technical' },
                    { title: 'Billing', value: 'billing' },
                    { title: 'Fitur', value: 'feature_request' },
                    { title: 'Bug', value: 'bug_report' },
                    { title: 'Akun', value: 'account' },
                    { title: 'Lainnya', value: 'other' },
                  ]"
                  :rules="[requiredValidator]"
                />
              </VCol>
              <VCol cols="12" md="6">
                <AppSelect
                  v-model="createForm.priority"
                  label="Prioritas *"
                  :items="[
                    { title: 'Low', value: 'low' },
                    { title: 'Medium', value: 'medium' },
                    { title: 'High', value: 'high' },
                    { title: 'Urgent', value: 'urgent' },
                  ]"
                  :rules="[requiredValidator]"
                />
              </VCol>

              <!-- Optional Fields Section -->
              <VCol cols="12">
                <VDivider />
                <p class="text-subtitle-2 mt-3 mb-2">
                  Informasi Tambahan (Opsional)
                </p>
              </VCol>

              <VCol cols="12" md="4">
                <AppTextField
                  v-model="createForm.companyId"
                  label="Company ID"
                  placeholder="UUID Company (opsional)"
                  clearable
                />
              </VCol>
              <VCol cols="12" md="4">
                <AppTextField
                  v-model="createForm.businessUnitId"
                  label="Business Unit ID"
                  placeholder="UUID Business Unit (opsional)"
                  clearable
                />
              </VCol>
              <VCol cols="12" md="4">
                <AppTextField
                  v-model="createForm.outletId"
                  label="Outlet ID"
                  placeholder="UUID Outlet (opsional)"
                  clearable
                />
              </VCol>

              <!-- Attachments Section -->
              <VCol cols="12">
                <VDivider />
                <p class="text-subtitle-2 mt-3 mb-2">Attachments (Opsional)</p>
                <div class="d-flex gap-2 mb-3">
                  <AppTextField
                    v-model="attachmentForm.fileName"
                    placeholder="Nama file"
                    density="compact"
                    style="flex: 1"
                  />
                  <AppTextField
                    v-model="attachmentForm.fileUrl"
                    placeholder="URL file"
                    density="compact"
                    style="flex: 1"
                  />
                  <VBtn
                    color="primary"
                    size="small"
                    prepend-icon="tabler-paperclip"
                    @click="addAttachment"
                  >
                    Tambah
                  </VBtn>
                </div>
                <div
                  v-if="createForm.attachments.length > 0"
                  class="d-flex flex-wrap gap-2"
                >
                  <VChip
                    v-for="(att, idx) in createForm.attachments"
                    :key="idx"
                    closable
                    color="info"
                    variant="tonal"
                    prepend-icon="tabler-paperclip"
                    @click:close="removeAttachment(idx)"
                  >
                    {{ att.fileName }}
                  </VChip>
                </div>
              </VCol>

              <!-- Metadata Section -->
              <VCol cols="12">
                <VDivider />
                <p class="text-subtitle-2 mt-3 mb-2">Metadata (Opsional)</p>
                <p class="text-caption text-disabled mb-2">
                  Informasi tambahan seperti browser, OS, device, userAgent, dll
                </p>
                <div class="d-flex gap-2 mb-3">
                  <AppTextField
                    v-model="metaKey"
                    placeholder="Key (contoh: browser, os, device)"
                    density="compact"
                    style="flex: 1"
                  />
                  <AppTextField
                    v-model="metaValue"
                    placeholder="Value"
                    density="compact"
                    style="flex: 1"
                  />
                  <VBtn color="primary" size="small" @click="addMeta">
                    Tambah
                  </VBtn>
                </div>
                <div
                  v-if="Object.keys(createForm.metadata).length > 0"
                  class="d-flex flex-wrap gap-2"
                >
                  <VChip
                    v-for="(value, key) in createForm.metadata"
                    :key="key"
                    closable
                    color="primary"
                    variant="tonal"
                    @click:close="removeMeta(String(key))"
                  >
                    <strong>{{ key }}:</strong>&nbsp;{{ value }}
                  </VChip>
                </div>
              </VCol>
            </VRow>

            <div class="d-flex justify-end gap-3 mt-4">
              <VBtn
                variant="outlined"
                color="secondary"
                @click="closeCreateDialog"
              >
                Batal
              </VBtn>
              <VBtn
                color="primary"
                :loading="isLoadingAction"
                @click="handleCreateTicket"
              >
                Buat Ticket
              </VBtn>
            </div>
          </VForm>
        </VCardText>
      </VCard>
    </VDialog>

    <!-- Ticket Detail Dialog -->
    <VDialog v-model="detailDialogVisible" max-width="800" scrollable>
      <VCard v-if="selectedTicket">
        <VCardTitle class="d-flex justify-space-between align-center">
          <div>
            <span class="text-h6">{{ selectedTicket.ticketNumber }}</span>
            <VChip
              size="small"
              :color="getStatusColor(selectedTicket.status)"
              class="ms-2"
            >
              {{ getStatusText(selectedTicket.status) }}
            </VChip>
          </div>
          <IconBtn @click="detailDialogVisible = false">
            <VIcon icon="tabler-x" />
          </IconBtn>
        </VCardTitle>

        <VDivider />

        <VCardText style="max-height: 60vh; overflow-y: auto">
          <div class="mb-4">
            <h6 class="text-h6 mb-2">{{ selectedTicket.title }}</h6>
            <div class="d-flex flex-wrap gap-4 mb-3">
              <div>
                <span class="text-body-2 text-disabled">Prioritas:</span>
                <VChip
                  size="x-small"
                  :color="getPriorityColor(selectedTicket.priority)"
                  class="ms-1"
                >
                  {{ selectedTicket.priority }}
                </VChip>
              </div>
              <div>
                <span class="text-body-2 text-disabled">Kategori:</span>
                <VChip
                  size="x-small"
                  :color="getCategoryColor(selectedTicket.category)"
                  class="ms-1"
                  variant="tonal"
                >
                  {{ getCategoryText(selectedTicket.category) }}
                </VChip>
              </div>
              <div>
                <span class="text-body-2 text-disabled">Dibuat:</span>
                <span class="ms-1">{{
                  dayjs(selectedTicket.createdAt).format("DD/MM/YYYY HH:mm")
                }}</span>
              </div>
            </div>
            <VCard variant="outlined" class="pa-3">
              <p class="text-body-2 mb-0">{{ selectedTicket.description }}</p>
            </VCard>

            <div
              v-if="
                selectedTicket.attachments &&
                selectedTicket.attachments.length > 0
              "
              class="mt-3"
            >
              <p class="text-caption text-disabled mb-2">Attachments:</p>
              <div class="d-flex flex-wrap gap-2">
                <VChip
                  v-for="(att, idx) in selectedTicket.attachments"
                  :key="idx"
                  size="small"
                  prepend-icon="tabler-paperclip"
                  color="info"
                  variant="tonal"
                >
                  {{ att.fileName }}
                </VChip>
              </div>
            </div>

            <div
              v-if="
                selectedTicket.metadata &&
                Object.keys(selectedTicket.metadata).length > 0
              "
              class="mt-3"
            >
              <p class="text-caption text-disabled mb-2">Metadata:</p>
              <div class="d-flex flex-wrap gap-2">
                <VChip
                  v-for="(value, key) in selectedTicket.metadata"
                  :key="key"
                  size="small"
                  color="primary"
                  variant="tonal"
                >
                  <strong>{{ key }}:</strong>&nbsp;{{ value }}
                </VChip>
              </div>
            </div>
          </div>

          <VDivider class="my-4" />

          <div
            v-if="selectedTicket.replies && selectedTicket.replies.length > 0"
          >
            <h6 class="text-h6 mb-3">
              Balasan ({{ selectedTicket.replies.length }})
            </h6>
            <div
              v-for="reply in selectedTicket.replies"
              :key="reply.replyId"
              class="mb-3"
            >
              <VCard
                :variant="reply.userType === 'support' ? 'tonal' : 'outlined'"
                :color="reply.userType === 'support' ? 'primary' : undefined"
                class="pa-3"
              >
                <div class="d-flex justify-space-between mb-2">
                  <VChip
                    size="x-small"
                    :color="
                      reply.userType === 'support'
                        ? 'primary'
                        : reply.userType === 'system'
                        ? 'secondary'
                        : 'info'
                    "
                  >
                    {{ reply.userType }}
                  </VChip>
                  <span class="text-caption text-disabled">
                    {{ dayjs(reply.createdAt).format("DD/MM/YYYY HH:mm") }}
                  </span>
                </div>
                <p class="text-body-2 mb-0">{{ reply.message }}</p>
              </VCard>
            </div>
          </div>

          <div
            v-if="
              selectedTicket.status !== 'closed' &&
              selectedTicket.status !== 'resolved'
            "
            class="mt-4"
          >
            <h6 class="text-h6 mb-2">Kirim Balasan</h6>
            <AppTextarea
              v-model="replyMessage"
              placeholder="Tulis balasan..."
              rows="3"
            />
          </div>
        </VCardText>

        <VDivider />

        <VCardActions class="mt-2">
          <VBtn
            v-if="
              selectedTicket.status !== 'closed' &&
              selectedTicket.status !== 'resolved'
            "
            variant="outlined"
            color="error"
            @click="openCloseDialog"
          >
            Tutup Ticket
          </VBtn>
          <VSpacer />
          <VBtn variant="outlined" @click="detailDialogVisible = false">
            Tutup
          </VBtn>
          <VBtn
            v-if="
              selectedTicket.status !== 'closed' &&
              selectedTicket.status !== 'resolved'
            "
            color="primary"
            variant="outlined"
            :loading="isLoadingAction"
            :disabled="!replyMessage"
            @click="handleReply"
          >
            Kirim Balasan
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>

    <!-- Close Ticket Dialog -->
    <VDialog v-model="closeDialogVisible" max-width="500">
      <VCard>
        <VCardTitle>Tutup Ticket</VCardTitle>
        <VDivider />
        <VCardText>
          <VForm @submit.prevent="handleCloseTicket">
            <VRow>
              <VCol cols="12">
                <AppTextarea
                  v-model="closeForm.resolutionNotes"
                  label="Resolution Notes"
                  placeholder="Catatan penyelesaian"
                  rows="3"
                />
              </VCol>
              <VCol cols="12">
                <AppTextField
                  v-model.number="closeForm.satisfactionRating"
                  label="Satisfaction Rating (1-5)"
                  type="number"
                  min="1"
                  max="5"
                />
              </VCol>
              <VCol cols="12">
                <AppTextarea
                  v-model="closeForm.satisfactionComment"
                  label="Satisfaction Comment"
                  placeholder="Komentar kepuasan"
                  rows="2"
                />
              </VCol>
            </VRow>

            <div class="d-flex justify-end gap-3 mt-4">
              <VBtn
                variant="outlined"
                color="secondary"
                @click="closeDialogVisible = false"
              >
                Batal
              </VBtn>
              <VBtn
                color="error"
                :loading="isLoadingAction"
                @click="handleCloseTicket"
              >
                Tutup Ticket
              </VBtn>
            </div>
          </VForm>
        </VCardText>
      </VCard>
    </VDialog>
  </div>
</template>
