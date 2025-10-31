import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { test, expect, vi } from 'vitest'
import AddExpense from './AddExpense'

test('shows validation and calls onAdd', ()=>{
  const onAdd = vi.fn()
  const onNavigate = vi.fn()
  render(<AddExpense onAdd={onAdd} onNavigate={onNavigate} />)

  const addBtn = screen.getByRole('button', { name: /Add/i })
  fireEvent.click(addBtn)
  expect(screen.getByText(/Введите положительную сумму/)).toBeTruthy()

  const input = screen.getByPlaceholderText('$')
  fireEvent.change(input, { target: { value: '42' } })
  fireEvent.click(addBtn)

  // onAdd should be called and navigation back
  expect(onAdd).toHaveBeenCalled()
  expect(onNavigate).toHaveBeenCalledWith('home')
})
