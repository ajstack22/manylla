import { ErrorHandler } from "../../utils/errors";

/**
 * Toast Manager for displaying user notifications
 * Supports error handling, queuing, and retry actions
 */
class ToastManagerClass {
  constructor() {
    this.queue = [];
    this.currentToast = null;
    this.toastComponent = null;
    this.idCounter = 0;
  }

  /**
   * Register the toast component reference
   */
  setToastRef(ref) {
    this.toastComponent = ref;
  }

  /**
   * Generate unique ID for toasts
   */
  generateId() {
    return `toast_${++this.idCounter}_${Date.now()}`;
  }

  /**
   * Show a toast message
   * @param {string} message - The message to display
   * @param {string} type - Type of toast (info, success, warning, error)
   * @param {object} options - Additional options
   */
  show(message, type = "info", options = {}) {
    const toast = {
      id: this.generateId(),
      message,
      type,
      duration: options.duration || this.getDefaultDuration(type),
      action: options.action,
      persistent: options.persistent || false,
      icon: options.icon || this.getDefaultIcon(type),
      timestamp: Date.now(),
    };

    // Add to queue
    this.queue.push(toast);

    // Process queue
    this.processQueue();

    return toast.id;
  }

  /**
   * Show error toast with special handling
   */
  showError(error, options = {}) {
    const normalizedError = ErrorHandler.normalize(error);
    const message = ErrorHandler.getUserMessage(normalizedError);

    const toastOptions = {
      ...options,
      persistent: !ErrorHandler.isRecoverable(normalizedError),
      action:
        normalizedError.recoverable && options.onRetry
          ? {
              label: "Retry",
              handler: options.onRetry,
            }
          : options.action,
    };

    // Log the error
    ErrorHandler.log(normalizedError, {
      context: "toast",
      userNotified: true,
    });

    return this.show(message, "error", toastOptions);
  }

  /**
   * Show success toast
   */
  showSuccess(message, options = {}) {
    return this.show(message, "success", options);
  }

  /**
   * Show warning toast
   */
  showWarning(message, options = {}) {
    return this.show(message, "warning", options);
  }

  /**
   * Show info toast
   */
  showInfo(message, options = {}) {
    return this.show(message, "info", options);
  }

  /**
   * Show toast with retry action
   */
  showWithRetry(message, retryFn, options = {}) {
    return this.show(message, "warning", {
      ...options,
      persistent: true,
      action: {
        label: "Retry",
        handler: retryFn,
      },
    });
  }

  /**
   * Hide a specific toast
   */
  hide(toastId) {
    // Remove from queue
    this.queue = this.queue.filter((t) => t.id !== toastId);

    // Hide if current
    if (this.currentToast?.id === toastId) {
      this.currentToast = null;
      if (this.toastComponent) {
        this.toastComponent.hide();
      }
      // Process next in queue
      this.processQueue();
    }
  }

  /**
   * Hide all toasts
   */
  hideAll() {
    this.queue = [];
    this.currentToast = null;
    if (this.toastComponent) {
      this.toastComponent.hide();
    }
  }

  /**
   * Process the toast queue
   */
  processQueue() {
    // Don't process if already showing a toast
    if (this.currentToast || this.queue.length < 1) {
      return;
    }

    // Get next toast
    const toast = this.queue.shift();
    this.currentToast = toast;

    // Display toast
    if (this.toastComponent) {
      this.toastComponent.show(toast);
    }

    // Auto-hide if not persistent
    if (!toast.persistent && toast.duration > 0) {
      setTimeout(() => {
        if (this.currentToast?.id === toast.id) {
          this.hide(toast.id);
        }
      }, toast.duration);
    }
  }

  /**
   * Get default duration based on type
   */
  getDefaultDuration(type) {
    switch (type) {
      case "error":
        return 5000; // 5 seconds for errors
      case "warning":
        return 4000; // 4 seconds for warnings
      case "success":
        return 3000; // 3 seconds for success
      case "info":
      default:
        return 3000; // 3 seconds for info
    }
  }

  /**
   * Get default icon based on type
   */
  getDefaultIcon(type) {
    switch (type) {
      case "error":
        return "❌";
      case "warning":
        return "⚠️";
      case "success":
        return "✅";
      case "info":
      default:
        return "ℹ️";
    }
  }
}

// Create singleton instance
const ToastManager = new ToastManagerClass();

// Export convenience functions
export const showToast = (message, type = "info", options = {}) => {
  return ToastManager.show(message, type, options);
};

export const showErrorToast = (error, options = {}) => {
  return ToastManager.showError(error, options);
};

export const showSuccessToast = (message, options = {}) => {
  return ToastManager.showSuccess(message, options);
};

export const showWarningToast = (message, options = {}) => {
  return ToastManager.showWarning(message, options);
};

export const showInfoToast = (message, options = {}) => {
  return ToastManager.showInfo(message, options);
};

export const hideToast = (toastId) => {
  ToastManager.hide(toastId);
};

export const hideAllToasts = () => {
  ToastManager.hideAll();
};

export default ToastManager;
