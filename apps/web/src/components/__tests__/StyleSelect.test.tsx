import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StyleSelect } from '../StyleSelect';

describe('StyleSelect', () => {
  it('should render select with label', () => {
    const mockOnChange = vi.fn();
    render(<StyleSelect value="Minimalist" onChange={mockOnChange} />);

    expect(screen.getByLabelText(/style/i)).toBeInTheDocument();
  });

  it('should display all style options', () => {
    const mockOnChange = vi.fn();
    render(<StyleSelect value="Minimalist" onChange={mockOnChange} />);

    const select = screen.getByLabelText(/style/i);
    expect(select).toHaveValue('Minimalist');

    const options = Array.from(select.querySelectorAll('option')).map((opt) => opt.textContent);
    expect(options).toEqual(['Avant-garde', 'Streetwear', 'Minimalist', 'Formal', 'Retro']);
  });

  it('should call onChange when value changes', async () => {
    const user = userEvent.setup();
    const mockOnChange = vi.fn();
    render(<StyleSelect value="Minimalist" onChange={mockOnChange} />);

    const select = screen.getByLabelText(/style/i);
    await user.selectOptions(select, 'Avant-garde');

    expect(mockOnChange).toHaveBeenCalledWith('Avant-garde');
  });

  it('should display current value', () => {
    const mockOnChange = vi.fn();
    render(<StyleSelect value="Formal" onChange={mockOnChange} />);

    const select = screen.getByLabelText(/style/i);
    expect(select).toHaveValue('Formal');
  });

  it('should be disabled when disabled prop is true', () => {
    const mockOnChange = vi.fn();
    render(<StyleSelect value="Minimalist" onChange={mockOnChange} disabled />);

    const select = screen.getByLabelText(/style/i);
    expect(select).toBeDisabled();
  });

  it('should not be disabled when disabled prop is false', () => {
    const mockOnChange = vi.fn();
    render(<StyleSelect value="Minimalist" onChange={mockOnChange} disabled={false} />);

    const select = screen.getByLabelText(/style/i);
    expect(select).not.toBeDisabled();
  });
});

