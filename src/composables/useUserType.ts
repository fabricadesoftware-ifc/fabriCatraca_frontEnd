export function useUserType () {
  const getUserTypeColor = (userTypeId: number | null) => {
    return userTypeId === 1 ? 'warning' : 'primary'
  }

  const getUserTypeLabel = (userTypeId: number | null) => {
    return userTypeId === 1 ? 'Visitante' : 'Usuário'
  }

  return {
    getUserTypeColor,
    getUserTypeLabel,
  }
}
