<template>
  <v-footer
    app
    height="40"
    relative
  >
    <a
      v-for="item in items"
      :key="item.title"
      class="d-inline-block mx-2 social-link"
      :href="item.href"
      rel="noopener noreferrer"
      target="_blank"
      :title="item.title"
    >
      <template v-if="item.logo">
        <img
          :alt="item.title"
          class="social-logo"
          :height="20"
          :src="item.logo"
          :width="30"
        >
      </template>
      <template v-else>
        <v-icon
          :icon="item.icon"
          :size="item.icon === '$vuetify' ? 24 : 16"
        />
      </template>
    </a>

    <div
      class="text-caption text-disabled absolute bottom-0 mb-2"
      style="position: absolute; right: 32px;"
    >
      &copy; {{ (new Date()).getFullYear() }} <span class="d-none d-sm-inline-block">Fabrica De Software</span>
    </div>
  </v-footer>
</template>

<script setup lang="ts">
  import logoFabrica from '@/assets/fabrica_nice.png'
  const items = [
    {
      title: 'Fabrica De Software',
      logo: logoFabrica,
      href: 'https://fabricadesoftware.ifc.edu.br/',
    },
    {
      title: 'Github',
      icon: 'mdi-github',
      href: 'https://github.com/fabricadesoftware-ifc',
    },
    {
      title: 'Linkedin',
      icon: `mdi-linkedin`,
      href: 'https://www.linkedin.com/company/fabricadesoftware-ifc/',
    },
  ]
</script>

<style scoped lang="sass">
  .social-link :deep(.v-icon)
    color: rgba(var(--v-theme-on-background), var(--v-disabled-opacity))
    text-decoration: none
    transition: .2s ease-in-out

    &:hover
      color: rgba(25, 118, 210, 1)
</style>
