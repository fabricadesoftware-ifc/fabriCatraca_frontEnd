/**
 * plugins/vuetify.ts
 *
 * Framework documentation: https://vuetifyjs.com`
 */

// Composables
import { createVuetify } from 'vuetify'
// Styles
import '@mdi/font/css/materialdesignicons.css'
import '@/styles/settings.scss'

import 'vuetify/styles'

// https://vuetifyjs.com/en/introduction/why-vuetify/#feature-guides
export default createVuetify({
  theme: {
    defaultTheme: 'dark',
    themes: {
      light: {
        colors: {
          ifc_primary: '#459C50',
          secondary: '#212227',
          tertiary: '#292A2F',
          quaternary: '#313237',
          quinary: '#393A3F',
          senary: '#414247',
          septenary: '#494A4F',
          octonary: '#515257',
          nonary: '#595A5F',
        },
      },
      dark: {
        colors: {
          ifc_primary: '#459c50',
          ifc_primary_700: '#276737',
          ifc_accent: '#2a9df4',
          ifc_success: '#2bb673',
          ifc_warning: '#f2a900',
          ifc_error: '#e14b4b',
          card_bg: '#ffffff',
          muted_text: '#6b7280',
        },
      },
    },
  },
})
