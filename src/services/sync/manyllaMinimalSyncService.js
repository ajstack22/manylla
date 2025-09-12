import platform from '../../utils/platform';

// Create unified sync service based on platform
let manyllaMinimalSyncService;

if (platform.isWeb) {
  // Web-specific implementation with fetch API
  manyllaMinimalSyncService = require("./manyllaMinimalSyncServiceWeb").default;
} else {
  // Native implementation with React Native networking
  manyllaMinimalSyncService =
    require("./manyllaMinimalSyncServiceNative").default;
}

export default manyllaMinimalSyncService;
