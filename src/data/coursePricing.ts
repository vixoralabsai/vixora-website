/**
 * Vixora Academy — Course Pricing Contract
 *
 * Phase 1 establishes one structured pricing source for course amounts.
 * Values are fixed commercial prices, not live FX conversions.
 *
 * IMPORTANT:
 * - null means a price for that currency has not yet been approved/configured.
 * - Do not derive one currency from the other using an exchange-rate peg.
 * - Payment amounts must remain server-authoritative.
 */

export type SupportedCourseCurrency = 'NGN' | 'USD';

export interface CoursePrices {
  NGN: number | null;
  USD: number | null;
}

export interface CoursePricing {
  courseId: string;
  prices: CoursePrices;
}

/**
 * Current approved prices migrated from ACADEMY_COURSES.tuition.
 * Missing counterpart prices are intentionally null until explicitly set.
 */
export const COURSE_PRICING: Record<string, CoursePrices> = {
  'course-ai-image-short-videos-creation': {
    NGN: 10000,
    USD: 10,
  },
  'course-data-analysis-cohort': {
    NGN: 60000,
    USD: 50,
  },
  'course-ai-automation-digital-skills': {
    NGN: 30000,
    USD: 25,
  },
  'course-ai-automation-digital-business-systems': {
    NGN: 60000,
    USD: 50,
  },
  'course-fullstack-vibe-coding': {
    NGN: 50000,
    USD: 100,
  },
  'course-fullstack-ai': {
    NGN: null,
    USD: 1850,
  },
  'course-executive-ai': {
    NGN: null,
    USD: 2400,
  },
  'course-workflow-automation': {
    NGN: null,
    USD: 950,
  },
  'course-ai-product-design': {
    NGN: null,
    USD: 1100,
  },
  'course-generative-media-marketing': {
    NGN: null,
    USD: 850,
  },
  'course-machine-learning-data-science': {
    NGN: 60000,
    USD: 60,
  },
  'course-client-acquisition-freelancing': {
    NGN: 25000,
    USD: 25,
  },
  'course-cohort-1-master-bundle': {
    NGN: 45000,
    USD: 45,
  },
};

export function getCoursePrices(courseId: string): CoursePrices | null {
  if (!courseId || typeof courseId !== 'string') {
    return null;
  }

  return COURSE_PRICING[courseId.trim()] ?? null;
}

export function getCoursePrice(
  courseId: string,
  currency: SupportedCourseCurrency
): number | null {
  return getCoursePrices(courseId)?.[currency] ?? null;
}
