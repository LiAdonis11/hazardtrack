// Responsive Design System for HazardTrack Mobile App
// Cross-platform responsive utilities for React Native + Tamagui

import { Dimensions } from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Breakpoint definitions
export const breakpoints = {
  xs: 0,      // Mobile
  sm: 481,    // Large Mobile/Tablet
  md: 769,    // Tablet
  lg: 1025,   // Desktop
} as const;

// Media query helpers
export const mediaQueries = {
  xs: { maxWidth: breakpoints.sm - 1 },
  sm: { maxWidth: breakpoints.md - 1 },
  md: { maxWidth: breakpoints.lg - 1 },
  lg: { minWidth: breakpoints.lg },
  gtXs: { minWidth: breakpoints.sm },
  gtSm: { minWidth: breakpoints.md },
  gtMd: { minWidth: breakpoints.lg },
} as const;

// Responsive spacing tokens
export const spacing = {
  '$0.5': 2,
  '$1': 4,
  '$2': 8,
  '$3': 12,
  '$4': 16,
  '$5': 20,
  '$6': 24,
  '$8': 32,
  '$10': 40,
} as const;

// Container sizes
export const containers = {
  sm: 480,
  md: 768,
  lg: 1024,
} as const;

// Color palette for responsive design
export const colors = {
  fireRed: '#D32F2F',
  darkGray: '#212121',
  muted: '#f5f5f5',
  mutedFg: '#757575',
  border: 'rgba(33,33,33,0.12)',
  successGreen: '#2E7D32',
  warningOrange: '#F57C00',
  infoBlue: '#1976D2',
  warningYellow: '#FBC02D',
} as const;

// Utility functions
export const isMobile = () => screenWidth < breakpoints.sm;
export const isTablet = () => screenWidth >= breakpoints.sm && screenWidth < breakpoints.md;
export const isDesktop = () => screenWidth >= breakpoints.md;

export const getResponsiveValue = <T>(
  values: { xs?: T; sm?: T; md?: T; lg?: T },
  defaultValue: T
): T => {
  if (screenWidth >= breakpoints.lg && values.lg !== undefined) return values.lg;
  if (screenWidth >= breakpoints.md && values.md !== undefined) return values.md;
  if (screenWidth >= breakpoints.sm && values.sm !== undefined) return values.sm;
  return values.xs ?? defaultValue;
};

// Hook for responsive values
export const useResponsiveValue = <T>(
  values: { xs?: T; sm?: T; md?: T; lg?: T },
  defaultValue: T
): T => {
  return getResponsiveValue(values, defaultValue);
};

// Common responsive patterns
export const responsiveProps = {
  // Container padding
  containerPadding: {
    xs: '$4',
    sm: '$6',
    md: '$8',
  },

  // Font sizes
  headingSize: {
    xs: '$8',
    sm: '$9',
    md: '$10',
  },

  // Card spacing
  cardGap: {
    xs: '$3',
    sm: '$4',
    md: '$5',
  },

  // Button sizes
  buttonSize: {
    xs: '$4',
    sm: '$5',
    md: '$6',
  },
} as const;

// FlatList optimization props
export const flatListProps = {
  initialNumToRender: 10,
  maxToRenderPerBatch: 5,
  windowSize: 5,
  removeClippedSubviews: true,
  showsVerticalScrollIndicator: false,
  showsHorizontalScrollIndicator: false,
} as const;

// Touch target minimum size (44x44 as per Apple HIG)
export const touchTargetSize = 44;

// Animation configurations
export const animations = {
  fadeIn: {
    opacity: [0, 1],
    scale: [0.95, 1],
  },
  slideUp: {
    translateY: [20, 0],
    opacity: [0, 1],
  },
  bounce: {
    scale: [1, 1.05, 1],
  },
} as const;

export default {
  breakpoints,
  mediaQueries,
  spacing,
  containers,
  colors,
  isMobile,
  isTablet,
  isDesktop,
  getResponsiveValue,
  useResponsiveValue,
  responsiveProps,
  flatListProps,
  touchTargetSize,
  animations,
};
