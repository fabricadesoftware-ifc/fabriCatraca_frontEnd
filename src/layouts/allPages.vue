<script lang="ts" setup>
import { computed, onBeforeUnmount, onMounted } from "vue";
import { useAlertsStore, useAuthStore } from "@/stores";

const authStore = useAuthStore();
const alertsStore = useAlertsStore();
const rawItems = [
  {
    title: "Home",
    icon: "mdi-home",
    to: "/",
    roles: ["admin", "guarita", "sisae"],
  },
  {
    title: "Cadastrar Usuario",
    icon: "mdi-account-plus",
    to: " ",
    roles: ["admin", "sisae"],
  },
  {
    title: "Usuario",
    icon: "mdi-account",
    to: "/users",
    roles: ["admin"],
  },
  {
    title: "Grupos",
    icon: "mdi-account-group",
    to: "/groups",
    roles: ["admin"],
  },
  {
    title: "Regras de Acesso",
    icon: "mdi-lock",
    to: "/access-rules",
    roles: ["admin"],
  },
  {
    title: "Entradas e Saidas",
    icon: "mdi-login-variant",
    to: "/portal",
    roles: ["admin"],
  },
  {
    title: "Areas",
    icon: "mdi-map-marker",
    to: "/areas",
    roles: ["admin"],
  },
  {
    title: "Grupos de Portais",
    icon: "mdi-map-marker-radius-outline",
    to: "/portal-groups",
    roles: ["admin"],
  },
  {
    title: "Dispositivos",
    icon: "mdi-turnstile",
    to: "/devices",
    roles: ["admin"],
  },
  {
    title: "Ações em Catracas",
    icon: "mdi-play-circle-outline",
    to: "/device-actions",
    roles: ["admin"],
  },
  {
    title: "Guarita",
    icon: "mdi-shield-account",
    to: "/guarita",
    roles: ["admin", "guarita"],
  },
  {
    title: "Visitantes",
    icon: "mdi-account-plus",
    to: "/visitantes",
    roles: ["admin", "guarita"],
  },
    {
    title: "Liberar Turma",
    icon: "mdi-account-group-outline",
    to: "/liberar-turma",
    roles: ["admin", "sisae"],
  },
  {
    title: "Liberar Usuário",
    icon: "mdi-account-clock",
    to: "/liberar-usuario",
    roles: ["admin", "sisae"],
  },

  {
    title: "Reconfigurar Catracas",
    icon: "mdi-cog-sync",
    to: "/easy-setup",
    roles: ["admin"],
  },
  {
    title: "Logs de Acesso",
    icon: "mdi-clipboard-text-clock",
    to: "/logs",
    roles: ["admin", "sisae"],
  },
  {
    title: "Dados",
    icon: "mdi-database",
    roles: ["admin"],
    subitems: [
      {
        title: "Exportar",
        icon: "mdi-database-export",
        to: "/data/export",
      },
      {
        title: "Importar",
        icon: "mdi-database-import",
        to: "/data/import",
      },
    ],
  },
  {
    title: "Configurações",
    icon: "mdi-cog",
    to: "/settings",
    roles: ["admin"],
  },

];

const items = computed(() =>
  rawItems
    .filter((item) => authStore.hasRole((item.roles || []) as any))
    .map((item) => ({
      ...item,
      subitems: item.subitems?.filter(
        (subitem) =>
          !("roles" in subitem) || authStore.hasRole(((subitem as any).roles || []) as any),
      ),
    })),
);

function formatAlertTime(dateTime?: string | null) {
  if (!dateTime) {
    return "";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(dateTime));
}

function alertIcon(severity: string) {
  if (severity === "error") {
    return "mdi-alert-circle";
  }
  if (severity === "warning") {
    return "mdi-alert";
  }
  return "mdi-information";
}

function alertColor(severity: string) {
  if (severity === "error") {
    return "error";
  }
  if (severity === "warning") {
    return "warning";
  }
  return "info";
}

async function handleAlertClick(alertId: number) {
  await alertsStore.markAsRead(alertId);
}

onMounted(async () => {
  await alertsStore.initialize();
});

onBeforeUnmount(() => {
  alertsStore.stopPolling();
});
</script>
<template>
  <v-app>
    <v-navigation-drawer border="none" class="mx-h-1" width="210">
      <v-list-item class="pt-6 pb-0 d-flex align-center mb-5">
        <template #prepend>
          <v-img class="mr-2" height="40" src="@/assets/fabrica_nice.png" width="40" />
        </template>
        <v-list-item-title class="text-h6 font-weight-bold"> FabriCatraca </v-list-item-title>
      </v-list-item>
      <v-list density="compact" nav>
        <template v-for="item in items" :key="item.title">
          <template v-if="!item?.subitems">
            <!-- Item pai sem subitens -->
            <v-list-item :to="item.to">
              <v-icon :icon="item.icon" />
              {{ item.title }}</v-list-item
            >
          </template>

          <template v-else>
            <!-- Item com subitens -->
            <v-list-group>
              <template #activator="{ props }">
                <v-list-item v-bind="props">
                  <v-icon :icon="item.icon" />
                  {{ item.title }}
                </v-list-item></template
              >
              <v-list-item
                v-for="(subitem, index) in item?.subitems || []"
                :key="index"
                class="pr-0"
                :to="subitem.to"
              >
                <v-icon :icon="subitem.icon" />
                {{ subitem.title }}
              </v-list-item></v-list-group
            >
          </template>
        </template>
      </v-list>
    </v-navigation-drawer>

    <v-main class="bg-surface rounded-lg">
      <v-app-bar
        class=""
        density="compact"
        :elevation="0"
        height="110"
        scroll-behavior="fade-image"
        scroll-threshold="985"
      >
        <v-autocomplete
          auto-select-first
          class="pt-5"
          density="compact"
          item-props
          :items="items"
          menu-icon=""
          prepend-inner-icon="mdi-magnify"
          rounded="sm"
          style="max-width: 350px"
          theme="dark"
          variant="solo-filled"
        />
        <v-spacer />
        <v-sheet class="d-flex align-center pr-5" elevation="0">
          <v-card class="d-flex align-center px-3 py-3" elevation="0" rounded="lg">
            <v-menu location="bottom end" width="380">
              <template #activator="{ props }">
                <v-badge
                  color="error"
                  :content="alertsStore.unreadCount > 99 ? '99+' : alertsStore.unreadCount"
                  :model-value="alertsStore.unreadCount > 0"
                  :offset-x="5"
                >
                  <v-btn
                    v-bind="props"
                    class="mr-1"
                    icon="mdi-bell-outline"
                    size="medium"
                    variant="text"
                    @click="alertsStore.refresh()"
                  />
                </v-badge>
              </template>

              <v-card min-width="360" rounded="lg">
                <v-card-title class="d-flex align-center justify-space-between">
                  <span>Alertas</span>
                  <v-btn size="small" variant="text" @click="alertsStore.markAllAsRead()">
                    Marcar tudo como lido
                  </v-btn>
                </v-card-title>
                <v-divider />
                <v-card-text v-if="alertsStore.loading" class="py-6 text-center">
                  Carregando alertas...
                </v-card-text>
                <v-list v-else-if="alertsStore.alerts.length" density="compact">
                  <v-list-item
                    v-for="alert in alertsStore.alerts"
                    :key="alert.id"
                    class="py-2"
                    @click="handleAlertClick(alert.id)"
                  >
                    <template #prepend>
                      <v-icon
                        :color="alertColor(alert.severity)"
                        :icon="alertIcon(alert.severity)"
                      />
                    </template>
                    <v-list-item-title class="text-body-2">
                      {{ alert.title }}
                    </v-list-item-title>
                    <v-list-item-subtitle class="text-caption">
                      {{ alert.message }}
                    </v-list-item-subtitle>
                    <v-list-item-subtitle class="text-caption mt-1">
                      {{ formatAlertTime(alert.started_at) }}
                      <span v-if="alert.device_name"> • {{ alert.device_name }}</span>
                    </v-list-item-subtitle>
                    <template #append>
                      <v-chip v-if="alert.is_active" color="error" size="x-small" variant="tonal">
                        Ativo
                      </v-chip>
                      <v-chip v-else color="success" size="x-small" variant="tonal">
                        Resolvido
                      </v-chip>
                    </template>
                  </v-list-item>
                </v-list>
                <v-card-text v-else class="py-6 text-center">
                  Nenhum alerta no momento.
                </v-card-text>
              </v-card>
            </v-menu>

            <div class="ml-2">
              <div class="text-subtitle-2 font-weight-medium cursor-pointer" ></div>
              <v-speed-dial location="bottom right" transition="fade-transition" >
                <template v-slot:activator="{ props: activatorProps }">
                  <v-fab v-bind="activatorProps" size="large" variant="tonal"
                    ><v-icon>mdi-account</v-icon> {{ authStore.user?.name || "Usuário" }}
                  </v-fab>
                </template>

                <v-btn key="1" width="10vw" color="red" @click="authStore.logout()">Sair</v-btn>
              </v-speed-dial>
            </div>
          </v-card>
        </v-sheet>
      </v-app-bar>

      <v-sheet class="mr-8 rounded-lg" style="background-color: #eff5f9; color: #000">
        <router-view />
      </v-sheet>
    </v-main>
  </v-app>
  <AppFooter />
</template>

<style scoped>
.v-autocomplete {
  max-width: 350px;
}
</style>
