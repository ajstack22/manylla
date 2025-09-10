#!/bin/bash

# Fix all remaining malformed properties in JavaScript files

echo "Fixing remaining syntax errors..."

# Fix all malformed properties in all JS files
find src -name "*.js" -exec sed -i '' \
  -e 's/fontSize\([0-9]\)/fontSize: \1/g' \
  -e 's/padding\([0-9]\)/padding: \1/g' \
  -e 's/margin\([0-9]\)/margin: \1/g' \
  -e 's/gap\([0-9]\)/gap: \1/g' \
  -e 's/colorolors/color: colors/g' \
  -e 's/backgroundColorolors/backgroundColor: colors/g' \
  -e 's/borderColorolors/borderColor: colors/g' \
  -e 's/borderTopColorolors/borderTopColor: colors/g' \
  -e 's/paddingadding/padding: /g' \
  -e 's/marginBottom\([0-9]\)/marginBottom: \1/g' \
  -e 's/marginTop\([0-9]\)/marginTop: \1/g' \
  -e 's/marginLeft\([0-9]\)/marginLeft: \1/g' \
  -e 's/marginVertical\([0-9]\)/marginVertical: \1/g' \
  -e 's/paddingTop\([0-9]\)/paddingTop: \1/g' \
  -e 's/paddingHorizontal\([0-9]\)/paddingHorizontal: \1/g' \
  -e 's/paddingVertical\([0-9]\)/paddingVertical: \1/g' \
  -e 's/lineHeight\([0-9]\)/lineHeight: \1/g' \
  -e 's/borderRadius\([0-9]\)/borderRadius: \1/g' \
  -e 's/borderWidth\([0-9]\)/borderWidth: \1/g' \
  -e 's/borderTopWidth\([0-9]\)/borderTopWidth: \1/g' \
  -e 's/height\([0-9]\)/height: \1/g' \
  -e 's/flex\([0-9]\)/flex: \1/g' \
  -e 's/gap: \([0-9]\)/gap: \10/g' \
  -e 's/padding: \([0-9]\)/padding: \10/g' \
  -e 's/margin: \([0-9]\)/margin: \10/g' \
  -e 's/fontSize: \([0-9]\)/fontSize: 1\1/g' \
  -e 's/lineHeight: \([0-9]\)/lineHeight: 2\1/g' \
  {} \;

echo "Done fixing syntax errors"