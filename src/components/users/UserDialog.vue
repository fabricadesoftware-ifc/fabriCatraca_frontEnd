<script lang="ts" setup>
  import { ref } from 'vue'

  interface User {
    id: number
    name: string
    user_groups?: string[]
    registration?: string
  }

  const props = defineProps<{
    modelValue: boolean
    user: User | null
  }>()

  const emit = defineEmits<{
    (e: 'update:modelValue', value: boolean): void
    (e: 'save', value: User): void
  }>()

  const tab = ref('dados')
  const isAdmin = ref(false)
  const name = ref('')
  const registration = ref('')

  // Atualiza os campos locais quando o props.user mudar
  watch(
    () => props.user,
    newUser => {
      if (newUser) {
        name.value = newUser.name
        registration.value = newUser.registration || ''
      }
    },
    { immediate: true },
  )

  function closeDialog () {
    emit('update:modelValue', false)
  }

  function salvarUsuario () {
    if (props.user) {
      emit('save', {
        ...props.user,
        name: name.value,
        registration: registration.value,
      })
      closeDialog()
    }
  }
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
                  <v-text-field label="Senha" type="password" />
                  <v-text-field label="Senha de Pânico" type="password" />

                  <v-row>
                    <v-col>
                      <v-text-field label="Horário Início" type="time" />
                    </v-col>
                    <v-col>
                      <v-text-field label="Horário Fim" type="time" />
                    </v-col>
                  </v-row>

                  <v-row>
                    <v-col>
                      <v-text-field label="Data Início" type="date" />
                    </v-col>
                    <v-col>
                      <v-text-field label="Data Fim" type="date" />
                    </v-col>
                  </v-row>

                  <v-text-field label="CPF" />
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
          <v-window-item value="departamentos"><p>Form de Departamentos...</p></v-window-item>
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
