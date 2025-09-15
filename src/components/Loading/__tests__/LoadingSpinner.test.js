/**
 * LoadingSpinner Component Tests
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { LoadingSpinner } from '../LoadingSpinner';

describe('LoadingSpinner', () => {
  describe('Basic rendering', () => {
    test('should render with default props', () => {
      render(<LoadingSpinner />);

      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    test('should render custom message', () => {
      render(<LoadingSpinner message="Processing..." />);

      expect(screen.getByText('Processing...')).toBeInTheDocument();
    });

    test('should render without message when message is null', () => {
      render(<LoadingSpinner message={null} />);

      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    test('should render without message when message is empty string', () => {
      render(<LoadingSpinner message="" />);

      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });
  });

  describe('Size variants', () => {
    test('should render with small size', () => {
      const { container } = render(<LoadingSpinner size="small" />);

      expect(container).toBeInTheDocument();
    });

    test('should render with large size (default)', () => {
      const { container } = render(<LoadingSpinner size="large" />);

      expect(container).toBeInTheDocument();
    });
  });

  describe('Full screen mode', () => {
    test('should render in fullScreen mode', () => {
      render(<LoadingSpinner fullScreen={true} />);

      const spinnerElement = screen.getByRole('progressbar');
      expect(spinnerElement).toBeInTheDocument();
      // Test that fullScreen mode renders properly without direct DOM access
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    test('should render in normal mode by default', () => {
      render(<LoadingSpinner fullScreen={false} />);

      const spinnerElement = screen.getByRole('progressbar');
      expect(spinnerElement).toBeInTheDocument();
      // Test that normal mode renders properly without direct DOM access
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });
  });

  describe('Props combinations', () => {
    test('should handle all props together', () => {
      render(
        <LoadingSpinner
          message="Custom loading message"
          size="small"
          fullScreen={true}
        />
      );

      expect(screen.getByText('Custom loading message')).toBeInTheDocument();
    });

    test('should handle size and color props together', () => {
      render(<LoadingSpinner size="large" color="#FF0000" />);

      const progressbar = screen.getByRole('progressbar');
      expect(progressbar).toBeInTheDocument();
    });

    test('should handle fullScreen with size prop', () => {
      render(<LoadingSpinner fullScreen={true} size="small" />);

      const progressbar = screen.getByRole('progressbar');
      expect(progressbar).toBeInTheDocument();
    });
  });

  describe('Edge cases', () => {
    test('should handle invalid size prop gracefully', () => {
      render(<LoadingSpinner size="invalid" />);

      const progressbar = screen.getByRole('progressbar');
      expect(progressbar).toBeInTheDocument();
    });

    test('should handle invalid color prop gracefully', () => {
      render(<LoadingSpinner color="not-a-color" />);

      const progressbar = screen.getByRole('progressbar');
      expect(progressbar).toBeInTheDocument();
    });

    test('should handle undefined props', () => {
      render(<LoadingSpinner size={undefined} color={undefined} fullScreen={undefined} />);

      const progressbar = screen.getByRole('progressbar');
      expect(progressbar).toBeInTheDocument();
    });

    test('should handle null props', () => {
      render(<LoadingSpinner size={null} color={null} fullScreen={null} />);

      const progressbar = screen.getByRole('progressbar');
      expect(progressbar).toBeInTheDocument();
    });

    test('should handle empty string message', () => {
      render(<LoadingSpinner message="" />);

      const progressbar = screen.getByRole('progressbar');
      expect(progressbar).toBeInTheDocument();
    });

    test('should handle boolean size prop', () => {
      render(<LoadingSpinner size={true} />);

      const progressbar = screen.getByRole('progressbar');
      expect(progressbar).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    test('should have proper accessibility role', () => {
      render(<LoadingSpinner />);

      const progressbar = screen.getByRole('progressbar');
      expect(progressbar).toBeInTheDocument();
    });

    test('should be accessible in all configurations', () => {
      const configurations = [
        { fullScreen: true },
        { size: 'small' },
        { size: 'large' },
        { color: '#FF0000' },
        { fullScreen: true, size: 'large', color: '#00FF00' },
        { message: 'Loading data...' }
      ];

      configurations.forEach(config => {
        const { unmount } = render(<LoadingSpinner {...config} />);
        const progressbar = screen.getByRole('progressbar');
        expect(progressbar).toBeInTheDocument();
        unmount();
      });
    });
  });

  describe('Component consistency', () => {
    test('should render consistently across multiple mounts', () => {
      const { unmount } = render(<LoadingSpinner />);
      let progressbar = screen.getByRole('progressbar');
      expect(progressbar).toBeInTheDocument();
      unmount();

      render(<LoadingSpinner />);
      progressbar = screen.getByRole('progressbar');
      expect(progressbar).toBeInTheDocument();
    });

    test('should handle rapid prop changes', () => {
      const { rerender } = render(<LoadingSpinner size="small" />);
      expect(screen.getByRole('progressbar')).toBeInTheDocument();

      rerender(<LoadingSpinner size="large" />);
      expect(screen.getByRole('progressbar')).toBeInTheDocument();

      rerender(<LoadingSpinner fullScreen={true} />);
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    test('should maintain component integrity with complex prop combinations', () => {
      const complexProps = {
        message: 'Loading complex data with special characters: @#$%^&*()',
        size: 'large',
        color: '#123456',
        fullScreen: true
      };

      render(<LoadingSpinner {...complexProps} />);

      const progressbar = screen.getByRole('progressbar');
      expect(progressbar).toBeInTheDocument();
      expect(screen.getByText(complexProps.message)).toBeInTheDocument();
    });
  });
});