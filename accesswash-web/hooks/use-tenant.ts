'use client'

import { usePathname, useParams } from 'next/navigation'
import { createApiClient } from '@/lib/utils/api-client'
import { useMemo } from 'react'

export function useTenant() {
  const params = useParams()
  const pathname = usePathname()
  
  const tenant = useMemo(() => {
    // Get tenant from URL params first
    if (params?.tenant && typeof params.tenant === 'string') {
      return params.tenant
    }
    
    // Fallback to extracting from pathname
    const segments = pathname.split('/')
    return segments[1] || 'demo'
  }, [params, pathname])

  const api = useMemo(() => createApiClient(tenant), [tenant])

  return { tenant, api }
}