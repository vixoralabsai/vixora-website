import { ACADEMY_COURSES } from '../../src/data/vixoraContent.js';
import { getCoursePrices, type CoursePrices } from '../../src/data/coursePricing.js';

export interface CanonicalCourse {
  id: string;
  slug: string;
  title: string;
  /** Structured commercial prices. Null means that currency is not configured. */
  prices: CoursePrices;
  /** Legacy NGN payment fields retained during Phase 1 compatibility work. */
  nairaAmount: number;
  koboAmount: number;
  currency: 'NGN';
  totalModules: number;
  nextCohortDate: string;
  tuitionDisplay: string;
}

/**
 * Phase 1 compatibility helper.
 *
 * The structured course pricing contract is now authoritative. Existing
 * Paystack NGN flows still consume nairaAmount/koboAmount until the currency
 * routing/payment phase is implemented. No live FX conversion is introduced
 * by the new pricing model.
 */
function getLegacyNairaAmount(courseId: string, tuition: string): number {
  const prices = getCoursePrices(courseId);
  if (prices?.NGN != null) return prices.NGN;

  // Preserve the existing behavior for USD-priced courses during the
  // transition. This is intentionally temporary and is NOT the new pricing
  // model. It will be removed when USD checkout is implemented.
  if (prices?.USD != null) return prices.USD * 1000;

  if (tuition?.includes('₦')) {
    const num = parseInt(tuition.replace(/[^0-9]/g, ''), 10);
    if (!isNaN(num) && num > 0) return num;
  }

  const raw = parseInt(tuition?.replace(/[^0-9]/g, '') || '', 10);
  return !isNaN(raw) && raw > 0 ? raw : 60000;
}

// Build canonical map indexed by both canonical ID and slug
const canonicalCourseMap = new Map<string, CanonicalCourse>();

for (const course of ACADEMY_COURSES) {
  const prices = getCoursePrices(course.id);
  const resolvedPrices: CoursePrices = prices ?? { NGN: null, USD: null };
  const naira = getLegacyNairaAmount(course.id, course.tuition);
  const canonical: CanonicalCourse = {
    id: course.id,
    slug: course.slug,
    title: course.title,
    prices: resolvedPrices,
    nairaAmount: naira,
    koboAmount: naira * 100,
    currency: 'NGN',
    totalModules: course.weeklySyllabus?.length || course.curriculum?.length || 12,
    nextCohortDate: course.nextCohortDate || 'October 9, 2026',
    tuitionDisplay: course.tuition
  };

  // Index by full ID (e.g. 'course-data-analysis-cohort')
  canonicalCourseMap.set(course.id.toLowerCase().trim(), canonical);
  // Index by slug (e.g. 'data-analysis-cohort')
  canonicalCourseMap.set(course.slug.toLowerCase().trim(), canonical);
}

/**
 * Finds the authoritative canonical course by ID or slug.
 * Returns null if course is not recognized in the official catalog.
 */
export function findCanonicalCourse(courseIdentifier: string): CanonicalCourse | null {
  if (!courseIdentifier || typeof courseIdentifier !== 'string') {
    return null;
  }
  const clean = courseIdentifier.toLowerCase().trim();
  return canonicalCourseMap.get(clean) || null;
}

/**
 * Returns all active canonical courses
 */
export function getAllCanonicalCourses(): CanonicalCourse[] {
  // Deduplicate by course id
  const unique = new Map<string, CanonicalCourse>();
  for (const course of canonicalCourseMap.values()) {
    unique.set(course.id, course);
  }
  return Array.from(unique.values());
}
