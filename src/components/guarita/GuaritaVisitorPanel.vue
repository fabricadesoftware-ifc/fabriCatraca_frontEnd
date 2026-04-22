<script setup lang="ts">
import type { Visita } from "@/types";
import { computed, onMounted, ref } from "vue";
import { toast } from "vue3-toastify";
import { useAuthStore, useUserStore } from "@/stores";
import { VisitasService } from "@/services";
import UserComponent from "@/components/users/UserComponent.vue";
import { formatDateTimeForDisplay } from "@/utils/dateTime";

const authStore = useAuthStore();
const userStore = useUserStore();
const searchTerm = ref("");
const visits = ref<Visita[]>([]);
const visitsLoading = ref(false);
const closingVisitId = ref<number | null>(null);

const activeVisits = computed(() => visits.value.filter((visit) => visit.status === "active"));
const overdueVisits = computed(() => visits.value.filter((visit) => visit.status === "overdue"));

function getVisitStatusColor(status?: Visita["status"]) {
  const colors: Record<string, string> = {
    active: "primary",
    overdue: "warning",
    finished: "success",
  };
  return colors[status || "finished"] || "default";
}

async function loadVisits() {
  visitsLoading.value = true;
  try {
    const response = await VisitasService.getVisitas({
      ordering: "-visit_date",
      page_size: 20,
    });
    visits.value = response.results || [];
  } catch (error) {
    console.error(error);
    toast.error("Erro ao carregar historico de visitas.");
  } finally {
    visitsLoading.value = false;
  }
}

async function loadVisitors(page = 1, pageSize = userStore.page_size) {
  await userStore.loadUsers({
    page,
    page_size: pageSize,
    search: searchTerm.value || undefined,
    user_type_id: 1,
  });
}

async function pageChanger(page: number | string) {
  const pageNum = typeof page === "number" ? page : Number(page);
  await loadVisitors(pageNum, userStore.page_size);
}

async function itemsPerPageChanger(pageSize: number | string) {
  const pageSizeNum = typeof pageSize === "number" ? pageSize : Number(pageSize);
  await loadVisitors(userStore.current_page, pageSizeNum);
}

async function searchChanged(search: string | number) {
  const searchValue = typeof search === "string" ? search : String(search);
  searchTerm.value = searchValue;
  await loadVisitors(1, userStore.page_size);
}

async function closeVisit(visit: Visita) {
  closingVisitId.value = visit.id;
  try {
    await VisitasService.closeVisita(visit.id);
    toast.success("Visita encerrada com sucesso.");
    await loadVisits();
    await loadVisitors(userStore.current_page, userStore.page_size);
  } catch (error: any) {
    console.error(error);
    const message = error?.response?.data?.error || "Erro ao encerrar visita.";
    toast.error(message);
  } finally {
    closingVisitId.value = null;
  }
}

onMounted(async () => {
  await loadVisitors();
  await loadVisits();
});
</script>

<template>
  <UserComponent
    :app_role="authStore.role"
    :can-create="authStore.role === 'admin' || authStore.role === 'guarita'"
    :create-label="'Cadastrar visitante'"
    :current-page="userStore.current_page"
    :custom-headers="[
      { title: 'ID', key: 'id', align: 'start' },
      { title: 'Nome', key: 'name', align: 'start' },
      { title: 'CPF', key: 'cpf', align: 'start' },
      { title: 'E-mail', key: 'email', align: 'start' },
      { title: 'Telefone', key: 'phone', align: 'start' },
      { title: 'Inicio Vigencia', key: 'start_date', align: 'start' },
      { title: 'Fim Vigencia', key: 'end_date', align: 'start' },
      { title: 'Ultima Passagem', key: 'last_passage_at', align: 'start' },
    ]"
    :minimal-dialog="true"
    :new-user-defaults="{
      user_type_id: 1,
      device_scope: 'all_active',
      selected_device_ids: [],
      selected_devices: [],
      app_role: '',
      panel_access_only: false,
      device_admin: false,
    }"
    :page-size="userStore.page_size"
    :reload-query="{ user_type_id: 1, search: searchTerm || undefined }"
    :title="'Visitantes'"
    :total-items="userStore.count"
    :total-pages="userStore.total_pages"
    :users="userStore.users"
    @item-per-page="itemsPerPageChanger($event)"
    @page-changed="pageChanger($event)"
    @search-changed="searchChanged($event)"
  >
    <template #item.start_date="{ item }">
      {{ item.start_date ? formatDateTimeForDisplay(item.start_date) : 'N/A' }}
    </template>
    <template #item.end_date="{ item }">
      {{ item.end_date ? formatDateTimeForDisplay(item.end_date) : 'Sem limite' }}
    </template>
    <template #item.last_passage_at="{ item }">
      {{ item.last_passage_at ? formatDateTimeForDisplay(item.last_passage_at) : 'Nao registrada' }}
    </template>
  </UserComponent>

  <v-card class="mt-6">
    <v-card-title class="d-flex align-center justify-space-between">
      <span class="text-subtitle-1">Historico de Visitas</span>
      <v-btn
        color="default"
        prepend-icon="mdi-refresh"
        size="small"
        variant="outlined"
        @click="loadVisits"
      >
        Atualizar
      </v-btn>
    </v-card-title>

    <v-card-text>
      <div class="d-flex flex-wrap ga-2 mb-4">
        <v-chip color="primary" variant="tonal">
          Em andamento: {{ activeVisits.length }}
        </v-chip>
        <v-chip color="warning" variant="tonal">
          Aguardando encerramento: {{ overdueVisits.length }}
        </v-chip>
        <v-chip color="success" variant="tonal">
          Total listadas: {{ visits.length }}
        </v-chip>
      </div>

      <v-progress-linear v-if="visitsLoading" color="primary" indeterminate />

      <v-table v-else density="comfortable">
        <thead>
          <tr>
            <th>Status</th>
            <th>Visitante</th>
            <th>Entrada</th>
            <th>Fim previsto</th>
            <th>Cartao</th>
            <th>Resultado</th>
            <th class="text-right">Acoes</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="visit in visits" :key="visit.id">
            <td>
              <v-chip :color="getVisitStatusColor(visit.status)" size="small" variant="tonal">
                {{ visit.status_label || visit.status || "Sem status" }}
              </v-chip>
            </td>
            <td>
              <div class="text-body-2">{{ visit.user_name || `Usuario #${visit.user}` }}</div>
              <div class="text-caption text-medium-emphasis">
                Criada por {{ visit.created_by_name || "Sistema" }}
              </div>
            </td>
            <td>{{ formatDateTimeForDisplay(visit.visit_date) }}</td>
            <td>{{ visit.end_date ? formatDateTimeForDisplay(visit.end_date) : "Sem limite" }}</td>
            <td>{{ visit.card_value || "Sem cartao" }}</td>
            <td>
              <div class="text-body-2">
                {{ visit.finished_at ? `Encerrada em ${formatDateTimeForDisplay(visit.finished_at)}` : "Visita aberta" }}
              </div>
              <div class="text-caption text-medium-emphasis">
                {{
                  visit.card_removed_at
                    ? `Cartao removido em ${formatDateTimeForDisplay(visit.card_removed_at)}`
                    : visit.card_value
                      ? "Cartao ainda ativo na catraca"
                      : "Sem necessidade de remocao"
                }}
              </div>
            </td>
            <td class="text-right">
              <v-btn
                v-if="visit.status === 'active' || visit.status === 'overdue'"
                color="error"
                :loading="closingVisitId === visit.id"
                size="small"
                variant="text"
                @click="closeVisit(visit)"
              >
                Encerrar
              </v-btn>
            </td>
          </tr>
          <tr v-if="visits.length === 0">
            <td class="text-center text-medium-emphasis py-6" colspan="7">
              Nenhuma visita registrada.
            </td>
          </tr>
        </tbody>
      </v-table>
    </v-card-text>
  </v-card>
</template>
