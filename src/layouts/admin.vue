<template>
  <v-app>
    <!-- App Bar -->
    <v-app-bar
      app
      color="primary"
      dark
      elevation="0"
    >
      <v-app-bar-nav-icon @click="drawer = !drawer" />

      <v-toolbar-title class="d-flex align-center">
        <v-icon class="mr-2">mdi-school</v-icon>
        Sistema de Controle de Acesso Escolar
      </v-toolbar-title>

      <v-spacer />

      <v-btn
        icon
        :loading="configStore.syncing"
        @click="syncData"
      >
        <v-tooltip activator="parent">
          Sincronizar Dados
        </v-tooltip>
        <v-icon>mdi-sync</v-icon>
      </v-btn>

      <v-btn icon @click="toggleTheme">
        <v-icon>{{ themeIcon }}</v-icon>
      </v-btn>

      <v-menu offset-y>
        <template #activator="{ props }">
          <v-btn
            icon
            v-bind="props"
          >
            <v-icon>mdi-account-circle</v-icon>
          </v-btn>
        </template>
        <v-list>
          <v-list-item @click="navigateTo('/admin/profile')">
            <v-list-item-title>
              <v-icon class="mr-2">mdi-account</v-icon>
              Perfil
            </v-list-item-title>
          </v-list-item>
          <v-list-item @click="logout">
            <v-list-item-title>
              <v-icon class="mr-2">mdi-logout</v-icon>
              Sair
            </v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-app-bar>

    <!-- Navigation Drawer -->
    <v-navigation-drawer
      v-model="drawer"
      app
      color="surface"
      width="280"
    >
      <v-list>
        <v-list-item
          prepend-avatar="https://cdn.vuetifyjs.com/images/john.jpg"
          subtitle="admin@escola.com"
          title="Administrador"
        />
      </v-list>

      <v-divider />

      <v-list density="compact" nav>
        <v-list-item
          v-for="item in menuItems"
          :key="item.title"
          class="mb-1"
          :prepend-icon="item.icon"
          rounded="lg"
          :subtitle="item.subtitle"
          :title="item.title"
          :to="item.route"
        />
      </v-list>

      <template #append>
        <v-divider />
        <v-list density="compact" nav>
          <v-list-item
            prepend-icon="mdi-cog"
            rounded="lg"
            subtitle="Sistema"
            title="Configurações"
            to="/admin/settings"
          />
        </v-list>
      </template>
    </v-navigation-drawer>

    <!-- Main Content -->
    <v-main>
      <router-view />
    </v-main>

    <!-- Footer -->
    <v-footer app class="text-center">
      <span>&copy; {{ new Date().getFullYear() }} Sistema de Controle de Acesso Escolar</span>
    </v-footer>
  </v-app>
</template>

<script setup lang="ts">
  import { computed, ref } from 'vue'
  import { useRouter } from 'vue-router'
  import { useTheme } from 'vuetify'
  import { useConfigStore } from '@/stores/config'

  const router = useRouter()
  const theme = useTheme()
  const configStore = useConfigStore()

  // Estado reativo
  const drawer = ref(true)

  // Menu items
  const menuItems = [
    {
      title: 'Dashboard',
      subtitle: 'Visão geral do sistema',
      icon: 'mdi-view-dashboard',
      route: '/admin',
    },
    {
      title: 'Usuários',
      subtitle: 'Alunos e funcionários',
      icon: 'mdi-account-group',
      route: '/admin/users',
    },
    {
      title: 'Catracas',
      subtitle: 'Dispositivos de acesso',
      icon: 'mdi-door-open',
      route: '/admin/devices',
    },
    {
      title: 'Áreas',
      subtitle: 'Zonas de acesso',
      icon: 'mdi-map-marker',
      route: '/admin/areas',
    },
    {
      title: 'Grupos',
      subtitle: 'Organização de usuários',
      icon: 'mdi-account-multiple',
      route: '/admin/groups',
    },
    {
      title: 'Regras de Acesso',
      subtitle: 'Permissões e políticas',
      icon: 'mdi-shield-account',
      route: '/admin/access-rules',
    },
    {
      title: 'Horários',
      subtitle: 'Janelas de acesso',
      icon: 'mdi-clock',
      route: '/admin/time-zones',
    },
    {
      title: 'Portais',
      subtitle: 'Pontos de acesso',
      icon: 'mdi-door',
      route: '/admin/portals',
    },
    {
      title: 'Logs de Acesso',
      subtitle: 'Histórico de acessos',
      icon: 'mdi-file-document',
      route: '/admin/access-logs',
    },
  ]

  // Computed
  const themeIcon = computed(() => {
    return theme.global.current.value.dark ? 'mdi-weather-sunny' : 'mdi-weather-night'
  })

  // Métodos
  const toggleTheme = () => {
    theme.global.name.value = theme.global.current.value.dark ? 'light' : 'dark'
  }

  const navigateTo = (route: string) => {
    router.push(route)
  }

  const logout = () => {
    // TODO: Implementar logout
    console.log('Logout')
    router.push('/login')
  }

  const syncData = async () => {
    try {
      await configStore.syncData()
      // TODO: Atualizar dados das stores após sincronização
    } catch (error) {
      console.error('Erro ao sincronizar dados:', error)
    }
  }
</script>

<style scoped>
.v-list-item {
  margin-bottom: 4px;
}
</style>
