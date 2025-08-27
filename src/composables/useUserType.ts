export function useUserType () {
  const getUserTypeColor = (isVisitor: number) => {
    return isVisitor ? 'warning' : 'primary'
  }

  const getUserTypeLabel = (isVisitor: number) => {
    return isVisitor ? 'Visitante' : 'Usuário'
  }

  return {
    getUserTypeColor,
    getUserTypeLabel,
  }
}
