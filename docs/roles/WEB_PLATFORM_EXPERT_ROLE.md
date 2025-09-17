# Web Platform Expert Role & Implementation Guide

## Core Responsibility
Ensure optimal web performance, cross-browser compatibility, responsive design, accessibility compliance, and production deployment success.

## Critical Commands & Metrics
```bash
# Build validation (MUST PASS)
npm run build:web                                       # Webpack build
ls -la web/build/                                       # NOT build/ directory!

# Local testing
npm run web                                             # Port 3000 (Webpack dev)
open http://localhost:3000

# Deployment verification
./scripts/deploy-qual.sh                                # ONLY approved method
```

## Decision Authority
**CAN**: Webpack config, responsive breakpoints, web-specific optimizations, polyfills
**CANNOT**: Add TypeScript, change build directory, bypass deployment validation

## Critical Web Knowledge

### Build Configuration (IMMUTABLE)
```javascript
// webpack.config.js
module.exports = {
  entry: './index.js',
  output: {
    path: path.resolve(__dirname, 'web/build'),  // NOT 'build'!
    filename: 'bundle.[contenthash].js',
    publicPath: '/manylla/qual/',  // Production path
  },
  // NO TypeScript loader
  // NO .tsx/.ts extensions
};
```

### Deployment Rules (NEVER BYPASS)
```bash
# THE ONLY WAY to deploy to qual:
./scripts/deploy-qual.sh

# This script:
1. Validates lint, TypeScript, security
2. Checks TODOs (max 20) and console.logs (max 5)
3. Builds to web/build/
4. Uses correct .htaccess.manylla-qual
5. Deploys to manylla.com/qual/

# NEVER:
- Run npm run deploy:qual directly
- Manually rsync files
- Use build/ directory (old, obsolete)
- Use wrong .htaccess file
```

## Performance Optimization

### Bundle Size Management
```javascript
// webpack.config.js optimizations
optimization: {
  splitChunks: {
    chunks: 'all',
    cacheGroups: {
      vendor: {
        test: /[\\/]node_modules[\\/]/,
        name: 'vendors',
        priority: 10,
      },
      common: {
        minChunks: 2,
        priority: 5,
        reuseExistingChunk: true,
      },
    },
  },
  minimizer: [
    new TerserPlugin({
      terserOptions: {
        compress: {
          drop_console: true,  // Remove console.logs in production
        },
      },
    }),
  ],
},
```

**Target Metrics:**
- Initial bundle: < 200KB gzipped
- Time to Interactive: < 3s
- Lighthouse score: > 90
- First Contentful Paint: < 1.5s

### Lazy Loading
```javascript
// Lazy load heavy components
const ShareDialog = lazy(() => import('./components/Dialogs/ShareDialog'));
const PrintPreview = lazy(() => import('./components/Sharing/PrintPreview'));

// Use with Suspense
<Suspense fallback={<Loading />}>
  <ShareDialog />
</Suspense>
```

### Image Optimization
```javascript
// Responsive images
const ResponsiveImage = ({ src, alt }) => {
  const [loaded, setLoaded] = useState(false);
  
  return (
    <>
      {!loaded && <ImagePlaceholder />}
      <img
        src={src}
        alt={alt}
        loading="lazy"  // Native lazy loading
        decoding="async"
        onLoad={() => setLoaded(true)}
        style={{
          display: loaded ? 'block' : 'none',
          maxWidth: '100%',
          height: 'auto',
        }}
      />
    </>
  );
};

// WebP with fallback
<picture>
  <source srcSet="image.webp" type="image/webp" />
  <source srcSet="image.jpg" type="image/jpeg" />
  <img src="image.jpg" alt="Profile" />
</picture>
```

## Browser Compatibility

### Supported Browsers
```javascript
// package.json browserslist
"browserslist": [
  ">0.2%",
  "not dead",
  "not op_mini all",
  "last 2 Chrome versions",
  "last 2 Firefox versions",
  "last 2 Safari versions",
  "last 2 Edge versions"
]
```

### Polyfills
```javascript
// src/utils/polyfills.js
// Only if needed for older browsers
import 'core-js/stable';
import 'regenerator-runtime/runtime';

// Check for required features
if (!window.Promise) {
  console.error('Browser too old - Promise not supported');
}

if (!window.fetch) {
  console.warn('Fetch not supported, using polyfill');
  require('whatwg-fetch');
}
```

### Cross-Browser Testing
```bash
# Test matrix (minimum)
- Chrome (latest, latest-1)
- Safari (latest, latest-1)  
- Firefox (latest)
- Edge (latest)
- Mobile Safari (iOS 14+)
- Chrome Mobile (Android 7+)

# Browser-specific fixes
const isIE = /MSIE|Trident/.test(navigator.userAgent);
if (isIE) {
  alert('Internet Explorer is not supported. Please use a modern browser.');
}
```

## Responsive Design

### Breakpoints
```javascript
// src/utils/responsive.js
export const breakpoints = {
  mobile: 0,      // 0-767px
  tablet: 768,    // 768-1023px
  desktop: 1024,  // 1024px+
  wide: 1440,     // 1440px+ (optional)
};

export const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(false);
  
  useEffect(() => {
    const media = window.matchMedia(query);
    setMatches(media.matches);
    
    const listener = (e) => setMatches(e.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [query]);
  
  return matches;
};

// Usage
const isMobile = useMediaQuery('(max-width: 767px)');
const isTablet = useMediaQuery('(min-width: 768px) and (max-width: 1023px)');
const isDesktop = useMediaQuery('(min-width: 1024px)');
```

### Responsive Components
```javascript
// Responsive modal widths
const modalStyle = {
  maxWidth: isMobile ? '90%' : isTablet ? '70%' : '600px',
  width: '100%',
  margin: isMobile ? '20px' : '40px auto',
};

// Responsive grid
const gridStyle = {
  display: 'grid',
  gridTemplateColumns: isMobile ? '1fr' : isTablet ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)',
  gap: '16px',
};
```

## Web-Specific Features

### Local Storage Management
```javascript
// Web storage with quota checking
const webStorage = {
  async checkQuota() {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const { usage, quota } = await navigator.storage.estimate();
      const percentUsed = (usage / quota) * 100;
      
      if (percentUsed > 90) {
        console.warn(`Storage almost full: ${percentUsed.toFixed(2)}%`);
      }
      
      return { usage, quota, percentUsed };
    }
  },
  
  setItem(key, value) {
    try {
      const serialized = JSON.stringify(value);
      
      // Check size before saving
      const size = new Blob([serialized]).size;
      if (size > 5 * 1024 * 1024) { // 5MB limit per item
        throw new Error('Data too large for localStorage');
      }
      
      localStorage.setItem(key, serialized);
      return true;
    } catch (e) {
      if (e.name === 'QuotaExceededError') {
        // Clear old data
        this.clearOldData();
        // Retry
        localStorage.setItem(key, serialized);
      }
      throw e;
    }
  }
};
```

### Service Worker (PWA)
```javascript
// public/service-worker.js
const CACHE_NAME = 'manylla-v1';
const urlsToCache = [
  '/',
  '/static/css/main.css',
  '/static/js/bundle.js',
  '/manifest.json',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => response || fetch(event.request))
  );
});
```

### Keyboard Navigation
```javascript
// Accessibility keyboard support
const useKeyboardNavigation = () => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Tab navigation
      if (e.key === 'Tab') {
        document.body.classList.add('keyboard-nav');
      }
      
      // Escape closes modals
      if (e.key === 'Escape') {
        closeActiveModal();
      }
      
      // Arrow key navigation
      if (e.key.startsWith('Arrow')) {
        navigateWithArrows(e.key);
      }
    };
    
    const handleMouseDown = () => {
      document.body.classList.remove('keyboard-nav');
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('mousedown', handleMouseDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('mousedown', handleMouseDown);
    };
  }, []);
};

// CSS for keyboard navigation
.keyboard-nav *:focus {
  outline: 2px solid #A08670;
  outline-offset: 2px;
}
```

### Print Styles
```css
/* src/styles/print.css */
@media print {
  /* Hide non-essential elements */
  .no-print,
  .header,
  .footer,
  .modal,
  button {
    display: none !important;
  }
  
  /* Optimize for print */
  body {
    font-size: 12pt;
    line-height: 1.5;
    color: #000;
    background: #fff;
  }
  
  /* Page breaks */
  .page-break {
    page-break-after: always;
  }
  
  /* Avoid breaks inside elements */
  .profile-card {
    page-break-inside: avoid;
  }
  
  /* Print URLs for links */
  a[href]:after {
    content: " (" attr(href) ")";
  }
}
```

## Security Considerations

### Content Security Policy
```html
<!-- public/index.html -->
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'unsafe-inline';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: blob:;
  font-src 'self' data:;
  connect-src 'self' https://manylla.com;
">
```

### XSS Prevention
```javascript
// Never use dangerouslySetInnerHTML with user content
// Always sanitize user input
import DOMPurify from 'dompurify';

const sanitizeHtml = (dirty) => {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br'],
    ALLOWED_ATTR: [],
  });
};

// Safe rendering
<div>{sanitizeHtml(userContent)}</div>
```

### HTTPS Enforcement
```apache
# public/.htaccess.manylla-qual
RewriteEngine On

# Force HTTPS
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# Correct RewriteBase for Manylla
RewriteBase /manylla/qual/

# Security headers
Header set X-Content-Type-Options "nosniff"
Header set X-Frame-Options "SAMEORIGIN"
Header set X-XSS-Protection "1; mode=block"
```

## Accessibility (WCAG 2.1 AA)

### Required Attributes
```javascript
// Form inputs
<input
  type="text"
  id="name"
  aria-label="Profile name"
  aria-required="true"
  aria-invalid={!!error}
  aria-describedby="name-error"
/>
{error && <span id="name-error" role="alert">{error}</span>}

// Buttons
<button
  aria-label="Save profile"
  aria-pressed={isActive}
  disabled={loading}
  aria-busy={loading}
>

// Images
<img 
  src={photo} 
  alt="Profile photo of John" // Descriptive alt text
  role="img"
/>

// Navigation
<nav aria-label="Main navigation">
  <ul role="menubar">
    <li role="none">
      <a role="menuitem" href="/profiles">Profiles</a>
    </li>
  </ul>
</nav>
```

### Focus Management
```javascript
// Focus trap in modals
const trapFocus = (element) => {
  const focusableElements = element.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  const firstFocusable = focusableElements[0];
  const lastFocusable = focusableElements[focusableElements.length - 1];
  
  element.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      if (e.shiftKey) { // Shift + Tab
        if (document.activeElement === firstFocusable) {
          lastFocusable.focus();
          e.preventDefault();
        }
      } else { // Tab
        if (document.activeElement === lastFocusable) {
          firstFocusable.focus();
          e.preventDefault();
        }
      }
    }
  });
  
  firstFocusable.focus();
};
```

## Testing & Debugging

### Browser DevTools
```javascript
// Performance profiling
console.time('ProfileLoad');
// ... load profile
console.timeEnd('ProfileLoad');

// Memory profiling
if (performance.memory) {
  console.log('Memory usage:', {
    used: (performance.memory.usedJSHeapSize / 1048576).toFixed(2) + ' MB',
    total: (performance.memory.totalJSHeapSize / 1048576).toFixed(2) + ' MB',
    limit: (performance.memory.jsHeapSizeLimit / 1048576).toFixed(2) + ' MB'
  });
}

// Network monitoring
if ('connection' in navigator) {
  console.log('Network:', {
    type: navigator.connection.effectiveType,
    downlink: navigator.connection.downlink,
    rtt: navigator.connection.rtt,
  });
}
```

### Lighthouse Audit
```bash
# Run Lighthouse audit
npm install -g lighthouse
lighthouse https://manylla.com/qual/ --view

# Target scores:
# Performance: > 90
# Accessibility: > 95
# Best Practices: > 90
# SEO: > 90
```

## Common Web Issues & Solutions

### Issue 1: Build Directory Confusion
```bash
# CORRECT: Webpack builds to web/build/
npm run build:web
ls -la web/build/

# WRONG: Old build/ directory (obsolete)
# Never deploy from build/
```

### Issue 2: Console Errors in Production
```javascript
// Remove all console.logs before deploy
if (process.env.NODE_ENV === 'production') {
  console.log = () => {};
  console.warn = () => {};
  console.error = () => {};
}
```

### Issue 3: Modal Z-Index Issues
```css
/* Ensure proper stacking */
.modal-overlay {
  z-index: 1040;
}
.modal-content {
  z-index: 1050;
}
.toast {
  z-index: 1060;
}
```

### Issue 4: Mobile Touch Issues
```javascript
// Add touch handlers for web
const handleTouch = (e) => {
  // Prevent 300ms delay
  e.preventDefault();
  onClick(e);
};

<div
  onClick={handleClick}
  onTouchEnd={handleTouch}
  style={{ cursor: 'pointer' }}
>
```

### Issue 5: Font Loading
```css
/* Optimize font loading */
@font-face {
  font-family: 'CustomFont';
  src: url('/fonts/custom.woff2') format('woff2');
  font-display: swap; /* Show fallback immediately */
}
```

## Quality Checklist

### Before Any Web Change
- [ ] Webpack build succeeds
- [ ] Output in web/build/ (not build/)
- [ ] No TypeScript files
- [ ] No console.logs (max 5)
- [ ] No TODOs (max 20)
- [ ] Cross-browser tested
- [ ] Mobile responsive
- [ ] Accessibility checked
- [ ] Lighthouse score > 90
- [ ] Bundle size reasonable

### Deployment Checklist
- [ ] Git commit created
- [ ] Release notes updated
- [ ] Lint passes
- [ ] Security check passes
- [ ] deploy-qual.sh used
- [ ] .htaccess.manylla-qual correct
- [ ] Test on production URL
- [ ] No 404 errors
- [ ] No console errors
- [ ] Performance acceptable

## Emergency Fixes

### Reset Web Build
```bash
rm -rf web/build
rm -rf node_modules/.cache
npm run build:web
```

### Fix Deployment Issues
```bash
# Verify correct .htaccess
cat public/.htaccess.manylla-qual | grep RewriteBase
# Should show: RewriteBase /manylla/qual/

# Manual emergency deploy (ONLY if script fails)
npm run build:web
rsync -avz web/build/ stackmap-cpanel:~/public_html/manylla/qual/
```

### Debug Production Issues
```javascript
// Temporary debug mode
window.DEBUG_MODE = true;

if (window.DEBUG_MODE) {
  console.log = console.log.bind(console);
  window.onerror = (msg, source, lineno, colno, error) => {
    console.error('Global error:', { msg, source, lineno, colno, error });
  };
}
```

## Performance Monitoring

### Web Vitals
```javascript
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

// Monitor Core Web Vitals
getCLS(console.log);  // Cumulative Layout Shift
getFID(console.log);  // First Input Delay
getFCP(console.log);  // First Contentful Paint
getLCP(console.log);  // Largest Contentful Paint
getTTFB(console.log); // Time to First Byte

// Send to analytics
const sendToAnalytics = ({ name, delta, id }) => {
  // Google Analytics example
  gtag('event', name, {
    value: Math.round(delta),
    metric_id: id,
    metric_value: delta,
    metric_delta: delta,
  });
};

getCLS(sendToAnalytics);
getFID(sendToAnalytics);
getLCP(sendToAnalytics);
```

---
*Last Updated: 2025.09.11*
*Build Tool: Webpack*
*Build Output: web/build/*
*Deploy: ./scripts/deploy-qual.sh ONLY*