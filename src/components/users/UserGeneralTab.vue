<script setup lang="ts">
import type { Device, User as BaseUser } from "@/types";
import type { UserFieldFlags, UserFormState } from "@/composables/useUserFormState";
import { ref } from "vue";
import { formatCpf, formatPhone, isCpfValidFormat, isPhoneValidFormat } from "@/utils/contact";
import { formatDateTimeForDisplay } from "@/utils/datetime";

const props = defineProps<{
  form: UserFormState;
  fieldFlags: UserFieldFlags;
  backendErrors?: Record<string, string[]>;
  canManagePhoto: boolean;
  deviceOptions: Device[];
  canShowPasswordField: boolean;
  isGuaritaViewer: boolean;
  isSisaeViewer: boolean;
  groups: Array<string>;
  roleOptions: { title: string; value: string }[];
  minimalMode?: boolean;
  pictureUrl?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  lastPassageAt?: string | null;
}>();

const emit = defineEmits<{
  (e: "update:form", value: Partial<UserFormState>): void;
  (e: "select-picture", value: File | null): void;
  (e: "remove-picture"): void;
}>();

const fileInput = ref<HTMLInputElement | null>(null);

function onFileSelected(event: Event) {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0] || null;
  if (file) {
    emit("select-picture", file);
  }
}

function openFilePicker() {
  fileInput.value?.click();
}

function onRemovePicture() {
  emit("remove-picture");
}

const deviceScopeOptions = [
  { title: "Todas as catracas ativas", value: "all_active" },
  { title: "Somente catracas selecionadas", value: "selected" },
  { title: "Nao sincronizar com catracas", value: "none" },
];

function getFieldErrors(field: string): string[] {
  return props.backendErrors?.[field] ?? [];
}

const cpfRules = [
  (value: string) => !value || isCpfValidFormat(value) || "CPF deve estar no formato 000.000.000-00",
];

const phoneRules = [
  (value: string) => !!value || "Telefone e obrigatorio para visitantes",
  (value: string) =>
    isPhoneValidFormat(value) || "Telefone deve estar no formato (00) 0000-0000 ou (00) 00000-0000",
];
</script>

<template>
  <v-container>
    <v-row>
      <v-col cols="8">
        <v-alert
          v-if="
            getFieldErrors('non_field_errors').length
            || getFieldErrors('error').length
            || getFieldErrors('detail').length
          "
          class="mb-4"
          density="comfortable"
          type="error"
          variant="tonal"
        >
          {{
            [
              ...getFieldErrors("error"),
              ...getFieldErrors("detail"),
              ...getFieldErrors("non_field_errors"),
            ].join(" ")
          }}
        </v-alert>
        <v-text-field
          v-if="!minimalMode"
          :model-value="groups[0] || 'Usuario sem turma'"
          label="Turma"
          type="text"
          disabled
        />
        <v-text-field
          :model-value="form.name"
          label="Nome"
          required
          :error-messages="getFieldErrors('name')"
          :rules="[(v) => !!v || 'Nome e obrigatorio']"
          :disabled="isSisaeViewer"
          @update:model-value="emit('update:form', { name: String($event ?? '') })"
        />
        <v-text-field
          v-if="fieldFlags.hasEmailField"
          :model-value="form.email"
          :label="minimalMode ? 'E-mail' : 'E-mail para login'"
          :error-messages="getFieldErrors('email')"
          :disabled="isSisaeViewer"
          @update:model-value="emit('update:form', { email: String($event ?? '') })"
        />
        <v-text-field
          v-if="minimalMode"
          :model-value="form.cpf"
          label="CPF"
          :error-messages="getFieldErrors('cpf')"
          :maxlength="14"
          :rules="cpfRules"
          :disabled="isSisaeViewer"
          @update:model-value="emit('update:form', { cpf: formatCpf(String($event ?? '')) })"
        />
        <v-text-field
          v-if="minimalMode"
          :model-value="form.phone"
          label="Telefone"
          required
          :error-messages="getFieldErrors('phone')"
          :maxlength="15"
          :rules="phoneRules"
          :disabled="isSisaeViewer"
          @update:model-value="emit('update:form', { phone: formatPhone(String($event ?? '')) })"
        />
        <v-select
          v-if="fieldFlags.hasAppRoleField && !minimalMode"
          :model-value="form.appRole"
          :items="roleOptions"
          item-title="title"
          item-value="value"
          label="Perfil do painel"
          :error-messages="getFieldErrors('app_role')"
          :disabled="isSisaeViewer"
          @update:model-value="
            emit('update:form', { appRole: ($event as BaseUser['app_role']) ?? '' })
          "
        />
        <v-switch
          v-if="fieldFlags.hasPanelAccessOnlyField && !minimalMode"
          :model-value="form.panelAccessOnly"
          color="info"
          label="Conta somente do painel"
          :error-messages="getFieldErrors('panel_access_only')"
          :disabled="isSisaeViewer"
          @update:model-value="emit('update:form', { panelAccessOnly: Boolean($event) })"
        />
        <v-text-field
          v-if="canShowPasswordField && !minimalMode"
          :model-value="form.password"
          label="Senha do painel"
          placeholder="Preencha para definir ou alterar a senha"
          :error-messages="getFieldErrors('password')"
          type="password"
          @update:model-value="emit('update:form', { password: String($event ?? '') })"
        />

        <v-text-field
          v-if="!minimalMode"
          :model-value="form.registration"
          label="Matricula"
          :error-messages="getFieldErrors('registration')"
          :disabled="isSisaeViewer"
          @update:model-value="emit('update:form', { registration: String($event ?? '') })"
        />

        <v-select
          :model-value="form.deviceScope"
          :items="deviceScopeOptions"
          item-title="title"
          item-value="value"
          label="Escopo de catracas"
          :error-messages="getFieldErrors('device_scope')"
          :disabled="isSisaeViewer || form.panelAccessOnly"
          @update:model-value="
            emit('update:form', {
              deviceScope: ($event as BaseUser['device_scope']) ?? 'all_active',
            })
          "
        />

        <v-row dense class="pt-2">
          <v-col cols="12" md="6">
            <v-text-field
              :model-value="props.form.startDate"
              label="Data e hora de inicio"
              type="datetime-local"
              clearable
              :error-messages="getFieldErrors('start_date')"
              :disabled="isSisaeViewer || isGuaritaViewer"
              @update:model-value="
                emit('update:form', { startDate: ($event as string | null) ?? null })
              "
            />
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field
              :model-value="props.form.endDate"
              label="Data e hora de fim"
              type="datetime-local"
              clearable
              :error-messages="getFieldErrors('end_date')"
              :disabled="isSisaeViewer"
              @update:model-value="
                emit('update:form', { endDate: ($event as string | null) ?? null })
              "
            />
          </v-col>
            <v-text-field
            :model-value="formatDateTimeForDisplay(props.form.lastPassageAt)"
            label="Ultima Passagem na Catraca"
            readonly
            disabled
            hint="Atualizado automaticamente quando o visitante passa na catraca"
          />
        </v-row>

        <v-col cols="12" v-if="minimalMode"> </v-col>

        <v-select
          v-if="form.deviceScope === 'selected'"
          :model-value="form.selectedDeviceIds"
          :items="deviceOptions"
          item-title="name"
          item-value="id"
          chips
          clearable
          label="Catracas selecionadas"
          multiple
          :error-messages="getFieldErrors('selected_device_ids')"
          :disabled="isSisaeViewer || form.panelAccessOnly"
          @update:model-value="
            emit('update:form', { selectedDeviceIds: ($event as number[]) || [] })
          "
        />

        <v-switch
          v-if="fieldFlags.hasUserTypeField && !minimalMode"
          :model-value="form.isVisitor"
          color="warning"
          label="Visitante"
          :disabled="isSisaeViewer"
          @update:model-value="emit('update:form', { isVisitor: Boolean($event) })"
        />
        <v-switch
          v-if="fieldFlags.hasDeviceAdminField && !minimalMode"
          :model-value="form.deviceAdmin"
          color="primary"
          label="Administrador da catraca"
          :disabled="isSisaeViewer"
          @update:model-value="emit('update:form', { deviceAdmin: Boolean($event) })"
        />
        <v-text-field v-if="!minimalMode" label="Data de nascimento" type="date" disabled />
        <v-text-field v-if="!minimalMode" label="(xx) xxxxx-xxxx" type="tel" disabled />
      </v-col>

      <v-col v-if="!minimalMode" class="d-flex flex-column align-center" cols="4">
        <input
          ref="fileInput"
          accept="image/*"
          style="display: none"
          type="file"
          @change="onFileSelected"
        />
        <v-avatar class="mb-4" size="150">
          <v-img v-if="pictureUrl" :src="pictureUrl" />
          <v-icon v-else size="100">mdi-account-circle</v-icon>
        </v-avatar>
        <v-btn class="mb-2" color="primary" v-if="canManagePhoto" @click="openFilePicker"
          >Arquivo</v-btn
        >
        <v-btn
          class="mb-2"
          color="error"
          v-if="pictureUrl && canManagePhoto"
          @click="onRemovePicture"
          >Remover</v-btn
        >
      </v-col>
    </v-row>
  </v-container>
</template>
