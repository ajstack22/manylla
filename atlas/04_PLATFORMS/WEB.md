# Web Platform Guide

## 1. Build & Deployment

This section covers the critical configuration for building and deploying the application to the web.

### Build Configuration (Webpack)

-   **Output Directory**: The build output must be configured to a specific, agreed-upon directory (e.g., `web/build/`) to avoid confusion with other build artifacts.
-   **Code Splitting**: The Webpack configuration should be set up to split code into chunks (e.g., vendor, common, per-route) to reduce initial bundle sizes.
-   **Minification**: Production builds must use tools like `TerserPlugin` to minify JavaScript and drop `console.log` statements.
-   **`publicPath`**: This must be correctly configured to match the subdirectory where the app will be hosted in production (e.g., `/app/`).

### Deployment Process

A single, scripted deployment process is mandatory. This script must:

1.  Run all validation checks (lint, tests, security).
2.  Create a production build.
3.  Deploy the contents of the correct build directory.
4.  Handle environment-specific configurations (e.g., `.htaccess` files).

Bypassing this script is not permitted.

## 2. UI & UX Patterns

-   **Responsive Design**: The application must be fully responsive. Use media queries or a hook-based approach to adapt the layout for mobile, tablet, and desktop breakpoints.
-   **Browser Compatibility**: Define a `browserslist` in `package.json` to specify the range of supported browsers. Test on all major browsers (Chrome, Firefox, Safari, Edge).
-   **Hover and Focus States**: All interactive elements must have clear `:hover` and `:focus` states to be usable with a mouse and keyboard.
-   **Keyboard Navigation**: The application must be fully navigable using only the keyboard. This includes focus trapping within modals.

## 3. Performance

-   **Core Web Vitals**: The application should be optimized for Google's Core Web Vitals.
    -   **LCP (Largest Contentful Paint)**: Target < 2.5 seconds.
    -   **FID (First Input Delay)**: Target < 100 milliseconds.
    -   **CLS (Cumulative Layout Shift)**: Target < 0.1.
-   **Bundle Size**: The initial JavaScript bundle should be aggressively optimized. Aim for < 250KB gzipped.
-   **Lazy Loading**: Lazy load components, images, and routes to defer loading non-critical assets.
-   **Image Optimization**: Use modern image formats like WebP with fallbacks. Use native lazy loading (`loading="lazy"`).

## 4. Security

-   **Content Security Policy (CSP)**: Implement a strict CSP via a `<meta>` tag or HTTP headers to prevent XSS attacks.
-   **XSS Prevention**: Never use `dangerouslySetInnerHTML` with un-sanitized user content. Use libraries like `DOMPurify` to clean any user-generated HTML.
-   **HTTPS**: Enforce HTTPS across the entire application. Use `.htaccess` or server configuration to redirect HTTP traffic to HTTPS.
-   **Security Headers**: Set security headers like `X-Content-Type-Options`, `X-Frame-Options`, and `X-XSS-Protection`.

## 5. Accessibility (WCAG)

-   **Semantic HTML**: Use appropriate HTML tags for their intended purpose (`<nav>`, `<main>`, `<button>`).
-   **ARIA Attributes**: Use ARIA (`Accessible Rich Internet Applications`) attributes to provide context for screen readers, especially for complex, dynamic components.
-   **Alt Text**: All `<img>` tags must have descriptive `alt` attributes.
-   **Color Contrast**: Ensure that all text has sufficient color contrast to be readable, meeting WCAG AA standards.
