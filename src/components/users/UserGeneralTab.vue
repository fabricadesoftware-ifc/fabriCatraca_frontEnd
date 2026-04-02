<script setup lang="ts">
import type { Device, User as BaseUser } from "@/types";

const props = defineProps<{
  name: string;
  email: string;
  cpf?: string;
  phone?: string;
  password: string;
  appRole: BaseUser["app_role"];
  panelAccessOnly: boolean;
  registration: string;
  isVisitor: boolean;
  deviceAdmin: boolean;
  deviceScope: BaseUser["device_scope"];
  selectedDeviceIds: number[];
  deviceOptions: Device[];
  hasEmailField: boolean;
  hasAppRoleField: boolean;
  hasPanelAccessOnlyField: boolean;
  hasUserTypeField: boolean;
  hasDeviceAdminField: boolean;
  canShowPasswordField: boolean;
  isSisaeViewer: boolean;
  groups: Array<string>;
  roleOptions: { title: string; value: string }[];
  minimalMode?: boolean;
}>();

const emit = defineEmits<{
  (e: "update:name", value: string): void;
  (e: "update:email", value: string): void;
  (e: "update:cpf", value: string): void;
  (e: "update:phone", value: string): void;
  (e: "update:password", value: string): void;
  (e: "update:appRole", value: BaseUser["app_role"]): void;
  (e: "update:panelAccessOnly", value: boolean): void;
  (e: "update:registration", value: string): void;
  (e: "update:isVisitor", value: boolean): void;
  (e: "update:deviceAdmin", value: boolean): void;
  (e: "update:deviceScope", value: BaseUser["device_scope"]): void;
  (e: "update:selectedDeviceIds", value: number[]): void;
}>();

const deviceScopeOptions = [
  { title: "Todas as catracas ativas", value: "all_active" },
  { title: "Somente catracas selecionadas", value: "selected" },
  { title: "Nao sincronizar com catracas", value: "none" },
];
</script>

<template>
  <v-container>
    <v-row>
      <v-col cols="8">
        <v-text-field
          v-if="!minimalMode"
          :model-value="groups[0] || 'Usuario sem turma'"
          label="Turma"
          type="text"
          disabled
        />
        <v-text-field
          :model-value="name"
          label="Nome"
          required
          :rules="[(v) => !!v || 'Nome e obrigatorio']"
          :disabled="isSisaeViewer"
          @update:model-value="emit('update:name', String($event ?? ''))"
        />
        <v-text-field
          v-if="hasEmailField"
          :model-value="email"
          :label="minimalMode ? 'E-mail' : 'E-mail para login'"
          :disabled="isSisaeViewer"
          @update:model-value="emit('update:email', String($event ?? ''))"
        />
        <v-text-field
          v-if="minimalMode"
          :model-value="cpf"
          label="CPF"
          :disabled="isSisaeViewer"
          @update:model-value="emit('update:cpf', String($event ?? ''))"
        />
        <v-text-field
          v-if="minimalMode"
          :model-value="phone"
          label="Telefone"
          required
          :rules="[(v) => !!v || 'Telefone e obrigatorio para visitantes']"
          :disabled="isSisaeViewer"
          @update:model-value="emit('update:phone', String($event ?? ''))"
        />
        <v-select
          v-if="hasAppRoleField && !minimalMode"
          :model-value="appRole"
          :items="roleOptions"
          item-title="title"
          item-value="value"
          label="Perfil do painel"
          :disabled="isSisaeViewer"
          @update:model-value="emit('update:appRole', $event)"
        />
        <v-switch
          v-if="hasPanelAccessOnlyField && !minimalMode"
          :model-value="panelAccessOnly"
          color="info"
          label="Conta somente do painel"
          :disabled="isSisaeViewer"
          @update:model-value="emit('update:panelAccessOnly', Boolean($event))"
        />
        <v-text-field
          v-if="canShowPasswordField && !minimalMode"
          :model-value="password"
          label="Senha do painel"
          placeholder="Preencha para definir ou alterar a senha"
          type="password"
          @update:model-value="emit('update:password', String($event ?? ''))"
        />
        <v-text-field
          v-if="!minimalMode"
          :model-value="registration"
          label="Matricula"
          :disabled="isSisaeViewer"
          @update:model-value="emit('update:registration', String($event ?? ''))"
        />

        <v-select
          :model-value="deviceScope"
          :items="deviceScopeOptions"
          item-title="title"
          item-value="value"
          label="Escopo de catracas"
          :disabled="isSisaeViewer || panelAccessOnly"
          @update:model-value="emit('update:deviceScope', $event)"
        />

        <v-select
          v-if="deviceScope === 'selected'"
          :model-value="selectedDeviceIds"
          :items="deviceOptions"
          item-title="name"
          item-value="id"
          chips
          clearable
          label="Catracas selecionadas"
          multiple
          :disabled="isSisaeViewer || panelAccessOnly"
          @update:model-value="emit('update:selectedDeviceIds', ($event as number[]) || [])"
        />

        <v-switch
          v-if="hasUserTypeField && !minimalMode"
          :model-value="isVisitor"
          color="warning"
          label="Visitante"
          :disabled="isSisaeViewer"
          @update:model-value="emit('update:isVisitor', Boolean($event))"
        />
        <v-switch
          v-if="hasDeviceAdminField && !minimalMode"
          :model-value="deviceAdmin"
          color="primary"
          label="Administrador da catraca"
          :disabled="isSisaeViewer"
          @update:model-value="emit('update:deviceAdmin', Boolean($event))"
        />
        <v-text-field v-if="!minimalMode" label="Data de nascimento" type="date" disabled />
        <v-text-field v-if="!minimalMode" label="(xx) xxxxx-xxxx" type="tel" disabled />
      </v-col>

      <v-col v-if="!minimalMode" class="d-flex flex-column align-center" cols="4">
        <v-avatar class="mb-4" size="150">
          <v-img :src="`https://randomuser.me/api/portraits/lego/${Math.floor(Math.random() * 10)}.jpg`" />
        </v-avatar>
        <v-btn class="mb-2" color="primary" v-if="!isSisaeViewer">Arquivo</v-btn>
        <v-btn class="mb-2" color="primary" v-if="!isSisaeViewer">Camera</v-btn>
        <v-btn class="mb-2" color="error" v-if="!isSisaeViewer">Remover</v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>
