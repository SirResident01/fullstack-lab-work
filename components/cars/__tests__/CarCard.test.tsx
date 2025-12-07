import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeProvider } from '@mui/material/styles'
import { createTheme } from '@mui/material/styles'
import CarCard from '../CarCard'
import { CarWithOwner } from '@/types/api'

const theme = createTheme()

const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>)
}

const mockCar: CarWithOwner = {
  id: 1,
  brand: 'Toyota',
  model: 'Camry',
  color: 'White',
  registrationNumber: 'ABC123',
  modelYear: 2023,
  price: 5000000,
  owner_id: 1,
  owner: 'Иван Иванов',
}

describe('CarCard', () => {
  it('отображает информацию об автомобиле', () => {
    renderWithTheme(<CarCard car={mockCar} />)
    
    expect(screen.getByText(/Toyota Camry/)).toBeInTheDocument()
    expect(screen.getByText('ABC123')).toBeInTheDocument()
    expect(screen.getByText(/2023/)).toBeInTheDocument()
  })

  it('вызывает onEdit при клике на кнопку редактирования', async () => {
    const handleEdit = vi.fn()
    renderWithTheme(<CarCard car={mockCar} onEdit={handleEdit} onDelete={vi.fn()} showActions />)
    
    await act(async () => {
      const editButton = screen.getByLabelText('edit')
      await userEvent.click(editButton)
    })
    
    expect(handleEdit).toHaveBeenCalledWith(mockCar)
  })

  it('вызывает onDelete при клике на кнопку удаления', async () => {
    const handleDelete = vi.fn()
    renderWithTheme(<CarCard car={mockCar} onEdit={vi.fn()} onDelete={handleDelete} showActions />)
    
    await act(async () => {
      const deleteButton = screen.getByLabelText('delete')
      await userEvent.click(deleteButton)
    })
    
    expect(handleDelete).toHaveBeenCalledWith(mockCar)
  })

  it('не отображает кнопки действий когда showActions=false', () => {
    renderWithTheme(<CarCard car={mockCar} showActions={false} />)
    
    expect(screen.queryByLabelText('edit')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('delete')).not.toBeInTheDocument()
  })
})

