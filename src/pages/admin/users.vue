<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <div class="d-flex align-center justify-space-between mb-6">
          <h1 class="text-h4">Gerenciamento de Usuários</h1>
          <v-btn
            color="primary"
            prepend-icon="mdi-plus"
            @click="openDialog()"
          >
            Novo Usuário
          </v-btn>
        </div>
      </v-col>
    </v-row>

    <!-- Filtros -->
    <v-row>
      <v-col cols="12" md="4">
        <v-text-field
          v-model="search"
          clearable
          density="compact"
          label="Buscar usuários"
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
        />
      </v-col>
      <v-col cols="12" md="3">
        <v-select
          v-model="userTypeFilter"
          clearable
          density="compact"
          :items="userTypes"
          label="Tipo de Usuário"
          variant="outlined"
        />
      </v-col>
      <v-col cols="12" md="3">
        <v-select
          v-model="statusFilter"
          clearable
          density="compact"
          :items="statusOptions"
          label="Status"
          variant="outlined"
        />
      </v-col>
      <v-col cols="12" md="2">
        <v-btn
          color="secondary"
          :loading="loading"
          variant="outlined"
          @click="loadUsers"
        >
          Filtrar
        </v-btn>
      </v-col>
    </v-row>

    <!-- Tabela de Usuários -->
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-data-table
            class="elevation-0"
            :headers="headers"
            :items="users"
            :items-per-page="10"
            :items-per-page-options="[10, 25, 50, 100]"
            :loading="loading"
            :search="search"
          >
            <template #item.actions="{ item }">
              <v-btn
                class="mr-2"
                color="info"
                icon="mdi-eye"
                size="small"
                variant="text"
                @click="viewUser(item)"
              />
              <v-btn
                class="mr-2"
                color="warning"
                icon="mdi-pencil"
                size="small"
                variant="text"
                @click="editUser(item)"
              />
              <v-btn
                color="error"
                icon="mdi-delete"
                size="small"
                variant="text"
                @click="deleteUser(item)"
              />
            </template>

            <template #item.user_type_id="{ item }">
              <v-chip
                :color="getUserTypeColor(item.user_type_id)"
                size="small"
              >
                {{ getUserTypeLabel(item.user_type_id) }}
              </v-chip>
            </template>

            <template #item.devices="{ item }">
              <v-chip
                v-for="device in item.devices?.slice(0, 2)"
                :key="device.id"
                class="mr-1"
                size="small"
                variant="outlined"
              >
                {{ device.name }}
              </v-chip>
              <v-chip
                v-if="item.devices?.length > 2"
                color="grey"
                size="small"
                variant="outlined"
              >
                +{{ item.devices.length - 2 }}
              </v-chip>
            </template>
          </v-data-table>
        </v-card>
      </v-col>
    </v-row>

    <!-- Dialog de Usuário -->
    <v-dialog
      v-model="dialog"
      max-width="600px"
      persistent
    >
      <v-card>
        <v-card-title>
          <span class="text-h5">{{ isEditing ? 'Editar' : 'Novo' }} Usuário</span>
        </v-card-title>

        <v-card-text>
          <v-form ref="form" v-model="valid">
            <v-row>
              <v-col cols="12">
                <v-text-field
                  v-model="editedUser.name"
                  density="compact"
                  label="Nome Completo"
                  :rules="[rules.required]"
                  variant="outlined"
                />
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field
                  v-model="editedUser.registration"
                  density="compact"
                  label="Matrícula"
                  :rules="[rules.required]"
                  variant="outlined"
                />
              </v-col>

              <v-col cols="12" md="6">
                <v-select
                  v-model="editedUser.user_type_id"
                  density="compact"
                  :items="userTypes"
                  label="Tipo de Usuário"
                  :rules="[rules.required]"
                  variant="outlined"
                />
              </v-col>

              <v-col cols="12">
                <v-select
                  v-model="editedUser.devices"
                  chips
                  density="compact"
                  item-title="name"
                  item-value="id"
                  :items="availableDevices"
                  label="Dispositivos de Acesso"
                  multiple
                  variant="outlined"
                />
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn
            color="grey"
            variant="text"
            @click="closeDialog"
          >
            Cancelar
          </v-btn>
          <v-btn
            color="primary"
            :disabled="!valid"
            :loading="saving"
            @click="saveUser"
          >
            {{ isEditing ? 'Atualizar' : 'Criar' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog de Confirmação de Exclusão -->
    <v-dialog v-model="deleteDialog" max-width="400px">
      <v-card>
        <v-card-title class="text-h5">
          Confirmar Exclusão
        </v-card-title>
        <v-card-text>
          Tem certeza que deseja excluir o usuário <strong>{{ userToDelete?.name }}</strong>?
          Esta ação não pode ser desfeita.
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="grey" variant="text" @click="deleteDialog = false">
            Cancelar
          </v-btn>
          <v-btn color="error" :loading="deleting" @click="confirmDelete">
            Excluir
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
  import type { Device, User } from '@/types'
  import { onMounted, ref } from 'vue'
  import { DeviceService, UsersService } from '@/services'

  // Estado reativo
  const users = ref<User[]>([])
  const availableDevices = ref<Device[]>([])
  const loading = ref(false)
  const saving = ref(false)
  const deleting = ref(false)
  const dialog = ref(false)
  const deleteDialog = ref(false)
  const valid = ref(false)
  const search = ref('')
  const userTypeFilter = ref(null)
  const statusFilter = ref(null)

  const isEditing = ref(false)
  const editedUser = ref<Partial<User>>({})
  const userToDelete = ref<User | null>(null)

  // Headers da tabela
  const headers = [
    { title: 'Nome', key: 'name', sortable: true },
    { title: 'Matrícula', key: 'registration', sortable: true },
    { title: 'Tipo', key: 'user_type_id', sortable: true },
    { title: 'Dispositivos', key: 'devices', sortable: false },
    { title: 'Ações', key: 'actions', sortable: false, width: '150px' },
  ]

  // Opções de filtro
  const userTypes = [
    { title: 'Aluno', value: 1 },
    { title: 'Professor', value: 2 },
    { title: 'Funcionário', value: 3 },
    { title: 'Administrador', value: 4 },
  ]

  const statusOptions = [
    { title: 'Ativo', value: 'active' },
    { title: 'Inativo', value: 'inactive' },
  ]

  // Regras de validação
  const rules = {
    required: (v: any) => !!v || 'Campo obrigatório',
  }

  // Computed - filtros aplicados automaticamente via v-data-table

  // Métodos
  const loadUsers = async () => {
    loading.value = true
    try {
      const response = await UsersService.getUsers()
      users.value = response.results
    } catch (error) {
      console.error('Erro ao carregar usuários:', error)
    } finally {
      loading.value = false
    }
  }

  const loadDevices = async () => {
    try {
      const response = await DeviceService.getDevices()
      availableDevices.value = response.results
    } catch (error) {
      console.error('Erro ao carregar dispositivos:', error)
    }
  }

  const openDialog = (user?: User) => {
    isEditing.value = !!user
    editedUser.value = user
      ? {
        id: user.id,
        name: user.name,
        registration: user.registration,
        user_type_id: user.user_type_id,
        devices: Array.isArray(user.devices) ? user.devices.map(d => d.id) : [],
        is_active: user.is_active,
      }
      : {
        name: '',
        registration: '',
        user_type_id: 1,
        devices: [],
        is_active: true,
      }
    dialog.value = true
  }

  const closeDialog = () => {
    dialog.value = false
    editedUser.value = {}
    isEditing.value = false
  }

  const saveUser = async () => {
    if (!valid.value) return

    saving.value = true
    try {
      await (isEditing.value && editedUser.value.id ? UsersService.updateUser(editedUser.value.id, editedUser.value) : UsersService.createUser(editedUser.value))

      closeDialog()
      loadUsers()
    } catch (error) {
      console.error('Erro ao salvar usuário:', error)
    } finally {
      saving.value = false
    }
  }

  const viewUser = (user: User) => {
    // TODO: Implementar visualização detalhada
    console.log('Visualizar usuário:', user)
  }

  const editUser = (user: User) => {
    openDialog(user)
  }

  const deleteUser = (user: User) => {
    userToDelete.value = user
    deleteDialog.value = true
  }

  const confirmDelete = async () => {
    if (!userToDelete.value) return

    deleting.value = true
    try {
      await UsersService.deleteUser(userToDelete.value.id)
      deleteDialog.value = false
      userToDelete.value = null
      loadUsers()
    } catch (error) {
      console.error('Erro ao excluir usuário:', error)
    } finally {
      deleting.value = false
    }
  }

  const getUserTypeColor = (userTypeId: number) => {
    const colors: Record<number, string> = {
      1: 'primary', // Aluno
      2: 'success', // Professor
      3: 'warning', // Funcionário
      4: 'error', // Administrador
    }
    return colors[userTypeId] || 'grey'
  }

  const getUserTypeLabel = (userTypeId: number) => {
    const userType = userTypes.find(type => type.value === userTypeId)
    return userType?.title || 'Desconhecido'
  }

  // Lifecycle
  onMounted(() => {
    loadUsers()
    loadDevices()
  })
</script>
