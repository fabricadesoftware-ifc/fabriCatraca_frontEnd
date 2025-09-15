<script lang="ts" setup>
  import type { User as BaseUser } from '@/types'
  import { onMounted, ref, toValue, watch } from 'vue'
  import { useGroupStore } from '@/stores'

  interface User extends Omit<BaseUser, 'user_groups'> {
    user_groups?: (number | { id: number, name: string })[]
  }

  const props = defineProps<{
    modelValue: boolean
    user: User | null
  }>()

  const userGroups = ref<number[]>([])
  const setUserGroups = (newGroups: number[]) => {
    userGroups.value = newGroups
  }

  const emit = defineEmits<{
    (e: 'update:modelValue', value: boolean): void
    (e: 'save', value: User): void
  }>()

  const groupStore = useGroupStore()
  const tab = ref('dados')
  const isAdmin = ref(false)
  const name = ref('')
  const registration = ref('')
  const loading = ref(false)

  // Atualiza os campos locais quando o props.user mudar
  watch(
    () => props.user,
    newUser => {
      if (newUser) {
        name.value = newUser.name
        registration.value = newUser.registration || ''
        userGroups.value = newUser.user_groups?.map(g => typeof g === 'number' ? g : g.id) || []
      }
    },
    { immediate: true },
  )

  function closeDialog () {
    emit('update:modelValue', false)
  }

  async function salvarUsuario () {
    if (props.user) {
      emit('save', {
        ...props.user,
        name: name.value,
        registration: registration.value,
        user_groups: userGroups.value,
      })
      closeDialog()
    }
  }

  onMounted(async () => {
    loading.value = true
    try {
      await groupStore.loadGroups()
    } catch (error) {
      console.error('Erro ao carregar grupos:', error)
    } finally {
      loading.value = false
    }
  })
</script>
<template>
  <v-dialog max-width="900" :model-value="props.modelValue" @update:model-value="emit('update:modelValue', $event)">
    <v-card v-if="props.user">
      <v-card-title class="text-h5">Editar Usuário</v-card-title>

      <v-card-text>
        <v-tabs v-model="tab" bg-color="transparent" color="primary">
          <v-tab value="dados">Dados Gerais</v-tab>
          <v-tab value="departamentos">Grupos</v-tab>
          <v-tab value="cartoes">Cartões</v-tab>
          <v-tab value="horarios">Horários</v-tab>
          <v-tab value="pin">PIN</v-tab>
          <v-tab value="biometria">Biometria</v-tab>
        </v-tabs>

        <v-window v-model="tab">
          <!-- Aba Dados Gerais -->
          <v-window-item value="dados">
            <v-container>
              <v-row>
                <!-- Coluna esquerda -->
                <v-col cols="8">
                  <v-text-field
                    v-model="name"
                    label="Nome"
                    required
                    :rules="[v => !!v || 'Nome é obrigatório']"
                  />
                  <v-text-field
                    v-model="registration"
                    label="Matrícula"
                  />

                  <v-switch v-model="isAdmin" label="Administrador" />
                </v-col>

                <!-- Coluna direita -->
                <v-col class="d-flex flex-column align-center" cols="4">
                  <v-avatar class="mb-4" size="150">
                    <v-img src="https://cdn.vuetifyjs.com/images/profiles/avatar.jpg" />
                  </v-avatar>
                  <v-btn class="mb-2" color="primary">Arquivo</v-btn>
                  <v-btn class="mb-2" color="primary">Câmera</v-btn>
                  <v-btn class="mb-2" color="error">Remover</v-btn>
                </v-col>
              </v-row>
            </v-container>
          </v-window-item>

          <!-- Outras abas -->
          <v-window-item value="departamentos">
            <v-container>
              <v-row>
                <v-col cols="12">
                  <v-card>
                    <v-card-text class="pa-4">
                      <v-progress-linear
                        v-if="loading"
                        color="primary"
                        indeterminate
                      />

                      <template v-else>
                        <div class="text-subtitle-1 mb-4">
                          Selecione os grupos aos quais o usuário pertence:
                        </div>

                        <v-list lines="two">
                          <v-list-item
                            v-for="group in groupStore.groups"
                            :key="group.id"
                            :title="group.name"
                          >
                            <template #append>
                              <v-switch
                                color="primary"
                                hide-details
                                :model-value="userGroups.includes(group.id)"
                                @update:model-value="(value) => {
                                  const groups = toValue(userGroups)
                                  const newGroups = value
                                    ? [...groups, group.id]
                                    : groups.filter((gid: number) => gid !== group.id)
                                  setUserGroups(newGroups)
                                }"
                              />
                            </template>
                          </v-list-item>
                        </v-list>

                        <div v-if="groupStore.groups.length === 0" class="text-center pa-4">
                          <v-icon class="mb-2" color="grey" icon="mdi-account-group" size="48" />
                          <div class="text-body-1 text-grey">Nenhum grupo disponível</div>
                        </div>
                      </template>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>
            </v-container>
          </v-window-item>
          <v-window-item value="cartoes"><p>Gerenciar cartões...</p></v-window-item>
          <v-window-item value="horarios"><p>Configurar horários...</p></v-window-item>
          <v-window-item value="pin"><p>Definir PIN...</p></v-window-item>
          <v-window-item value="biometria"><p>Gerenciar biometria...</p></v-window-item>
        </v-window>
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn color="error" variant="text" @click="closeDialog">Cancelar</v-btn>
        <v-btn color="primary" variant="flat" @click="salvarUsuario">Salvar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
