#!/bin/bash

# Fix malformed object properties in all JS files

echo "Fixing final syntax errors..."

# Fix specific patterns
find src -name "*.js" -exec sed -i '' \
  -e 's/shadowOpacity\.\([0-9]\)/shadowOpacity: 0.\1/g' \
  -e 's/width,/width: 0,/g' \
  -e 's/height,/height: 2,/g' \
  -e 's/height }/height: 2 }/g' \
  -e 's/flex,/flex: 1,/g' \
  -e 's/flex }/flex: 1 }/g' \
  -e 's/borderWidth,/borderWidth: 1,/g' \
  -e 's/borderTopWidth,/borderTopWidth: 1,/g' \
  -e 's/borderBottomWidth,/borderBottomWidth: 1,/g' \
  -e 's/elevation,/elevation: 2,/g' \
  -e 's/shadowRadius,/shadowRadius: 4,/g' \
  -e 's/borderRadius,/borderRadius: 8,/g' \
  -e 's/gap,/gap: 8,/g' \
  -e 's/padding,/padding: 8,/g' \
  -e 's/margin,/margin: 8,/g' \
  -e 's/marginTop,/marginTop: 8,/g' \
  -e 's/marginBottom,/marginBottom: 8,/g' \
  -e 's/marginLeft,/marginLeft: 8,/g' \
  -e 's/paddingTop,/paddingTop: 8,/g' \
  -e 's/paddingBottom,/paddingBottom: 8,/g' \
  -e 's/letterSpacing,/letterSpacing: 1,/g' \
  {} \;

echo "Fixed final syntax errors"
