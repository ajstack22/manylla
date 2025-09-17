# Manylla Logo Branding Implementation Specification

## Final Logo Design

### Selected Design: Variation #6 from Light & Subtle Gradients
**Location for reference:** `/public/manylla-logo-light-subtle.html` - Variation #6

### Visual Specifications

#### Typography
- **Font Family:** Atkinson Hyperlegible
- **Font Weight:** 700 (Bold) for entire logo
- **Font Size:** Variable based on context (see implementation guidelines)
- **Letter Spacing:** -0.05em to -0.1em (slight compression for cohesion)

#### Color Scheme

##### Gradient (Applied to "man" and "lla")
- **Type:** Linear gradient, horizontal (90deg)
- **Start Color:** #B8A398 (Light brown/tan)
- **End Color:** #A89185 (Medium brown/tan)
- **Application:** Continuous gradient flowing through the entire word as if "y" were part of it

##### Accent Color (Applied to "y" only)
- **Primary Red:** #D32F2F
- **Alternative Options:** 
  - Soft Red: #E57373
  - Coral Red: #FF6B6B
  - Deep Red: #B71C1C

### Technical Implementation

#### CSS Implementation
```css
/* Container */
.logo-text {
  font-family: "Atkinson Hyperlegible", sans-serif;
  font-weight: 700;
  font-size: [context-dependent];
  display: inline-block;
}

/* Gradient text */
.logo-gradient {
  background: linear-gradient(90deg, #B8A398 0%, #A89185 100%);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  color: transparent;
}

/* Red Y */
.logo-y {
  color: #D32F2F;
  -webkit-text-fill-color: #D32F2F;
}
```

#### HTML Structure
```html
<span class="logo-text">
  <span class="logo-gradient">
    man<span class="logo-y">y</span>lla
  </span>
</span>
```

#### React/JSX Implementation
```jsx
<Typography component="div" className="logo-text">
  <span className="logo-gradient">
    man<span className="logo-y">y</span>lla
  </span>
</Typography>
```

### Implementation Contexts

#### 1. Header/Navigation Bar
- **File:** `src/components/Layout/Header.tsx`
- **Font Size:** 48px (desktop), 36px (mobile)
- **Padding:** 4px top, 8px bottom
- **Line Height:** 1

#### 2. Loading/Splash Screen
- **Font Size:** 64px-72px
- **Animation:** Optional subtle fade-in

#### 3. Footer
- **Font Size:** 24px-32px
- **Opacity:** Can be slightly reduced (0.8-0.9) if needed

#### 4. Favicon/App Icon (Updated with String Tie Design)
- **Design:** String tie-inspired circular logo
- **Brown Circle:** #A08670 (Manylla brown)
- **White Gap Ring:** 3px offset for visual separation
- **Red Border:** #CC0000 (String tie red) at 5px offset
- **Center Letter:** Manila-colored "m" (#F4E4C1) in Georgia serif font
- **Implementation:** Available in SVG, ICO, and PNG formats

### Header Avatar Design (String Tie Implementation)

#### Visual Design
- **Base Circle:** Brown background matching theme primary color (#A08670)
- **Offset Ring Effect:** 
  - White gap at 3px for visual separation
  - Red border at 5px creating string tie appearance (#CC0000)
- **Typography:** Manila-colored initials (#F4E4C1)

#### Implementation Details
- **Component:** `src/components/Layout/Header.js`
- **Styles:** Applied via `box-shadow` property
- **Animation:** Transitions smoothly with opacity during scroll
- **Theme Support:** Border color remains red (#CC0000) across all themes
- **Gap Color:** Adapts to theme background (white/dark/manila)

#### Technical Specifications
```javascript
boxShadow: "0 0 0 3px " + colors.background.paper + ", 0 0 0 5px #CC0000"
```

### Responsive Considerations

#### Mobile (< 600px)
- Font size: 36px in header
- Maintain gradient and color contrast
- Ensure adequate touch target if clickable

#### Tablet (600px - 1024px)
- Font size: 42px in header
- Standard implementation

#### Desktop (> 1024px)
- Font size: 48px in header
- Full implementation with all visual details

### Accessibility

1. **Contrast Ratios:**
   - Ensure gradient colors meet WCAG AA standards against background
   - Red "y" (#D32F2F) has good contrast on light backgrounds

2. **Screen Readers:**
   - Use proper aria-label="manylla" on logo container
   - Ensure it's recognized as heading or branding element

3. **Alternative Text:**
   - For image versions: alt="Manylla logo"
   - For SVG: Include title element

### Theme Variations

#### Light Mode (Default)
- Use specifications as described above
- Background should be white or manila (#F4E4C1)

#### Dark Mode
- Consider lightening the gradient slightly:
  - Start: #C9B4A9
  - End: #B9A296
- Red "y" can remain the same or use #EF5350 for better visibility

#### Manila Theme
- Keep gradient as specified
- Red "y" remains #D32F2F
- Ensure adequate contrast against #F4E4C1 background

### Animation Guidelines (Optional)

#### Hover State
```css
.logo-text:hover .logo-y {
  transition: transform 0.2s ease;
  transform: scale(1.05);
}
```

#### Page Load
- Subtle fade-in: 0.3s ease-in
- No bouncing or sliding animations (maintain professional appearance)

### Do's and Don'ts

#### Do's
- ✅ Maintain the continuous gradient flow
- ✅ Keep the "y" in its natural position within the gradient
- ✅ Use Atkinson Hyperlegible font exclusively
- ✅ Preserve the subtle, professional appearance
- ✅ Ensure consistent implementation across all platforms

#### Don'ts
- ❌ Don't reset the gradient after "man" and before "lla"
- ❌ Don't make the "y" larger or smaller than other letters
- ❌ Don't use drop shadows or 3D effects
- ❌ Don't rotate or skew any letters
- ❌ Don't use different fonts for different letters

### File References

1. **Example Implementation:** `/public/manylla-logo-light-subtle.html`
2. **Variation Testing:** `/public/manylla-logo-v6-variations.html`
3. **Current Header:** `src/components/Layout/Header.tsx` (lines 112-131)

### Testing Checklist

- [ ] Logo renders correctly in Chrome, Firefox, Safari, Edge
- [ ] Gradient displays properly on all browsers
- [ ] Red "y" is clearly visible and maintains correct color
- [ ] Logo is responsive and scales appropriately
- [ ] Text remains sharp at all sizes
- [ ] Accessibility requirements are met
- [ ] Logo works in light, dark, and manila themes

### Notes for Developers

1. **Font Loading:** Ensure Atkinson Hyperlegible is loaded before rendering the logo to prevent FOUT (Flash of Unstyled Text)

2. **Performance:** The gradient CSS is lightweight and performant. No need for SVG unless required for specific use cases.

3. **Fallbacks:** If gradients aren't supported (very old browsers), fallback to solid brown (#A89185) for the text with red "y".

4. **Print Styles:** Consider using solid colors for print media to ensure clarity.

---

## Implementation Priority

1. **Phase 1:** Update main header logo (`src/components/Layout/Header.tsx`)
2. **Phase 2:** Update loading screens and splash screens
3. **Phase 3:** Update marketing materials and documentation
4. **Phase 4:** Create favicon and app icons

## Questions or Clarifications

For any questions about the branding implementation, refer to the example files or contact the design team.