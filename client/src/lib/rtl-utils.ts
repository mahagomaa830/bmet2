/**
 * RTL (Right-to-Left) utility functions for Arabic language support
 */

export interface RTLConfig {
  direction: 'rtl' | 'ltr';
  textAlign: 'right' | 'left';
  marginLeft: string;
  marginRight: string;
  paddingLeft: string;
  paddingRight: string;
}

/**
 * Get RTL configuration based on language
 */
export function getRTLConfig(isRTL: boolean = true): RTLConfig {
  return {
    direction: isRTL ? 'rtl' : 'ltr',
    textAlign: isRTL ? 'right' : 'left',
    marginLeft: isRTL ? '0' : 'auto',
    marginRight: isRTL ? 'auto' : '0',
    paddingLeft: isRTL ? '0' : '1rem',
    paddingRight: isRTL ? '1rem' : '0',
  };
}

/**
 * Apply RTL classes to elements
 */
export function getRTLClasses(isRTL: boolean = true): string {
  const baseClasses = ['font-arabic'];
  
  if (isRTL) {
    baseClasses.push(
      'text-right',
      'space-x-reverse',
      '[&>*]:ml-2',
      '[&>*]:mr-0'
    );
  } else {
    baseClasses.push(
      'text-left',
      '[&>*]:mr-2',
      '[&>*]:ml-0'
    );
  }
  
  return baseClasses.join(' ');
}

/**
 * Format numbers for Arabic locale
 */
export function formatArabicNumber(number: number | string): string {
  const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  const englishDigits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
  
  return String(number).replace(/[0-9]/g, (digit) => {
    return arabicDigits[englishDigits.indexOf(digit)];
  });
}

/**
 * Format dates for Arabic locale
 */
export function formatArabicDate(date: Date | string, options?: Intl.DateTimeFormatOptions): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    calendar: 'gregory', // Use Gregorian calendar
    numberingSystem: 'latn', // Use Latin numerals for better readability
    ...options,
  };
  
  return dateObj.toLocaleDateString('ar-SA', defaultOptions);
}

/**
 * Format time for Arabic locale
 */
export function formatArabicTime(date: Date | string, use24Hour: boolean = false): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  const options: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
    hour12: !use24Hour,
    numberingSystem: 'latn', // Use Latin numerals for time
  };
  
  return dateObj.toLocaleTimeString('ar-SA', options);
}

/**
 * Get direction-aware margin and padding utilities
 */
export function getDirectionalSpacing(isRTL: boolean = true) {
  return {
    marginStart: isRTL ? 'mr' : 'ml',
    marginEnd: isRTL ? 'ml' : 'mr',
    paddingStart: isRTL ? 'pr' : 'pl',
    paddingEnd: isRTL ? 'pl' : 'pr',
    textAlign: isRTL ? 'text-right' : 'text-left',
    float: isRTL ? 'float-right' : 'float-left',
  };
}

/**
 * Get RTL-aware flex direction classes
 */
export function getFlexDirection(isRTL: boolean = true, direction: 'row' | 'col' = 'row'): string {
  if (direction === 'col') {
    return 'flex-col';
  }
  
  return isRTL ? 'flex-row-reverse' : 'flex-row';
}

/**
 * Transform icon classes for RTL support
 */
export function getIconClass(baseClass: string, shouldFlip: boolean = false): string {
  const classes = [baseClass];
  
  if (shouldFlip) {
    classes.push('transform', 'scale-x-[-1]');
  } else {
    classes.push('no-flip');
  }
  
  return classes.join(' ');
}

/**
 * Get appropriate text direction for mixed content
 */
export function getTextDirection(text: string): 'rtl' | 'ltr' {
  // Simple heuristic: if text contains Arabic characters, use RTL
  const arabicRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
  return arabicRegex.test(text) ? 'rtl' : 'ltr';
}

/**
 * Priority level translations
 */
export const PRIORITY_TRANSLATIONS = {
  low: 'غير عاجل',
  medium: 'متوسط',
  high: 'عاجل',
  critical: 'حرج',
} as const;

/**
 * Status translations
 */
export const STATUS_TRANSLATIONS = {
  operational: 'تعمل بشكل طبيعي',
  maintenance: 'تحت الصيانة',
  out_of_service: 'خارج الخدمة',
  open: 'مفتوح',
  assigned: 'معيّن',
  in_progress: 'قيد التنفيذ',
  resolved: 'محلول',
  closed: 'مغلق',
  pass: 'سليم',
  fail: 'معطل',
  needs_attention: 'يحتاج انتباه',
} as const;

/**
 * Department translations (common departments)
 */
export const DEPARTMENT_TRANSLATIONS = {
  'قسم العناية المركزة': 'Intensive Care Unit',
  'قسم الطوارئ': 'Emergency Department',
  'قسم الجراحة': 'Surgery Department',
  'قسم الأشعة': 'Radiology Department',
  'قسم المختبر': 'Laboratory Department',
  'الصيانة الطبية': 'Biomedical Engineering',
} as const;

/**
 * Maintenance type translations
 */
export const MAINTENANCE_TYPE_TRANSLATIONS = {
  preventive: 'وقائية',
  corrective: 'إصلاحية',
  emergency: 'طارئة',
} as const;

/**
 * Get localized text for various system values
 */
export function getLocalizedText(
  key: string,
  type: 'priority' | 'status' | 'department' | 'maintenance'
): string {
  switch (type) {
    case 'priority':
      return PRIORITY_TRANSLATIONS[key as keyof typeof PRIORITY_TRANSLATIONS] || key;
    case 'status':
      return STATUS_TRANSLATIONS[key as keyof typeof STATUS_TRANSLATIONS] || key;
    case 'department':
      return DEPARTMENT_TRANSLATIONS[key as keyof typeof DEPARTMENT_TRANSLATIONS] || key;
    case 'maintenance':
      return MAINTENANCE_TYPE_TRANSLATIONS[key as keyof typeof MAINTENANCE_TYPE_TRANSLATIONS] || key;
    default:
      return key;
  }
}

/**
 * Validate Arabic text input
 */
export function validateArabicText(text: string): boolean {
  // Allow Arabic, numbers, punctuation, and common symbols
  const validPattern = /^[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF\s\d\p{P}]*$/u;
  return validPattern.test(text);
}

/**
 * Clean and normalize Arabic text
 */
export function normalizeArabicText(text: string): string {
  return text
    .trim()
    // Normalize Arabic characters
    .replace(/ي/g, 'ي')
    .replace(/ك/g, 'ك')
    // Remove extra whitespace
    .replace(/\s+/g, ' ');
}

/**
 * Generate RTL-aware CSS custom properties
 */
export function generateRTLCustomProperties(isRTL: boolean = true): Record<string, string> {
  return {
    '--text-align': isRTL ? 'right' : 'left',
    '--flex-direction': isRTL ? 'row-reverse' : 'row',
    '--margin-start': isRTL ? 'margin-right' : 'margin-left',
    '--margin-end': isRTL ? 'margin-left' : 'margin-right',
    '--padding-start': isRTL ? 'padding-right' : 'padding-left',
    '--padding-end': isRTL ? 'padding-left' : 'padding-right',
    '--border-start': isRTL ? 'border-right' : 'border-left',
    '--border-end': isRTL ? 'border-left' : 'border-right',
  };
}
