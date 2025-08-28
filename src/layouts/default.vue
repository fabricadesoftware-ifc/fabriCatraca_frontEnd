<template>
  <v-app>
    <v-navigation-drawer
      border="none"
      permanent
      width="200"
    >
      <v-list-item class="pt-6 pb-0 d-flex align-center mb-5">
        <template v-slot:prepend>
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
          <template v-if="!item.subitems">
            <!-- Item pai sem subitens -->
            <v-list-item
              :prepend-icon="item.icon"
              :title="item.title"
              :to="item.to"
            />
          </template>

          <template v-else>
            <!-- Item com subitens -->
            <v-list-group>
              <template #activator="{ props }">
                <v-list-item
                  v-bind="props"
                  :prepend-icon="item.icon"
                  :title="item.title"
                />
              </template>
              <v-list-item
                v-for="subitem in item.subitems"
                :key="subitem.title"
                class="pr-0"
                :prepend-icon="subitem.icon"
                :title="subitem.title"
                :to="subitem.to"
              />
            </v-list-group>
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
            <v-avatar image="https://cdn.vuetifyjs.com/images/john.png" size="32" />

            <div class="ml-2">
              <div class="text-subtitle-2 font-weight-medium">
                John Doe
              </div>
              <div class="text-caption text-medium-emphasis">
                john.doe@example.com
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

<script lang="ts" setup>
  const items = [
    {
      title: 'Home',
      icon: 'mdi-home',
      to: '/',
    },
    {
      title: 'About',
      icon: 'mdi-information',
      to: '/about',
    },
    {
      title: 'relatorios',
      icon: 'mdi-file-document-outline',
      subitems: [
        {
          title: 'relatorio 1',
          icon: 'mdi-file-document-outline',
          to: '/relatorios',
        },
      ],
    },
  ]
</script>
<style scoped>
.v-autocomplete {
  max-width: 350px;
}
</style>
