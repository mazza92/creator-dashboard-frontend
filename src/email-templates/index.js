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
  sampleAnnouncementInsights,
  sampleAnnouncementGeneral,
  getAnnouncementInsightsPreview,
  getAnnouncementGeneralPreview,
} from './GeneralAnnouncement';

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
};

// Helper to get all available templates
export const getAvailableTemplates = () => Object.values(emailTemplates);
