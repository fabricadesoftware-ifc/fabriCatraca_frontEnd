<script setup lang="ts">
import type { User } from "@/types";
import { computed, onMounted, reactive, ref, watch } from "vue";
import { toast } from "vue3-toastify";
import ReleaseAuditTable from "@/components/release-audits/ReleaseAuditTable.vue";
import { TemporaryUserReleasesService, UsersService } from "@/services";

const loadingUsers = ref(false);
const saving = ref(false);
const userOptions = ref<User[]>([]);
const userSearch = ref("");
const selectedUserId = ref<number | null>(null);

const form = reactive({
  duration_minutes: 30,
  valid_from: "",
  notes: "",
});

const selectedUser = computed(() =>
  userOptions.value.find(user => user.id === selectedUserId.value) || null,
);

async function loadUsers(search?: string) {
  loadingUsers.value = true;
  try {
    const response = await UsersService.getUsers({
      search: search || undefined,
      page_size: 30,
      ordering: "name",
    });
    userOptions.value = response.results;
  } catch (error) {
    console.error(error);
    toast.error("Erro ao carregar alunos");
  } finally {
    loadingUsers.value = false;
  }
}

async function scheduleRelease() {
  if (!selectedUserId.value) {
    toast.warning("Selecione um aluno");
    return;
  }
  if (!form.notes.trim()) {
    toast.warning("Informe a justificativa da liberação");
    return;
  }
  if (!form.valid_from) {
    toast.warning("Informe a data e hora da liberação");
    return;
  }

  saving.value = true;
  try {
    await TemporaryUserReleasesService.createTemporaryUserRelease({
      user_id: selectedUserId.value,
      duration_minutes: Number(form.duration_minutes),
      valid_from: new Date(form.valid_from).toISOString(),
      notes: form.notes.trim(),
    });
    form.notes = "";
    toast.success("Liberação agendada com sucesso");
  } catch (error: any) {
    console.error(error);
    const message
      = error?.response?.data?.non_field_errors?.[0]
        || error?.response?.data?.user_id?.[0]
        || error?.response?.data?.error
        || "Erro ao agendar liberação";
    toast.error(message);
  } finally {
    saving.value = false;
  }
}

watch(userSearch, async value => {
  await loadUsers(value);
});

onMounted(async () => {
  await loadUsers();
});
</script>

<template>
  <v-container class="pa-0" fluid>
    <v-row>
      <v-col cols="12" md="5">
        <v-card>
          <v-card-title>Selecionar aluno</v-card-title>
          <v-card-text>
            <v-autocomplete
              v-model="selectedUserId"
              v-model:search="userSearch"
              :items="userOptions"
              item-title="name"
              item-value="id"
              label="Buscar aluno por nome ou matrícula"
              :loading="loadingUsers"
              no-filter
            >
              <template #item="{ props, item }">
                <v-list-item
                  v-bind="props"
                  :subtitle="item.raw.registration || 'Sem matrícula'"
                  :title="item.raw.name"
                />
              </template>
            </v-autocomplete>

            <v-alert v-if="selectedUser" class="mt-4" type="info" variant="tonal">
              <div><strong>Aluno:</strong> {{ selectedUser.name }}</div>
              <div><strong>Matrícula:</strong> {{ selectedUser.registration || "—" }}</div>
            </v-alert>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="7">
        <v-card>
          <v-card-title>Agendar liberação</v-card-title>
          <v-card-text>
            <v-row>
              <v-col cols="12" md="4">
                <v-text-field
                  v-model.number="form.duration_minutes"
                  label="Duração (minutos)"
                  min="1"
                  type="number"
                />
              </v-col>
              <v-col cols="12" md="8">
                <v-text-field
                  v-model="form.valid_from"
                  label="Data e hora da liberação"
                  type="datetime-local"
                />
              </v-col>
              <v-col cols="12">
                <v-textarea
                  v-model="form.notes"
                  auto-grow
                  label="Justificativa"
                  rows="3"
                />
              </v-col>
            </v-row>
          </v-card-text>
          <v-card-actions class="px-4 pb-4">
            <v-spacer />
            <v-btn color="primary" :loading="saving" @click="scheduleRelease">
              Agendar liberação
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>

      <v-col cols="12">
        <ReleaseAuditTable
          title="Histórico de liberações do SISAE"
          :filters="selectedUserId ? { target_user: selectedUserId } : {}"
          :release-types="['scheduled_user_release', 'temporary_user_release']"
        />
      </v-col>
    </v-row>
  </v-container>
</template>
