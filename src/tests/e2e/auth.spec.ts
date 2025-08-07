import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
  test('should display login page', async ({ page }) => {
    await page.goto('/login')
    
    await expect(page.getByRole('heading', { name: /connexion/i })).toBeVisible()
    await expect(page.getByLabel(/email/i)).toBeVisible()
    await expect(page.getByLabel(/mot de passe/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /se connecter/i })).toBeVisible()
  })

  test('should show validation errors for invalid form', async ({ page }) => {
    await page.goto('/login')
    
    // Submit empty form
    await page.getByRole('button', { name: /se connecter/i }).click()
    
    // Should show validation errors
    await expect(page.getByText(/email requis/i)).toBeVisible()
    await expect(page.getByText(/mot de passe requis/i)).toBeVisible()
  })

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/login')
    
    await page.getByLabel(/email/i).fill('invalid@example.com')
    await page.getByLabel(/mot de passe/i).fill('wrongpassword')
    await page.getByRole('button', { name: /se connecter/i }).click()
    
    // Should show error message
    await expect(page.getByText(/identifiants invalides/i)).toBeVisible()
  })

  test('should redirect to dashboard after successful login', async ({ page }) => {
    await page.goto('/login')
    
    // Use test credentials
    await page.getByLabel(/email/i).fill('client@test.com')
    await page.getByLabel(/mot de passe/i).fill('password123')
    await page.getByRole('button', { name: /se connecter/i }).click()
    
    // Should redirect to dashboard
    await expect(page).toHaveURL('/client')
    await expect(page.getByText(/tableau de bord/i)).toBeVisible()
  })

  test('should allow user to logout', async ({ page }) => {
    // Login first
    await page.goto('/login')
    await page.getByLabel(/email/i).fill('client@test.com')
    await page.getByLabel(/mot de passe/i).fill('password123')
    await page.getByRole('button', { name: /se connecter/i }).click()
    
    // Wait for dashboard to load
    await expect(page).toHaveURL('/client')
    
    // Logout
    await page.getByRole('button', { name: /menu/i }).click()
    await page.getByRole('menuitem', { name: /déconnexion/i }).click()
    
    // Should redirect to login page
    await expect(page).toHaveURL('/login')
  })
}) 