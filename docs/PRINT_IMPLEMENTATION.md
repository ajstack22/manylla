# Print Modal Implementation Guide

## Overview
This document provides complete technical implementation details for adding proper print functionality to the Manylla application, supporting both web browser printing and mobile share/print options.

## Current State
- **Component**: `src/components/Sharing/PrintPreview.js`
- **Current Implementation**: Uses React Native's `Share.share()` API for all platforms
- **Issue**: No actual browser print functionality on web

## Implementation Strategy

### 1. Platform-Specific Print Handling

#### Web Platform
```javascript
import platform from "../../utils/platform";

const handlePrint = async () => {
  if (platform.isWeb) {
    // Web-specific print implementation
    window.print();
  } else {
    // Mobile: Use Share API
    await Share.share({
      message: generateTextContent(),
      title: `${childName} - Information Summary`,
    });
  }
};
```

### 2. Print-Optimized Styling

#### Create Print Stylesheet
```javascript
// src/components/Sharing/PrintStyles.js
import { StyleSheet } from "react-native";

export const createPrintStyles = () => {
  if (!platform.isWeb) return null;
  
  // Inject print-specific CSS into document
  const style = document.createElement('style');
  style.textContent = `
    @media print {
      /* Hide non-printable elements */
      .no-print {
        display: none !important;
      }
      
      /* Print-specific layout */
      .print-container {
        background: white !important;
        color: black !important;
        font-size: 12pt !important;
        line-height: 1.5 !important;
        padding: 0 !important;
        margin: 0 !important;
      }
      
      /* Headers and footers */
      .print-header {
        page-break-after: avoid;
        border-bottom: 2px solid #000;
        padding-bottom: 10pt;
        margin-bottom: 20pt;
      }
      
      /* Section styling */
      .print-section {
        page-break-inside: avoid;
        margin-bottom: 15pt;
      }
      
      /* Page breaks */
      .page-break {
        page-break-before: always;
      }
      
      /* Remove shadows and borders */
      * {
        box-shadow: none !important;
        text-shadow: none !important;
      }
    }
  `;
  document.head.appendChild(style);
  return style;
};
```

### 3. Enhanced PrintPreview Component

```javascript
// Updated PrintPreview.js structure
import React, { useRef, useEffect } from "react";
import { createPrintStyles } from "./PrintStyles";

export const PrintPreview = ({ ... }) => {
  const printContentRef = useRef(null);
  
  useEffect(() => {
    if (platform.isWeb && visible) {
      const printStyles = createPrintStyles();
      return () => {
        if (printStyles) {
          document.head.removeChild(printStyles);
        }
      };
    }
  }, [visible]);
  
  const handlePrint = async () => {
    if (platform.isWeb) {
      // Create hidden print window
      const printWindow = window.open('', '_blank');
      printWindow.document.write(generatePrintHTML());
      printWindow.document.close();
      printWindow.focus();
      
      // Wait for content to load then print
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 250);
    } else {
      // Mobile implementation
      await handleMobilePrint();
    }
  };
  
  const generatePrintHTML = () => {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${childName} - Information Summary</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 800px;
              margin: 0 auto;
              padding: 20px;
            }
            h1 { 
              color: #2c3e50;
              border-bottom: 2px solid #3498db;
              padding-bottom: 10px;
            }
            h2 {
              color: #34495e;
              margin-top: 30px;
              border-bottom: 1px solid #ecf0f1;
              padding-bottom: 5px;
            }
            .header-info {
              background: #f8f9fa;
              padding: 15px;
              border-radius: 5px;
              margin-bottom: 20px;
            }
            .entry {
              margin-bottom: 15px;
              padding: 10px;
              background: #fff;
              border-left: 3px solid #3498db;
              padding-left: 15px;
            }
            .entry-title {
              font-weight: bold;
              color: #2c3e50;
              margin-bottom: 5px;
            }
            .entry-description {
              color: #555;
              margin-bottom: 5px;
            }
            .entry-date {
              color: #7f8c8d;
              font-size: 0.9em;
            }
            .quick-info {
              background: #e8f4f8;
              padding: 15px;
              border-radius: 5px;
              margin-bottom: 20px;
            }
            .footer {
              margin-top: 40px;
              padding-top: 20px;
              border-top: 1px solid #ecf0f1;
              font-size: 0.9em;
              color: #7f8c8d;
              text-align: center;
            }
            @media print {
              body { margin: 0; padding: 10px; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          ${generatePrintContent()}
        </body>
      </html>
    `;
  };
  
  const generatePrintContent = () => {
    let html = `
      <h1>${childName} - Information Summary</h1>
      <div class="header-info">
        <p><strong>Prepared on:</strong> ${new Date().toLocaleDateString()}</p>
        ${recipientName ? `<p><strong>For:</strong> ${recipientName}</p>` : ''}
      </div>
    `;
    
    if (note) {
      html += `
        <div class="quick-info">
          <p><em>${note}</em></p>
        </div>
      `;
    }
    
    if (includeQuickInfo) {
      html += `
        <div class="quick-info">
          <h2>Quick Reference</h2>
          <ul>
            <li><strong>Communication:</strong> Uses 2-3 word phrases. Understands more than can express.</li>
            <li><strong>Sensory:</strong> Sensitive to loud noises and bright lights. Loves soft textures.</li>
            <li><strong>Medical:</strong> No allergies. Takes melatonin for sleep (prescribed).</li>
            <li><strong>Dietary:</strong> Gluten-free diet. Prefers crunchy foods. No nuts.</li>
            <li><strong>Emergency Contact:</strong> Mom: 555-0123, Dad: 555-0124</li>
          </ul>
        </div>
      `;
    }
    
    selectedCategories.forEach((category) => {
      const categoryEntries = entries[category] || [];
      if (categoryEntries.length > 0) {
        html += `<h2>${categoryTitles[category] || category}</h2>`;
        categoryEntries.forEach((entry, index) => {
          html += `
            <div class="entry">
              <div class="entry-title">${index + 1}. ${escapeHtml(entry.title)}</div>
              <div class="entry-description">${escapeHtml(entry.description)}</div>
              <div class="entry-date">Date: ${new Date(entry.date).toLocaleDateString()}</div>
            </div>
          `;
        });
      }
    });
    
    html += `
      <div class="footer">
        <p>This information is confidential. Generated by Manylla on ${new Date().toLocaleString()}</p>
      </div>
    `;
    
    return html;
  };
  
  const escapeHtml = (text) => {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  };
};
```

### 4. Mobile Print Implementation

```javascript
const handleMobilePrint = async () => {
  try {
    if (platform.isIOS) {
      // iOS-specific: Can use Share with print option
      await Share.share({
        message: generateTextContent(),
        title: `${childName} - Information Summary`,
        // iOS automatically shows print option in share sheet
      });
    } else if (platform.isAndroid) {
      // Android: Generate HTML and use WebView for printing
      // Or use Share API as fallback
      await Share.share({
        message: generateTextContent(),
        title: `${childName} - Information Summary`,
      });
    }
  } catch (error) {
    if (error.message !== "User did not share") {
      Alert.alert("Error", "Failed to share document. Please try again.");
    }
  }
};
```

### 5. PDF Generation (Advanced Option)

For more robust printing, consider adding PDF generation:

```javascript
// Using react-pdf for web or react-native-pdf-lib for mobile
import { PDFDocument, PDFDownloadLink } from '@react-pdf/renderer';

const MyDocument = ({ data }) => (
  <PDFDocument>
    <Page size="A4" style={styles.page}>
      <View style={styles.section}>
        <Text>{data.childName} - Information Summary</Text>
        {/* PDF content */}
      </View>
    </Page>
  </PDFDocument>
);

// In component
const handleDownloadPDF = () => {
  if (platform.isWeb) {
    return (
      <PDFDownloadLink 
        document={<MyDocument data={printData} />} 
        fileName={`${childName}_summary.pdf`}
      >
        {({ blob, url, loading, error }) =>
          loading ? 'Loading document...' : 'Download PDF'
        }
      </PDFDownloadLink>
    );
  }
};
```

## Implementation Steps

1. **Update PrintPreview component**
   - Add platform detection
   - Implement web-specific print handling
   - Add print styles injection

2. **Create print stylesheet**
   - Define @media print rules
   - Hide navigation elements
   - Optimize typography for print

3. **Add HTML generation**
   - Create formatted HTML for print
   - Include proper styling
   - Handle data escaping

4. **Test across platforms**
   - Web browsers (Chrome, Safari, Firefox)
   - iOS devices (Share sheet with print)
   - Android devices (Share functionality)

5. **Optional: Add PDF generation**
   - Install PDF library
   - Create PDF template
   - Add download button

## Testing Checklist

- [ ] Print preview displays correctly on web
- [ ] Print dialog opens with proper formatting
- [ ] Headers and footers are included
- [ ] Page breaks work correctly
- [ ] Mobile share functionality works
- [ ] Print styles don't affect screen display
- [ ] All data is properly escaped
- [ ] Confidentiality notice is included

## Browser Compatibility

### Supported Features by Browser
- **Chrome/Edge**: Full support for all print CSS
- **Firefox**: Full support with minor spacing differences
- **Safari**: Full support, may need webkit prefixes
- **Mobile browsers**: Share API only (no direct print)

## Security Considerations

1. **Data Sanitization**: Always escape HTML content to prevent XSS
2. **Confidentiality**: Include privacy notice on printed documents
3. **Local Processing**: Generate print content client-side only
4. **No External Dependencies**: Don't load external resources in print view

## Performance Optimization

1. **Lazy Load Print Styles**: Only inject when modal opens
2. **Cleanup**: Remove injected styles when modal closes
3. **Minimal DOM**: Generate print content only when needed
4. **Debounce**: Prevent multiple print requests

## Accessibility

1. **Screen Reader Support**: Announce print action
2. **Keyboard Navigation**: Support Ctrl+P / Cmd+P
3. **High Contrast**: Ensure print output is readable
4. **Font Size**: Use minimum 12pt for body text

## Future Enhancements

1. **Custom Headers/Footers**: Add page numbers, dates
2. **Multiple Layouts**: Portrait/landscape options
3. **Export Formats**: CSV, JSON, XML options
4. **Batch Printing**: Print multiple profiles
5. **Print Templates**: Customizable layouts
6. **Cloud Printing**: Google Cloud Print API integration