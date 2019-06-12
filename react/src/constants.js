let LocalConstants = {};
try {
  LocalConstants = require('./localConstants');
}
catch (e) {
  // Nothing
}

export const BASE_URL = (
  (process.env.NODE_ENV === 'development' && LocalConstants.BASE_URL)
    ? LocalConstants.BASE_URL
    : '' // Use Relative URL
);
