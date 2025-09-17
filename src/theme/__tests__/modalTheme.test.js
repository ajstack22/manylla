import {
  modalTheme,
  getModalDialogProps,
  getModalTextFieldProps,
  getModalButtonProps,
} from '../modalTheme';

// Mock the theme module
jest.mock('../theme', () => ({
  manyllaColors: {
    darkBrown: '#A08670',
    inputBackground: '#F5F5F5',
    avatarDefaultBg: '#A08670',
  },
}));

describe('modalTheme', () => {
  test('contains modal configuration', () => {
    expect(modalTheme.modal).toBeDefined();
    expect(modalTheme.modal.backdrop).toEqual({
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      backdropFilter: 'blur(4px)',
    });
    expect(modalTheme.modal.paper).toEqual({
      borderRadius: '16px',
      maxWidth: '600px',
      width: '90vw',
      maxHeight: '90vh',
    });
  });

  test('contains header styling configuration', () => {
    expect(modalTheme.header).toBeDefined();
    expect(modalTheme.header.backgroundColor).toBe('#A08670');
    expect(modalTheme.header.color).toBe('white');
    expect(modalTheme.header.height).toBe(4);
    expect(modalTheme.header.borderRadius).toBe('16px 16px 0 0');
  });

  test('contains content configuration', () => {
    expect(modalTheme.content).toBeDefined();
    expect(modalTheme.content.padding).toEqual({
      xs: 2,
      sm: 3,
    });
    expect(modalTheme.content.spacing).toBe(2);
  });

  test('contains text field styling', () => {
    expect(modalTheme.textField).toBeDefined();
    expect(modalTheme.textField.variant).toBe('filled');
    expect(modalTheme.textField.fullWidth).toBe(true);
    expect(modalTheme.textField.sx).toBeDefined();
  });

  test('contains button variants', () => {
    expect(modalTheme.buttons).toBeDefined();
    expect(modalTheme.buttons.primary).toBeDefined();
    expect(modalTheme.buttons.secondary).toBeDefined();
    expect(modalTheme.buttons.cancel).toBeDefined();

    expect(modalTheme.buttons.primary.variant).toBe('contained');
    expect(modalTheme.buttons.secondary.variant).toBe('outlined');
    expect(modalTheme.buttons.cancel.variant).toBe('text');
  });

  test('contains avatar size configurations', () => {
    expect(modalTheme.avatar).toBeDefined();
    expect(modalTheme.avatar.large).toEqual({
      width: 120,
      height: 120,
      bgcolor: '#A08670',
      color: 'white',
      fontSize: '3rem',
    });
    expect(modalTheme.avatar.medium).toEqual({
      width: 80,
      height: 80,
      bgcolor: '#A08670',
      color: 'white',
      fontSize: '2rem',
    });
    expect(modalTheme.avatar.small).toEqual({
      width: 80,
      height: 80,
      bgcolor: '#A08670',
      color: 'white',
      fontSize: '1.25rem',
    });
  });

  test('contains typography presets', () => {
    expect(modalTheme.typography).toBeDefined();
    expect(modalTheme.typography.modalTitle).toEqual({
      variant: 'h5',
      fontWeight: 600,
      textAlign: 'center',
      mb: 2,
    });
    expect(modalTheme.typography.modalSubtitle).toEqual({
      variant: 'body1',
      textAlign: 'center',
      color: 'text.secondary',
      mb: 2,
    });
    expect(modalTheme.typography.sectionTitle).toEqual({
      variant: 'h6',
      fontWeight: 600,
      mb: 2,
    });
  });

  test('contains shadow definitions', () => {
    expect(modalTheme.shadows).toBeDefined();
    expect(modalTheme.shadows.modal).toBe('0 8px 32px rgba(0, 0, 0, 0.12)');
    expect(modalTheme.shadows.panel).toBe('0 2px 8px rgba(0, 0, 0, 0.08)');
    expect(modalTheme.shadows.button).toBe('0 2px 4px rgba(0, 0, 0, 0.08)');
  });
});

describe('getModalDialogProps', () => {
  test('returns dialog props with default settings', () => {
    const props = getModalDialogProps();
    expect(props.fullScreen).toBe(false);
    expect(props.maxWidth).toBe('sm');
    expect(props.PaperProps).toBeDefined();
    expect(props.PaperProps.sx.borderRadius).toBe('16px');
  });

  test('returns dialog props for fullscreen mode', () => {
    const props = getModalDialogProps(true);
    expect(props.fullScreen).toBe(true);
    expect(props.PaperProps.sx.borderRadius).toBe(0);
  });

  test('includes box shadow in paper props', () => {
    const props = getModalDialogProps();
    expect(props.PaperProps.sx.boxShadow).toBe(modalTheme.shadows.modal);
  });
});

describe('getModalTextFieldProps', () => {
  test('returns text field configuration', () => {
    const props = getModalTextFieldProps();
    expect(props.variant).toBe('filled');
    expect(props.fullWidth).toBe(true);
    expect(props.sx).toBeDefined();
  });
});

describe('getModalButtonProps', () => {
  test('returns primary button props by default', () => {
    const props = getModalButtonProps();
    expect(props.variant).toBe('contained');
    expect(props.sx.borderRadius).toBe('8px');
    expect(props.sx.textTransform).toBe('none');
  });

  test('returns secondary button props when specified', () => {
    const props = getModalButtonProps('secondary');
    expect(props.variant).toBe('outlined');
    expect(props.sx.borderRadius).toBe('8px');
    expect(props.sx.textTransform).toBe('none');
  });

  test('returns cancel button props when specified', () => {
    const props = getModalButtonProps('cancel');
    expect(props.variant).toBe('text');
    expect(props.sx.borderRadius).toBe('8px');
    expect(props.sx.textTransform).toBe('none');
  });

  test('includes consistent padding and spacing', () => {
    const primaryProps = getModalButtonProps('primary');
    const secondaryProps = getModalButtonProps('secondary');
    const cancelProps = getModalButtonProps('cancel');

    expect(primaryProps.sx.px).toBe(3);
    expect(primaryProps.sx.py).toBe(1.5);
    expect(secondaryProps.sx.px).toBe(3);
    expect(secondaryProps.sx.py).toBe(1.5);
    expect(cancelProps.sx.px).toBe(3);
    expect(cancelProps.sx.py).toBe(1.5);
  });
});