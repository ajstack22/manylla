import platform from '../../../utils/platform';

/**
 * Custom hook for date formatting with automatic slash insertion for mobile
 * Web uses native date input, mobile uses formatted text input
 */
export const useDateFormatter = () => {
  const formatDateInput = (text) => {
    // Remove all non-numeric characters
    const cleaned = text.replace(/\D/g, '');

    // Apply MM/DD/YYYY format
    let formatted = cleaned;
    if (cleaned.length >= 3 && cleaned.length <= 4) {
      formatted = `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
    } else if (cleaned.length >= 5) {
      formatted = `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}/${cleaned.slice(4, 8)}`;
    }

    return formatted;
  };

  const handleDateChange = (value, setter) => {
    if (platform.isWeb) {
      setter(value);
    } else {
      // Mobile text input with formatting
      const formatted = formatDateInput(value);
      setter(formatted);
    }
  };

  return {
    formatDateInput,
    handleDateChange,
  };
};
