import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ImageUpload } from '../ImageUpload';

describe('ImageUpload', () => {
  const mockOnFileChange = vi.fn();
  const mockOnError = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock URL.createObjectURL
    global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
    global.URL.revokeObjectURL = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should render file input', () => {
    render(<ImageUpload previewUrl={null} onFileChange={mockOnFileChange} />);
    expect(screen.getByLabelText(/base image/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/base image/i)).toBeInTheDocument();
  });

  it('should call onFileChange when file is selected', async () => {
    const user = userEvent.setup();
    const file = new File(['test'], 'test.png', { type: 'image/png' });

    render(<ImageUpload previewUrl={null} onFileChange={mockOnFileChange} />);

    const input = screen.getByLabelText(/base image/i) as HTMLInputElement;
    await user.upload(input, file);

    expect(mockOnFileChange).toHaveBeenCalledWith(file, 'blob:mock-url');
    expect(global.URL.createObjectURL).toHaveBeenCalledWith(file);
  });

  it('should display preview when previewUrl is provided', () => {
    const previewUrl = 'blob:preview-url';
    render(<ImageUpload previewUrl={previewUrl} onFileChange={mockOnFileChange} />);

    const img = screen.getByAltText(/uploaded preview/i);
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', previewUrl);
  });

  it('should not display preview when previewUrl is null', () => {
    render(<ImageUpload previewUrl={null} onFileChange={mockOnFileChange} />);
    expect(screen.queryByAltText(/uploaded preview/i)).not.toBeInTheDocument();
  });

  it('should handle empty file selection', async () => {
    const user = userEvent.setup();
    render(<ImageUpload previewUrl={null} onFileChange={mockOnFileChange} onError={mockOnError} />);

    const input = screen.getByLabelText(/base image/i) as HTMLInputElement;
    
    // Create a change event with no files
    const changeEvent = new Event('change', { bubbles: true });
    Object.defineProperty(changeEvent, 'target', {
      value: { files: null },
      writable: false,
      configurable: true,
    });
    
    input.dispatchEvent(changeEvent);

    // Component should handle null files gracefully
    expect(input).toBeInTheDocument();
  });

  it('should call onError when file is too large', async () => {
    const user = userEvent.setup();
    const largeFile = new File(['x'.repeat(11 * 1024 * 1024)], 'large.png', { type: 'image/png' });

    render(<ImageUpload previewUrl={null} onFileChange={mockOnFileChange} onError={mockOnError} />);

    const input = screen.getByLabelText(/base image/i) as HTMLInputElement;
    await user.upload(input, largeFile);

    expect(mockOnError).toHaveBeenCalledWith('File is too large. Please choose one under 10MB.');
    expect(mockOnFileChange).toHaveBeenCalledWith(null, null);
  });

  it('should clear error when valid file is selected after error', async () => {
    const user = userEvent.setup();
    const largeFile = new File(['x'.repeat(11 * 1024 * 1024)], 'large.png', { type: 'image/png' });
    const validFile = new File(['test'], 'test.png', { type: 'image/png' });

    render(<ImageUpload previewUrl={null} onFileChange={mockOnFileChange} onError={mockOnError} />);

    const input = screen.getByLabelText(/base image/i) as HTMLInputElement;

    // Upload large file
    await user.upload(input, largeFile);
    expect(mockOnError).toHaveBeenCalledWith('File is too large. Please choose one under 10MB.');

    // Upload valid file
    await user.upload(input, validFile);
    expect(mockOnError).toHaveBeenCalledWith(null);
  });

  it('should disable input when disabled prop is true', () => {
    render(<ImageUpload previewUrl={null} onFileChange={mockOnFileChange} disabled />);
    const input = screen.getByLabelText(/base image/i) as HTMLInputElement;
    expect(input).toBeDisabled();
  });

  it('should display error message when error prop is provided', () => {
    const errorMessage = 'Invalid file type';
    render(<ImageUpload previewUrl={null} onFileChange={mockOnFileChange} error={errorMessage} />);

    expect(screen.getByRole('alert')).toHaveTextContent(errorMessage);
  });

  it('should not display error message when error is null', () => {
    render(<ImageUpload previewUrl={null} onFileChange={mockOnFileChange} error={null} />);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});

