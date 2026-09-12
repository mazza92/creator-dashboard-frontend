/**
 * Email Templates Index
 *
 * Central export for all email templates and utilities
 */

// Templates
export {
  default as generateWeeklyBrandRoundup,
  generateWeeklyBrandRoundup as WeeklyBrandRoundup,
  generateSubjectLine,
  sampleBrands,
  getPreviewHTML as getWeeklyBrandRoundupPreview
} from './WeeklyBrandRoundup';

export {
  default as generateGeneralAnnouncement,
  generateGeneralAnnouncement as GeneralAnnouncement,
  resolveAnnouncementPreheader,
  sampleAnnouncementInsights,
  sampleAnnouncementGeneral,
  getAnnouncementInsightsPreview,
  getAnnouncementGeneralPreview,
} from './GeneralAnnouncement';

export {
  default as generateBrandViewNotification,
  generateBrandViewNotification as BrandViewNotification,
  sampleBrandViewFree,
  sampleBrandViewPro,
  getBrandViewFreePreview,
  getBrandViewProPreview,
} from './BrandViewNotification';

export {
  generatePROpportunity,
  generatePROpportunitySubject,
  productFromBrand,
  websiteFromBrand,
  samplePROpportunity,
  DEFAULT_PR_EXCHANGE,
} from './PROpportunity';

export {
  generatePRRosterLive,
  generatePRRosterLiveSubject,
  applyUrlFromBrand,
  normalizeRosterBrands,
  samplePRRosterLive,
} from './PRRosterLive';

// Components
export { default as EmailTemplatePreview } from './EmailTemplatePreview';

// Template registry for dynamic selection
export const emailTemplates = {
  brand_roundup: {
    id: 'brand_roundup',
    name: 'Weekly Brand Roundup',
    description: 'Showcase new brands with clean card layout',
    icon: '📦',
    generator: 'generateWeeklyBrandRoundup',
  },
  general_announcement: {
    id: 'general_announcement',
    name: 'General Announcement',
    description: 'Flexible template for insights, news, and updates',
    icon: '💡',
    generator: 'generateGeneralAnnouncement',
  },
  brand_view_notification: {
    id: 'brand_view_notification',
    name: 'Brand View Notification',
    description: 'Triggered when a brand views creator kit via tracked link',
    icon: '👀',
    generator: 'generateBrandViewNotification',
  },
  pr_opportunity: {
    id: 'pr_opportunity',
    name: 'PR Opportunity',
    description: 'Gifted PR invite for selected creators — brand and product fill from the brand record',
    icon: '🎁',
    generator: 'generatePROpportunity',
  },
  pr_roster_live: {
    id: 'pr_roster_live',
    name: 'Gift list live',
    description: 'Roundup-style cards for brands actively running PR — one or several',
    icon: '⚡',
    generator: 'generatePRRosterLive',
  },
  new_gifting_campaigns: {
    id: 'new_gifting_campaigns',
    name: 'New gifting campaigns',
    description: 'Apply-now list of new brand PR rosters waiting to be filled',
    icon: '🎁',
    generator: 'generatePRRosterLive',
  },
};

// Helper to get all available templates
export const getAvailableTemplates = () => Object.values(emailTemplates);
