<script lang="ts" setup>
  import type { AccessRule } from '@/types'
  import { onMounted, ref, watch } from 'vue'
  import portalAccessRulesService from '@/services/portal_access_rules'
  import { useAreaStore } from '@/stores'
  import { usePortalStore } from '@/stores/portal'

  const props = defineProps<{ modelValue: boolean, rule: AccessRule | null }>()
  const emit = defineEmits<{ (e: 'update:modelValue', v: boolean): void, (e: 'save', v: AccessRule): void }>()

  const areaStore = useAreaStore()
  const portalStore = usePortalStore()
  const tab = ref('dados')
  const name = ref('')
  const type = ref<number>(1)
  const priority = ref<number>(1)
  const ruleAreas = ref<number[]>([])
  const rulePortals = ref<number[]>([])
  const loading = ref(false)
  const loadingPortals = ref(false)

  // Opções para o tipo de regra
  const typeOptions = [
    { title: 'Regra de Bloqueio', value: 0 },
    { title: 'Regra de Permissão', value: 1 },
  ]

  watch(() => props.rule, async r => {
    if (!r) return
    name.value = r.name || ''
    type.value = Number(r.type) || 1
    priority.value = Number(r.priority) || 1
    ruleAreas.value = (r.areas || []).map(area => typeof area === 'number' ? area : area.id)

    // Carregar portals associados se a regra já existe
    if (r.id && r.id !== 0) {
      await loadPortalsForRule(r.id)
    } else {
      rulePortals.value = []
    }
  }, { immediate: true })

  function close () {
    emit('update:modelValue', false)
  }
  
  function save () {
    if (!props.rule) return
    emit('save', {
      ...props.rule,
      name: name.value,
      type: type.value,
      priority: priority.value,
      areas: ruleAreas.value,
      portals: rulePortals.value,
    } as AccessRule)
    close()
  }

  function toggleArea (areaId: number, checked: boolean) {
    if (checked) {
      if (!ruleAreas.value.includes(areaId)) {
        ruleAreas.value.push(areaId)
      }
    } else {
      ruleAreas.value = ruleAreas.value.filter(id => id !== areaId)
    }
  }

  function togglePortal (portalId: number, checked: boolean) {
    if (checked) {
      if (!rulePortals.value.includes(portalId)) {
        rulePortals.value.push(portalId)
      }
    } else {
      rulePortals.value = rulePortals.value.filter(id => id !== portalId)
    }
  }

  async function loadPortalsForRule (ruleId: number) {
    loadingPortals.value = true
    try {
      const relations = await portalAccessRulesService.getPortalAccessRules({ access_rule: ruleId })
      rulePortals.value = (relations.results || [])
        .filter((rel: any) => ((rel?.access_rule?.id ?? rel?.access_rule) === ruleId))
        .map((rel: any) => rel?.portal?.id ?? rel?.portal)
        .filter((id: any) => typeof id === 'number')
    } catch (error) {
      console.error('Erro ao carregar portals da regra:', error)
      rulePortals.value = []
    } finally {
      loadingPortals.value = false
    }
  }

  onMounted(async () => {
    loading.value = true
    try {
      await Promise.all([
        areaStore.loadAreas(),
        portalStore.loadPortals(),
      ])
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      loading.value = false
    }
  })
</script>

<template>
  <v-dialog max-width="900" :model-value="props.modelValue" @update:model-value="emit('update:modelValue', $event)">
    <v-card v-if="props.rule">
      <v-card-title class="text-h5">{{ props.rule.id ? 'Editar Regra' : 'Nova Regra' }}</v-card-title>

      <v-card-text>
        <v-tabs v-model="tab" bg-color="transparent" color="primary">
          <v-tab value="dados">Dados Gerais</v-tab>
          <v-tab value="areas">Áreas</v-tab>
          <v-tab value="portals">Entradas/Saídas</v-tab>
        </v-tabs>

        <v-window v-model="tab">
          <!-- Aba Dados Gerais -->
          <v-window-item value="dados">
            <v-container>
              <v-row>
                <v-col cols="12">
                  <v-text-field
                    v-model="name"
                    label="Nome"
                    required
                    :rules="[v => !!v || 'Obrigatório']"
                  />
                </v-col>
                <v-col cols="12">
                  <v-select
                    v-model="type"
                    :items="typeOptions"
                    label="Tipo da Regra"
                    required
                    :rules="[v => v !== null && v !== undefined || 'Obrigatório']"
                    variant="outlined"
                  />
                </v-col>
                <v-col cols="12">
                  <v-text-field
                    v-model.number="priority"
                    label="Prioridade"
                    type="number"
                  />
                </v-col>
              </v-row>
            </v-container>
          </v-window-item>

          <!-- Aba Áreas -->
          <v-window-item value="areas">
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
                          Selecione as áreas para esta regra de acesso:
                        </div>

                        <v-list lines="two">
                          <v-list-item
                            v-for="area in areaStore.areas"
                            :key="area.id"
                            :title="area.name"
                          >
                            <template #append>
                              <v-switch
                                color="primary"
                                hide-details
                                :model-value="ruleAreas.includes(area.id)"
                                @update:model-value="(value) => toggleArea(area.id, !!value)"
                              />
                            </template>
                          </v-list-item>
                        </v-list>

                        <div v-if="areaStore.areas.length === 0" class="text-center pa-4">
                          <v-icon class="mb-2" color="grey" icon="mdi-map-marker" size="48" />
                          <div class="text-body-1 text-grey">Nenhuma área disponível</div>
                        </div>
                      </template>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>
            </v-container>
          </v-window-item>

          <!-- Aba Entradas/Saídas -->
          <v-window-item value="portals">
            <v-container>
              <v-row>
                <v-col cols="12">
                  <v-card>
                    <v-card-text class="pa-4">
                      <v-progress-linear
                        v-if="loading || loadingPortals"
                        color="primary"
                        indeterminate
                      />

                      <template v-else>
                        <div class="text-subtitle-1 mb-4">
                          Selecione as entradas/saídas para esta regra de acesso:
                        </div>

                        <v-list lines="two">
                          <v-list-item
                            v-for="portal in portalStore.portals"
                            :key="portal.id"
                            :subtitle="`${typeof portal.area_from === 'object' ? portal.area_from.name : 'N/A'} → ${typeof portal.area_to === 'object' ? portal.area_to.name : 'N/A'}`"
                            :title="portal.name"
                          >
                            <template #prepend>
                              <v-icon color="primary" icon="mdi-swap-horizontal" />
                            </template>

                            <template #append>
                              <v-switch
                                color="primary"
                                hide-details
                                :model-value="rulePortals.includes(portal.id)"
                                @update:model-value="(value) => togglePortal(portal.id, !!value)"
                              />
                            </template>
                          </v-list-item>
                        </v-list>

                        <div v-if="portalStore.portals.length === 0" class="text-center pa-4">
                          <v-icon class="mb-2" color="grey" icon="mdi-swap-horizontal" size="48" />
                          <div class="text-body-1 text-grey">Nenhuma entrada/saída disponível</div>
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
        <v-btn variant="text" @click="close">Cancelar</v-btn>
        <v-btn color="primary" @click="save">Salvar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>


