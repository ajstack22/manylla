/**
 * API Configuration for Manylla
 * Phase 3 Cloud Storage Implementation
 */

// Determine the API base URL based on environment
const getApiBaseUrl = () => {
  // Check for development environment
  if (process.env.NODE_ENV === 'development') {
    // Use local API during development
    return 'http://localhost:3000/api';
  }
  
  // Production/staging detection based on hostname
  const hostname = window.location.hostname;
  
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return '/api';
  } else if (hostname.includes('manylla.com')) {
    // Check if we're on qual/staging
    if (window.location.pathname.startsWith('/qual')) {
      return '/qual/api';
    }
    // Production
    return '/api';
  } else if (hostname.includes('stackmap.app')) {
    // Deployed to StackMap domain
    return '/manylla/api';
  }
  
  // Default fallback
  return '/api';
};

export const API_BASE_URL = getApiBaseUrl();

// API Endpoints
export const API_ENDPOINTS = {
  // Sync endpoints (Phase 3)
  sync: {
    push: `${API_BASE_URL}/sync/push_timestamp.php`,
    pull: `${API_BASE_URL}/sync/pull_timestamp.php`,
    create: `${API_BASE_URL}/sync/create_timestamp.php`,
    join: `${API_BASE_URL}/sync/join_timestamp.php`,
    backup: `${API_BASE_URL}/sync/backup.php`,
    restore: `${API_BASE_URL}/sync/restore.php`,
    createInvite: `${API_BASE_URL}/sync/create_invite.php`,
    validateInvite: `${API_BASE_URL}/sync/validate_invite.php`,
    useInvite: `${API_BASE_URL}/sync/use_invite.php`,
    health: `${API_BASE_URL}/sync/health.php`
  },
  
  // Share endpoints (Phase 3)
  share: {
    create: `${API_BASE_URL}/share/create.php`,
    access: `${API_BASE_URL}/share/access.php`
  }
};

// Export for debugging
if (process.env.NODE_ENV === 'development') {
  console.log('[API] Configuration:', {
    baseUrl: API_BASE_URL,
    endpoints: API_ENDPOINTS
  });
}

export default {
  API_BASE_URL,
  API_ENDPOINTS
};