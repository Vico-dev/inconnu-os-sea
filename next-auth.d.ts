import NextAuth from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: string
      clientAccount?: any
      accountManager?: any
    }
  }

  interface User {
    id: string
    email: string
    name: string
    role: string
    clientAccount?: any
    accountManager?: any
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: string
    clientAccount?: any
    accountManager?: any
  }
} 