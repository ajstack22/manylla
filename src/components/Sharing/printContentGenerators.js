// Platform utilities (removed unused import)

// HTML escaping for security
export const escapeHtml = (unsafe) => {
  if (!unsafe) return "";
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

export const generateTextContent = ({
  childName,
  recipientName,
  note,
  selectedCategories,
  actualEntries,
  categoryGroups,
  categoryTitles
}) => {
  let content = `${childName} - Information Summary
`;
  content += `Prepared on ${new Date().toLocaleDateString()}
`;
  if (recipientName) {
    content += `For: ${recipientName}
`;
  }
  content += `
---

`;

  if (note) {
    content += `Note: ${note}

`;
  }

  selectedCategories &&
    selectedCategories.forEach((categoryGroup) => {
      if (categoryGroup === "quick-info") {
        // Handle Quick Info as special formatted content
        content += `QUICK INFO
`;
        content += `================

`;
        content += `• Communication: Uses 2-3 word phrases. Understands more than can express.
`;
        content += `• Sensory: Sensitive to loud noises and bright lights. Loves soft textures.
`;
        content += `• Medical: No allergies. Takes melatonin for sleep (prescribed).
`;
        content += `• Dietary: Gluten-free diet. Prefers crunchy foods. No nuts.
`;
        content += `• Emergency Contact: Mom: 555-0123, Dad: 555-0124

`;
      } else if (categoryGroups[categoryGroup]) {
        // Handle category groups
        const group = categoryGroups[categoryGroup];
        let hasContent = false;

        // Check if any categories in this group have entries
        group.categories.forEach((cat) => {
          const categoryEntries =
            actualEntries && actualEntries[cat] ? actualEntries[cat] : [];
          if (categoryEntries.length > 0) {
            hasContent = true;
          }
        });

        if (hasContent) {
          const title = categoryTitles[categoryGroup] || categoryGroup;
          content += `${title.toUpperCase()}
`;
          content += `${"=".repeat(title.length)}

`;

          // Add entries from all categories in this group
          group.categories.forEach((cat) => {
            const categoryEntries =
              actualEntries && actualEntries[cat] ? actualEntries[cat] : [];
            if (categoryEntries.length > 0) {
              const catTitle = categoryTitles[cat] || cat;
              content += `${catTitle}:
`;
              categoryEntries.forEach((entry, index) => {
                content += `  ${index + 1}. ${entry.title}
`;
                content += `     ${entry.description}
`;
                content += `     Date: ${new Date(entry.date).toLocaleDateString()}

`;
              });
            }
          });
        }
      }
    });

  return content;
};

export const generateHtmlContent = ({
  childName,
  recipientName,
  note,
  selectedCategories,
  actualEntries,
  categoryTitles
}) => {
  const currentDate = new Date().toLocaleDateString();
  const currentDateTime = new Date().toLocaleString();

  let html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHtml(childName)} - Information Summary</title>
    <style>
        @page {
            margin: 1in;
            size: letter;
        }

        @media print {
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
                font-size: 12pt;
                line-height: 1.4;
                color: #000;
                background: white;
            }

            .no-print { display: none; }

            h1 {
                font-size: 18pt;
                margin-bottom: 8pt;
                text-align: center;
            }

            h2 {
                font-size: 14pt;
                margin-top: 16pt;
                margin-bottom: 8pt;
                border-bottom: 1px solid #ccc;
                padding-bottom: 4pt;
            }

            .document-header {
                text-align: center;
                margin-bottom: 20pt;
                border-bottom: 2pt solid #000;
                padding-bottom: 12pt;
            }

            .document-subtitle {
                font-size: 10pt;
                color: #666;
                margin-top: 4pt;
            }

            .note-section {
                background-color: #f9f9f9;
                padding: 12pt;
                border-left: 4pt solid #ccc;
                margin: 16pt 0;
                font-style: italic;
            }

            .section {
                margin-bottom: 16pt;
                break-inside: avoid;
            }

            .entry {
                margin-bottom: 12pt;
                margin-left: 16pt;
                break-inside: avoid;
            }

            .entry-title {
                font-weight: bold;
                margin-bottom: 4pt;
            }

            .entry-description {
                margin-bottom: 4pt;
                margin-left: 8pt;
            }

            .entry-date {
                font-size: 10pt;
                color: #666;
                margin-left: 8pt;
            }

            .quick-info-item {
                margin-bottom: 8pt;
                margin-left: 16pt;
            }

            .document-footer {
                margin-top: 24pt;
                padding-top: 12pt;
                border-top: 1pt solid #ccc;
                text-align: center;
                font-size: 10pt;
                color: #666;
                page-break-inside: avoid;
            }
        }

        @media screen {
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
                max-width: 8.5in;
                margin: 0 auto;
                padding: 1in;
                background: white;
                box-shadow: 0 0 10px rgba(0,0,0,0.1);
            }

            .print-button {
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 10px 20px;
                background: #007bff;
                color: white;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                font-size: 14px;
            }

            .print-button:hover {
                background: #0056b3;
            }
        }
    </style>
</head>
<body>
    <button class="print-button no-print" onclick="window.print()">Print Document</button>

    <div class="document-header">
        <h1>${escapeHtml(childName)} - Information Summary</h1>
        <div class="document-subtitle">
            Prepared on ${escapeHtml(currentDate)}${recipientName ? ` for ${escapeHtml(recipientName)}` : ""}
        </div>
    </div>`;

  if (note) {
    html += `
    <div class="note-section">
        <strong>Note:</strong> ${escapeHtml(note)}
    </div>`;
  }

  if (selectedCategories.includes("quick-info")) {
    html += `
    <div class="section">
        <h2>Quick Info</h2>
        <div class="quick-info-item"><strong>Communication:</strong> ${escapeHtml("Uses 2-3 word phrases. Understands more than can express.")}</div>
        <div class="quick-info-item"><strong>Sensory:</strong> ${escapeHtml("Sensitive to loud noises and bright lights. Loves soft textures.")}</div>
        <div class="quick-info-item"><strong>Medical:</strong> ${escapeHtml("No allergies. Takes melatonin for sleep (prescribed).")}</div>
        <div class="quick-info-item"><strong>Dietary:</strong> ${escapeHtml("Gluten-free diet. Prefers crunchy foods. No nuts.")}</div>
        <div class="quick-info-item"><strong>Emergency Contact:</strong> ${escapeHtml("Mom: 555-0123, Dad: 555-0124")}</div>
    </div>`;
  }

  selectedCategories &&
    selectedCategories.forEach((category) => {
      // Skip quick-info since it's handled above
      if (category === "quick-info") return;

      const categoryEntries = actualEntries[category] || [];
      if (categoryEntries.length > 0) {
        html += `
    <div class="section">
        <h2>${escapeHtml(categoryTitles[category])}</h2>`;

        categoryEntries.forEach((entry, index) => {
          html += `
        <div class="entry">
            <div class="entry-title">• ${escapeHtml(entry.title)}</div>
            <div class="entry-description">${escapeHtml(entry.description)}</div>
            <div class="entry-date">Date: ${escapeHtml(new Date(entry.date).toLocaleDateString())}</div>
        </div>`;
        });

        html += `
    </div>`;
      }
    });

  html += `
    <div class="document-footer">
        This information is confidential. Generated by Manylla on ${escapeHtml(currentDateTime)}
    </div>
</body>
</html>`;

  return html;
};