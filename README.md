# Manylla - Special Needs Information Management

A zero-knowledge encrypted web application for special needs parents to retain and share sensitive development information about their children.

## 🎉 Phase 3 Complete - Cloud Data Storage Operational

**Status**: Production-ready cloud storage with zero-knowledge encryption
- ✅ All data stored in cloud database (no localStorage fallbacks)
- ✅ Zero-knowledge encryption - server never sees plaintext
- ✅ Deployed to https://manylla.com/qual/
- ✅ Share system fully operational
- ✅ Multi-device sync with 32-char hex recovery phrases

## Features Implemented

### Core Features
- **Zero-Knowledge Encryption**: All data encrypted client-side with TweetNaCl.js
- **Cloud Sync**: Multi-device sync with 32-character hex recovery phrases
- **Temporary Sharing**: Create encrypted share links with expiration dates
- **Child Profiles**: Comprehensive profiles with categories and entries
- **Categories**: Current Goals, Recent Successes, Strengths, Challenges
- **Smart Organization**: Tag system for filtering and organization

### Security Features (Phase 3)
- **Client-Side Encryption**: Data encrypted before leaving device
- **Cloud Storage**: Encrypted blobs stored in MySQL database
- **Share System**: Temporary encrypted shares with automatic expiration
- **No User Accounts**: Privacy-first design with recovery phrases
- **Zero-Knowledge Architecture**: Server cannot decrypt user data

### UI Components
- **Material Design**: Clean, modern interface using Material-UI v7
- **Light/Dark Mode**: Toggle between themes
- **Progressive Onboarding**: Gentle introduction for new users
- **Mobile Optimized**: Responsive design for all devices
- **Manila Envelope Branding**: Warm, trustworthy color palette (#F4E4C1)

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).
