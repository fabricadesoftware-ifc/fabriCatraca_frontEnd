<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <div class="d-flex align-center justify-space-between mb-4">
          <div>
            <h1 class="text-h4 font-weight-bold mb-2">
              Regras de Acesso
            </h1>
            <p class="text-body-1 text-medium-emphasis">
              Configure políticas de acesso para usuários, grupos e dispositivos
            </p>
          </div>
        </div>
      </v-col>
    </v-row>

    <AccessRuleList
      :access-rules="accessRules"
      :loading="loading"
      @add="openDialog()"
      @delete="deleteRule"
      @duplicate="duplicateRule"
      @edit="editRule"
      @toggle-status="toggleRuleStatus"
      @view="viewDetails"
    />

    <AccessRuleForm
      v-model="dialog"
      :areas="areas"
      :rule="editingRule"
      :saving="saving"
      :time-zones="timeZones"
      @save="saveRule"
    />

    <v-dialog
      v-model="detailsDialog"
      max-width="600px"
    >
      <v-card>
        <v-card-title class="text-h5">
          Detalhes da Regra: {{ selectedRule?.name }}
        </v-card-title>

        <v-card-text>
          <v-list>
            <v-list-item>
              <v-list-item-title>Nome</v-list-item-title>
              <v-list-item-subtitle>{{ selectedRule?.name }}</v-list-item-subtitle>
            </v-list-item>
            <v-list-item>
              <v-list-item-title>Tipo</v-list-item-title>
              <v-list-item-subtitle>{{ getRuleTypeLabel(selectedRule?.type || '') }}</v-list-item-subtitle>
            </v-list-item>
            <v-list-item>
              <v-list-item-title>Prioridade</v-list-item-title>
              <v-list-item-subtitle>{{ selectedRule?.priority }}</v-list-item-subtitle>
            </v-list-item>
            <v-list-item>
              <v-list-item-title>Status</v-list-item-title>
              <v-list-item-subtitle>
                <v-chip
                  :color="selectedRule?.is_active ? 'success' : 'error'"
                  size="small"
                >
                  {{ selectedRule?.is_active ? 'Ativa' : 'Inativa' }}
                </v-chip>
              </v-list-item-subtitle>
            </v-list-item>
            <v-list-item v-if="selectedRule?.description">
              <v-list-item-title>Descrição</v-list-item-title>
              <v-list-item-subtitle>{{ selectedRule.description }}</v-list-item-subtitle>
            </v-list-item>
          </v-list>
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn
            variant="text"
            @click="detailsDialog = false"
          >
            Fechar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

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
  import type { AccessRule } from '@/types'
  import { onMounted, reactive, ref } from 'vue'
  import AccessRuleForm from '@/components/access-rules/AccessRuleForm.vue'
  import AccessRuleList from '@/components/access-rules/AccessRuleList.vue'
  import { useAccessRule } from '@/composables/useAccessRule'
  import { useArea } from '@/composables/useArea'
  import { useTimeZone } from '@/composables/useTimeZone'

  // Componentes

  // Composables
  const {
    accessRules,
    selectedRule,
    loading,
    saving,
    loadAccessRules,
    createAccessRule,
    updateAccessRule,
    deleteAccessRule: removeRule,
    getRuleTypeLabel,
  } = useAccessRule()

  const {
    timeZones,
    loading: loadingTimeZones,
    loadTimeZones,
  } = useTimeZone()

  const {
    areas,
    loading: loadingAreas,
    loadAreas,
  } = useArea()

  // Estado local
  const dialog = ref(false)
  const detailsDialog = ref(false)
  const editingRule = ref<AccessRule | undefined>()

  // Snackbar
  const snackbar = reactive({
    show: false,
    message: '',
    color: 'success',
  })

  // Métodos
  const openDialog = (rule?: AccessRule) => {
    editingRule.value = rule
    dialog.value = true
  }

  const editRule = (rule: AccessRule) => {
    openDialog(rule)
  }

  const saveRule = async (data: Partial<AccessRule>) => {
    try {
      if (editingRule.value) {
        await updateAccessRule(editingRule.value.id, data)
        showSnackbar('Regra atualizada com sucesso')
      } else {
        await createAccessRule(data)
        showSnackbar('Regra criada com sucesso')
      }
      dialog.value = false
    } catch (error: unknown) {
      showSnackbar('Erro ao salvar regra', error instanceof Error ? error.message : 'Erro desconhecido')
    }
  }

  const deleteRule = async (rule: AccessRule) => {
    if (!confirm(`Tem certeza que deseja excluir a regra "${rule.name}"?`)) return

    try {
      await removeRule(rule.id)
      showSnackbar('Regra excluída com sucesso')
    } catch (error: unknown) {
      showSnackbar('Erro ao excluir regra', error instanceof Error ? error.message : 'Erro desconhecido')
    }
  }

  const toggleRuleStatus = async (rule: AccessRule) => {
    rule.updating = true
    try {
      await updateAccessRule(rule.id, { is_active: rule.is_active })
      showSnackbar('Status atualizado com sucesso')
    } catch (error: unknown) {
      rule.is_active = !rule.is_active // Reverter mudança
      showSnackbar('Erro ao atualizar status', error instanceof Error ? error.message : 'Erro desconhecido')
    } finally {
      rule.updating = false
    }
  }

  const viewDetails = (rule: AccessRule) => {
    selectedRule.value = rule
    detailsDialog.value = true
  }

  const duplicateRule = (rule: AccessRule) => {
    const duplicatedRule = {
      ...rule,
      id: undefined,
      name: `${rule.name} (Cópia)`,
      created_at: undefined,
      updated_at: undefined,
    }
    openDialog({ ...duplicatedRule, id: 0 } as AccessRule)
  }

  // Helpers
  const showSnackbar = (message: string, color = 'success') => {
    snackbar.message = message
    snackbar.color = color
    snackbar.show = true
  }

  // Lifecycle
  onMounted(() => {
    loadAccessRules()
    loadTimeZones()
    loadAreas()
  })
</script>
