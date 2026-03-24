<script lang="ts" setup>
import type { Card } from "@/types";
import { onMounted, ref, watch } from "vue";
import { toast } from "vue3-toastify";
import { useDeviceStore } from "@/stores";
import { CardsService } from "@/services";

const props = defineProps<{ userId: number }>();

const cards = ref<Card[]>([]);
const loading = ref(false);
const saving = ref(false);
const deletingId = ref<number | null>(null);

const createDialog = ref(false);
const selectedDevice = ref<number | null>(null);

const deviceStore = useDeviceStore();

async function loadCards() {
  loading.value = true;
  try {
    const response = await CardsService.getCards({ user_id: props.userId });
    cards.value = response.results;
  } catch {
    toast.error("Erro ao carregar cartoes");
  } finally {
    loading.value = false;
  }
}

function openCreateDialog() {
  selectedDevice.value = null;
  createDialog.value = true;
}

async function saveCard() {
  if (!selectedDevice.value) {
    toast.warning("Selecione uma catraca para capturar o cartao");
    return;
  }

  saving.value = true;
  try {
    await CardsService.createCard({
      user_id: props.userId,
      enrollment_device_id: selectedDevice.value,
    });
    toast.success("Cartao cadastrado com sucesso!");
    createDialog.value = false;
    await loadCards();
  } catch (err: any) {
    const msg = err?.response?.data?.error || "Erro ao cadastrar cartao";
    toast.error(msg);
  } finally {
    saving.value = false;
  }
}

async function deleteCard(id: number) {
  deletingId.value = id;
  try {
    await CardsService.deleteCard(id);
    toast.success("Cartao removido");
    await loadCards();
  } catch {
    toast.error("Erro ao remover cartao");
  } finally {
    deletingId.value = null;
  }
}

onMounted(async () => {
  await loadCards();
  if (deviceStore.devices.length === 0) {
    await deviceStore.loadDevices();
  }
});

watch(createDialog, (isOpen) => {
  if (isOpen) {
    selectedDevice.value = null;
  }
});
</script>

<template>
  <v-card>
    <v-card-title class="d-flex align-center justify-space-between">
      <span class="text-subtitle-1">Cartoes do Usuario</span>
      <v-btn
        color="primary"
        prepend-icon="mdi-credit-card-plus"
        size="small"
        @click="openCreateDialog"
      >
        Cadastrar Cartao
      </v-btn>
    </v-card-title>

    <v-data-table
      density="compact"
      :headers="[
        { title: 'ID', key: 'id', width: '80px' },
        { title: 'Valor', key: 'value' },
        { title: 'Acoes', key: 'actions', align: 'end', sortable: false },
      ]"
      :items="cards"
      :loading="loading"
      no-data-text="Nenhum cartao cadastrado"
    >
      <template #item.actions="{ item }">
        <v-btn
          color="error"
          icon="mdi-delete"
          :loading="deletingId === item.id"
          size="small"
          variant="text"
          @click="deleteCard(item.id)"
        />
      </template>
    </v-data-table>
  </v-card>

  <v-dialog v-model="createDialog" max-width="600">
    <v-card>
      <v-card-title class="text-h6">Selecionar Dispositivo</v-card-title>
      <v-card-text>
        <v-alert
          class="mb-4"
          color="info"
          density="compact"
          icon="mdi-credit-card-wireless"
          variant="tonal"
        >
          O cartao sera capturado pela catraca selecionada e salvo no sistema para
          distribuicao posterior.
        </v-alert>

        <v-select
          v-model="selectedDevice"
          :disabled="deviceStore.loading"
          item-title="name"
          item-value="id"
          :items="deviceStore.devices"
          label="Dispositivo para capturar o cartao"
          :loading="deviceStore.loading"
        />
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" @click="createDialog = false">Cancelar</v-btn>
        <v-btn color="primary" :loading="saving" @click="saveCard">Iniciar Cadastro</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
