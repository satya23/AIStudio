import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PromptInput } from '../PromptInput';

describe('PromptInput', () => {
  it('should render textarea with label', () => {
    const mockOnChange = vi.fn();
    render(<PromptInput value="" onChange={mockOnChange} />);

    expect(screen.getByLabelText(/prompt/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/metallic dress/i)).toBeInTheDocument();
  });

  it('should display current value', () => {
    const mockOnChange = vi.fn();
    const value = 'Test prompt text';
    render(<PromptInput value={value} onChange={mockOnChange} />);

    expect(screen.getByLabelText(/prompt/i)).toHaveValue(value);
  });

  it('should call onChange when value changes', async () => {
    const user = userEvent.setup();
    const mockOnChange = vi.fn();
    render(<PromptInput value="" onChange={mockOnChange} />);

    const textarea = screen.getByLabelText(/prompt/i);
    await user.type(textarea, 'New prompt');

    expect(mockOnChange).toHaveBeenCalled();
  });

  it('should display character count', () => {
    const mockOnChange = vi.fn();
    const value = 'Test prompt';
    render(<PromptInput value={value} onChange={mockOnChange} />);

    expect(screen.getByText(`${value.length}/280`)).toBeInTheDocument();
  });

  it('should update character count as user types', async () => {
    const user = userEvent.setup();
    const mockOnChange = vi.fn();
    const { rerender } = render(<PromptInput value="" onChange={mockOnChange} />);

    const textarea = screen.getByLabelText(/prompt/i);
    await user.type(textarea, 'Hello');

    // Update the component with new value
    rerender(<PromptInput value="Hello" onChange={mockOnChange} />);

    expect(screen.getByText('5/280')).toBeInTheDocument();
  });

  it('should have maxLength of 280', () => {
    const mockOnChange = vi.fn();
    render(<PromptInput value="" onChange={mockOnChange} />);

    const textarea = screen.getByLabelText(/prompt/i);
    expect(textarea).toHaveAttribute('maxLength', '280');
  });

  it('should be disabled when disabled prop is true', () => {
    const mockOnChange = vi.fn();
    render(<PromptInput value="" onChange={mockOnChange} disabled />);

    const textarea = screen.getByLabelText(/prompt/i);
    expect(textarea).toBeDisabled();
  });

  it('should not be disabled when disabled prop is false', () => {
    const mockOnChange = vi.fn();
    render(<PromptInput value="" onChange={mockOnChange} disabled={false} />);

    const textarea = screen.getByLabelText(/prompt/i);
    expect(textarea).not.toBeDisabled();
  });
});

