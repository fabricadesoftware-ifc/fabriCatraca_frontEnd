<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <div class="d-flex align-center justify-space-between mb-6">
          <h1 class="text-h4">Gerenciamento de Grupos</h1>
        </div>
      </v-col>
    </v-row>

    <GroupList
      :groups="groups"
      :loading="loading"
      @add="openGroupDialog()"
      @delete="deleteGroup"
      @edit="editGroup"
      @manage-members="openMemberList"
      @toggle-status="toggleGroupStatus"
    />

    <GroupForm
      v-model="groupDialog"
      :group="editingGroup"
      :saving="saving"
      @save="saveGroup"
    />

    <GroupMemberList
      v-model="memberListDialog"
      :group="selectedGroup || undefined"
      :loading="loadingMembers"
      :users="users"
      @toggle-member="toggleGroupMember"
    />

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
  import GroupForm from '@/components/groups/GroupForm.vue'
  import GroupList from '@/components/groups/GroupList.vue'
  import GroupMemberList from '@/components/groups/GroupMemberList.vue'
  import { useGroup } from '@/composables/useGroup'
  import { useUser } from '@/composables/useUser'

  // Componentes

  // Composables
  const {
    groups,
    selectedGroup,
    loading,
    saving,
    loadingMembers,
    loadGroups,
    createGroup,
    updateGroup,
    deleteGroup: removeGroup,
    addUserToGroup,
    removeUserFromGroup,
  } = useGroup()

  const {
    users,
    loading: loadingUsers,
    loadUsers,
  } = useUser()

  // Estado local
  const groupDialog = ref(false)
  const memberListDialog = ref(false)
  const editingGroup = ref<Group | undefined>()

  // Snackbar
  const snackbar = reactive({
    show: false,
    message: '',
    color: 'success',
  })

  // Métodos
  const openGroupDialog = (group?: Group) => {
    editingGroup.value = group
    groupDialog.value = true
  }

  const editGroup = (group: Group) => {
    openGroupDialog(group)
  }

  const saveGroup = async (data: Partial<Group>) => {
    try {
      if (editingGroup.value) {
        await updateGroup(editingGroup.value.id, data)
        showSnackbar('Grupo atualizado com sucesso')
      } else {
        await createGroup(data)
        showSnackbar('Grupo criado com sucesso')
      }
      groupDialog.value = false
    } catch (error: unknown) {
      showSnackbar('Erro ao salvar grupo', error instanceof Error ? error.message : 'Erro desconhecido')
    }
  }

  const deleteGroup = async (group: Group) => {
    if (!confirm(`Tem certeza que deseja excluir o grupo "${group.name}"?`)) return

    try {
      await removeGroup(group.id)
      showSnackbar('Grupo excluído com sucesso')
    } catch (error: unknown) {
      showSnackbar('Erro ao excluir grupo', error instanceof Error ? error.message : 'Erro desconhecido')
    }
  }

  const toggleGroupStatus = async (group: Group) => {
    group.updating = true
    try {
      await updateGroup(group.id, { is_active: group.is_active })
      showSnackbar('Status atualizado com sucesso')
    } catch (error: unknown) {
      group.is_active = !group.is_active // Reverter mudança
      showSnackbar('Erro ao atualizar status', error instanceof Error ? error.message : 'Erro desconhecido')
    } finally {
      group.updating = false
    }
  }

  const openMemberList = (group: Group) => {
    selectedGroup.value = group
    memberListDialog.value = true
  }

  const toggleGroupMember = async (user: User) => {
    if (!selectedGroup.value) return

    try {
      if (selectedGroup.value.users?.some(u => u.id === user.id)) {
        await removeUserFromGroup(user.id, selectedGroup.value.id)
        showSnackbar('Usuário removido do grupo')
      } else {
        await addUserToGroup(user.id, selectedGroup.value.id)
        showSnackbar('Usuário adicionado ao grupo')
      }
    } catch (error: unknown) {
      showSnackbar('Erro ao gerenciar membro do grupo', error instanceof Error ? error.message : 'Erro desconhecido')
    }
  }

  // Helpers
  const showSnackbar = (message: string, color = 'success') => {
    snackbar.message = message
    snackbar.color = color
    snackbar.show = true
  }

  // Lifecycle
  onMounted(() => {
    loadGroups()
    loadUsers()
  })
</script>
