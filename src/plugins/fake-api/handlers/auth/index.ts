import { db } from '@db/auth/db'
import type { UserOut } from '@db/auth/types'
import type { PathParams } from 'msw'
import { HttpResponse, http } from 'msw'

// Helper function to create login response
function createLoginResponse(user: any, accessToken: string) {
  const userData = { ...user }
  
  const userOutData = Object.fromEntries(
    Object.entries(userData)
      .filter(
        ([key, _]) => !(key === 'password' || key === 'abilityRules'),
      ),
  ) as UserOut['userData']

  return {
    success: true,
    message: 'Login successful',
    data: {
      tokenType: 'Bearer',
      expiresIn: '3600',
      accessToken,
      refreshToken: accessToken,
      user: {
        ...userOutData,
        name: userOutData.fullName || userOutData.username || 'Admin User',
        userId: user.id,
        businessUnitId: 'default-bu',
        permissions: userData.abilityRules || [{ action: 'manage', subject: 'all' }],
        roles: [{ id: 1, name: 'SuperAdmin', code: 'super_admin' }],
      },
    },
  }
}

// Helper function to create user data for /me endpoint
function createUserData(user: any) {
  const userData = { ...user }
  
  return Object.fromEntries(
    Object.entries(userData)
      .filter(
        ([key, _]) => !(key === 'password' || key === 'abilityRules'),
      ),
  )
}

// Handlers for auth
export const handlerAuth = [
  // Login endpoint - platform/auth/login (with full URL pattern)
  http.post<PathParams>('*/platform/auth/login', async ({ request }) => {
    const { email, password } = await request.json() as { email: string; password: string }

    let errors: Record<string, string[]> = {
      email: ['Something went wrong'],
    }

    const user = db.users.find(u => u.email === email && u.password === password)

    if (user) {
      try {
        const accessToken = db.userTokens[user.id - 1] || db.userTokens[0]
        const response = createLoginResponse(user, accessToken)

        return HttpResponse.json(response, { status: 200 })
      }
      catch (e: unknown) {
        errors = { email: [e as string] }
      }
    }
    else {
      errors = { email: ['Invalid email or password'] }
    }

    return HttpResponse.json({ errors }, { status: 400 })
  }),

  // Login endpoint - api/platform/auth/login
  http.post<PathParams>('/api/platform/auth/login', async ({ request }) => {
    const { email, password } = await request.json() as { email: string; password: string }

    let errors: Record<string, string[]> = {
      email: ['Something went wrong'],
    }

    const user = db.users.find(u => u.email === email && u.password === password)

    if (user) {
      try {
        const accessToken = db.userTokens[user.id - 1] || db.userTokens[0]
        const response = createLoginResponse(user, accessToken)

        return HttpResponse.json(response, { status: 200 })
      }
      catch (e: unknown) {
        errors = { email: [e as string] }
      }
    }
    else {
      errors = { email: ['Invalid email or password'] }
    }

    return HttpResponse.json({ errors }, { status: 400 })
  }),

  // Legacy endpoint - api/auth/login
  http.post<PathParams>('/api/auth/login', async ({ request }) => {
    const { email, password } = await request.json() as { email: string; password: string }

    let errors: Record<string, string[]> = {
      email: ['Something went wrong'],
    }

    const user = db.users.find(u => u.email === email && u.password === password)

    if (user) {
      try {
        const accessToken = db.userTokens[user.id - 1] || db.userTokens[0]

        const userData = { ...user }

        const userOutData = Object.fromEntries(
          Object.entries(userData)
            .filter(
              ([key, _]) => !(key === 'password' || key === 'abilityRules'),
            ),
        ) as UserOut['userData']

        const response: UserOut = {
          userAbilityRules: userData.abilityRules,
          accessToken,
          userData: userOutData,
        }

        return HttpResponse.json(response, { status: 201 })
      }
      catch (e: unknown) {
        errors = { email: [e as string] }
      }
    }
    else {
      errors = { email: ['Invalid email or password'] }
    }

    return HttpResponse.json({ errors }, { status: 400 })
  }),

  // Get current user - auth/me
  http.get<PathParams>('*/auth/me', async ({ request }) => {
    const url = new URL(request.url)
    const authHeader = request.headers.get('authorization')
    
    // Check if user has valid token (simplified check)
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json(
        { errors: { message: ['Unauthorized'] } },
        { status: 401 }
      )
    }

    // Get first user as default (you can enhance this to parse token and get user ID)
    const user = db.users[0]
    const userData = createUserData(user)

    const response = {
      success: true,
      data: {
        ...userData,
        name: userData.fullName || userData.username || 'Admin User',
        userId: user.id,
        businessUnitId: 'default-bu',
        permissions: user.abilityRules || [{ action: 'manage', subject: 'all' }],
        roles: [{ id: 1, name: 'SuperAdmin', code: 'super_admin' }],
      },
    }

    return HttpResponse.json(response, { status: 200 })
  }),

  // Refresh token - auth/refresh-token
  http.post<PathParams>('*/auth/refresh-token', async ({ request }) => {
    const body = await request.json() as { refreshToken?: string }
    const authHeader = request.headers.get('authorization')

    // Check if user has valid token
    if (!authHeader && !body.refreshToken) {
      return HttpResponse.json(
        { errors: { message: ['Invalid refresh token'] } },
        { status: 401 }
      )
    }

    // Get first user as default
    const user = db.users[0]
    const accessToken = db.userTokens[0]

    const response = {
      success: true,
      data: {
        tokenType: 'Bearer',
        expiresIn: '3600',
        accessToken,
        refreshToken: accessToken,
        user: {
          ...createUserData(user),
          name: user.fullName || user.username || 'Admin User',
          userId: user.id,
          businessUnitId: 'default-bu',
          permissions: user.abilityRules || [{ action: 'manage', subject: 'all' }],
          roles: [{ id: 1, name: 'SuperAdmin', code: 'super_admin' }],
        },
        permissions: user.abilityRules || [{ action: 'manage', subject: 'all' }],
      },
    }

    return HttpResponse.json(response, { status: 200 })
  }),

  // Logout - auth/logout
  http.post<PathParams>('*/auth/logout', async () => {
    return HttpResponse.json(
      { success: true, message: 'Logout successful' },
      { status: 200 }
    )
  }),
]
