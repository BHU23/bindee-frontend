import { fireEvent, render, screen } from '@testing-library/react'
import { expect, it } from 'vitest'
import App from '@/App'

it('renders the card title', () => {
  render(<App />)
  expect(screen.getByText('Bindee')).toBeInTheDocument()
})

it('greets the typed name and clears it', () => {
  render(<App />)
  fireEvent.change(screen.getByPlaceholderText('Your name'), { target: { value: 'Ann' } })
  expect(screen.getByText('Hello, Ann!')).toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name: 'Clear' }))
  expect(screen.queryByText('Hello, Ann!')).not.toBeInTheDocument()
})
