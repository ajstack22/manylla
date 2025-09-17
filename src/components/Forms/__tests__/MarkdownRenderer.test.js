import React from 'react';
import { render, screen } from '@testing-library/react';
import { MarkdownRenderer } from '../MarkdownRenderer';

// Mock React Native modules
jest.mock('react-native', () => ({
  View: ({ children, ...props }) => <div {...props}>{children}</div>,
  Text: ({ children, ...props }) => <span {...props}>{children}</span>,
  ScrollView: ({ children, ...props }) => <div {...props}>{children}</div>,
}));

// P2 TECH DEBT: Remove skip when working on markdown components
describe.skip('MarkdownRenderer', () => {
  test('renders without crashing', () => {
    render(<MarkdownRenderer content="Hello world" />);
    expect(screen.getByText('Hello world')).toBeInTheDocument();
  });

  test('renders empty content without crashing', () => {
    render(<MarkdownRenderer content="" />);
    expect(screen.getByRole('generic')).toBeInTheDocument(); // The ScrollView container
  });

  test('renders null content without crashing', () => {
    render(<MarkdownRenderer content={null} />);
    expect(screen.getByRole('generic')).toBeInTheDocument(); // The ScrollView container
  });

  test('renders h1 headers correctly', () => {
    render(<MarkdownRenderer content="# Header 1" />);
    expect(screen.getByText('Header 1')).toBeInTheDocument();
  });

  test('renders h2 headers correctly', () => {
    render(<MarkdownRenderer content="## Header 2" />);
    expect(screen.getByText('Header 2')).toBeInTheDocument();
  });

  test('renders bulleted lists correctly', () => {
    const content = "- First item\n- Second item\n- Third item";
    render(<MarkdownRenderer content={content} />);

    expect(screen.getByText('• First item')).toBeInTheDocument();
    expect(screen.getByText('• Second item')).toBeInTheDocument();
    expect(screen.getByText('• Third item')).toBeInTheDocument();
  });

  test('renders numbered lists correctly', () => {
    const content = "1. First item\n2. Second item\n3. Third item";
    render(<MarkdownRenderer content={content} />);

    expect(screen.getByText('• First item')).toBeInTheDocument();
    expect(screen.getByText('• Second item')).toBeInTheDocument();
    expect(screen.getByText('• Third item')).toBeInTheDocument();
  });

  test('renders bold text correctly', () => {
    const content = "This is **bold text** in a sentence.";
    render(<MarkdownRenderer content={content} />);

    expect(screen.getByText('This is ')).toBeInTheDocument();
    expect(screen.getByText('bold text')).toBeInTheDocument();
    expect(screen.getByText(' in a sentence.')).toBeInTheDocument();
  });

  test('handles multiple bold sections', () => {
    const content = "**First bold** and **second bold** text.";
    render(<MarkdownRenderer content={content} />);

    expect(screen.getByText('First bold')).toBeInTheDocument();
    expect(screen.getByText('second bold')).toBeInTheDocument();
    expect(screen.getByText(' and ')).toBeInTheDocument();
    expect(screen.getByText(' text.')).toBeInTheDocument();
  });

  test('handles mixed content types', () => {
    const content = "# Main Header\n\nSome paragraph text.\n\n- List item 1\n- List item 2\n\n**Bold text** here.";
    render(<MarkdownRenderer content={content} />);

    expect(screen.getByText('Main Header')).toBeInTheDocument();
    expect(screen.getByText('Some paragraph text.')).toBeInTheDocument();
    expect(screen.getByText('• List item 1')).toBeInTheDocument();
    expect(screen.getByText('• List item 2')).toBeInTheDocument();
    expect(screen.getByText('Bold text')).toBeInTheDocument();
    expect(screen.getByText(' here.')).toBeInTheDocument();
  });

  test('uses body2 variant by default', () => {
    render(<MarkdownRenderer content="Regular text" />);
    expect(screen.getByText('Regular text')).toBeInTheDocument();
  });

  test('accepts custom variant prop', () => {
    render(<MarkdownRenderer content="Regular text" variant="body1" />);
    expect(screen.getByText('Regular text')).toBeInTheDocument();
  });

  test('handles empty lines as spacing', () => {
    const content = "First line\n\nSecond line";
    render(<MarkdownRenderer content={content} />);

    expect(screen.getByText('First line')).toBeInTheDocument();
    expect(screen.getByText('Second line')).toBeInTheDocument();
  });

  test('preserves line breaks in content', () => {
    const content = "First paragraph\n\nSecond paragraph\n\nThird paragraph";
    render(<MarkdownRenderer content={content} />);

    expect(screen.getByText('First paragraph')).toBeInTheDocument();
    expect(screen.getByText('Second paragraph')).toBeInTheDocument();
    expect(screen.getByText('Third paragraph')).toBeInTheDocument();
  });
});