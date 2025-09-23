<script lang="ts" setup>
  import type { AccessRule, Group as BaseGroup } from '@/types'
  import { onMounted, ref, watch } from 'vue'
  import { useAccessRuleStore } from '@/stores'

  interface Group extends Omit<BaseGroup, 'access_rules'> {
    access_rules?: (number | AccessRule)[]
  }

  const props = defineProps<{
    modelValue: boolean
    group: Group | null
  }>()

  const accessRuleStore = useAccessRuleStore()
  const tab = ref('dados')
  const name = ref('')
  const loading = ref(false)
  const groupAccessRules = ref<number[]>([])

  const toggleAccessRule = (ruleId: number, value: boolean) => {
    const currentRules = [...groupAccessRules.value]
    if (value) {
      if (!currentRules.includes(ruleId)) {
        currentRules.push(ruleId)
      }
    } else {
      const index = currentRules.indexOf(ruleId)
      if (index !== -1) {
        currentRules.splice(index, 1)
      }
    }
    groupAccessRules.value = currentRules
  }

  const emit = defineEmits<{
    (e: 'update:modelValue', value: boolean): void
    (e: 'save', value: Group): void
  }>()

  // Atualiza os campos locais quando o props.group mudar
  watch(
    () => props.group,
    newGroup => {
      if (newGroup) {
        name.value = newGroup.name
        groupAccessRules.value = newGroup.access_rules?.map(r => typeof r === 'number' ? r : r.id) || []
      }
    },
    { immediate: true },
  )

  function closeDialog () {
    emit('update:modelValue', false)
  }

  async function salvarGrupo () {
    if (props.group) {
      emit('save', {
        ...props.group,
        name: name.value,
        access_rules: groupAccessRules.value,
      })
      closeDialog()
    }
  }

  onMounted(async () => {
    loading.value = true
    try {
      await accessRuleStore.loadAccessRules()
    } catch (error) {
      console.error('Erro ao carregar regras de acesso:', error)
    } finally {
      loading.value = false
    }
  })
</script>

<template>
  <v-dialog max-width="900" :model-value="props.modelValue" @update:model-value="emit('update:modelValue', $event)">
    <v-card v-if="props.group">
      <v-card-title class="text-h5">Editar Grupo</v-card-title>

      <v-card-text>
        <v-tabs v-model="tab" bg-color="transparent" color="primary">
          <v-tab value="dados">Dados Gerais</v-tab>
          <v-tab value="regras">Regras de Acesso</v-tab>
        </v-tabs>

        <v-window v-model="tab">
          <!-- Aba Dados Gerais -->
          <v-window-item value="dados">
            <v-container>
              <v-row>
                <v-col cols="12">
                  <v-text-field
                    v-model="name"
                    label="Nome do Grupo"
                    required
                    :rules="[v => !!v || 'Nome é obrigatório']"
                  />
                </v-col>
              </v-row>
            </v-container>
          </v-window-item>

          <!-- Aba Regras de Acesso -->
          <v-window-item value="regras">
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
                          Selecione as regras de acesso para este grupo:
                        </div>

                        <v-list lines="two">
                          <v-list-item
                            v-for="rule in accessRuleStore.accessRules"
                            :key="rule.id"
                            :subtitle="rule.description"
                            :title="rule.name"
                          >
                            <template #prepend>
                              <v-chip
                                :color="accessRuleStore.getRuleTypeColor(rule.type)"
                                size="small"
                                :text="accessRuleStore.getRuleTypeLabel(rule.type)"
                              />
                            </template>

                            <template #append>
                              <v-switch
                                color="primary"
                                hide-details
                                :model-value="groupAccessRules.includes(rule.id)"
                                @update:model-value="(value) => toggleAccessRule(rule.id, !!value)"
                              />
                            </template>
                          </v-list-item>
                        </v-list>

                        <div v-if="accessRuleStore.accessRules.length === 0" class="text-center pa-4">
                          <v-icon class="mb-2" color="grey" icon="mdi-shield" size="48" />
                          <div class="text-body-1 text-grey">Nenhuma regra de acesso disponível</div>
                        </div>
                      </template>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>
            </v-container>
          </v-window-item>
        </v-window>
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn color="error" variant="text" @click="closeDialog">Cancelar</v-btn>
        <v-btn color="primary" variant="flat" @click="salvarGrupo">Salvar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
