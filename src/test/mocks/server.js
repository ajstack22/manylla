// Use require syntax for MSW v2 compatibility with Jest
const { setupServer } = require('../../../../node_modules/msw/lib/node');
const { handlers } = require('./handlers');

// Create MSW server for testing
const server = setupServer(...handlers);

module.exports = { server };
module.exports.default = server;