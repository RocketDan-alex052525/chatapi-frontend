export type AuthInfo = {
  userId: number
  accessToken: string
  expiresInSeconds: number
}

export type RegisterResponse = {
  userId: number
}

export type LoginResponse = {
  userId: number
  accessToken: string
  expiresInSeconds: number
}
