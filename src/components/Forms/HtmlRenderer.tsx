import React from 'react';
import { Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';

interface HtmlRendererProps {
  content: string;
  variant?: 'body1' | 'body2' | 'h6';
}

export const HtmlRenderer: React.FC<HtmlRendererProps> = ({
  content,
  variant = 'body2',
}) => {
  const theme = useTheme();

  // Check if content contains HTML tags
  const hasHtml = /<[^>]*>/.test(content);

  if (!hasHtml) {
    // Plain text - just render as is
    return (
      <Typography
        variant={variant}
        sx={{
          fontSize: variant === 'body2' ? '15px' : '16px',
          lineHeight: 1.65,
          letterSpacing: '0.3px',
        }}
      >
        {content}
      </Typography>
    );
  }

  // HTML content - render with styling
  return (
    <Typography
      component="div"
      variant={variant}
      sx={{
        fontSize: variant === 'body2' ? '15px' : '16px',
        lineHeight: 1.65,
        letterSpacing: '0.3px',
        wordSpacing: '0.05em',
        '& p': {
          margin: 0,
          marginBottom: '1em',
          lineHeight: 1.7,
          '&:last-child': {
            marginBottom: 0,
          },
        },
        '& ul, & ol': {
          marginTop: 0,
          marginBottom: '1em',
          paddingLeft: '1.5em',
          lineHeight: 1.8,
        },
        '& li': {
          marginBottom: '0.5em',
          paddingLeft: '0.25em',
        },
        '& strong, & b': {
          fontWeight: 600,
          color: theme.palette.text.primary,
        },
        '& em, & i': {
          fontStyle: 'italic',
        },
        '& code': {
          backgroundColor: theme.palette.action.hover,
          padding: '2px 6px',
          borderRadius: '4px',
          fontFamily: 'monospace',
          fontSize: '0.9em',
        },
        '& a': {
          color: theme.palette.primary.main,
          textDecoration: 'underline',
        },
      }}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
};