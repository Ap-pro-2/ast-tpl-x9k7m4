
import { defaultTheme, type ThemeConfig } from './theme';
import settingsData from '../content/data/settings.json';


const jsonThemeSettings = settingsData?.[0]?.themeSettings || null;




export const userTheme: ThemeConfig = jsonThemeSettings ? {
  colors: {
    primary: jsonThemeSettings.colors.primary,
    primaryLight: jsonThemeSettings.colors.primaryLight,
    primaryDark: jsonThemeSettings.colors.primaryDark,
    secondary: jsonThemeSettings.colors.secondary,
    accent: jsonThemeSettings.colors.accent,
    
    
    primaryAccessible: jsonThemeSettings.colors.primary,      
    primaryAccessibleDark: jsonThemeSettings.colors.primaryDark, 
    
    textPrimary: jsonThemeSettings.colors.textPrimary,
    textSecondary: jsonThemeSettings.colors.textSecondary,
    textMuted: jsonThemeSettings.colors.textMuted,
    textMutedAccessible: jsonThemeSettings.colors.textSecondary || jsonThemeSettings.colors.textMuted,
    textAccent: jsonThemeSettings.colors.textAccent,
    
    bgPrimary: jsonThemeSettings.colors.bgPrimary,
    bgSecondary: jsonThemeSettings.colors.bgSecondary,
    bgTertiary: jsonThemeSettings.colors.bgTertiary,
    bgContrastSafe: jsonThemeSettings.colors.bgSecondary || jsonThemeSettings.colors.bgTertiary,
    
    surfaceCard: jsonThemeSettings.colors.surfaceCard,
    surfaceOverlay: jsonThemeSettings.colors.surfaceOverlay,
    borderDefault: jsonThemeSettings.colors.borderDefault,
    borderLight: jsonThemeSettings.colors.borderLight,
    borderAccent: jsonThemeSettings.colors.borderAccent,
  },
    typography: {
    fontHeading: jsonThemeSettings.typography.fontHeading,
    fontBody: jsonThemeSettings.typography.fontBody,
    fontMono: jsonThemeSettings.typography.fontMono,
    textXs: jsonThemeSettings.typography.textXs,
    textSm: jsonThemeSettings.typography.textSm,
    textBase: jsonThemeSettings.typography.textBase,
    textLg: jsonThemeSettings.typography.textLg,
    textXl: jsonThemeSettings.typography.textXl,
    text2xl: jsonThemeSettings.typography.text2xl,
    text3xl: jsonThemeSettings.typography.text3xl,
    text4xl: jsonThemeSettings.typography.text4xl,
  },
  spacing: {
    containerMaxWidth: jsonThemeSettings.spacing.containerMaxWidth,
    sectionPadding: jsonThemeSettings.spacing.sectionPadding,
    cardPadding: jsonThemeSettings.spacing.cardPadding,
    buttonPadding: jsonThemeSettings.spacing.buttonPadding,
  },
  borderRadius: {
    sm: jsonThemeSettings.borderRadius.sm,
    md: jsonThemeSettings.borderRadius.md,
    lg: jsonThemeSettings.borderRadius.lg,
    xl: jsonThemeSettings.borderRadius.xl,
    full: jsonThemeSettings.borderRadius.full,
  },
  shadows: {
    sm: jsonThemeSettings.shadows.sm,
    md: jsonThemeSettings.shadows.md,
    lg: jsonThemeSettings.shadows.lg,
    xl: jsonThemeSettings.shadows.xl,
  },
  animation: {
    duration: jsonThemeSettings.animation.duration,
    easing: jsonThemeSettings.animation.easing,
  },
  transitions: {
    pageStyle: jsonThemeSettings.transitions.pageStyle,
    speed: jsonThemeSettings.transitions.speed,
    loadingStyle: jsonThemeSettings.transitions.loadingStyle,
    reducedMotion: jsonThemeSettings.transitions.reducedMotion,
  },
} : defaultTheme; 






export const luxuryGold: ThemeConfig = {
  ...defaultTheme,
  colors: {
    primary: '#D4AF37',        
    primaryLight: '#F4E4BC',   
    primaryDark: '#B8860B',    
    secondary: '#8B7355',      
    accent: '#CD853F',         
    
    
    primaryAccessible: '#B8860B',      
    primaryAccessibleDark: '#996F0A',  
    
    textPrimary: '#1A0F0A',    
    textSecondary: '#2C1810',  
    textMuted: '#5D4037',      
    textMutedAccessible: '#4A2C17',    
    textAccent: '#B8860B',     
    
    bgPrimary: '#FFFEF7',      
    bgSecondary: '#FAF7F0',    
    bgTertiary: '#F5F0E8',     
    bgContrastSafe: '#F2EDE3', 
    
    surfaceCard: '#FEFDFB',    
    surfaceOverlay: '#F9F6F0', 
    borderDefault: '#E8DCC6',  
    borderLight: '#F0E6D2',    
    borderAccent: '#D4C4A8',   
  },
  typography: {
    ...defaultTheme.typography,
    fontHeading: '"Playfair Display", "Georgia", serif',
    fontBody: '"Source Sans Pro", "Helvetica Neue", sans-serif',
  },
  shadows: {
    sm: '0 2px 4px 0 rgb(212 175 55 / 0.1)',
    md: '0 4px 8px -1px rgb(212 175 55 / 0.15), 0 2px 4px -2px rgb(212 175 55 / 0.1)',
    lg: '0 10px 20px -3px rgb(212 175 55 / 0.2), 0 4px 8px -4px rgb(212 175 55 / 0.15)',
    xl: '0 20px 30px -5px rgb(212 175 55 / 0.25), 0 8px 12px -6px rgb(212 175 55 / 0.2)',
  },
};


export const luxuryMidnight: ThemeConfig = {
  ...defaultTheme,
  colors: {
    primary: '#6366F1',        
    primaryLight: '#818CF8',   
    primaryDark: '#4F46E5',    
    secondary: '#64748B',      
    accent: '#F59E0B',         
    
    
    primaryAccessible: '#818CF8',      
    primaryAccessibleDark: '#93C5FD',  
    
    textPrimary: '#F8FAFC',    
    textSecondary: '#CBD5E1',  
    textMuted: '#94A3B8',      
    textMutedAccessible: '#CBD5E1',    
    textAccent: '#6366F1',     
    
    bgPrimary: '#0F172A',      
    bgSecondary: '#1E293B',    
    bgTertiary: '#334155',     
    bgContrastSafe: '#1E293B', 
    
    surfaceCard: '#1E293B',    
    surfaceOverlay: '#334155', 
    borderDefault: '#475569',  
    borderLight: '#64748B',    
    borderAccent: '#6366F1',   
  },
  typography: {
    ...defaultTheme.typography,
    fontHeading: '"Inter", system-ui, sans-serif',
    fontBody: '"Inter", system-ui, sans-serif',
  },
};























































































