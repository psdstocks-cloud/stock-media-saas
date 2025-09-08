import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from '../ui/button'
import { Card } from '../ui/card'
import { Input } from '../ui/input'
import { Alert } from '../ui/alert'
import { LoadingSpinner } from '../ui/loading-spinner'

describe('UI Components', () => {
  describe('Button', () => {
    it('should render button with default variant', () => {
      render(<Button>Click me</Button>)
      const button = screen.getByRole('button', { name: /click me/i })
      expect(button).toBeInTheDocument()
      expect(button).toHaveClass('bg-primary')
    })

    it('should render button with secondary variant', () => {
      render(<Button variant="secondary">Secondary</Button>)
      const button = screen.getByRole('button', { name: /secondary/i })
      expect(button).toHaveClass('bg-secondary')
    })

    it('should render button with destructive variant', () => {
      render(<Button variant="destructive">Delete</Button>)
      const button = screen.getByRole('button', { name: /delete/i })
      expect(button).toHaveClass('bg-destructive')
    })

    it('should render button with outline variant', () => {
      render(<Button variant="outline">Outline</Button>)
      const button = screen.getByRole('button', { name: /outline/i })
      expect(button).toHaveClass('border')
    })

    it('should render button with ghost variant', () => {
      render(<Button variant="ghost">Ghost</Button>)
      const button = screen.getByRole('button', { name: /ghost/i })
      expect(button).toHaveClass('hover:bg-accent')
    })

    it('should render button with link variant', () => {
      render(<Button variant="link">Link</Button>)
      const button = screen.getByRole('button', { name: /link/i })
      expect(button).toHaveClass('text-primary')
    })

    it('should render button with different sizes', () => {
      render(<Button size="sm">Small</Button>)
      const button = screen.getByRole('button', { name: /small/i })
      expect(button).toHaveClass('h-9')
    })

    it('should render button with large size', () => {
      render(<Button size="lg">Large</Button>)
      const button = screen.getByRole('button', { name: /large/i })
      expect(button).toHaveClass('h-11')
    })

    it('should render button with icon size', () => {
      render(<Button size="icon">Icon</Button>)
      const button = screen.getByRole('button', { name: /icon/i })
      expect(button).toHaveClass('h-10 w-10')
    })

    it('should be disabled when disabled prop is true', () => {
      render(<Button disabled>Disabled</Button>)
      const button = screen.getByRole('button', { name: /disabled/i })
      expect(button).toBeDisabled()
    })

    it('should call onClick when clicked', () => {
      const handleClick = jest.fn()
      render(<Button onClick={handleClick}>Click me</Button>)
      const button = screen.getByRole('button', { name: /click me/i })
      fireEvent.click(button)
      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('should not call onClick when disabled', () => {
      const handleClick = jest.fn()
      render(<Button disabled onClick={handleClick}>Disabled</Button>)
      const button = screen.getByRole('button', { name: /disabled/i })
      fireEvent.click(button)
      expect(handleClick).not.toHaveBeenCalled()
    })
  })

  describe('Card', () => {
    it('should render card with default content', () => {
      render(
        <Card>
          <div>Card content</div>
        </Card>
      )
      expect(screen.getByText('Card content')).toBeInTheDocument()
    })

    it('should render card with custom className', () => {
      render(
        <Card className="custom-class">
          <div>Card content</div>
        </Card>
      )
      const card = screen.getByText('Card content').parentElement
      expect(card).toHaveClass('custom-class')
    })
  })

  describe('Input', () => {
    it('should render input with default props', () => {
      render(<Input placeholder="Enter text" />)
      const input = screen.getByPlaceholderText('Enter text')
      expect(input).toBeInTheDocument()
      expect(input).toHaveAttribute('type', 'text')
    })

    it('should render input with custom type', () => {
      render(<Input type="email" placeholder="Enter email" />)
      const input = screen.getByPlaceholderText('Enter email')
      expect(input).toHaveAttribute('type', 'email')
    })

    it('should render input with custom className', () => {
      render(<Input className="custom-class" placeholder="Enter text" />)
      const input = screen.getByPlaceholderText('Enter text')
      expect(input).toHaveClass('custom-class')
    })

    it('should be disabled when disabled prop is true', () => {
      render(<Input disabled placeholder="Enter text" />)
      const input = screen.getByPlaceholderText('Enter text')
      expect(input).toBeDisabled()
    })

    it('should call onChange when value changes', () => {
      const handleChange = jest.fn()
      render(<Input onChange={handleChange} placeholder="Enter text" />)
      const input = screen.getByPlaceholderText('Enter text')
      fireEvent.change(input, { target: { value: 'new value' } })
      expect(handleChange).toHaveBeenCalledTimes(1)
    })
  })

  describe('Alert', () => {
    it('should render alert with default variant', () => {
      render(<Alert>Alert message</Alert>)
      expect(screen.getByText('Alert message')).toBeInTheDocument()
    })

    it('should render alert with destructive variant', () => {
      render(<Alert variant="destructive">Error message</Alert>)
      const alert = screen.getByText('Error message')
      expect(alert).toBeInTheDocument()
      expect(alert).toHaveClass('border-destructive/50')
    })

    it('should render alert with custom className', () => {
      render(<Alert className="custom-class">Alert message</Alert>)
      const alert = screen.getByText('Alert message')
      expect(alert).toHaveClass('custom-class')
    })
  })

  describe('LoadingSpinner', () => {
    it('should render loading spinner with default props', () => {
      render(<LoadingSpinner />)
      const spinner = screen.getByRole('status')
      expect(spinner).toBeInTheDocument()
      expect(spinner).toHaveClass('animate-spin')
    })

    it('should render loading spinner with custom size', () => {
      render(<LoadingSpinner size="lg" />)
      const spinner = screen.getByRole('status')
      expect(spinner).toHaveClass('h-12 w-12')
    })

    it('should render loading spinner with custom className', () => {
      render(<LoadingSpinner className="custom-class" />)
      const spinner = screen.getByRole('status')
      expect(spinner).toHaveClass('custom-class')
    })

    it('should render loading spinner with custom text', () => {
      render(<LoadingSpinner text="Loading..." />)
      expect(screen.getByText('Loading...')).toBeInTheDocument()
    })
  })
})
