<template>
  <v-container fluid>
    <!-- Header -->
    <v-row>
      <v-col cols="12">
        <div class="d-flex align-center justify-space-between mb-4">
          <div>
            <h1 class="text-h4 font-weight-bold mb-2">
              Gerenciamento de Grupos
            </h1>
            <p class="text-body-1 text-medium-emphasis">
              Organize usuários em grupos para facilitar o gerenciamento de permissões
            </p>
          </div>
          <v-btn
            color="primary"
            prepend-icon="mdi-plus"
            @click="openDialog()"
          >
            Novo Grupo
          </v-btn>
        </div>
      </v-col>
    </v-row>

    <!-- Search and Filters -->
    <v-row>
      <v-col cols="12" md="6">
        <v-text-field
          v-model="search"
          clearable
          density="compact"
          hide-details
          label="Buscar grupos..."
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
        />
      </v-col>
      <v-col cols="12" md="3">
        <v-select
          v-model="statusFilter"
          clearable
          density="compact"
          hide-details
          :items="statusOptions"
          label="Status"
          variant="outlined"
        />
      </v-col>
      <v-col cols="12" md="3">
        <v-btn
          prepend-icon="mdi-filter-variant"
          variant="outlined"
          @click="applyFilters"
        >
          Aplicar Filtros
        </v-btn>
      </v-col>
    </v-row>

    <!-- Groups Table -->
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-data-table
            class="elevation-1"
            :headers="headers"
            :items="groups"
            :items-per-page="10"
            :items-per-page-options="[5, 10, 25, 50]"
            :loading="loading"
            :search="search"
          >
            <template #item.name="{ item }">
              <div class="d-flex align-center">
                <v-avatar
                  class="mr-3"
                  color="primary"
                  size="32"
                >
                  <span class="text-caption font-weight-bold">
                    {{ item.name.charAt(0).toUpperCase() }}
                  </span>
                </v-avatar>
                <div>
                  <div class="font-weight-medium">{{ item.name }}</div>
                  <div class="text-caption text-medium-emphasis">
                    ID: {{ item.id }}
                  </div>
                </div>
              </div>
            </template>

            <template #item.description="{ item }">
              <span class="text-body-2">
                {{ item.description || 'Sem descrição' }}
              </span>
            </template>

            <template #item.member_count="{ item }">
              <v-chip
                :color="item.member_count > 0 ? 'primary' : 'grey'"
                size="small"
                variant="tonal"
              >
                {{ item.member_count || 0 }} membros
              </v-chip>
            </template>

            <template #item.is_active="{ item }">
              <v-switch
                v-model="item.is_active"
                density="compact"
                hide-details
                :loading="item.updating"
                @change="toggleGroupStatus(item)"
              />
            </template>

            <template #item.actions="{ item }">
              <v-menu>
                <template #activator="{ props }">
                  <v-btn
                    icon="mdi-dots-vertical"
                    size="small"
                    variant="text"
                    v-bind="props"
                  />
                </template>
                <v-list>
                  <v-list-item @click="openDialog(item)">
                    <v-list-item-title>
                      <v-icon class="mr-2">mdi-pencil</v-icon>
                      Editar
                    </v-list-item-title>
                  </v-list-item>
                  <v-list-item @click="viewMembers(item)">
                    <v-list-item-title>
                      <v-icon class="mr-2">mdi-account-group</v-icon>
                      Ver Membros
                    </v-list-item-title>
                  </v-list-item>
                  <v-list-item @click="deleteGroup(item)">
                    <v-list-item-title class="text-error">
                      <v-icon class="mr-2">mdi-delete</v-icon>
                      Excluir
                    </v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-menu>
            </template>
          </v-data-table>
        </v-card>
      </v-col>
    </v-row>

    <!-- Group Dialog -->
    <v-dialog
      v-model="dialog"
      max-width="600px"
      persistent
    >
      <v-card>
        <v-card-title class="text-h5">
          {{ editingGroup ? 'Editar Grupo' : 'Novo Grupo' }}
        </v-card-title>

        <v-card-text>
          <v-form ref="form" v-model="formValid">
            <v-row>
              <v-col cols="12">
                <v-text-field
                  v-model="form.name"
                  label="Nome do Grupo"
                  required
                  :rules="[rules.required]"
                  variant="outlined"
                />
              </v-col>
              <v-col cols="12">
                <v-textarea
                  v-model="form.description"
                  auto-grow
                  label="Descrição"
                  rows="3"
                  variant="outlined"
                />
              </v-col>
              <v-col cols="12">
                <v-switch
                  v-model="form.is_active"
                  color="primary"
                  label="Grupo Ativo"
                />
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn
            variant="text"
            @click="closeDialog"
          >
            Cancelar
          </v-btn>
          <v-btn
            color="primary"
            :disabled="!formValid"
            :loading="saving"
            @click="saveGroup"
          >
            {{ editingGroup ? 'Atualizar' : 'Criar' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Members Dialog -->
    <v-dialog
      v-model="membersDialog"
      max-width="800px"
    >
      <v-card>
        <v-card-title class="text-h5">
          Membros do Grupo: {{ selectedGroup?.name }}
        </v-card-title>

        <v-card-text>
          <v-row>
            <v-col cols="12">
              <v-text-field
                v-model="memberSearch"
                clearable
                density="compact"
                label="Buscar usuários..."
                prepend-inner-icon="mdi-magnify"
                variant="outlined"
              />
            </v-col>
          </v-row>

          <v-data-table
            class="elevation-1"
            :headers="memberHeaders"
            :items="availableUsers"
            :items-per-page="10"
            :loading="loadingUsers"
            :search="memberSearch"
          >
            <template #item.name="{ item }">
              <div class="d-flex align-center">
                <v-avatar
                  class="mr-3"
                  color="secondary"
                  size="32"
                >
                  <span class="text-caption font-weight-bold">
                    {{ item.name.charAt(0).toUpperCase() }}
                  </span>
                </v-avatar>
                <div>
                  <div class="font-weight-medium">{{ item.name }}</div>
                  <div class="text-caption text-medium-emphasis">
                    {{ item.email }}
                  </div>
                </div>
              </div>
            </template>

            <template #item.user_type="{ item }">
              <v-chip
                :color="getUserTypeColor(item.user_type)"
                size="small"
                variant="tonal"
              >
                {{ getUserTypeLabel(item.user_type) }}
              </v-chip>
            </template>

            <template #item.actions="{ item }">
              <v-btn
                :color="isUserInGroup(item) ? 'error' : 'primary'"
                size="small"
                :variant="isUserInGroup(item) ? 'outlined' : 'elevated'"
                @click="toggleGroupMember(item)"
              >
                {{ isUserInGroup(item) ? 'Remover' : 'Adicionar' }}
              </v-btn>
            </template>
          </v-data-table>
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn
            variant="text"
            @click="membersDialog = false"
          >
            Fechar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Snackbar -->
    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      :timeout="3000"
    >
      {{ snackbar.message }}
      <template #actions>
        <v-btn
          variant="text"
          @click="snackbar.show = false"
        >
          Fechar
        </v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script setup lang="ts">
  import type { Group, User } from '@/types'
  import { onMounted, reactive, ref } from 'vue'
  import groupsService from '@/services/groups'
  import userGroupsService from '@/services/user_groups'
  import usersService from '@/services/users'

  // Estado reativo
  const loading = ref(false)
  const saving = ref(false)
  const loadingUsers = ref(false)
  const dialog = ref(false)
  const membersDialog = ref(false)
  const search = ref('')
  const statusFilter = ref('')
  const memberSearch = ref('')
  const formValid = ref(false)
  const form = ref<any>({
    name: '',
    description: '',
    is_active: true,
  })

  const groups = ref<Group[]>([])
  const availableUsers = ref<User[]>([])
  const selectedGroup = ref<Group | null>(null)
  const editingGroup = ref<Group | null>(null)

  // Headers da tabela
  const headers = [
    { title: 'Nome', key: 'name', sortable: true },
    { title: 'Descrição', key: 'description', sortable: false },
    { title: 'Membros', key: 'member_count', sortable: true, align: 'center' },
    { title: 'Ativo', key: 'is_active', sortable: true, align: 'center' },
    { title: 'Ações', key: 'actions', sortable: false, align: 'center' },
  ]

  const memberHeaders = [
    { title: 'Usuário', key: 'name', sortable: true },
    { title: 'Tipo', key: 'user_type', sortable: true },
    { title: 'Status', key: 'is_active', sortable: true },
    { title: 'Ações', key: 'actions', sortable: false, align: 'center' },
  ]

  // Opções de filtro
  const statusOptions = [
    { title: 'Ativos', value: 'active' },
    { title: 'Inativos', value: 'inactive' },
  ]

  // Regras de validação
  const rules = {
    required: (v: string) => !!v || 'Campo obrigatório',
  }

  // Snackbar
  const snackbar = reactive({
    show: false,
    message: '',
    color: 'success',
  })

  // Computed - filtros aplicados automaticamente via v-data-table

  // Métodos
  const loadGroups = async () => {
    loading.value = true
    try {
      const response = await groupsService.getGroups()
      groups.value = response.results
    } catch (error) {
      console.error('Erro ao carregar grupos:', error)
      showSnackbar('Erro ao carregar grupos', 'error')
    } finally {
      loading.value = false
    }
  }

  const loadUsers = async () => {
    loadingUsers.value = true
    try {
      const response = await usersService.getUsers()
      availableUsers.value = response.results
    } catch (error) {
      console.error('Erro ao carregar usuários:', error)
      showSnackbar('Erro ao carregar usuários', 'error')
    } finally {
      loadingUsers.value = false
    }
  }

  const openDialog = (group?: Group) => {
    editingGroup.value = group || null
    form.value = group
      ? {
        name: group.name,
        description: group.description,
        is_active: group.is_active,
      }
      : {
        name: '',
        description: '',
        is_active: true,
      }
    dialog.value = true
  }

  const closeDialog = () => {
    dialog.value = false
    editingGroup.value = null
    form.value = {
      name: '',
      description: '',
      is_active: true,
    }
  }

  const saveGroup = async () => {
    if (!formValid.value) return

    saving.value = true
    try {
      if (editingGroup.value) {
        await groupsService.updateGroup(editingGroup.value.id, form.value)
        showSnackbar('Grupo atualizado com sucesso')
      } else {
        await groupsService.createGroup(form.value)
        showSnackbar('Grupo criado com sucesso')
      }
      closeDialog()
      loadGroups()
    } catch (error) {
      console.error('Erro ao salvar grupo:', error)
      showSnackbar('Erro ao salvar grupo', 'error')
    } finally {
      saving.value = false
    }
  }

  const deleteGroup = async (group: Group) => {
    if (!confirm(`Tem certeza que deseja excluir o grupo "${group.name}"?`)) return

    try {
      await groupsService.deleteGroup(group.id)
      showSnackbar('Grupo excluído com sucesso')
      loadGroups()
    } catch (error) {
      console.error('Erro ao excluir grupo:', error)
      showSnackbar('Erro ao excluir grupo', 'error')
    }
  }

  const toggleGroupStatus = async (group: Group) => {
    group.updating = true
    try {
      await groupsService.updateGroup(group.id, { is_active: group.is_active })
      showSnackbar('Status do grupo atualizado')
    } catch (error) {
      console.error('Erro ao atualizar status:', error)
      group.is_active = !group.is_active // Reverter mudança
      showSnackbar('Erro ao atualizar status', 'error')
    } finally {
      group.updating = false
    }
  }

  const viewMembers = async (group: Group) => {
    selectedGroup.value = group
    membersDialog.value = true
    await loadUsers()
  }

  const isUserInGroup = (_user: User) => {
    // TODO: Implementar verificação se usuário está no grupo
    return false
  }

  const toggleGroupMember = async (user: User) => {
    if (!selectedGroup.value) return

    try {
      if (isUserInGroup(user)) {
        // Remover do grupo
        await userGroupsService.deleteUserGroup(user.id, selectedGroup.value.id)
        showSnackbar('Usuário removido do grupo')
      } else {
        // Adicionar ao grupo
        await userGroupsService.createUserGroup({
          user: user.id,
          group: selectedGroup.value.id,
        })
        showSnackbar('Usuário adicionado ao grupo')
      }
      // Recarregar dados
      loadGroups()
    } catch (error) {
      console.error('Erro ao gerenciar membro do grupo:', error)
      showSnackbar('Erro ao gerenciar membro do grupo', 'error')
    }
  }

  const applyFilters = () => {
  // Os filtros são aplicados automaticamente via computed
  }

  const getUserTypeColor = (userType: number) => {
    const colors: Record<number, string> = {
      1: 'primary',
      2: 'secondary',
      3: 'success',
    }
    return colors[userType] || 'grey'
  }

  const getUserTypeLabel = (userType: number) => {
    const labels: Record<number, string> = {
      1: 'Aluno',
      2: 'Professor',
      3: 'Funcionário',
    }
    return labels[userType] || 'Desconhecido'
  }

  const showSnackbar = (message: string, color = 'success') => {
    snackbar.message = message
    snackbar.color = color
    snackbar.show = true
  }

  // Lifecycle
  onMounted(() => {
    loadGroups()
  })
</script>
