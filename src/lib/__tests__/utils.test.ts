import { formatCurrency, formatDate, validateEmail } from '@/lib/utils'

describe('Utils', () => {
  describe('formatCurrency', () => {
    it('should format currency correctly', () => {
      expect(formatCurrency(1234.56)).toBe('1\u202F234,56\u00A0€')
      expect(formatCurrency(0)).toBe('0,00\u00A0€')
      expect(formatCurrency(1000000)).toBe('1\u202F000\u202F000,00\u00A0€')
    })

    it('should handle negative values', () => {
      expect(formatCurrency(-1234.56)).toBe('-1\u202F234,56\u00A0€')
    })
  })

  describe('formatDate', () => {
    it('should format date correctly', () => {
      const date = new Date('2024-01-15T10:30:00Z')
      expect(formatDate(date)).toBe('15/01/2024')
    })

    it('should handle different date formats', () => {
      const date1 = new Date('2024-12-25')
      const date2 = new Date('2024-03-08')
      
      expect(formatDate(date1)).toBe('25/12/2024')
      expect(formatDate(date2)).toBe('08/03/2024')
    })
  })

  describe('validateEmail', () => {
    it('should validate correct email addresses', () => {
      expect(validateEmail('test@example.com')).toBe(true)
      expect(validateEmail('user.name@domain.co.uk')).toBe(true)
      expect(validateEmail('user+tag@example.org')).toBe(true)
    })

    it('should reject invalid email addresses', () => {
      expect(validateEmail('invalid-email')).toBe(false)
      expect(validateEmail('test@')).toBe(false)
      expect(validateEmail('@example.com')).toBe(false)
      expect(validateEmail('')).toBe(false)
      expect(validateEmail('test@example')).toBe(false)
    })
  })
}) 