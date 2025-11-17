import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RecentGenerations } from '../RecentGenerations';
import type { Generation } from '../../types';

describe('RecentGenerations', () => {
  const mockGenerations: Generation[] = [
    {
      id: '1',
      prompt: 'Futuristic metallic dress',
      style: 'Avant-garde',
      imageUrl: '/uploads/img1.png',
      createdAt: new Date('2024-01-01T10:00:00Z').toISOString(),
      status: 'completed',
    },
    {
      id: '2',
      prompt: 'Casual streetwear outfit',
      style: 'Streetwear',
      imageUrl: '/uploads/img2.png',
      createdAt: new Date('2024-01-02T11:00:00Z').toISOString(),
      status: 'completed',
    },
  ];

  it('should render section with heading', () => {
    const mockOnSelect = vi.fn();
    render(<RecentGenerations items={[]} onSelect={mockOnSelect} />);

    expect(screen.getByRole('region', { name: /recent generations/i })).toBeInTheDocument();
    expect(screen.getByText(/recent looks/i)).toBeInTheDocument();
  });

  it('should display empty state when no items', () => {
    const mockOnSelect = vi.fn();
    render(<RecentGenerations items={[]} onSelect={mockOnSelect} />);

    expect(screen.getByText(/your next five creations will live here/i)).toBeInTheDocument();
    expect(screen.getByText(/last 0/i)).toBeInTheDocument();
  });

  it('should display items count', () => {
    const mockOnSelect = vi.fn();
    render(<RecentGenerations items={mockGenerations} onSelect={mockOnSelect} />);

    expect(screen.getByText(/last 2/i)).toBeInTheDocument();
  });

  it('should render generation items', () => {
    const mockOnSelect = vi.fn();
    render(<RecentGenerations items={mockGenerations} onSelect={mockOnSelect} />);

    expect(screen.getByText('Futuristic metallic dress')).toBeInTheDocument();
    expect(screen.getByText('Casual streetwear outfit')).toBeInTheDocument();
  });

  it('should display generation images', () => {
    const mockOnSelect = vi.fn();
    const { container } = render(<RecentGenerations items={mockGenerations} onSelect={mockOnSelect} />);

    // Get all images by querying the DOM
    const images = container.querySelectorAll('img');
    expect(images.length).toBe(2);
    
    const imageSources = Array.from(images).map(img => img.getAttribute('src'));
    expect(imageSources).toContain('/uploads/img1.png');
    expect(imageSources).toContain('/uploads/img2.png');
  });

  it('should display style and time for each generation', () => {
    const mockOnSelect = vi.fn();
    render(<RecentGenerations items={mockGenerations} onSelect={mockOnSelect} />);

    // Check that styles are displayed (they appear in the format "Style · Time")
    const textContent = screen.getByText('Futuristic metallic dress').closest('button')?.textContent || '';
    expect(textContent).toContain('Avant-garde');
    
    const textContent2 = screen.getByText('Casual streetwear outfit').closest('button')?.textContent || '';
    expect(textContent2).toContain('Streetwear');
  });

  it('should call onSelect when item is clicked', async () => {
    const user = userEvent.setup();
    const mockOnSelect = vi.fn();
    render(<RecentGenerations items={mockGenerations} onSelect={mockOnSelect} />);

    const firstItem = screen.getByText('Futuristic metallic dress').closest('button');
    expect(firstItem).toBeInTheDocument();

    await user.click(firstItem!);

    expect(mockOnSelect).toHaveBeenCalledWith(mockGenerations[0]);
  });

  it('should call onSelect with correct generation when multiple items exist', async () => {
    const user = userEvent.setup();
    const mockOnSelect = vi.fn();
    render(<RecentGenerations items={mockGenerations} onSelect={mockOnSelect} />);

    const secondItem = screen.getByText('Casual streetwear outfit').closest('button');
    await user.click(secondItem!);

    expect(mockOnSelect).toHaveBeenCalledWith(mockGenerations[1]);
    expect(mockOnSelect).toHaveBeenCalledTimes(1);
  });
});

