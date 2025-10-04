<script lang="ts" setup>
  import { useAuthStore } from '@/stores';
  const authStore = useAuthStore();
  const items = [
    {
      title: 'Home',
      icon: 'mdi-home',
      to: '/',
    },
    {
      title: 'Usuario',
      icon: 'mdi-account',
      to: '/users',
    },
    {
      title: 'Permissões',
      icon: 'mdi-lock',
      to: '/access-rules',
    },
    {
      title: 'Areas',
      icon: 'mdi-map-marker',
      to: '/areas',
    },
    {
      title: 'Grupos',
      icon: 'mdi-account-group',
      to: '/groups',
    },
    {
      title: 'Entradas e Saidas',
      icon: 'mdi-login-variant',
      to: '/portal',
    },
    {
      title: 'Dispositivos',
      icon: 'mdi-turnstile',
      to: '/devices',
    },
    {
      title: 'Dados',
      icon: 'mdi-database',
      subitems: [
        {
          title: 'Exportar',
          icon: 'mdi-database-export',
          to: '/data/export',
        },
        {
          title: 'Importar',
          icon: 'mdi-database-import',
          to: '/data/import',
        },
      ],
    },
    {
      title: 'Configurações',
      icon: 'mdi-cog',
      to: '/config',
    },
  ]

  onMounted(async () => {
    await authStore.getMe()
  });
</script>
<template>
  <v-app>
    <v-navigation-drawer
      border="none"
      permanent
      width="210"
    >
      <v-list-item class="pt-6 pb-0 d-flex align-center mb-5">
        <template #prepend>
          <v-img
            class="mr-2"
            height="40"
            src="@/assets/fabrica_nice.png"
            width="40"
          />
        </template>

        <v-list-item-title class="text-h6">
          FabriCatraca
        </v-list-item-title>
      </v-list-item>
      <v-list density="compact" nav>
        <template v-for="item in items" :key="item.title">
          <template v-if="!item?.subitems">
            <!-- Item pai sem subitens -->
            <v-list-item
              :to="item.to"
            >
              <v-icon :icon="item.icon" />
              <v-title class="pl-3">{{ item.title }}</v-title>
            </v-list-item>
          </template>

          <template v-else>
            <!-- Item com subitens -->
            <v-list-group>
              <template #activator="{ props }">
                <v-list-item
                  v-bind="props"
                >
                  <v-icon :icon="item.icon" />
                  <v-title class="pl-3">{{ item.title }}</v-title>
                </v-list-item></template>
              <v-list-item
                v-for="(subitem, index) in item?.subitems || []"
                :key="index"
                class="pr-0"
                :to="subitem.to"
              >
                <v-icon :icon="subitem.icon" />
                <v-title class="pl-3">{{ subitem.title }}</v-title>

              </v-list-item></v-list-group>
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
          append-inner-icon="mdi-microphone"
          auto-select-first
          class="pt-5"
          density="compact"
          item-props
          :items="items"
          menu-icon=""
          placeholder="Search Google or type a URL"
          prepend-inner-icon="mdi-magnify"
          rounded="sm"
          style="max-width: 350px;"
          theme="dark"
          variant="solo-filled"
        />
        <v-spacer />
        <v-sheet class="d-flex align-center pr-5" elevation="0">
          <v-sheet class="d-flex align-center">
            <v-btn stacked>
              <v-badge color="error" content="1" location="top right">
                <v-icon>mdi-email-outline</v-icon>
              </v-badge>
            </v-btn>

            <v-btn stacked>
              <v-badge color="error" dot location="top right">
                <v-icon>mdi-bell-outline</v-icon>
              </v-badge>
            </v-btn>
          </v-sheet>
          <v-card
            class="d-flex align-center px-3"
            elevation="0"
            rounded="lg"
          >
            <v-avatar image="https://tse3.mm.bing.net/th/id/OIP.4yQU3p-Cx4P_mLF7QcesFwAAAA?pid=Api&P=0&h=180" size="32" />

            <div class="ml-2">
              <div class="text-subtitle-2 font-weight-medium">
                {{ authStore.user.name }}
              </div>
              <div class="text-caption text-medium-emphasis">
                {{ authStore.user.registration }}
              </div>
            </div>
          </v-card>
        </v-sheet>
      </v-app-bar>

      <v-sheet class="mr-8 rounded-lg" style="background-color: #EFF5F9; color: #000;">
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
