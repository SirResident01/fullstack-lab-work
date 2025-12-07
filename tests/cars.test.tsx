import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from 'react-query'
import { ThemeProvider } from '@mui/material/styles'
import { createTheme } from '@mui/material/styles'
import CarsPage from '../cars/index'
import { apiClient } from '@/lib/api'

const theme = createTheme()

// Мокируем API клиент
vi.mock('@/lib/api', () => ({
  apiClient: {
    searchCars: vi.fn(),
    getOwners: vi.fn(),
  },
}))

// Мокируем useAuth
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    isAdmin: true,
    user: { role: 'ADMIN' },
    isAuthenticated: true,
  }),
}))

// Мокируем useRouter
vi.mock('next/router', () => ({
  useRouter: () => ({
    push: vi.fn(),
    events: {
      on: vi.fn(),
      off: vi.fn(),
    },
  }),
}))

// Мокируем useDataRefresh
vi.mock('@/hooks/useDataRefresh', () => ({
  useDataRefresh: vi.fn(),
}))

// Мокируем useSearchState
vi.mock('@/hooks/useSearchState', () => ({
  useSearchState: () => [
    { brand: '', color: '', sort_by: 'id', sort_order: 'asc', limit: 20, offset: 0 },
    vi.fn(),
  ],
}))

// Мокируем Next.js компоненты
vi.mock('next/head', () => ({
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}))

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        cacheTime: 0,
      },
    },
  })

describe('CarsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    ;(apiClient.getOwners as any).mockResolvedValue([])
  })

  it('отображает заголовок "Автомобили"', () => {
    ;(apiClient.searchCars as any).mockResolvedValue([])

    const testQueryClient = createTestQueryClient()

    render(
      <ThemeProvider theme={theme}>
        <QueryClientProvider client={testQueryClient}>
          <CarsPage />
        </QueryClientProvider>
      </ThemeProvider>
    )
    
    expect(screen.getByText('Автомобили')).toBeInTheDocument()
  })

  it('отображает список автомобилей после загрузки', async () => {
    const mockCars = [
      {
        id: 1,
        brand: 'Toyota',
        model: 'Camry',
        color: 'White',
        registrationNumber: 'ABC123',
        modelYear: 2023,
        price: 5000000,
        owner_id: 1,
        owner: 'Иван Иванов',
      },
      {
        id: 2,
        brand: 'Ford',
        model: 'Focus',
        color: 'Black',
        registrationNumber: 'XYZ789',
        modelYear: 2022,
        price: 4000000,
        owner_id: 2,
        owner: 'Петр Петров',
      },
    ]

    ;(apiClient.searchCars as any).mockResolvedValue(mockCars)

    const testQueryClient = createTestQueryClient()

    render(
      <ThemeProvider theme={theme}>
        <QueryClientProvider client={testQueryClient}>
          <CarsPage />
        </QueryClientProvider>
      </ThemeProvider>
    )

    // Ждем, пока данные загрузятся - используем findByText для асинхронного поиска
    const toyotaText = await screen.findByText(/Toyota/, {}, { timeout: 3000 })
    expect(toyotaText).toBeInTheDocument()
    
    const camryText = await screen.findByText(/Camry/, {}, { timeout: 3000 })
    expect(camryText).toBeInTheDocument()
    
    const fordText = await screen.findByText(/Ford/, {}, { timeout: 3000 })
    expect(fordText).toBeInTheDocument()
    
    const focusText = await screen.findByText(/Focus/, {}, { timeout: 3000 })
    expect(focusText).toBeInTheDocument()
  })
})

