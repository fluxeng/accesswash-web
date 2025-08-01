'use client'

import { useEffect } from 'react'
import { useAuthStore } from '@/lib/stores/auth-store'
import { useTenant } from './use-tenant'

export function useCustomerAuth() {
  const { tenant } = useTenant()
  const {
    customer,
    loading,
    error,
    isAuthenticated,
    login,
    register,
    logout,
    forgotPassword,
    loadCustomerFromStorage,
    clearError
  } = useAuthStore()

  // Load customer from storage on mount
  useEffect(() => {
    if (tenant) {
      loadCustomerFromStorage(tenant)
    }
  }, [tenant, loadCustomerFromStorage])

  return {
    customer,
    loading,
    error,
    isAuthenticated,
    
    // Wrapped actions with tenant
    login: (credentials: any) => login(credentials, tenant),
    register: (data: any) => register(data, tenant),
    logout: () => logout(tenant),
    forgotPassword: (email: string) => forgotPassword(email, tenant),
    clearError,
  }
}