/**
 * SPENDWISE DESIGN SYSTEM v2
 * Premium fintech dark-mode palette with 3-font typographic system
 * Fonts: Sora (display), Inter (body), Space Grotesk (labels/headers)
 */
export const THEME = {
  colors: {
    // Backgrounds
    background: '#03040D',
    surface: '#0C0E1F',
    surfaceHigh: '#131628',
    surfaceGlass: 'rgba(19, 22, 40, 0.85)',

    // Brand
    primary: '#6366F1',       // Indigo — primary CTA
    primaryLight: '#818CF8',  // Indigo tint
    secondary: '#22D3EE',     // Cyan — accent
    emerald: '#10B981',       // Income / success
    rose: '#FB7185',          // Expense / alert
    amber: '#F59E0B',         // Budget warnings
    purple: '#A855F7',        // AI/Brain accent

    // Text
    textPrimary: '#F1F5F9',
    textSecondary: '#94A3B8',
    textMuted: '#475569',

    // Borders & Glass
    border: 'rgba(99, 102, 241, 0.18)',
    borderBright: 'rgba(99, 102, 241, 0.45)',
    borderGlass: 'rgba(255, 255, 255, 0.07)',

    // Semantic aliases
    success: '#10B981',
    danger: '#FB7185',
  },

  // Typography: 3 font families for visual hierarchy
  fonts: {
    // Sora — Hero numbers, display amounts, big headlines
    soraBlack: 'Sora_800ExtraBold',
    soraBold: 'Sora_700Bold',
    soraSemiBold: 'Sora_600SemiBold',

    // Inter — Body text, form inputs, descriptions
    interBold: 'Inter_700Bold',
    interSemiBold: 'Inter_600SemiBold',
    interRegular: 'Inter_400Regular',
    interLight: 'Inter_300Light',

    // Space Grotesk — Section headers, tab labels, all-caps chips
    spaceGrotesk: 'SpaceGrotesk_500Medium',
    spaceGroteskBold: 'SpaceGrotesk_700Bold',
  },

  // Legacy typography aliases (kept for backward compat with existing screens)
  typography: {
    heroText: { fontFamily: 'Inter-Black', fontWeight: '900', letterSpacing: -0.5 },
    boldHeader: { fontFamily: 'Inter-Bold', fontWeight: '700' },
    labelLight: { fontFamily: 'Inter-Light', fontWeight: '300', letterSpacing: 1 },
    regularText: { fontFamily: 'Inter-Regular', fontWeight: '400' },
  },

  layout: {
    borderRadius: 20,
    borderRadiusSm: 12,
    borderRadiusLg: 28,
    spacing: 20,
    spacingSm: 12,
    spacingLg: 32,
  },

  glass: {
    intensity: 35,
    tint: 'dark',
  },

  shadow: {
    indigo: {
      shadowColor: '#6366F1',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.35,
      shadowRadius: 20,
      elevation: 12,
    },
    card: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.4,
      shadowRadius: 12,
      elevation: 8,
    },
  },
};
