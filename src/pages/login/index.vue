<script setup>
import { useAuthStore } from "@/stores";
import { infoAuth } from "@/utils/loginInfo";

const authStore = useAuthStore();

function handleLogin() {
  authStore.takeDatas(infoAuth.value);
}

function abrirSite() {
  window.open("https://fabricadesoftware.ifc.edu.br/", "_blank");
}
</script>

<template>
  <v-app style="background: #131313">
    <!-- Top App Bar -->
    <v-app-bar flat color="transparent" class="px-2">
      <v-app-bar-title>
        <span class="text-h6 font-weight-bold" style="letter-spacing: 0.1em"> FabriCatraca </span>
      </v-app-bar-title>
      <template #append>
        <v-btn icon variant="text" style="color: #adc7ff" @click="abrirSite()">
          <v-icon>mdi-help-circle-outline</v-icon>
        </v-btn>
      </template>
    </v-app-bar>

    <!-- Main Content -->
    <v-main>
      <v-container
        fluid
        class="d-flex align-center justify-center"
        style="min-height: 100%; position: relative; overflow: hidden"
      >
        <!-- Glow de fundo -->
        <div
          style="
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 100%;
            max-width: 900px;
            height: 384px;
            background: #4a8eff;
            filter: blur(120px);
            border-radius: 9999px;
            opacity: 0.1;
            pointer-events: none;
          "
        />

        <!-- Card de Login -->
        <v-card
          width="100%"
          max-width="448"
          :style="{
            background: '#2a2a2a',
            borderRadius: '12px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
            overflow: 'hidden',
            position: 'relative',
            zIndex: 10,
          }"
          flat
        >
          <!-- Corpo do card -->
          <div class="pa-8 pa-md-10">
            <!-- Header -->
            <div class="text-center mb-10">
              <h1 class="text-h5 font-weight-bold" style="color: #e5e2e1; letter-spacing: -0.02em">
                Faça o seu Login
              </h1>
              <p class="text-body-2 mt-2 font-weight-medium" style="color: #c1c6d7">
                Acesse o sistema de controle de acesso
              </p>
            </div>

            <!-- Formulário -->
            <form class="d-flex flex-column ga-6" @submit.prevent="handleLogin">
              <div v-for="(infos, i) in infoAuth" :key="i" class="d-flex flex-column ga-1">
                <label
                  class="text-caption font-weight-bold text-uppercase ml-1"
                  style="letter-spacing: 0.1em; color: #adc7ff"
                >
                  {{ infos.label }}
                </label>
                <v-text-field
                  v-model="infos.value"
                  :placeholder="infos.placeholder"
                  :prepend-inner-icon="infos.prependIcon"
                  :rules="infos.rules"
                  :type="infos.type"
                  rounded="xl"
                  variant="outlined"
                  hide-details="auto"
                  base-color="#414754"
                  color="#ADC7FF"
                  bg-color="#0e0e0e"
                  :style="{ '--v-field-border-opacity': '0.2' }"
                />
              </div>

              <!-- Botão de Login -->
              <v-btn
                block
                type="submit"
                size="large"
                rounded="pill"
                class="font-weight-bold text-uppercase mt-2"
                style="
                  background: linear-gradient(135deg, #4a8eff, #adc7ff);
                  color: #00285b;
                  letter-spacing: 0.15em;
                  font-size: 0.8rem;
                  padding-top: 28px;
                  padding-bottom: 28px;
                "
                elevation="6"
              >
                Login
              </v-btn>
            </form>
          </div>
        </v-card>
      </v-container>
    </v-main>

    <!-- Footer -->
    <v-footer color="transparent" class="justify-center" height="1">
      <span class="text-caption font-weight-medium" style="color: rgba(193, 198, 215, 0.4)">
        © {{ new Date().getFullYear() }} Fabrica De Software. Todos os direitos reservados.
      </span>
    </v-footer>
  </v-app>
</template>
