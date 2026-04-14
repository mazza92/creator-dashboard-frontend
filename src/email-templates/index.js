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

// Components
export { default as EmailTemplatePreview } from './EmailTemplatePreview';

// Template registry for dynamic selection
export const emailTemplates = {
  brand_roundup: {
    id: 'brand_roundup',
    name: 'Weekly Brand Roundup',
    description: 'Showcase new brands with clean card layout',
    icon: '📦',
    generator: 'generateWeeklyBrandRoundup'
  }
};

// Helper to get all available templates
export const getAvailableTemplates = () => Object.values(emailTemplates);
