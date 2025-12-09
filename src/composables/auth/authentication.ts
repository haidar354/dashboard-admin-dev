import type { User } from '@/types/models/user'

export const getAccessToken = () => {
  const storedData = localStorage.getItem('authStore')

  const userData = storedData ? JSON.parse(storedData).credentials : null

  return userData?.access_token
}

export const getRefreshToken = () => {
  const storedData = localStorage.getItem('authStore')

  const userData = storedData ? JSON.parse(storedData).credentials : null

  return userData?.refresh_token
}
export const isUserLogin = (): boolean => {
  // Check if user is logged in
  const storedData = localStorage.getItem('authStore')

  return storedData ? ((JSON.parse(storedData).isLogin as boolean) && !!getAccessToken()) : false
}

export const getUserID = () => {
  const storedData = localStorage.getItem('authStore')

  const userData = storedData
    ? (JSON.parse(storedData).userData as User)
    : null

  return userData?.userId
}

export const getUserData = () => {
  const storedData = localStorage.getItem('authStore')

  return storedData ? (JSON.parse(storedData).userData as User) : null
}

export const unsetAllCredential = () => {
  localStorage.removeItem('authStore')
  localStorage.removeItem('schoolStore')
  localStorage.removeItem('guestVisitStore')
  localStorage.removeItem('businessUnitStore')
  localStorage.removeItem('itemStore')
  localStorage.removeItem('outletStore')
}
