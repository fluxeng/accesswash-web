import { create } from 'zustand'
import { createApiClient, Customer, LoginCredentials, RegisterData } from '../utils/api-client'

interface AuthState {
  customer: Customer | null
  loading: boolean
  error: string | null
  isAuthenticated: boolean
  
  // Actions
  login: (credentials: LoginCredentials, tenant: string) => Promise<void>
  register: (data: RegisterData, tenant: string) => Promise<void>
  logout: (tenant: string) => Promise<void>
  forgotPassword: (email: string, tenant: string) => Promise<void>
  loadCustomerFromStorage: (tenant: string) => void
  clearError: () => void
}

export const useAuthStore = create<AuthState>((set, get) => ({
  customer: null,
  loading: false,
  error: null,
  isAuthenticated: false,

  login: async (credentials: LoginCredentials, tenant: string) => {
    set({ loading: true, error: null })
    
    try {
      const api = createApiClient(tenant)
      const response = await api.login(credentials)
      
      if (response.success) {
        set({ 
          customer: response.data!.customer, 
          isAuthenticated: true,
          loading: false 
        })
      } else {
        throw new Error(response.message || 'Login failed')
      }
    } catch (error: any) {
      set({ 
        error: error.message, 
        loading: false,
        isAuthenticated: false,
        customer: null 
      })
      throw error
    }
  },

  register: async (data: RegisterData, tenant: string) => {
    set({ loading: true, error: null })
    
    try {
      const api = createApiClient(tenant)
      const response = await api.register(data)
      
      if (response.success) {
        set({ 
          customer: response.data!.customer, 
          isAuthenticated: true,
          loading: false 
        })
      } else {
        throw new Error(response.message || 'Registration failed')
      }
    } catch (error: any) {
      set({ 
        error: error.message, 
        loading: false,
        isAuthenticated: false,
        customer: null 
      })
      throw error
    }
  },

  logout: async (tenant: string) => {
    set({ loading: true })
    
    try {
      const api = createApiClient(tenant)
      await api.logout()
    } catch (error) {
      // Ignore logout errors
    } finally {
      set({ 
        customer: null, 
        isAuthenticated: false, 
        loading: false,
        error: null 
      })
    }
  },

  forgotPassword: async (email: string, tenant: string) => {
    set({ loading: true, error: null })
    
    try {
      const api = createApiClient(tenant)
      await api.forgotPassword(email)
      set({ loading: false })
    } catch (error: any) {
      set({ error: error.message, loading: false })
      throw error
    }
  },

  loadCustomerFromStorage: (tenant: string) => {
    try {
      const api = createApiClient(tenant)
      const customer = api.getCurrentCustomer()
      const isAuthenticated = api.isAuthenticated()
      
      set({ 
        customer, 
        isAuthenticated,
        loading: false 
      })
    } catch (error) {
      set({ 
        customer: null, 
        isAuthenticated: false,
        loading: false 
      })
    }
  },

  clearError: () => set({ error: null }),
}))