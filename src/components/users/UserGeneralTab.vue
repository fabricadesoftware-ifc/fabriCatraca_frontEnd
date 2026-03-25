<script setup lang="ts">
import type { User as BaseUser } from "@/types";

defineProps<{
  name: string;
  email: string;
  password: string;
  appRole: BaseUser["app_role"];
  panelAccessOnly: boolean;
  registration: string;
  isVisitor: boolean;
  deviceAdmin: boolean;
  hasEmailField: boolean;
  hasAppRoleField: boolean;
  hasPanelAccessOnlyField: boolean;
  hasUserTypeField: boolean;
  hasDeviceAdminField: boolean;
  canShowPasswordField: boolean;
  isSisaeViewer: boolean;
  roleOptions: { title: string; value: string }[];
}>();

const emit = defineEmits<{
  (e: "update:name", value: string): void;
  (e: "update:email", value: string): void;
  (e: "update:password", value: string): void;
  (e: "update:appRole", value: BaseUser["app_role"]): void;
  (e: "update:panelAccessOnly", value: boolean): void;
  (e: "update:registration", value: string): void;
  (e: "update:isVisitor", value: boolean): void;
  (e: "update:deviceAdmin", value: boolean): void;
}>();
</script>

<template>
  <v-container>
    <v-row>
      <v-col cols="8">
        <v-text-field
          :model-value="name"
          label="Nome"
          required
          :rules="[(v) => !!v || 'Nome é obrigatório']"
          @update:model-value="emit('update:name', String($event ?? ''))"
        />
        <v-text-field
          v-if="hasEmailField"
          :model-value="email"
          label="E-mail para login"
          @update:model-value="emit('update:email', String($event ?? ''))"
        />
        <v-select
          v-if="hasAppRoleField"
          :model-value="appRole"
          :items="roleOptions"
          item-title="title"
          item-value="value"
          label="Perfil do painel"
          :disabled="isSisaeViewer"
          @update:model-value="emit('update:appRole', $event)"
        />
        <v-switch
          v-if="hasPanelAccessOnlyField"
          :model-value="panelAccessOnly"
          color="info"
          label="Conta somente do painel"
          :disabled="isSisaeViewer"
          @update:model-value="emit('update:panelAccessOnly', Boolean($event))"
        />
        <v-text-field
          v-if="canShowPasswordField"
          :model-value="password"
          label="Senha do painel"
          placeholder="Preencha para definir ou alterar a senha"
          type="password"
          @update:model-value="emit('update:password', String($event ?? ''))"
        />
        <v-text-field
          :model-value="registration"
          label="Matrícula"
          @update:model-value="emit('update:registration', String($event ?? ''))"
        />

        <v-switch
          v-if="hasUserTypeField"
          :model-value="isVisitor"
          color="warning"
          label="Visitante"
          :disabled="isSisaeViewer"
          @update:model-value="emit('update:isVisitor', Boolean($event))"
        />
        <v-switch
          v-if="hasDeviceAdminField"
          :model-value="deviceAdmin"
          color="primary"
          label="Administrador da catraca"
          :disabled="isSisaeViewer"
          @update:model-value="emit('update:deviceAdmin', Boolean($event))"
        />
      </v-col>

      <v-col class="d-flex flex-column align-center" cols="4">
        <v-avatar class="mb-4" size="150">
          <v-img :src="`https://randomuser.me/api/portraits/lego/${Math.floor(Math.random() * 10)}.jpg`" />
        </v-avatar>
        <v-btn class="mb-2" color="primary">Arquivo</v-btn>
        <v-btn class="mb-2" color="primary">Câmera</v-btn>
        <v-btn class="mb-2" color="error">Remover</v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>
