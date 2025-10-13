<template>
  <v-dialog
    max-width="1200px"
    :model-value="modelValue"
    persistent
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <v-card>
      <v-card-title class="d-flex align-center justify-space-between">
        <span class="text-h5">
          <v-icon class="mr-2">
            mdi-cog
          </v-icon>
          Configurações da Catraca
        </span>
        <v-btn
          icon="mdi-close"
          variant="text"
          @click="close"
        />
      </v-card-title>

      <v-card-subtitle v-if="device">
        {{ device.name }} - {{ device.ip }}
      </v-card-subtitle>

      <v-divider />

      <v-card-text style="max-height: 70vh; overflow-y: auto;">
        <v-tabs v-model="tab" color="primary">
          <v-tab value="system">
            <v-icon class="mr-2">
              mdi-application-cog
            </v-icon>
            Sistema
          </v-tab>
          <v-tab value="hardware">
            <v-icon class="mr-2">
              mdi-chip
            </v-icon>
            Hardware
          </v-tab>
          <v-tab value="security">
            <v-icon class="mr-2">
              mdi-shield-lock
            </v-icon>
            Segurança
          </v-tab>
          <v-tab value="ui">
            <v-icon class="mr-2">
              mdi-monitor
            </v-icon>
            Interface
          </v-tab>
          <v-tab value="catra">
            <v-icon class="mr-2">
              mdi-turnstile
            </v-icon>
            Catraca
          </v-tab>
          <v-tab value="push">
            <v-icon class="mr-2">
              mdi-server-network
            </v-icon>
            Push Server
          </v-tab>
          <v-tab value="monitor">
            <v-icon class="mr-2">
              mdi-monitor-eye
            </v-icon>
            Monitor
          </v-tab>
        </v-tabs>

        <v-window v-model="tab" class="mt-4">
          <!-- System Config -->
          <v-window-item value="system">
            <v-alert
              class="mb-4"
              color="info"
              icon="mdi-information"
              variant="tonal"
            >
              Configurações gerais do sistema da catraca
            </v-alert>
            <v-row>
              <v-col cols="12" md="6">
                <v-switch
                  v-model="systemForm.online"
                  color="primary"
                  hide-details
                  label="Modo Online"
                />
                <span class="text-caption text-grey">
                  Se ativado, a catraca se comunica com o servidor
                </span>
              </v-col>

              <v-col cols="12" md="6">
                <v-switch
                  v-model="systemForm.auto_reboot"
                  color="primary"
                  hide-details
                  label="Reinicialização Automática"
                />
                <span class="text-caption text-grey">
                  Reinicia automaticamente em caso de problemas
                </span>
              </v-col>

              <v-col cols="12" md="6">
                <v-switch
                  v-model="systemForm.local_identification"
                  color="primary"
                  hide-details
                  label="Identificação Local"
                />
                <span class="text-caption text-grey">
                  Permite identificação sem servidor
                </span>
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field
                  v-model.number="systemForm.catra_timeout"
                  hide-details
                  label="Timeout da Catraca (segundos)"
                  type="number"
                  variant="outlined"
                />
              </v-col>

              <v-col cols="12" md="6">
                <v-select
                  v-model="systemForm.exception_mode"
                  hide-details
                  :items="exceptionModeOptions"
                  label="Modo de Exceção"
                  variant="outlined"
                />
              </v-col>

              <v-col cols="12" md="6">
                <v-select
                  v-model="systemForm.language"
                  hide-details
                  :items="languageOptions"
                  label="Idioma"
                  variant="outlined"
                />
              </v-col>

              <v-col class="d-flex justify-end" cols="12">
                <v-btn
                  color="primary"
                  :loading="saving"
                  variant="elevated"
                  @click="saveSystemConfig"
                >
                  <v-icon class="mr-2">
                    mdi-content-save
                  </v-icon>
                  Salvar Configurações de Sistema
                </v-btn>
              </v-col>
            </v-row>
          </v-window-item>

          <!-- Hardware Config -->
          <v-window-item value="hardware">
            <v-row>
              <v-col cols="12" md="6">
                <v-switch
                  v-model="hardwareForm.beep_enabled"
                  color="primary"
                  hide-details
                  label="Beep Habilitado"
                />
                <span class="text-caption text-grey">
                  Emite beep sonoro em eventos
                </span>
              </v-col>

              <v-col cols="12" md="6">
                <v-switch
                  v-model="hardwareForm.bell_enabled"
                  color="primary"
                  hide-details
                  label="Sino Habilitado"
                />
                <span class="text-caption text-grey">
                  Ativa sino em eventos
                </span>
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field
                  v-model.number="hardwareForm.bell_relay"
                  hide-details
                  label="Relé do Sino (1-4)"
                  max="4"
                  min="1"
                  type="number"
                  variant="outlined"
                />
              </v-col>

              <v-col cols="12" md="6">
                <v-switch
                  v-model="hardwareForm.siren_enabled"
                  color="primary"
                  hide-details
                  label="Sirene Habilitada"
                />
                <span class="text-caption text-grey">
                  Ativa sirene de alarme
                </span>
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field
                  v-model.number="hardwareForm.siren_relay"
                  hide-details
                  label="Relé da Sirene (1-4)"
                  max="4"
                  min="1"
                  type="number"
                  variant="outlined"
                />
              </v-col>

              <v-col class="d-flex justify-end" cols="12">
                <v-btn
                  color="primary"
                  :loading="saving"
                  variant="elevated"
                  @click="saveHardwareConfig"
                >
                  <v-icon class="mr-2">
                    mdi-content-save
                  </v-icon>
                  Salvar Configurações de Hardware
                </v-btn>
              </v-col>
            </v-row>
          </v-window-item>

          <!-- Security Config -->
          <v-window-item value="security">
            <v-row>
              <v-col cols="12" md="6">
                <v-switch
                  v-model="securityForm.verbose_logging"
                  color="primary"
                  hide-details
                  label="Logs Detalhados"
                />
                <span class="text-caption text-warning">
                  ⚠️ Pode encher o storage rapidamente
                </span>
              </v-col>

              <v-col cols="12" md="6">
                <v-select
                  v-model="securityForm.log_type"
                  hide-details
                  :items="logTypeOptions"
                  label="Tipo de Log"
                  variant="outlined"
                />
              </v-col>

              <v-col cols="12" md="6">
                <v-switch
                  v-model="securityForm.multi_factor_authentication"
                  color="primary"
                  hide-details
                  label="Autenticação Multifator"
                />
                <span class="text-caption text-grey">
                  Requer múltiplos fatores de identificação
                </span>
              </v-col>

              <v-col class="d-flex justify-end" cols="12">
                <v-btn
                  color="primary"
                  :loading="saving"
                  variant="elevated"
                  @click="saveSecurityConfig"
                >
                  <v-icon class="mr-2">
                    mdi-content-save
                  </v-icon>
                  Salvar Configurações de Segurança
                </v-btn>
              </v-col>
            </v-row>
          </v-window-item>

          <!-- UI Config -->
          <v-window-item value="ui">
            <v-row>
              <v-col cols="12" md="6">
                <v-slider
                  v-model="uiForm.display_brightness"
                  hide-details
                  label="Brilho do Display"
                  max="100"
                  min="0"
                  step="5"
                  thumb-label
                />
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field
                  v-model.number="uiForm.display_timeout"
                  hide-details
                  label="Timeout do Display (segundos)"
                  suffix="0 = sempre ligado"
                  type="number"
                  variant="outlined"
                />
              </v-col>

              <v-col cols="12" md="6">
                <v-switch
                  v-model="uiForm.keyboard_backlight"
                  color="primary"
                  hide-details
                  label="Luz de Fundo do Teclado"
                />
              </v-col>

              <v-col cols="12">
                <v-text-field
                  v-model="uiForm.welcome_message"
                  hide-details
                  label="Mensagem de Boas-Vindas"
                  variant="outlined"
                />
              </v-col>

              <v-col cols="12">
                <v-text-field
                  v-model="uiForm.access_denied_message"
                  hide-details
                  label="Mensagem de Acesso Negado"
                  variant="outlined"
                />
              </v-col>

              <v-col class="d-flex justify-end" cols="12">
                <v-btn
                  color="primary"
                  :loading="saving"
                  variant="elevated"
                  @click="saveUIConfig"
                >
                  <v-icon class="mr-2">
                    mdi-content-save
                  </v-icon>
                  Salvar Configurações de Interface
                </v-btn>
              </v-col>
            </v-row>
          </v-window-item>

          <!-- Catra Config -->
          <v-window-item value="catra">
            <v-row>
              <v-col cols="12" md="6">
                <v-switch
                  v-model="catraForm.anti_passback"
                  color="primary"
                  hide-details
                  label="Anti-Passback"
                />
                <span class="text-caption text-grey">
                  Impede entradas/saídas duplicadas
                </span>
              </v-col>

              <v-col cols="12" md="6">
                <v-switch
                  v-model="catraForm.daily_reset"
                  color="primary"
                  hide-details
                  label="Reset Diário"
                />
                <span class="text-caption text-grey">
                  Reseta contadores à meia-noite
                </span>
              </v-col>

              <v-col cols="12" md="6">
                <v-select
                  v-model="catraForm.gateway"
                  hide-details
                  :items="gatewayOptions"
                  label="Sentido do Giro"
                  variant="outlined"
                />
              </v-col>

              <v-col cols="12" md="6">
                <v-select
                  v-model="catraForm.operation_mode"
                  hide-details
                  :items="operationModeOptions"
                  label="Modo de Operação"
                  variant="outlined"
                />
              </v-col>

              <v-col class="d-flex justify-end" cols="12">
                <v-btn
                  color="primary"
                  :loading="saving"
                  variant="elevated"
                  @click="saveCatraConfig"
                >
                  <v-icon class="mr-2">
                    mdi-content-save
                  </v-icon>
                  Salvar Configurações da Catraca
                </v-btn>
              </v-col>
            </v-row>
          </v-window-item>

          <!-- Push Server Config -->
          <v-window-item value="push">
            <v-row>
              <v-col cols="12">
                <v-text-field
                  v-model="pushServerForm.push_remote_address"
                  hide-details
                  label="Endereço do Servidor Push"
                  placeholder="https://meuservidor.com/api/events"
                  variant="outlined"
                />
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field
                  v-model.number="pushServerForm.push_request_timeout"
                  hide-details
                  label="Timeout (ms)"
                  type="number"
                  variant="outlined"
                />
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field
                  v-model.number="pushServerForm.push_request_period"
                  hide-details
                  label="Período (segundos)"
                  type="number"
                  variant="outlined"
                />
              </v-col>

              <v-col class="d-flex justify-end" cols="12">
                <v-btn
                  color="primary"
                  :loading="saving"
                  variant="elevated"
                  @click="savePushServerConfig"
                >
                  <v-icon class="mr-2">
                    mdi-content-save
                  </v-icon>
                  Salvar Configurações do Push Server
                </v-btn>
              </v-col>
            </v-row>
          </v-window-item>

          <!-- Monitor Config -->
          <v-window-item value="monitor">
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="monitorForm.hostname"
                  hide-details
                  label="Hostname"
                  placeholder="192.168.0.100"
                  variant="outlined"
                />
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field
                  v-model="monitorForm.port"
                  hide-details
                  label="Porta"
                  placeholder="8000"
                  variant="outlined"
                />
              </v-col>

              <v-col cols="12">
                <v-text-field
                  v-model="monitorForm.path"
                  hide-details
                  label="Path"
                  placeholder="api/control_id_monitor/notifications/dao"
                  variant="outlined"
                />
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field
                  v-model.number="monitorForm.request_timeout"
                  hide-details
                  label="Timeout (ms)"
                  type="number"
                  variant="outlined"
                />
              </v-col>

              <v-col v-if="monitorConfig?.full_url" cols="12">
                <v-alert
                  color="info"
                  icon="mdi-information"
                  variant="tonal"
                >
                  <strong>URL Completa:</strong> {{ monitorConfig.full_url }}
                </v-alert>
              </v-col>

              <v-col v-if="monitorConfig?.id" cols="12">
                <v-btn
                  block
                  color="success"
                  variant="outlined"
                  @click="activateMonitor"
                >
                  <v-icon class="mr-2">
                    mdi-play
                  </v-icon>
                  Ativar Monitor
                </v-btn>
              </v-col>

              <v-col class="d-flex justify-end" cols="12">
                <v-btn
                  color="primary"
                  :loading="saving"
                  variant="elevated"
                  @click="saveMonitorConfig"
                >
                  <v-icon class="mr-2">
                    mdi-content-save
                  </v-icon>
                  Salvar Configurações do Monitor
                </v-btn>
              </v-col>
            </v-row>
          </v-window-item>
        </v-window>
      </v-card-text>

      <v-divider />

      <v-card-actions>
        <v-spacer />
        <v-btn
          color="grey"
          variant="text"
          @click="close"
        >
          Fechar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
  import type { Device } from '@/types'

  import { storeToRefs } from 'pinia'
  import { onMounted, reactive, ref, watch } from 'vue'
  import { toast } from 'vue3-toastify'

  import { useControlIdConfigStore } from '@/stores'

  const props = defineProps<{
    modelValue: boolean
    device: Device | null
  }>()

  const emit = defineEmits<{
    (e: 'update:modelValue', value: boolean): void
    (e: 'saved'): void
  }>()

  const configStore = useControlIdConfigStore()

  const tab = ref('system')
  const saving = ref(false)

  const systemForm = reactive({
    online: true,
    auto_reboot: true,
    catra_timeout: 30,
    local_identification: true,
    exception_mode: 'none' as 'none' | 'free' | 'blocked',
    language: 'pt_BR' as 'pt_BR' | 'en_US' | 'es_ES',
  })

  const hardwareForm = reactive({
    beep_enabled: true,
    bell_enabled: true,
    bell_relay: 1,
    exception_mode: false,
    siren_enabled: false,
    siren_relay: 2,
  })

  const securityForm = reactive({
    verbose_logging: false,
    log_type: 0 as 0 | 1 | 2,
    multi_factor_authentication: false,
  })

  const uiForm = reactive({
    display_brightness: 80,
    display_timeout: 30,
    keyboard_backlight: true,
    welcome_message: 'Bem-vindo',
    access_denied_message: 'Acesso Negado',
  })

  const catraForm = reactive({
    anti_passback: true,
    daily_reset: true,
    gateway: 'clockwise' as 'clockwise' | 'anticlockwise',
    operation_mode: 'blocked' as 'blocked' | 'entrance_open' | 'exit_open' | 'both_open',
  })

  const pushServerForm = reactive({
    push_request_timeout: 15_000,
    push_request_period: 60,
    push_remote_address: '',
  })

  const monitorForm = reactive({
    hostname: '',
    port: '8000',
    path: 'api/control_id_monitor/notifications/dao',
    request_timeout: 5000,
  })

  // Options
  const exceptionModeOptions = [
    { title: 'Normal', value: 'none' },
    { title: 'Liberado (⚠️ Cuidado!)', value: 'free' },
    { title: 'Bloqueado (⚠️ Cuidado!)', value: 'blocked' },
  ]

  const languageOptions = [
    { title: 'Português (BR)', value: 'pt_BR' },
    { title: 'English (US)', value: 'en_US' },
    { title: 'Español (ES)', value: 'es_ES' },
  ]

  const logTypeOptions = [
    { title: 'Normal', value: 0 },
    { title: 'Detalhado', value: 1 },
    { title: 'Debug (⚠️ Cuidado!)', value: 2 },
  ]

  const gatewayOptions = [
    { title: 'Horário', value: 'clockwise' },
    { title: 'Anti-horário', value: 'anticlockwise' },
  ]

  const operationModeOptions = [
    { title: 'Ambas Controladas', value: 'blocked' },
    { title: 'Entrada Liberada', value: 'entrance_open' },
    { title: 'Saída Liberada', value: 'exit_open' },
    { title: 'Ambas Liberadas', value: 'both_open' },
  ]

  const { systemConfig, hardwareConfig, securityConfig, uiConfig, catraConfig, pushServerConfig, monitorConfig } = storeToRefs(configStore)

  async function loadConfigs () {
    if (!props.device?.id) {
      return
    }

    await configStore.loadAllConfigs(props.device.id)

    // Preencher formulários
    if (systemConfig.value) {
      Object.assign(systemForm, {
        online: systemConfig.value.online ?? true,
        auto_reboot: systemConfig.value.auto_reboot ?? true,
        catra_timeout: systemConfig.value.catra_timeout ?? 30,
        local_identification: systemConfig.value.local_identification ?? true,
        exception_mode: systemConfig.value.exception_mode ?? 'none',
        language: systemConfig.value.language ?? 'pt_BR',
      })
    }

    if (hardwareConfig.value) {
      Object.assign(hardwareForm, {
        beep_enabled: hardwareConfig.value.beep_enabled ?? true,
        bell_enabled: hardwareConfig.value.bell_enabled ?? true,
        bell_relay: hardwareConfig.value.bell_relay ?? 1,
        exception_mode: hardwareConfig.value.exception_mode ?? false,
        siren_enabled: hardwareConfig.value.siren_enabled ?? false,
        siren_relay: hardwareConfig.value.siren_relay ?? 2,
      })
    }

    if (securityConfig.value) {
      Object.assign(securityForm, {
        verbose_logging: securityConfig.value.verbose_logging ?? false,
        log_type: securityConfig.value.log_type ?? 0,
        multi_factor_authentication: securityConfig.value.multi_factor_authentication ?? false,
      })
    }

    if (uiConfig.value) {
      Object.assign(uiForm, {
        display_brightness: uiConfig.value.display_brightness ?? 80,
        display_timeout: uiConfig.value.display_timeout ?? 30,
        keyboard_backlight: uiConfig.value.keyboard_backlight ?? true,
        welcome_message: uiConfig.value.welcome_message ?? 'Bem-vindo',
        access_denied_message: uiConfig.value.access_denied_message ?? 'Acesso Negado',
      })
    }

    if (catraConfig.value) {
      Object.assign(catraForm, {
        anti_passback: catraConfig.value.anti_passback ?? true,
        daily_reset: catraConfig.value.daily_reset ?? true,
        gateway: catraConfig.value.gateway ?? 'clockwise',
        operation_mode: catraConfig.value.operation_mode ?? 'Ambas Controladas',
      })
    }

    if (pushServerConfig.value) {
      Object.assign(pushServerForm, {
        push_request_timeout: pushServerConfig.value.push_request_timeout ?? 15_000,
        push_request_period: pushServerConfig.value.push_request_period ?? 60,
        push_remote_address: pushServerConfig.value.push_remote_address ?? '',
      })
    }

    if (monitorConfig.value) {
      Object.assign(monitorForm, {
        hostname: monitorConfig.value.hostname ?? '',
        port: monitorConfig.value.port ?? '8000',
        path: monitorConfig.value.path ?? 'api/control_id_monitor/notifications/dao',
        request_timeout: monitorConfig.value.request_timeout ?? 5000,
      })
    }
  }

  async function saveSystemConfig () {
    if (!props.device?.id) return
    saving.value = true
    try {
      await configStore.saveSystemConfig(props.device.id, systemForm)
      emit('saved')
      toast.success('Configurações de sistema salvas com sucesso!')
    } catch (error) {
      console.error('Erro ao salvar configurações de sistema:', error)
      toast.error('Erro ao salvar configurações de sistema')
    } finally {
      saving.value = false
    }
  }

  async function saveHardwareConfig () {
    if (!props.device?.id) return
    saving.value = true
    try {
      await configStore.saveHardwareConfig(props.device.id, hardwareForm)
      emit('saved')
      toast.success('Configurações de hardware salvas com sucesso!')
    } catch (error) {
      console.error('Erro ao salvar configurações de hardware:', error)
      toast.error('Erro ao salvar configurações de hardware')
    } finally {
      saving.value = false
    }
  }

  async function saveSecurityConfig () {
    if (!props.device?.id) return
    saving.value = true
    try {
      await configStore.saveSecurityConfig(props.device.id, securityForm)
      emit('saved')
      toast.success('Configurações de segurança salvas com sucesso!')
    } catch (error) {
      console.error('Erro ao salvar configurações de segurança:', error)
      toast.error('Erro ao salvar configurações de segurança')
    } finally {
      saving.value = false
    }
  }

  async function saveUIConfig () {
    if (!props.device?.id) return
    saving.value = true
    try {
      await configStore.saveUIConfig(props.device.id, uiForm)
      emit('saved')
      toast.success('Configurações de interface salvas com sucesso!')
    } catch (error) {
      console.error('Erro ao salvar configurações de interface:', error)
      toast.error('Erro ao salvar configurações de interface')
    } finally {
      saving.value = false
    }
  }

  async function saveCatraConfig () {
    if (!props.device?.id) return
    saving.value = true
    try {
      await configStore.saveCatraConfig(props.device.id, catraForm)
      emit('saved')
      toast.success('Configurações da catraca salvas com sucesso!')
    } catch (error) {
      console.error('Erro ao salvar configurações da catraca:', error)
      toast.error('Erro ao salvar configurações da catraca')
    } finally {
      saving.value = false
    }
  }

  async function savePushServerConfig () {
    if (!props.device?.id) return
    saving.value = true
    try {
      await configStore.savePushServerConfig(props.device.id, pushServerForm)
      emit('saved')
      toast.success('Configurações do Push Server salvas com sucesso!')
    } catch (error) {
      console.error('Erro ao salvar configurações do Push Server:', error)
      toast.error('Erro ao salvar configurações do Push Server')
    } finally {
      saving.value = false
    }
  }

  async function saveMonitorConfig () {
    if (!props.device?.id) return
    saving.value = true
    try {
      await configStore.saveMonitorConfig(props.device.id, monitorForm)
      emit('saved')
      toast.success('Configurações do Monitor salvas com sucesso!')
    } catch (error) {
      console.error('Erro ao salvar configurações do Monitor:', error)
      toast.error('Erro ao salvar configurações do Monitor')
    } finally {
      saving.value = false
    }
  }

  async function activateMonitor () {
    // Validação do hostname antes de tentar ativar o monitor
    const hostname = (monitorForm.hostname || configStore.monitorConfig?.hostname || '').toString().trim()
    if (!hostname) {
      // Força exibir a aba do Monitor para que o usuário preencha o hostname
      tab.value = 'monitor'
      toast.error('Hostname/IP é obrigatório para ativar o monitor. Forneça o hostname/IP do servidor que receberá as notificações')
      return
    }

    // Se a configuração atual no servidor difere do formulário, ou não existe, salva antes de ativar
    try {
      const current = configStore.monitorConfig
      const needsSave = !current?.id
        || (String(current?.hostname ?? '') !== String(monitorForm.hostname ?? ''))
        || (String(current?.port ?? '') !== String(monitorForm.port ?? ''))
        || (String(current?.path ?? '') !== String(monitorForm.path ?? ''))
        || (Number(current?.request_timeout ?? 0) !== Number(monitorForm.request_timeout ?? 0))

      if (needsSave) {
        if (!props.device?.id) {
          toast.error('Dispositivo inválido. Não foi possível salvar configuração do monitor.')
          return
        }
        // Reutiliza a função existente para salvar e mostrar toasts
        await saveMonitorConfig()
      }

      await configStore.activateMonitor(monitorForm)
      toast.success('Monitor ativado com sucesso!')
    } catch (error) {
      console.error('Erro ao ativar monitor:', error)
      // Tenta extrair mensagem do backend quando disponível
      const msg = (error && (error as any).response?.data?.error) || (error && (error as any).message) || 'Erro ao ativar monitor'
      toast.error(msg)
    }
  }

  function close () {
    emit('update:modelValue', false)
  }

  watch(() => props.modelValue, newValue => {
    if (newValue && props.device) {
      loadConfigs()
    }
  })

  onMounted(() => {
    if (props.modelValue && props.device) {
      loadConfigs()
    }
  })
</script>
