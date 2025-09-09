import { NextRequest } from 'next/server'
import { POST as registerHandler } from '@/app/api/auth/register/route'
import { POST as signinHandler } from '@/app/api/auth/signin/route'

// Mock NextAuth
jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}))

// Mock Prisma
jest.mock('@/lib/db', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    clientAccount: {
      create: jest.fn(),
    },
    company: {
      create: jest.fn(),
    },
  },
}))

// Mock bcrypt
jest.mock('bcryptjs', () => ({
  hash: jest.fn().mockResolvedValue('hashed-password'),
  compare: jest.fn().mockResolvedValue(true),
}))

// Mock email service
jest.mock('@/lib/email-service', () => ({
  EmailService: {
    sendVerificationEmail: jest.fn().mockResolvedValue(true),
  },
}))

describe('Auth API', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        role: 'CLIENT',
      }

      const { prisma } = require('@/lib/db')
      prisma.user.findUnique.mockResolvedValue(null) // User doesn't exist
      prisma.user.create.mockResolvedValue(mockUser)
      prisma.company.create.mockResolvedValue({ id: 'company-123' })
      prisma.clientAccount.create.mockResolvedValue({ id: 'client-123' })

      const request = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'password123',
          name: 'Test User',
          companyName: 'Test Company',
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const response = await registerHandler(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.success).toBe(true)
      expect(data.message).toContain('Compte créé avec succès')
    })

    it('should reject registration with existing email', async () => {
      const { prisma } = require('@/lib/db')
      prisma.user.findUnique.mockResolvedValue({ id: 'existing-user' })

      const request = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          email: 'existing@example.com',
          password: 'password123',
          name: 'Test User',
          companyName: 'Test Company',
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const response = await registerHandler(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain('Un compte existe déjà')
    })

    it('should validate required fields', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          email: 'test@example.com',
          // Missing password, name, companyName
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const response = await registerHandler(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain('Champs requis manquants')
    })
  })

  describe('POST /api/auth/signin', () => {
    it('should sign in user with valid credentials', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        password: 'hashed-password',
        emailVerified: true,
        role: 'CLIENT',
      }

      const { prisma } = require('@/lib/db')
      prisma.user.findUnique.mockResolvedValue(mockUser)

      const request = new NextRequest('http://localhost:3000/api/auth/signin', {
        method: 'POST',
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'password123',
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const response = await signinHandler(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
    })

    it('should reject sign in with invalid credentials', async () => {
      const { prisma } = require('@/lib/db')
      prisma.user.findUnique.mockResolvedValue(null)

      const request = new NextRequest('http://localhost:3000/api/auth/signin', {
        method: 'POST',
        body: JSON.stringify({
          email: 'nonexistent@example.com',
          password: 'wrongpassword',
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const response = await signinHandler(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toContain('Identifiants invalides')
    })
  })
})
