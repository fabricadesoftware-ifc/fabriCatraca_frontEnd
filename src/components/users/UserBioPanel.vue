<script lang="ts" setup>
  import { onMounted, ref } from 'vue'
  import { useBioStore } from '@/stores'

  const props = defineProps<{ userId: number }>()
  const bioStore = useBioStore()
  const dialog = ref(false)
  const deletingId = ref<number | null>(null)

  async function openRegister () {
    dialog.value = true
  }

  async function removeBio (id: number) {
    try {
      deletingId.value = id
      await bioStore.deleteBio(id)
      await bioStore.loadUserBios(props.userId)
    } finally {
      deletingId.value = null
    }
  }

  onMounted(async () => {
    await bioStore.loadUserBios(props.userId)
  })
</script>

<template>
  <v-card>
    <v-card-title class="d-flex align-center justify-space-between">
      <span class="text-subtitle-1">Digitais cadastradas</span>
      <v-btn color="primary" prepend-icon="mdi-fingerprint" @click="openRegister">
        Cadastrar Digital
      </v-btn>
    </v-card-title>

    <v-data-table
      density="compact"
      :headers="[
        { title: 'ID', key: 'id' },
        { title: 'Dispositivos', key: 'devices' },
        { title: 'Dedo', key: 'finger_position' },
        { title: 'Tipo', key: 'finger_type' },
        { title: 'Ações', key: 'actions', align: 'end' },
      ]"
      :items="bioStore.bios"
      :loading="bioStore.loading"
    >
      <template #item.devices="{ item }">
        <span>{{ (item.devices || []).map((d: any) => d.name).join(', ') }}</span>
      </template>

      <template #item.actions="{ item }">
        <v-btn
          color="error"
          :loading="deletingId === item.id"
          size="small"
          variant="text"
          @click="removeBio(item.id)"
        >
          Remover
        </v-btn>
      </template>
    </v-data-table>
  </v-card>

  <RegisterBioDialog
    v-model="dialog"
    :user-id="props.userId"
    @saved="async () => { await bioStore.loadUserBios(props.userId) }"
  />
</template>
