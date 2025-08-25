<template>
  <v-container class="fill-height" max-width="900">
    <div class="text-center">
      <v-img
        class="mb-4 mx-auto"
        height="150"
        src="@/assets/logo.png"
        width="150"
      />

      <div class="mb-8">
        <div class="text-body-2 font-weight-light mb-n1">Bem-vindo ao</div>
        <h1 class="text-h2 font-weight-bold">Sistema de Controle de Acesso Escolar</h1>
        <p class="text-body-1 text-medium-emphasis mt-4">
          Gerencie o controle de acesso da sua instituição de forma eficiente e segura
        </p>
      </div>

      <v-row justify="center">
        <v-col cols="12" md="4" sm="6">
          <v-card
            class="py-6 text-center cursor-pointer"
            color="primary"
            dark
            hover
            @click="navigateToAdmin"
          >
            <v-icon class="mb-4" size="64">mdi-school</v-icon>
            <h2 class="text-h5 font-weight-bold mb-2">
              Painel Administrativo
            </h2>
            <p class="text-body-2">
              Acesse o painel completo de gerenciamento
            </p>
          </v-card>
        </v-col>

        <v-col cols="12" md="4" sm="6">
          <v-card
            class="py-6 text-center cursor-pointer"
            color="success"
            dark
            hover
            @click="navigateToLogs"
          >
            <v-icon class="mb-4" size="64">mdi-file-document</v-icon>
            <h2 class="text-h5 font-weight-bold mb-2">
              Logs de Acesso
            </h2>
            <p class="text-body-2">
              Visualize o histórico de acessos
            </p>
          </v-card>
        </v-col>

        <v-col cols="12" md="4" sm="6">
          <v-card
            class="py-6 text-center cursor-pointer"
            color="info"
            dark
            hover
            @click="navigateToUsers"
          >
            <v-icon class="mb-4" size="64">mdi-account-group</v-icon>
            <h2 class="text-h5 font-weight-bold mb-2">
              Gerenciar Usuários
            </h2>
            <p class="text-body-2">
              Cadastre e gerencie alunos e funcionários
            </p>
          </v-card>
        </v-col>
      </v-row>

      <v-row class="mt-8" justify="center">
        <v-col cols="12" md="8">
          <v-card class="pa-6" color="surface-variant" variant="tonal">
            <h3 class="text-h6 font-weight-bold mb-4">Funcionalidades Principais</h3>
            <v-row>
              <v-col
                v-for="feature in features"
                :key="feature.title"
                cols="12"
                md="3"
                sm="6"
              >
                <div class="text-center">
                  <v-icon class="mb-2" :color="feature.color" size="32">
                    {{ feature.icon }}
                  </v-icon>
                  <div class="text-body-2 font-weight-medium">{{ feature.title }}</div>
                  <div class="text-caption text-medium-emphasis">{{ feature.description }}</div>
                </div>
              </v-col>
            </v-row>
          </v-card>
        </v-col>
      </v-row>
    </div>
  </v-container>
</template>

<script setup lang="ts">
  import { useRouter } from 'vue-router'

  const router = useRouter()

  const features = [
    {
      title: 'Controle de Acesso',
      description: 'Gerencie permissões e horários',
      icon: 'mdi-shield-account',
      color: 'primary',
    },
    {
      title: 'Monitoramento',
      description: 'Acompanhe acessos em tempo real',
      icon: 'mdi-monitor-dashboard',
      color: 'success',
    },
    {
      title: 'Relatórios',
      description: 'Gere relatórios detalhados',
      icon: 'mdi-chart-line',
      color: 'info',
    },
    {
      title: 'Segurança',
      description: 'Sistema seguro e confiável',
      icon: 'mdi-security',
      color: 'warning',
    },
  ]

  const navigateToAdmin = () => {
    router.push('/admin')
  }

  const navigateToLogs = () => {
    router.push('/admin/access-logs')
  }

  const navigateToUsers = () => {
    router.push('/admin/users')
  }
</script>

<style scoped>
.cursor-pointer {
  cursor: pointer;
}
</style>
