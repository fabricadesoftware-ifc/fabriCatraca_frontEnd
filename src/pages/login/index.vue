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
  <div class="d-flex justify-center align-center" style="height: 100vh;">
    <div class="bg-white w-50 h-screen d-flex justify-center align-center w-full">
      <VCard class="w-full w-100 pa-10 d-flex align-center justify-center ga-5" elevation="20" rounded="xl">
        <div class="d-flex flex-column w-50 align-center ga-5">
          <img
            height="70"
            :src="Logo"
            style="top: -50px; width: 100px; left: 350px;"
          >
          <VCardTitle>FabriCatraca</VCardTitle>
        </div>
        <VDivider vertical />

        <!-- 🔥 Formulário para permitir Enter -->
        <form class="w-100 d-flex justify-center align-center flex-column ga-5 pa-5" @submit.prevent="handleLogin">
          <VCardTitle>faça o seu Login</VCardTitle>
          <VTextField
            v-for="(infos, i) in infoAuth"
            :key="i"
            v-model="infos.value"
            class="w-100"
            :label="infos.label"
            :placeholder="infos.placeholder"
            :prepend-icon="infos.prependIcon"
            rounded="xl"
            :rules="infos.rules"
            :type="infos.type"
            variant="outlined"
          />
          <VCardActions class="w-full d-flex justify-center align-center">
            <!-- type="submit" faz com que o Enter funcione -->
            <VBtn
              class="w-25"
              color="primary"
              type="submit"
            >Login</VBtn>
          </VCardActions>
        </form>
      </VCard>
    </div>
  </div>
</template>
