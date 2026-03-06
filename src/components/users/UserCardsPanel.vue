<script lang="ts" setup>
import type { Card, CardFromBioPayload } from "@/types";
import { onMounted, ref } from "vue";
import { toast } from "vue3-toastify";
import { useBioStore, useDeviceStore } from "@/stores";
import { CardsService } from "@/services";

const props = defineProps<{ userId: number }>();

const cards = ref<Card[]>([]);
const loading = ref(false);
const saving = ref(false);
const deletingId = ref<number | null>(null);

// Dialog para criar cartão
const createDialog = ref(false);
const cardNumber = ref("");
const cardValue = ref<number | null>(null);
const selectedDeviceIds = ref<number[]>([]);
const fromBio = ref(false);

const bioStore = useBioStore();
const deviceStore = useDeviceStore();

async function loadCards() {
  loading.value = true;
  try {
    const response = await CardsService.getCards({ user: props.userId });
    cards.value = response.results;
  } catch {
    toast.error("Erro ao carregar cartões");
  } finally {
    loading.value = false;
  }
}

function openCreateDialog(useBio = false) {
  fromBio.value = useBio;
  cardNumber.value = "";
  cardValue.value = null;
  selectedDeviceIds.value = [];
  createDialog.value = true;
}

async function saveCard() {
  if (!cardNumber.value || cardValue.value == null) {
    toast.warning("Preencha número e valor do cartão");
    return;
  }

  saving.value = true;
  try {
    if (fromBio.value) {
      const payload: CardFromBioPayload = {
        user_id: props.userId,
        card_number: cardNumber.value,
        card_value: cardValue.value,
        device_ids: selectedDeviceIds.value.length > 0 ? selectedDeviceIds.value : undefined,
      };
      await CardsService.createCardFromBio(payload);
      toast.success("Cartão criado com base na biometria!");
    } else {
      await CardsService.createCard({
        number: cardNumber.value,
        value: cardValue.value,
        user: { id: props.userId } as any,
      });
      toast.success("Cartão criado com sucesso!");
    }
    createDialog.value = false;
    await loadCards();
  } catch (err: any) {
    const msg = err?.response?.data?.error || "Erro ao criar cartão";
    toast.error(msg);
  } finally {
    saving.value = false;
  }
}

async function deleteCard(id: number) {
  deletingId.value = id;
  try {
    await CardsService.deleteCard(id);
    toast.success("Cartão removido");
    await loadCards();
  } catch {
    toast.error("Erro ao remover cartão");
  } finally {
    deletingId.value = null;
  }
}

onMounted(async () => {
  await loadCards();
  if (bioStore.bios.length === 0) {
    await bioStore.loadUserBios(props.userId);
  }
  if (deviceStore.devices.length === 0) {
    await deviceStore.loadDevices();
  }
});
</script>

<template>
  <v-card>
    <v-card-title class="d-flex align-center justify-space-between">
      <span class="text-subtitle-1">Cartões do Usuário</span>
      <div class="d-flex ga-2">
        <v-btn
          color="secondary"
          :disabled="bioStore.bios.length === 0"
          prepend-icon="mdi-fingerprint"
          size="small"
          variant="tonal"
          @click="openCreateDialog(true)"
        >
          Criar via Biometria
        </v-btn>
        <v-btn
          color="primary"
          prepend-icon="mdi-credit-card-plus"
          size="small"
          @click="openCreateDialog(false)"
        >
          Novo Cartão
        </v-btn>
      </div>
    </v-card-title>

    <v-card-text v-if="bioStore.bios.length === 0 && !bioStore.loading" class="pb-0">
      <v-alert color="info" density="compact" icon="mdi-information" variant="tonal" class="mb-3">
        Nenhuma biometria cadastrada. Cadastre uma digital na aba "Biometria" para criar cartões com
        base no template.
      </v-alert>
    </v-card-text>

    <v-data-table
      density="compact"
      :headers="[
        { title: 'ID', key: 'id', width: '80px' },
        { title: 'Número', key: 'number' },
        { title: 'Valor', key: 'value' },
        { title: 'Dispositivos', key: 'devices' },
        { title: 'Ações', key: 'actions', align: 'end', sortable: false },
      ]"
      :items="cards"
      :loading="loading"
      no-data-text="Nenhum cartão cadastrado"
    >
      <template #item.devices="{ item }">
        <v-chip
          v-for="dev in item.devices || []"
          :key="dev.id"
          class="ma-1"
          size="x-small"
          variant="tonal"
        >
          {{ dev.name }}
        </v-chip>
        <span v-if="!item.devices?.length" class="text-medium-emphasis">—</span>
      </template>

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

  <!-- Dialog criar cartão -->
  <v-dialog v-model="createDialog" max-width="550">
    <v-card>
      <v-card-title class="d-flex align-center ga-2">
        <v-icon :icon="fromBio ? 'mdi-fingerprint' : 'mdi-credit-card-plus'" />
        {{ fromBio ? "Criar Cartão via Biometria" : "Novo Cartão" }}
      </v-card-title>

      <v-card-text>
        <v-alert
          v-if="fromBio"
          class="mb-4"
          color="info"
          density="compact"
          icon="mdi-fingerprint"
          variant="tonal"
        >
          O cartão será associado à biometria cadastrada deste usuário ({{
            bioStore.bios.length
          }}
          template(s) encontrado(s)).
        </v-alert>

        <v-text-field
          v-model="cardNumber"
          class="mb-3"
          label="Número do Cartão"
          prepend-inner-icon="mdi-credit-card"
          required
          variant="outlined"
        />

        <v-text-field
          v-model.number="cardValue"
          class="mb-3"
          label="Valor do Cartão"
          prepend-inner-icon="mdi-numeric"
          required
          type="number"
          variant="outlined"
        />

        <v-select
          v-if="fromBio"
          v-model="selectedDeviceIds"
          chips
          clearable
          closable-chips
          item-title="name"
          item-value="id"
          :items="deviceStore.devices"
          label="Dispositivos (opcional)"
          :loading="deviceStore.loading"
          multiple
          prepend-inner-icon="mdi-router-wireless"
          variant="outlined"
        />
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" @click="createDialog = false">Cancelar</v-btn>
        <v-btn
          color="primary"
          :disabled="!cardNumber || cardValue == null"
          :loading="saving"
          @click="saveCard"
        >
          Salvar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
