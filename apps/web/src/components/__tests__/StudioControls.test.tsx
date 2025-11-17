import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { PromptInput } from '../PromptInput';
import { StyleSelect } from '../StyleSelect';
import { ImageUpload } from '../ImageUpload';
import { RecentGenerations } from '../RecentGenerations';
import type { Generation } from '../../types';

describe('Studio controls', () => {
  it('updates prompt input', async () => {
    const handleChange = vi.fn();
    render(<PromptInput value="" onChange={handleChange} />);
    const textarea = screen.getByLabelText(/prompt/i);
    await userEvent.type(textarea, 'Gala dress');
    expect(handleChange).toHaveBeenCalled();
  });

  it('changes style selection', async () => {
    const handleChange = vi.fn();
    render(<StyleSelect value="Minimalist" onChange={handleChange} />);
    const select = screen.getByLabelText(/style/i);
    await userEvent.selectOptions(select, ['Formal']);
    expect(handleChange).toHaveBeenCalledWith('Formal');
  });

  it('handles image uploads', async () => {
    const handleChange = vi.fn();
    render(<ImageUpload previewUrl={null} onFileChange={handleChange} />);
    const input = screen.getByLabelText(/base image/i);
    const file = new File(['test'], 'look.png', { type: 'image/png' });
    await userEvent.upload(input, file);
    expect(handleChange).toHaveBeenCalled();
  });

  it('selects a recent generation', async () => {
    const handleSelect = vi.fn();
    const mockItems: Generation[] = [
      {
        id: '1',
        prompt: 'Look 1',
        style: 'Formal',
        imageUrl: 'http://example.com/img.png',
        createdAt: new Date().toISOString(),
        status: 'completed',
      },
    ];
    render(<RecentGenerations items={mockItems} onSelect={handleSelect} />);
    await userEvent.click(screen.getByRole('button', { name: /look 1/i }));
    expect(handleSelect).toHaveBeenCalledWith(mockItems[0]);
  });
});

