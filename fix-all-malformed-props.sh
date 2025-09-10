#!/bin/bash

echo "Fixing all malformed style properties..."

# Fix malformed numeric values
find src -name "*.js" -exec sed -i '' \
  -e 's/borderTopLeftRadius0/borderTopLeftRadius: 0/g' \
  -e 's/borderTopRightRadius0/borderTopRightRadius: 0/g' \
  -e 's/width4,/width: 14,/g' \
  -e 's/width2,/width: 12,/g' \
  -e 's/width0,/width: 10,/g' \
  -e 's/width20,/width: 20,/g' \
  -e 's/width00,/width: 200,/g' \
  -e 's/marginHorizontal6,/marginHorizontal: 6,/g' \
  -e 's/marginRight2,/marginRight: 12,/g' \
  {} \;

# Fix missing values for common properties
find src -name "*.js" -exec sed -i '' \
  -e 's/paddingVertical,$/paddingVertical: 8,/g' \
  -e 's/paddingHorizontal,$/paddingHorizontal: 12,/g' \
  -e 's/marginVertical,$/marginVertical: 8,/g' \
  -e 's/marginHorizontal,$/marginHorizontal: 12,/g' \
  -e 's/paddingLeft,$/paddingLeft: 12,/g' \
  -e 's/marginRight,$/marginRight: 8,/g' \
  {} \;

# Fix malformed color properties
find src -name "*.js" -exec sed -i '' \
  -e 's/colorategoryColor/color: categoryColor/g' \
  -e 's/backgroundColorolor/backgroundColor: color/g' \
  -e 's/backgroundColorategoryColor/backgroundColor: categoryColor/g' \
  {} \;

# Fix standalone color property
find src -name "*.js" -exec sed -i '' \
  -e 's/^  color,$/  color: colors.text.primary,/g' \
  {} \;

echo "Done!"