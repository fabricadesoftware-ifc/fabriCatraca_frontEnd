# Sistema de Controle de Acesso Escolar

Sistema completo para gerenciamento de controle de acesso em instituições educacionais, desenvolvido com Vue 3, TypeScript e Vuetify.

## 🚀 Funcionalidades

### Painel Administrativo
- **Dashboard**: Visão geral com estatísticas em tempo real
- **Gerenciamento de Usuários**: CRUD completo para alunos e funcionários
- **Controle de Catracas**: Configuração e monitoramento de dispositivos
- **Gestão de Áreas**: Definição de zonas de acesso
- **Logs de Acesso**: Histórico detalhado com filtros avançados
- **Regras de Acesso**: Configuração de permissões e políticas
- **Horários**: Definição de janelas de acesso
- **Portais**: Gerenciamento de pontos de acesso

### Características Técnicas
- ✅ **Vue 3 Composition API** com TypeScript
- ✅ **Vuetify 3** para interface moderna e responsiva
- ✅ **Pinia** para gerenciamento de estado
- ✅ **Vue Router** com roteamento automático
- ✅ **Axios** para comunicação com API
- ✅ **Validação de formulários** integrada
- ✅ **Design responsivo** para tablets e smartphones

## 📁 Estrutura do Projeto

```
src/
├── components/          # Componentes reutilizáveis
├── pages/              # Páginas da aplicação
│   ├── index.vue       # Página inicial
│   └── admin/          # Páginas administrativas
│       ├── index.vue   # Dashboard
│       ├── users.vue   # Gerenciamento de usuários
│       ├── devices.vue # Gerenciamento de catracas
│       ├── areas.vue   # Gerenciamento de áreas
│       └── access-logs.vue # Logs de acesso
├── layouts/            # Layouts da aplicação
│   ├── default.vue     # Layout padrão
│   └── admin.vue       # Layout administrativo
├── services/           # Serviços de API (TypeScript)
├── types/              # Definições de tipos TypeScript
├── stores/             # Stores Pinia
└── plugins/            # Plugins (Vuetify, Axios)
```

## 🛠️ Instalação e Configuração

### Pré-requisitos
- Node.js 18+ 
- npm, yarn ou pnpm

### Instalação
```bash
# Instalar dependências
npm install

# Executar em modo desenvolvimento
npm run dev

# Build para produção
npm run build

# Verificação de tipos TypeScript
npm run type-check
```

### Variáveis de Ambiente
Crie um arquivo `.env` na raiz do projeto:

```env
VITE_API_URL=http://localhost:8000/api
```

## 🎯 Uso da Interface

### 1. Página Inicial
- Acesse a aplicação e veja as opções disponíveis
- Clique em "Painel Administrativo" para acessar o sistema

### 2. Dashboard Administrativo
- **Cards de Status**: Visualize estatísticas em tempo real
- **Navegação Rápida**: Acesso direto às principais funcionalidades
- **Últimos Acessos**: Monitoramento dos eventos recentes

### 3. Gerenciamento de Usuários
- **Listagem**: Visualize todos os usuários cadastrados
- **Filtros**: Busque por nome, tipo de usuário ou status
- **CRUD**: Crie, edite e exclua usuários
- **Associação**: Vincule usuários a dispositivos de acesso

### 4. Controle de Catracas
- **Status**: Monitore dispositivos online/offline
- **Configuração**: Configure IP, usuário e parâmetros
- **Teste**: Teste conectividade com dispositivos
- **Sincronização**: Sincronize dados com catracas

### 5. Logs de Acesso
- **Filtros Avançados**: Filtre por data, usuário, dispositivo, tipo de evento
- **Estatísticas**: Visualize resumos de acessos concedidos/negados
- **Detalhes**: Veja informações completas de cada evento
- **Exportação**: Exporte logs para análise

## 🔧 Desenvolvimento

### Adicionando Novas Páginas
1. Crie o arquivo em `src/pages/admin/`
2. Use o layout administrativo automaticamente
3. Adicione a rota no menu do layout

### Adicionando Novos Serviços
1. Crie o serviço em `src/services/`
2. Defina os tipos em `src/types/`
3. Importe e use nos componentes

### Padrões de Código
- Use **Composition API** com `<script setup>`
- Implemente **validação de formulários**
- Use **TypeScript** para tipagem
- Siga os **padrões do Vuetify**

## 📊 API Integration

O sistema está preparado para integrar com APIs REST que retornem dados no formato:

```typescript
// Resposta paginada
{
  count: number,
  next: string | null,
  previous: string | null,
  results: T[]
}

// Resposta individual
{
  data: T,
  message?: string,
  status?: number
}
```

## 🎨 Personalização

### Temas
- O sistema suporta temas claro/escuro
- Personalize cores no arquivo `src/plugins/vuetify.ts`

### Componentes
- Todos os componentes são customizáveis
- Use as variáveis CSS do Vuetify para consistência

## 📱 Responsividade

A interface é totalmente responsiva e funciona em:
- ✅ Desktop
- ✅ Tablet
- ✅ Smartphone

## 🔒 Segurança

- Validação de formulários no frontend
- Sanitização de dados
- Controle de acesso por rotas
- Logs de auditoria

## 🚀 Deploy

### Build para Produção
```bash
npm run build
```

### Servidor de Produção
```bash
npm run preview
```

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

---

Desenvolvido com ❤️ para instituições educacionais
