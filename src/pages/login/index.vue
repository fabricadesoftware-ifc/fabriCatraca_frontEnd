<script setup>
import { infoAuth } from '@/utils/loginInfo'
import Logo from '@/assets/fabrica_nice.png'
import { useAuthStore } from '@/stores'

const authStore = useAuthStore()

</script>
<template>
  <div class="d-flex justify-center align-center" style="height: 100vh;">
    <div class="bg-white w-50 h-screen d-flex justify-center align-center w-full">
      <VCard class="w-full w-100 pa-10 d-flex align-center justify-center  ga-5" elevation="20" rounded="xl">
        <div class="d-flex flex-column w-50 align-center ga-5">
          <img width="100" height="70" :src="Logo" style="top: -50px; left: 350px;" />
          <VCardTitle>FabriCatraca</VCardTitle>
        </div>
        <VDivider vertical></VDivider>
        <div class="w-100 d-flex justify-center align-center flex-column ga-5 pa-5">
          <VCardTitle>faça o seu Login</VCardTitle>
          <VTextField v-for="infos, i in infoAuth" :key="i" :prepend-icon="infos.prependIcon" :rules="infos.rules"
            :type="infos.type" :placeholder="infos.placeholder" :label="infos.label" v-model="infos.value" variant="outlined" rounded="xl" class="w-100"/>
          <VCardActions class="w-full d-flex justify-center align-center">
            <VBtn color="primary" class="w-25" @click="authStore.takeDatas(infoAuth)">Login</VBtn>
          </VCardActions>
        </div>
      </VCard>
    </div>
  </div>
</template>
