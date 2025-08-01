import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import Cookies from 'js-cookie'

export interface LoginCredentials {
  username: string
  password: string
}

export interface RegisterData {
  email: string
  phone_number?: string
  password: string
  password_confirm: string
  first_name: string
  last_name: string
  property_address: string
  language?: string
}

export interface Customer {
  id: string
  email: string
  phone_number?: string
  first_name: string
  last_name: string
  full_name: string
  account_number: string
  meter_number?: string
  property_address: string
  service_type: string
  language: string
  email_verified: boolean
  phone_verified: boolean
  last_login?: string
  created_at: string
}

export interface ServiceRequest {
  id: string
  request_number: string
  title: string
  description: string
  issue_type: string
  urgency: string
  status: string
  reported_location: string
  customer: string
  assigned_to?: string
  created_at: string
  updated_at: string
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
  errors?: Record<string, string[]>
}

class ApiClient {
  private client: AxiosInstance
  private tenant: string

  constructor(tenant: string) {
    this.tenant = tenant
    
    // Determine base URL based on environment
    const getBaseURL = () => {
      if (typeof window !== 'undefined') {
        // Client-side
        const hostname = window.location.hostname
        if (hostname.includes('localhost') || hostname.includes('127.0.0.1')) {
          return `http://${tenant}.accesswash.org:8000/api`
        }
        return `https://${tenant}.accesswash.org/api`
      } else {
        // Server-side
        return process.env.NODE_ENV === 'development' 
          ? `http://${tenant}.accesswash.org:8000/api`
          : `https://${tenant}.accesswash.org/api`
      }
    }

    this.client = axios.create({
      baseURL: getBaseURL(),
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = this.getAuthToken()
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => Promise.reject(error)
    )

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          this.clearAuthData()
          if (typeof window !== 'undefined') {
            window.location.href = `/${tenant}/portal/auth/login`
          }
        }
        return Promise.reject(error)
      }
    )
  }

  private getAuthToken(): string | null {
    if (typeof window === 'undefined') return null
    return Cookies.get(`accesswash_token_${this.tenant}`)
  }

  private setAuthToken(token: string): void {
    if (typeof window === 'undefined') return
    Cookies.set(`accesswash_token_${this.tenant}`, token, { 
      expires: 7, // 7 days
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    })
  }

  private clearAuthData(): void {
    if (typeof window === 'undefined') return
    Cookies.remove(`accesswash_token_${this.tenant}`)
    Cookies.remove(`accesswash_customer_${this.tenant}`)
  }

  // Authentication endpoints
  async login(credentials: LoginCredentials): Promise<ApiResponse<{ customer: Customer; tokens: any }>> {
    try {
      const response = await this.client.post('/portal/auth/login/', credentials)
      
      if (response.data.success && response.data.tokens) {
        this.setAuthToken(response.data.tokens.access_token)
        
        // Store customer data
        Cookies.set(`accesswash_customer_${this.tenant}`, JSON.stringify(response.data.customer), {
          expires: 7,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict'
        })
      }
      
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Login failed')
    }
  }

  async register(data: RegisterData): Promise<ApiResponse<{ customer: Customer; tokens: any }>> {
    try {
      const response = await this.client.post('/portal/auth/register/', data)
      
      if (response.data.success && response.data.tokens) {
        this.setAuthToken(response.data.tokens.access_token)
        
        // Store customer data
        Cookies.set(`accesswash_customer_${this.tenant}`, JSON.stringify(response.data.customer), {
          expires: 7,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict'
        })
      }
      
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Registration failed')
    }
  }

  async logout(): Promise<void> {
    try {
      await this.client.post('/portal/auth/logout/')
    } catch (error) {
      // Ignore logout errors
    } finally {
      this.clearAuthData()
    }
  }

  async forgotPassword(email: string): Promise<ApiResponse<any>> {
    try {
      const response = await this.client.post('/portal/auth/forgot-password/', { email })
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to send reset email')
    }
  }

  // Dashboard endpoints
  async getDashboard(): Promise<ApiResponse<any>> {
    try {
      const response = await this.client.get('/portal/dashboard/')
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to load dashboard')
    }
  }

  // Profile endpoints
  async getProfile(): Promise<ApiResponse<Customer>> {
    try {
      const response = await this.client.get('/portal/profile/')
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to load profile')
    }
  }

  async updateProfile(data: Partial<Customer>): Promise<ApiResponse<Customer>> {
    try {
      const response = await this.client.put('/portal/profile/', data)
      
      // Update stored customer data
      if (response.data.success) {
        Cookies.set(`accesswash_customer_${this.tenant}`, JSON.stringify(response.data.data), {
          expires: 7,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict'
        })
      }
      
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update profile')
    }
  }

  // Service request endpoints
  async getServiceRequests(): Promise<ServiceRequest[]> {
    try {
      const response = await this.client.get('/support/requests/')
      return response.data.results || response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to load service requests')
    }
  }

  async getServiceRequest(id: string): Promise<ServiceRequest> {
    try {
      const response = await this.client.get(`/support/requests/${id}/`)
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to load service request')
    }
  }

  async createServiceRequest(data: any): Promise<ApiResponse<ServiceRequest>> {
    try {
      const response = await this.client.post('/support/requests/', data)
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create service request')
    }
  }

  async addComment(requestId: string, comment: string): Promise<any> {
    try {
      const response = await this.client.post(`/support/requests/${requestId}/comments/`, {
        comment
      })
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to add comment')
    }
  }

  // Utility methods
  getCurrentCustomer(): Customer | null {
    if (typeof window === 'undefined') return null
    
    const customerData = Cookies.get(`accesswash_customer_${this.tenant}`)
    if (!customerData) return null
    
    try {
      return JSON.parse(customerData)
    } catch {
      return null
    }
  }

  isAuthenticated(): boolean {
    return !!this.getAuthToken() && !!this.getCurrentCustomer()
  }
}

// Factory function to create API client
export function createApiClient(tenant: string): ApiClient {
  return new ApiClient(tenant)
}

export default ApiClient