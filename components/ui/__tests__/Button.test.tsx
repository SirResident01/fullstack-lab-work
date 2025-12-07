import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Button from '../Button'

describe('Button', () => {
  it('рендерится с текстом', () => {
    render(<Button>Нажми меня</Button>)
    expect(screen.getByText('Нажми меня')).toBeInTheDocument()
  })

  it('вызывает onClick при клике', async () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Кнопка</Button>)
    
    const button = screen.getByText('Кнопка')
    await userEvent.click(button)
    
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('отображает состояние загрузки', () => {
    render(<Button loading>Загрузка</Button>)
    expect(screen.getByText('Загрузка')).toBeInTheDocument()
  })

  it('отключается при disabled', () => {
    render(<Button disabled>Отключена</Button>)
    const button = screen.getByText('Отключена')
    expect(button).toBeDisabled()
  })
})



