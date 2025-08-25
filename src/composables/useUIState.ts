import type { AccessRule, Area, Device, Group, Portal, TimeZone } from '@/types'

interface UIState {
  updating: boolean
  status?: string
  type?: string
  area?: Area
  devices?: Device[]
}

// Map para armazenar estados locais por ID
const uiStates = new Map<number, UIState>()

export function useUIState () {
  // Função genérica para obter estado de UI
  const getUIState = (id: number): UIState => {
    if (!uiStates.has(id)) {
      uiStates.set(id, { updating: false })
    }
    return uiStates.get(id)!
  }

  // Função para atualizar estado de UI
  const updateUIState = (id: number, state: Partial<UIState>) => {
    const currentState = getUIState(id)
    uiStates.set(id, { ...currentState, ...state })
  }

  // Adaptadores para cada tipo
  const adaptDevice = (device: Device) => {
    const state = getUIState(device.id)
    return {
      ...device,
      status: state.status,
      updating: state.updating,
    }
  }

  const adaptPortal = (portal: Portal) => {
    const state = getUIState(portal.id)
    return {
      ...portal,
      type: state.type,
      area: state.area,
      devices: state.devices,
      updating: state.updating,
    }
  }

  const adaptGroup = (group: Group) => {
    const state = getUIState(group.id)
    return {
      ...group,
      updating: state.updating,
    }
  }

  const adaptAccessRule = (rule: AccessRule) => {
    const state = getUIState(rule.id)
    return {
      ...rule,
      updating: state.updating,
    }
  }

  const adaptTimeZone = (timeZone: TimeZone) => {
    const state = getUIState(timeZone.id)
    return {
      ...timeZone,
      updating: state.updating,
    }
  }

  return {
    getUIState,
    updateUIState,
    adaptDevice,
    adaptPortal,
    adaptGroup,
    adaptAccessRule,
    adaptTimeZone,
  }
}
