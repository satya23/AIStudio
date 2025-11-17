import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatusBanner } from '../StatusBanner';

describe('StatusBanner', () => {
  it('should render message', () => {
    render(<StatusBanner message="Test message" />);
    expect(screen.getByText('Test message')).toBeInTheDocument();
  });

  it('should have info styling by default', () => {
    render(<StatusBanner message="Info message" />);
    const banner = screen.getByRole('status');
    expect(banner).toHaveClass('border-indigo-200', 'bg-indigo-50', 'text-indigo-900');
  });

  it('should have error styling when status is error', () => {
    render(<StatusBanner status="error" message="Error message" />);
    const banner = screen.getByRole('status');
    expect(banner).toHaveClass('border-red-200', 'bg-red-50', 'text-red-700');
  });

  it('should have success styling when status is success', () => {
    render(<StatusBanner status="success" message="Success message" />);
    const banner = screen.getByRole('status');
    expect(banner).toHaveClass('border-emerald-200', 'bg-emerald-50', 'text-emerald-800');
  });

  it('should have info styling when status is info', () => {
    render(<StatusBanner status="info" message="Info message" />);
    const banner = screen.getByRole('status');
    expect(banner).toHaveClass('border-indigo-200', 'bg-indigo-50', 'text-indigo-900');
  });

  it('should have aria-live attribute', () => {
    render(<StatusBanner message="Test message" />);
    const banner = screen.getByRole('status');
    expect(banner).toHaveAttribute('aria-live', 'polite');
  });
});

