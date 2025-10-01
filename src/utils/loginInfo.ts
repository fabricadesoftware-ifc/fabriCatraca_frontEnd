import { ref } from 'vue'

export const infoAuth = ref([
  {
    placeholder: 'ex: joe.doe@gmail.com',
    prependIcon: 'mdi-email',
    label: 'Email',
    type: 'email',
    model: 'email',
    value: '',
    rules: [(v: string) => !!v || 'preencha o campo de email', (v: string) => /.+@.+\..+/.test(v) || 'E-mail inválido'],
  },
  {
    type: 'password',
    label: 'senha',
    prependIcon: 'mdi-lock',
    placeholder: 'ex: password123@#',
    model: 'password',
    value: '',
    rules: [(v: string) => !!v || 'preencha o campo de senha'],
  },
])
