import React from 'react';
import { View } from 'react-native';
import Svg, { Defs, ClipPath, Rect, G, Path } from 'react-native-svg';
import platform from '../../utils/platform';

const ManyllaLogo = ({ size = 36 }) => {
  // For web, we can use a different approach if needed
  if (platform.isWeb) {
    return (
      <svg
        viewBox="0 0 180 180"
        width={size}
        height={size}
        style={{ display: 'block' }}
      >
        <defs>
          <clipPath id="squircle-clip">
            <rect x="0" y="0" width="180" height="180" rx="40" ry="40" />
          </clipPath>
        </defs>
        <g clipPath="url(#squircle-clip)">
          <rect width="180" height="75" fill="#C4A66B" />
          <rect y="75" width="180" height="105" fill="#D4B896" />
          <path d="M90 50 L115 75 L90 100 L65 75 Z" fill="#C73E3E" />
        </g>
      </svg>
    );
  }

  // For native platforms (iOS/Android)
  return (
    <Svg viewBox="0 0 180 180" width={size} height={size}>
      <Defs>
        <ClipPath id="squircle-clip">
          <Rect x="0" y="0" width="180" height="180" rx="40" ry="40" />
        </ClipPath>
      </Defs>
      <G clipPath="url(#squircle-clip)">
        <Rect width="180" height="75" fill="#C4A66B" />
        <Rect y="75" width="180" height="105" fill="#D4B896" />
        <Path d="M90 50 L115 75 L90 100 L65 75 Z" fill="#C73E3E" />
      </G>
    </Svg>
  );
};

export default ManyllaLogo;