/**
 * Brand Configuration for Vixora Digital Hub
 *
 * You can easily update your domain, logo link, hero background image link,
 * and WhatsApp contact channels below.
 */

export interface WhatsAppChannel {
  id: 'us' | 'ng';
  label: string;
  region: string;
  displayNumber: string;
  fullInternationalNumber: string;
  cleanDigits: string;
  flagEmoji: string;
  isPrimary?: boolean;
}

export interface BrandConfig {
  name: string;
  tagline: string;
  domain: string;
  cleanDomain: string;
  academyDomain: string;
  cleanAcademyDomain: string;
  adminDomain: string;
  cleanAdminDomain: string;
  email: string;
  secondaryEmail: string;
  phone: string;
  whatsapp: {
    usAndGlobal: WhatsAppChannel;
    nigeria: WhatsAppChannel;
    defaultUrl: string;
  };
  whatsappNumber: string;
  whatsappUrl: string;
  address: string;
  logo: {
    imageUrl: string;
    secondaryImageUrl?: string;
    mobileImageUrl?: string;
    darkImageUrl?: string;
    altText: string;
  };
  academyLogo: {
    imageUrl: string;
    fallbackUrl?: string;
    altText: string;
  };
  heroBackground: {
    imageUrl: string;
    videoUrl?: string;
    overlayOpacity: number;
  };
  academyHeroBackground: {
    imageUrl: string;
    videoUrl?: string;
    overlayOpacity: number;
  };
}

export const BRAND_CONFIG: BrandConfig = {
  name: "Vixora Digital Hub",
  tagline: "Software • AI • Automation",
  domain: "https://www.vixoradigitalhub.com",
  cleanDomain: "vixoradigitalhub.com",
  academyDomain: "https://academy.vixoradigitalhub.com",
  cleanAcademyDomain: "academy.vixoradigitalhub.com",
  adminDomain: "https://admin.vixoradigitalhub.com",
  cleanAdminDomain: "admin.vixoradigitalhub.com",
  email: "vixoralabsai@gmail.com",
  secondaryEmail: "hello@vixoradigitalhub.com",
  phone: "+1 (279) 257-4850",
  whatsapp: {
    usAndGlobal: {
      id: 'us',
      label: "US & Foreign Inbounds",
      region: "United States, Americas, Europe & Global",
      displayNumber: "+1 (279) 257-4850",
      fullInternationalNumber: "+12792574850",
      cleanDigits: "12792574850",
      flagEmoji: "US",
      isPrimary: true
    },
    nigeria: {
      id: 'ng',
      label: "Nigeria Inbounds",
      region: "Nigeria & West Africa Region",
      displayNumber: "08114542934",
      fullInternationalNumber: "+2348114542934",
      cleanDigits: "2348114542934",
      flagEmoji: "NG",
      isPrimary: false
    },
    defaultUrl: "https://wa.me/12792574850?text=Hello%20Vixora%20Digital%20Hub%20Team%2C%20I%20would%20like%20to%20discuss%20a%20new%20project."
  },
  whatsappNumber: "+1 (279) 257-4850",
  whatsappUrl: "https://wa.me/12792574850?text=Hello%20Vixora%20Digital%20Hub%20Team%2C%20I%20would%20like%20to%20discuss%20a%20new%20project.",
  address: "Vixora Digital Hub Headquarters, Silicon Corridor & Cloud Innovation Center",
  logo: {
    imageUrl: "/images/vixora-digital-hub-logo.png",
    secondaryImageUrl: "/images/vixora-digital-hub-logo.png",
    mobileImageUrl: "/images/brand-logo-mobile.png",
    darkImageUrl: "/images/vixora-digital-hub-logo.png",
    altText: "Vixora Digital Hub Logo"
  },
  academyLogo: {
    imageUrl: "/images/vixora-academy-logo.png",
    fallbackUrl: "/images/vixora-academy-logo.png",
    altText: "Vixora Academy"
  },
  heroBackground: {
    imageUrl: "/images/hero-background.png",
    videoUrl: "/videos/hero-background.mp4",
    overlayOpacity: 0.65
  },
  academyHeroBackground: {
    imageUrl: "/images/academy-hero-poster.jpg",
    videoUrl: "https://i.imgur.com/fo6rXq2.mp4",
    overlayOpacity: 0.65
  }
};

export function extractImgurId(url?: string): string | null {
  if (!url) return null;
  const match = url.match(/(?:imgur\.com\/(?:a|gallery)\/|i\.imgur\.com\/)([a-zA-Z0-9]+)/);
  return match ? match[1] : null;
}

export function getVideoSources(url?: string, defaultFallback: string = '/videos/hero-background.mp4'): string[] {
  const sources: string[] = [];
  if (url && url.trim()) {
    const trimmed = url.trim();
    if (trimmed.includes('6ASa1S5') || trimmed.includes('fo6rXq2')) {
      sources.push('https://i.imgur.com/fo6rXq2.mp4');
    } else {
      sources.push(trimmed);
    }
  }
  if (defaultFallback && !sources.includes(defaultFallback)) {
    sources.push(defaultFallback);
  }
  return sources.length > 0 ? Array.from(new Set(sources)) : [defaultFallback];
}

export function getDirectImageUrl(url?: string): string {
  if (!url) return '';
  const trimmed = url.trim();
  if (!trimmed) return '';
  return trimmed;
}

export function getImageFallbacks(url?: string): string[] {
  if (!url) return ['/images/vixora-digital-hub-logo.png'];
  const trimmed = url.trim();
  if (!trimmed) return ['/images/vixora-digital-hub-logo.png'];

  if (trimmed.includes('academy') || trimmed.includes('poster')) {
    return [
      '/images/academy-hero-poster.jpg',
      '/images/hero-background.png',
      '/images/vixora-academy-logo.jpg'
    ];
  }

  if (
    trimmed.includes('brand-logo') ||
    trimmed.includes('vixora') ||
    trimmed.includes('logo')
  ) {
    return [
      '/images/vixora-digital-hub-logo.png',
      '/images/brand-logo-horizontal.png',
      '/images/brand-logo-mobile.png',
      '/images/vixora-icon.png',
      '/images/brand-logo-1.png'
    ];
  }
  if (trimmed.includes('hero-background') || trimmed.includes('fo6rXq2') || trimmed.includes('6ASa1S5')) {
    return ['/images/hero-background.png'];
  }

  return [trimmed, '/images/vixora-digital-hub-logo.png'];
}

export function getWhatsAppUrl(
  channelOrMessage: 'us' | 'ng' | string = 'us',
  customMessage?: string
): string {
  let channel: 'us' | 'ng' = 'us';
  let message: string | undefined = customMessage;

  if (channelOrMessage === 'ng' || channelOrMessage === 'us') {
    channel = channelOrMessage;
  } else if (typeof channelOrMessage === 'string' && channelOrMessage.length > 0) {
    message = channelOrMessage;
    channel = 'us';
  }

  const selected = channel === 'ng' ? BRAND_CONFIG.whatsapp.nigeria : BRAND_CONFIG.whatsapp.usAndGlobal;
  const finalMessage = message || "Hello Vixora Digital Hub Team, I would like to discuss a project.";
  return `https://wa.me/${selected.cleanDigits}?text=${encodeURIComponent(finalMessage)}`;
}
