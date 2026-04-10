<script lang="ts" setup>
import type { AccessRule, Group as BaseGroup } from "@/types";
import { computed, onMounted, ref, watch } from "vue";
import exportUsersService from "@/services/export_users";
import userGroupsImportService from "@/services/user_groups_import";
import { useAccessRuleStore, usePortalGroupStore } from "@/stores";
import GroupTemporaryReleasePanel from "./GroupTemporaryReleasePanel.vue";

interface Group extends Omit<BaseGroup, "access_rules"> {
  access_rules?: (number | AccessRule)[];
}

const props = defineProps<{
  modelValue: boolean;
  group: Group | null;
  app_role?: string;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
  (e: "save", value: Group): void;
  (e: "saved"): void;
}>();

const accessRuleStore = useAccessRuleStore();
const portalGroupStore = usePortalGroupStore();
const portalGroupOptions = computed(() => {
  return [
    { id: null, name: "Todas as catracas" },
    ...portalGroupStore.portalGroups.map((pg) => ({ id: pg.id, name: pg.name })),
  ];
});
const tab = ref("dados");
const isSisae = computed(() => props.app_role === "sisae");
const name = ref("");
const loading = ref(false);
interface RuleWithPortalGroup {
  access_rule_id: number;
  portal_group_id: number | null;
}
const groupAccessRules = ref<RuleWithPortalGroup[]>([]);
const existingAccessRulePortalGroups = ref<Map<number, number | null>>(new Map());

// Estados para importação
const importFile = ref<File | null>(null);
const importError = ref("");
const importing = ref(false);

// Estados para exportação
const exportFormat = ref<"csv" | "xlsx">("csv");
const exporting = ref(false);

function findRuleIndex(ruleId: number): number {
  return groupAccessRules.value.findIndex((r) => r.access_rule_id === ruleId);
}

function getPortalGroupIdForRule(ruleId: number): number | null {
  const entry = groupAccessRules.value.find((r) => r.access_rule_id === ruleId);
  return entry ? entry.portal_group_id : null;
}

function toggleAccessRule(ruleId: number, value: boolean): void {
  const currentRules = [...groupAccessRules.value];
  if (value) {
    if (findRuleIndex(ruleId) === -1) {
      currentRules.push({ access_rule_id: ruleId, portal_group_id: null });
    }
  } else {
    const index = findRuleIndex(ruleId);
    if (index !== -1) {
      currentRules.splice(index, 1);
    }
  }
  groupAccessRules.value = currentRules;
}

function updateRulePortalGroupId(ruleId: number, portalGroupId: number | null): void {
  const index = findRuleIndex(ruleId);
  if (index !== -1) {
    groupAccessRules.value[index].portal_group_id = portalGroupId;
  }
}

// Atualiza os campos locais quando o props.group mudar
watch(
  () => props.group,
  (newGroup) => {
    if (newGroup) {
      name.value = newGroup.name;
      const rules = newGroup.access_rules || [];
      if (rules.length > 0 && typeof rules[0] === "object") {
        // Quando vem com info completa de regras (access_rule objects)
        groupAccessRules.value = (
          rules as unknown as { access_rule_id: number; portal_group_id: number | null }[]
        ).map((r) => ({
          access_rule_id: r.access_rule_id,
          portal_group_id: r.portal_group_id,
        }));
      } else {
        // Quando vem como array simples de IDs (backward compat)
        groupAccessRules.value = (rules as number[]).map((id) => ({
          access_rule_id: typeof id === "number" ? id : ((id as any)?.id ?? 0),
          portal_group_id: null,
        }));
      }
    }
  },
  { immediate: true },
);

watch(
  () => props.modelValue,
  (isOpen) => {
    if (!isOpen) return;
    if (isSisae.value && props.group?.id) {
      tab.value = "liberacao";
      return;
    }
    tab.value = "dados";
  },
  { immediate: true },
);

async function importarUsuarios(): Promise<void> {
  if (!importFile.value || !props.group) return;

  importing.value = true;
  importError.value = "";

  try {
    const formData = new FormData();
    formData.append("file", importFile.value);
    formData.append("group_id", String(props.group.id));

    await userGroupsImportService.importUsersToGroup(formData);
    importFile.value = null;
    emit("saved");
  } catch (error: any) {
    const resp = error?.response?.data;
    const parsed =
      typeof resp === "string"
        ? resp
        : resp?.error ||
          resp?.message ||
          resp?.detail ||
          (resp ? JSON.stringify(resp) : "Falha ao importar usuários");
    importError.value = parsed;
  } finally {
    importing.value = false;
  }
}

async function exportarUsuarios(): Promise<void> {
  if (!props.group) return;

  exporting.value = true;
  try {
    const blobData = await exportUsersService.exportUsers(props.group.id, exportFormat.value);
    const blob = new Blob([blobData], { type: "application/octet-stream" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `usuarios_grupo_${props.group.id}.${exportFormat.value}`;
    document.body.append(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Erro ao exportar usuários:", error);
  } finally {
    exporting.value = false;
  }
}

function close(): void {
  emit("update:modelValue", false);
}

function save(): void {
  if (!props.group) return;
  emit("save", {
    ...props.group,
    name: name.value,
    access_rules: [...groupAccessRules.value] as unknown as (number | AccessRule)[],
  });
  close();
}

onMounted(async () => {
  loading.value = true;
  try {
    await accessRuleStore.loadAccessRules();
    if (portalGroupStore.portalGroups.length === 0) {
      await portalGroupStore.loadPortalGroups({ page_size: 100 });
    }
  } catch (error) {
    console.error("Erro ao carregar regras de acesso:", error);
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <v-dialog
    max-width="900"
    :model-value="props.modelValue"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <v-card v-if="props.group">
      <v-card-title class="d-flex text-h5 justify-space-between">
        {{
          props.app_role === "sisae"
            ? props.group.name || "Turma"
            : props.group.id
              ? "Editar Grupo"
              : "Novo Grupo"
        }}
        <v-btn icon="mdi-close" variant="text" @click="emit('update:modelValue', false)" />
      </v-card-title>

      <v-card-text>
        <v-tabs v-model="tab" bg-color="transparent" color="primary">
          <v-tab v-if="!isSisae" value="dados">Dados Gerais</v-tab>
          <v-tab v-if="props.group.id" value="liberacao">Liberação</v-tab>
          <template v-if="!isSisae">
            <v-tab value="regras">Regras de Acesso</v-tab>
            <v-tab value="importar">Importar Usuários</v-tab>
            <v-tab value="exportar">Exportar Usuários</v-tab>
          </template>
        </v-tabs>

        <v-window v-model="tab">
          <!-- Aba Dados Gerais -->
          <v-window-item v-if="!isSisae" value="dados">
            <v-container>
              <v-row>
                <v-col cols="12">
                  <v-text-field
                    v-model="name"
                    label="Nome do Grupo"
                    :readonly="props.app_role === 'sisae'"
                    required
                    :rules="props.app_role !== 'sisae' ? [(v) => !!v || 'Nome é obrigatório'] : []"
                  />
                </v-col>
              </v-row>
            </v-container>
          </v-window-item>

          <!-- Aba Liberação -->
          <v-window-item value="liberacao">
            <GroupTemporaryReleasePanel v-if="props.group.id" :group-id="props.group.id" />
          </v-window-item>

          <!-- Aba Regras de Acesso -->
          <v-window-item value="regras">
            <v-container>
              <v-row>
                <v-col cols="12">
                  <v-card>
                    <v-card-text class="pa-4">
                      <v-progress-linear v-if="loading" color="primary" indeterminate />

                      <template v-else>
                        <v-alert class="mb-4" density="compact" type="info" variant="tonal">
                          Selecione as regras de acesso para este grupo e, opcionalmente, defina o
                          escopo de catracas.
                        </v-alert>

                        <v-list lines="two">
                          <v-list-item
                            v-for="rule in accessRuleStore.accessRules"
                            :key="rule.id"
                            :title="rule.name"
                          >
                            <template #prepend>
                              <v-chip
                                :color="String(accessRuleStore.getRuleTypeColor(String(rule.type)))"
                                size="small"
                                :text="String(accessRuleStore.getRuleTypeLabel(String(rule.type)))"
                              />
                            </template>

                            <template #default>
                              <v-row dense align="center">
                                <v-col cols="12" md="6">
                                  <v-select
                                    v-if="getPortalGroupIdForRule(rule.id) !== undefined"
                                    density="compact"
                                    hide-details
                                    :items="portalGroupOptions"
                                    item-title="name"
                                    item-value="id"
                                    label="Grupo de Portais"
                                    variant="outlined"
                                    :model-value="getPortalGroupIdForRule(rule.id)"
                                    @update:model-value="
                                      (val) => updateRulePortalGroupId(rule.id, val)
                                    "
                                  />
                                </v-col>
                              </v-row>
                            </template>

                            <template #append>
                              <v-switch
                                color="primary"
                                hide-details
                                :model-value="getPortalGroupIdForRule(rule.id) !== undefined"
                                @update:model-value="(value) => toggleAccessRule(rule.id, !!value)"
                              />
                            </template>
                          </v-list-item>
                        </v-list>

                        <div
                          v-if="accessRuleStore.accessRules.length === 0"
                          class="text-center pa-4"
                        >
                          <v-icon class="mb-2" color="grey" icon="mdi-shield" size="48" />
                          <div class="text-body-1 text-grey">
                            Nenhuma regra de acesso disponível
                          </div>
                        </div>
                      </template>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>
            </v-container>
          </v-window-item>

          <!-- Aba Importar Usuários -->
          <v-window-item value="importar">
            <v-container>
              <v-row>
                <v-col cols="12">
                  <v-card>
                    <v-card-text class="pa-4">
                      <div class="text-subtitle-1 mb-4">Importar usuários para este grupo</div>

                      <v-alert class="mb-4" type="info" variant="tonal">
                        Envie um arquivo .xlsx/.xls com a lista de usuários. Os usuários serão
                        automaticamente adicionados a este grupo.
                      </v-alert>

                      <v-alert v-if="importError" class="mb-4" type="error" variant="tonal">{{
                        importError
                      }}</v-alert>

                      <v-file-input
                        v-model="importFile"
                        accept=".xlsx,.xls"
                        counter
                        density="comfortable"
                        :error-messages="importError"
                        label="Selecionar arquivo (.xlsx, .xls)"
                        :loading="importing"
                        prepend-inner-icon="mdi-file-excel"
                        show-size
                        variant="outlined"
                        @error="importError = $event?.toString() || ''"
                      />

                      <div class="text-caption text-grey">
                        Limite recomendado: 100 linhas por arquivo.
                      </div>

                      <v-btn
                        class="mt-4"
                        color="primary"
                        :disabled="!importFile"
                        :loading="importing"
                        prepend-icon="mdi-upload"
                        @click="importarUsuarios"
                      >
                        Importar Usuários
                      </v-btn>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>
            </v-container>
          </v-window-item>

          <!-- Aba Exportar Usuários -->
          <v-window-item value="exportar">
            <v-container>
              <v-row>
                <v-col cols="12">
                  <v-card>
                    <v-card-text class="pa-4">
                      <div class="text-subtitle-1 mb-4">Exportar usuários deste grupo</div>

                      <v-alert class="mb-4" type="info" variant="tonal">
                        Selecione o formato desejado para exportar a lista de usuários deste grupo.
                      </v-alert>

                      <v-select
                        v-model="exportFormat"
                        density="comfortable"
                        item-title="title"
                        item-value="value"
                        :items="[
                          { title: 'CSV', value: 'csv' },
                          { title: 'Excel (XLSX)', value: 'xlsx' },
                        ]"
                        label="Formato do Arquivo"
                        variant="outlined"
                      />

                      <v-btn
                        class="mt-4"
                        color="primary"
                        :loading="exporting"
                        prepend-icon="mdi-download"
                        @click="exportarUsuarios"
                      >
                        Exportar Usuários
                      </v-btn>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>
            </v-container>
          </v-window-item>
        </v-window>
      </v-card-text>

      <v-card-actions v-if="props.app_role !== 'sisae'">
        <v-spacer />
        <v-btn color="error" variant="text" @click="emit('update:modelValue', false)"
          >Cancelar</v-btn
        >
        <v-btn color="primary" variant="flat" @click="save">Salvar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
