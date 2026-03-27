<script setup lang="ts">
import type { User as BaseUser } from "@/types";

const props = defineProps<{
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
  groups: Array<string>
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
                  :model-value="groups[0] || 'Usuario sem turma'"
                  label="Turma"
                  type="text"
                  disabled
                />
        <v-text-field
          :model-value="name"
          label="Nome"
          required
          :rules="[(v) => !!v || 'Nome é obrigatório']"
          :disabled="isSisaeViewer"
          @update:model-value="emit('update:name', String($event ?? ''))"
        />
        <v-text-field
          v-if="hasEmailField"
          :model-value="email"
          label="E-mail para login"
          :disabled="isSisaeViewer"
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
          :disabled="isSisaeViewer"
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
          <!-- TODO: Arrumar data de nascimento -->
        <v-text-field
                  label="Data de nascimento"
                  type="date"
                  disabled
                />

        <v-text-field
                  label="(xx) xxxxx-xxxx"
                  type="tel"
                  disabled
                />

      </v-col>

      <v-col class="d-flex flex-column align-center" cols="4">
        <v-avatar class="mb-4" size="150">
          <v-img :src="`https://randomuser.me/api/portraits/lego/${Math.floor(Math.random() * 10)}.jpg`" />
        </v-avatar>
        <v-btn class="mb-2" color="primary" v-if="!isSisaeViewer">Arquivo</v-btn>
        <v-btn class="mb-2" color="primary" v-if="!isSisaeViewer">Câmera</v-btn>
        <v-btn class="mb-2" color="error" v-if="!isSisaeViewer">Remover</v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>
