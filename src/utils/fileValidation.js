/**
 * FileValidation - Utilities for validating file types and content
 * Checks magic bytes, file sizes, and ensures file integrity
 */

// File signatures (magic bytes) for validation
const FILE_SIGNATURES = {
  'application/pdf': [
    { offset: 0, bytes: [0x25, 0x50, 0x44, 0x46] }, // %PDF
    { offset: -7, bytes: [0x25, 0x25, 0x45, 0x4F, 0x46] } // %%EOF (near end)
  ],
  'image/jpeg': [
    { offset: 0, bytes: [0xFF, 0xD8, 0xFF] }, // JPEG start
    { offset: -2, bytes: [0xFF, 0xD9] } // JPEG end
  ],
  'image/png': [
    { offset: 0, bytes: [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A] } // PNG header
  ],
  'image/heic': [
    { offset: 4, bytes: [0x66, 0x74, 0x79, 0x70] }, // ftyp
    { offset: 8, bytes: [0x68, 0x65, 0x69, 0x63] } // heic
  ],
  'image/heif': [
    { offset: 4, bytes: [0x66, 0x74, 0x79, 0x70] }, // ftyp
    { offset: 8, bytes: [0x6D, 0x69, 0x66, 0x31] } // mif1
  ],
  'application/msword': [
    { offset: 0, bytes: [0xD0, 0xCF, 0x11, 0xE0, 0xA1, 0xB1, 0x1A, 0xE1] } // DOC
  ],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': [
    { offset: 0, bytes: [0x50, 0x4B, 0x03, 0x04] }, // ZIP header (DOCX is ZIP)
    { offset: 30, pattern: 'word/' } // Contains word/ directory
  ],
  'text/plain': [
    // Text files don't have magic bytes, check for valid UTF-8
    { validator: 'utf8' }
  ]
};

// Maximum file sizes by type
const MAX_FILE_SIZES = {
  'application/pdf': 50 * 1024 * 1024, // 50MB
  'image/jpeg': 25 * 1024 * 1024, // 25MB
  'image/png': 25 * 1024 * 1024, // 25MB
  'image/heic': 25 * 1024 * 1024, // 25MB
  'image/heif': 25 * 1024 * 1024, // 25MB
  'application/msword': 50 * 1024 * 1024, // 50MB
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 50 * 1024 * 1024, // 50MB
  'text/plain': 10 * 1024 * 1024, // 10MB
  'default': 50 * 1024 * 1024 // 50MB default
};

/**
 * Validate file type using magic bytes
 * @param {File|Blob|ArrayBuffer} file - File to validate
 * @param {string} declaredType - MIME type declared by user/system
 * @returns {Promise<boolean>} True if file type matches signature
 */
export async function validateFileType(file, declaredType) {
  const signature = FILE_SIGNATURES[declaredType];
  if (!signature) {
    // Unknown type, can't validate
    return false;
  }

  // Get file data as ArrayBuffer
  let arrayBuffer;
  if (file instanceof ArrayBuffer) {
    arrayBuffer = file;
  } else if (file instanceof Blob || file instanceof File) {
    arrayBuffer = await file.arrayBuffer();
  } else if (file.uri) {
    // React Native file object
    return true; // Can't easily validate on RN without native module
  } else {
    return false;
  }

  const bytes = new Uint8Array(arrayBuffer);

  // Check each signature requirement
  for (const check of signature) {
    if (check.validator === 'utf8') {
      // Special case: validate UTF-8
      return isValidUTF8(bytes);
    }

    if (check.pattern) {
      // Check for string pattern
      const patternBytes = new TextEncoder().encode(check.pattern);
      if (!findPattern(bytes, patternBytes, check.offset)) {
        return false;
      }
    } else if (check.bytes) {
      // Check magic bytes
      const offset = check.offset < 0
        ? bytes.length + check.offset
        : check.offset;

      if (offset < 0 || offset + check.bytes.length > bytes.length) {
        return false;
      }

      for (let i = 0; i < check.bytes.length; i++) {
        if (bytes[offset + i] !== check.bytes[i]) {
          return false;
        }
      }
    }
  }

  return true;
}

/**
 * Validate file size
 * @param {number} size - File size in bytes
 * @param {string} type - MIME type
 * @returns {boolean} True if size is acceptable
 */
export function validateFileSize(size, type) {
  const maxSize = MAX_FILE_SIZES[type] || MAX_FILE_SIZES.default;
  return size > 0 && size <= maxSize;
}

/**
 * Comprehensive file validation
 * @param {Object} file - File object with size, type, name properties
 * @param {ArrayBuffer|Blob} fileData - Optional file data for magic byte checking
 * @returns {Promise<Object>} Validation result
 */
export async function validateFile(file, fileData) {
  const result = {
    valid: true,
    errors: [],
    warnings: []
  };

  // Check file exists and has required properties
  if (!file) {
    result.valid = false;
    result.errors.push('No file provided');
    return result;
  }

  // Check file size
  if (!validateFileSize(file.size, file.type)) {
    result.valid = false;
    const maxSize = MAX_FILE_SIZES[file.type] || MAX_FILE_SIZES.default;
    result.errors.push(`File size ${formatBytes(file.size)} exceeds maximum of ${formatBytes(maxSize)}`);
  }

  // Check file type if we have the data
  if (fileData) {
    const typeValid = await validateFileType(fileData, file.type);
    if (!typeValid) {
      result.valid = false;
      result.errors.push('File content does not match declared type');
    }
  }

  // Check for suspicious patterns
  const suspicious = checkSuspiciousContent(file.name, file.type);
  if (suspicious) {
    result.warnings.push(suspicious);
  }

  // Check extension matches type
  const expectedExt = getExpectedExtension(file.type);
  const actualExt = file.name?.split('.').pop()?.toLowerCase();
  if (expectedExt && actualExt && !expectedExt.includes(actualExt)) {
    result.warnings.push(`File extension .${actualExt} doesn't match type ${file.type}`);
  }

  return result;
}

/**
 * Check for suspicious file content patterns
 * @param {string} fileName - File name
 * @param {string} fileType - MIME type
 * @returns {string|null} Warning message or null
 */
function checkSuspiciousContent(fileName, fileType) {
  // Check for double extensions (possible attack)
  const doubleExtPattern = /\.(exe|scr|bat|cmd|com|pif|vbs|js|jar|zip|rar)\./i;
  if (doubleExtPattern.test(fileName)) {
    return 'File has suspicious double extension';
  }

  // Check for executable disguised as document
  const execPattern = /\.(exe|scr|bat|cmd|com|pif|vbs|js|jar|app|deb|rpm)$/i;
  if (execPattern.test(fileName) && fileType?.startsWith('application/')) {
    return 'Possible executable file disguised as document';
  }

  // Check for very long filenames (possible buffer overflow attempt)
  if (fileName && fileName.length > 255) {
    return 'File name is unusually long';
  }

  // Check for null bytes in filename
  if (fileName && fileName.includes('\x00')) {
    return 'File name contains null bytes';
  }

  return null;
}

/**
 * Get expected file extensions for a MIME type
 * @param {string} mimeType - MIME type
 * @returns {Array<string>} Expected extensions
 */
function getExpectedExtension(mimeType) {
  const extensions = {
    'application/pdf': ['pdf'],
    'application/msword': ['doc'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['docx'],
    'text/plain': ['txt', 'text'],
    'image/jpeg': ['jpg', 'jpeg'],
    'image/png': ['png'],
    'image/heic': ['heic'],
    'image/heif': ['heif', 'heic']
  };

  return extensions[mimeType] || null;
}

/**
 * Check if byte array is valid UTF-8
 * @param {Uint8Array} bytes - Byte array to check
 * @returns {boolean} True if valid UTF-8
 */
function isValidUTF8(bytes) {
  try {
    // Try to decode as UTF-8
    const decoder = new TextDecoder('utf-8', { fatal: true });
    decoder.decode(bytes);
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Find pattern in byte array
 * @param {Uint8Array} haystack - Bytes to search in
 * @param {Uint8Array} needle - Pattern to find
 * @param {number} startOffset - Where to start searching
 * @returns {boolean} True if pattern found
 */
function findPattern(haystack, needle, startOffset = 0) {
  const start = Math.max(0, startOffset);
  const end = haystack.length - needle.length;

  for (let i = start; i <= end; i++) {
    let found = true;
    for (let j = 0; j < needle.length; j++) {
      if (haystack[i + j] !== needle[j]) {
        found = false;
        break;
      }
    }
    if (found) return true;
  }

  return false;
}

/**
 * Format bytes to human readable string
 * @param {number} bytes - Number of bytes
 * @returns {string} Formatted string
 */
function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Sanitize filename for safe storage
 * @param {string} filename - Original filename
 * @returns {string} Sanitized filename
 */
export function sanitizeFilename(filename) {
  if (!filename) return 'unnamed';

  // Remove path components
  filename = filename.split(/[\/\\]/).pop() || 'unnamed';

  // Remove dangerous characters
  filename = filename.replace(/[^a-zA-Z0-9._-]/g, '_');

  // Remove multiple dots (except for extension)
  filename = filename.replace(/\.{2,}/g, '_');

  // Limit length
  if (filename.length > 100) {
    const ext = filename.split('.').pop();
    const name = filename.substring(0, 95);
    filename = ext && ext.length < 10 ? `${name}.${ext}` : name;
  }

  // Ensure it doesn't start with a dot (hidden file)
  if (filename.startsWith('.')) {
    filename = '_' + filename.substring(1);
  }

  return filename || 'unnamed';
}

/**
 * Check if file type is supported
 * @param {string} mimeType - MIME type to check
 * @returns {boolean} True if supported
 */
export function isFileTypeSupported(mimeType) {
  const supportedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'image/jpeg',
    'image/png',
    'image/heic',
    'image/heif'
  ];

  return supportedTypes.includes(mimeType);
}

/**
 * Get file type category
 * @param {string} mimeType - MIME type
 * @returns {string} Category (document, image, text, unknown)
 */
export function getFileCategory(mimeType) {
  if (!mimeType) return 'unknown';

  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('text/')) return 'text';
  if (mimeType.includes('pdf') || mimeType.includes('word')) return 'document';

  return 'unknown';
}

/**
 * Estimate encrypted file size
 * Accounts for encryption overhead and base64 encoding
 * @param {number} originalSize - Original file size in bytes
 * @returns {number} Estimated encrypted size
 */
export function estimateEncryptedSize(originalSize) {
  // NaCl adds 24 bytes per chunk (nonce) + 16 bytes (auth tag)
  const chunkSize = 1024 * 1024; // 1MB chunks
  const numChunks = Math.ceil(originalSize / chunkSize);
  const encryptionOverhead = numChunks * (24 + 16);

  // Base64 encoding adds ~33% overhead
  const base64Overhead = originalSize * 0.33;

  return Math.ceil(originalSize + encryptionOverhead + base64Overhead);
}