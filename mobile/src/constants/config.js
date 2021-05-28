const isDevEnv = process.env.NODE_ENV === 'development';

export default {
  // App Details
  appName: 'ReactNativeStarterKit',

  // Build Configuration - eg. Debug or Release?
  isDevEnv,

  // Date Format
  dateFormat: 'Do MMM YYYY',

  // API
  // https://thedistance.co.uk/wp-content/uploads/2020/01/eventbrite.json
  apiBaseUrl: isDevEnv
    ? 'https://thedistance.co.uk/wp-content/uploads/2020/01/eventbrite.json'
    : 'https://thedistance.co.uk/wp-content/uploads/2020/01/eventbrite.json',


  // Google Analytics - uses a 'dev' account while we're testing
  gaTrackingId: isDevEnv ? 'UA-84284256-2' : 'UA-84284256-1',
};
