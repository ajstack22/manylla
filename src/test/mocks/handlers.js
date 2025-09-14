// Use require syntax for MSW v2 compatibility with Jest
const { http, HttpResponse } = require('../../../../node_modules/msw/lib/core');

// Use hardcoded URLs to avoid window dependency in tests
const API_BASE_URL = 'https://manylla.com/qual/api';

// Mock API responses for testing
const handlers = [
  // Health check endpoint
  http.get(`${API_BASE_URL}/sync_health.php`, () => {
    return HttpResponse.json({
      status: 'healthy',
      timestamp: Date.now(),
    });
  }),

  // Sync push endpoint
  http.post(`${API_BASE_URL}/sync_push.php`, async ({ request }) => {
    const body = await request.json();

    // Validate required fields
    if (!body.sync_id || !body.data) {
      return HttpResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Simulate successful push
    return HttpResponse.json({
      success: true,
      timestamp: Date.now(),
    });
  }),

  // Sync pull endpoint
  http.get(`${API_BASE_URL}/sync_pull.php`, ({ request }) => {
    const url = new URL(request.url);
    const syncId = url.searchParams.get('sync_id');

    if (!syncId) {
      return HttpResponse.json(
        { success: false, error: 'Missing sync_id' },
        { status: 400 }
      );
    }

    // Return no data found for most tests
    return HttpResponse.json({
      success: false,
      error: 'No data found',
    });
  }),

  // Share create endpoint
  http.post(`${API_BASE_URL}/share_create.php`, async ({ request }) => {
    const body = await request.json();

    if (!body.data) {
      return HttpResponse.json(
        { success: false, error: 'Missing data' },
        { status: 400 }
      );
    }

    // Return mock share ID
    return HttpResponse.json({
      success: true,
      share_id: 'test_share_123',
      url: 'https://manylla.com/qual/share/test_share_123#testkey',
      expires_at: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    });
  }),

  // Share access endpoint
  http.get(`${API_BASE_URL}/share_access.php`, ({ request }) => {
    const url = new URL(request.url);
    const shareId = url.searchParams.get('share_id');

    if (!shareId) {
      return HttpResponse.json(
        { success: false, error: 'Missing share_id' },
        { status: 400 }
      );
    }

    if (shareId === 'test_share_123') {
      return HttpResponse.json({
        success: true,
        data: 'encrypted_test_data',
        expires_at: Date.now() + 24 * 60 * 60 * 1000,
      });
    }

    return HttpResponse.json(
      { success: false, error: 'Share not found or expired' },
      { status: 404 }
    );
  }),
];

// Export individual handler helpers for test customization
const syncHealthHandler = handlers[0];
const syncPushHandler = handlers[1];
const syncPullHandler = handlers[2];
const shareCreateHandler = handlers[3];
const shareAccessHandler = handlers[4];

module.exports = {
  handlers,
  syncHealthHandler,
  syncPushHandler,
  syncPullHandler,
  shareCreateHandler,
  shareAccessHandler,
};