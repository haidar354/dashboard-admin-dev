export const getBusinessUnitId = (): string | undefined => {
  const authStore = localStorage.getItem('authStore')
  if (!authStore)
    return undefined
  const authStoreParsed: { userData: { businessUnitId: string | undefined } } = JSON.parse(authStore)

  return authStoreParsed.userData.businessUnitId || undefined
}
