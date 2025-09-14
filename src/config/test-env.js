/**
 * Test Environment Configuration
 * Allows tests to run against different API environments
 */

const getTestApiUrl = () => {
  const env = process.env.API_ENV || 'local';

  const urls = {
    local: 'http://localhost:3001/api',
    dev: 'https://manylla.com/dev/api',
    qual: 'https://manylla.com/qual/api',
    prod: 'https://manylla.com/api'
  };

  return urls[env] || urls.local;
};

const getTestConfig = () => {
  const apiUrl = getTestApiUrl();
  const env = process.env.API_ENV || 'local';

  return {
    apiUrl,
    env,
    isRealApi: env !== 'local',
    timeout: env === 'local' ? 5000 : 15000,
    retryAttempts: env === 'local' ? 0 : 3,
    debug: process.env.DEBUG === 'true'
  };
};

module.exports = {
  getTestApiUrl,
  getTestConfig
};