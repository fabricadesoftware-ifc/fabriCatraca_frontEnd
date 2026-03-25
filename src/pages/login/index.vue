<script setup>
  import Logo from '@/assets/fabrica_nice.png'
  import { useAuthStore } from '@/stores'
  import { infoAuth } from '@/utils/loginInfo'

  const authStore = useAuthStore()

  function handleLogin () {
    authStore.takeDatas(infoAuth.value)
  }
</script>

<template>
  <v-container fluid class="pa-0 d-flex align-center justify-center login-page">
    <v-row class="ma-0 w-100" align="center" justify="center">
      <v-col cols="12" sm="8" md="6" lg="3" class="pa-4">
        <VCard class="pa-6 pa-sm-10" elevation="20" rounded="xl">


          <VCardTitle class="text-subtitle-1 text-center pa-0 pb-4">
            Faça o seu Login
          </VCardTitle>
          <!-- Formulário -->
          <form class="d-flex flex-column ga-6" @submit.prevent="handleLogin">

            <VTextField
            v-for="(infos, i) in infoAuth"
            :key="i"
            v-model="infos.value"
            :label="infos.label"
            :placeholder="infos.placeholder"
            :prepend-icon="infos.prependIcon"
            :rules="infos.rules"
            :type="infos.type"
            rounded="xl"
            variant="outlined"
            hide-details="auto"
            />

            <VCardActions class="pa-0 mt-2">
              <VBtn
              block
              color="primary"
              type="submit"
              size="large"
              rounded="xl"
              >
              Login
            </VBtn>

          </VCardActions>
        </form>
        <VDivider class="mb-6" />
        <!-- Logo + Título -->
        <div class="d-flex flex-column align-center ga-3 mt-4">
          <img
            :src="Logo"
            style="width: 80px; height: auto;"
          >
          <VCardTitle class="text-h6 text-center pa-0">FabriCatraca</VCardTitle>
        </div>

      </VCard>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
.login-page {
  min-height: 100vh;
}
</style>
