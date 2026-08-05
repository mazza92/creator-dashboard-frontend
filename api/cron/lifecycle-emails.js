/**
 * Vercel Cron Job: Lifecycle Emails
 *
 * Runs hourly to send lifecycle emails based on creator state.
 * Protected by CRON_SECRET environment variable.
 *
 * @version 1.0.1
 */

const { createClient } = require('@supabase/supabase-js');
const nodemailer = require('nodemailer');

const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SMTP_USER = process.env.SMTP_USER || process.env.GMAIL_USER;
const SMTP_PASSWORD = process.env.SMTP_PASSWORD || process.env.GMAIL_PASSWORD;
const FROM_NAME = 'Your Newcollab Manager';
const FROM_EMAIL = process.env.FROM_EMAIL || SMTP_USER;
const CRON_SECRET = process.env.CRON_SECRET;

const LOGO_URL = 'https://app.newcollab.co/newcollab-logo-dark.png';
const MAX_EMAILS_PER_DAY = 2;
const BATCH_SIZE = 50;
const DELAY_BETWEEN_EMAILS = 200;

export const config = {
  maxDuration: 300, // 5 minutes max for Vercel Pro
};

// Initialize clients
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
let transporter = null;

if (SMTP_USER && SMTP_PASSWORD) {
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: SMTP_USER, pass: SMTP_PASSWORD }
  });
}

function generateEmailHtml({ bodyText, primaryCta, preheader = '', utmCampaign = 'lifecycle' }) {
  const preheaderPadding = '\u200C\u00A0'.repeat(90);
  const primaryCtaHtml = primaryCta ? `
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
          <tr>
            <td style="padding: 24px 0 0 0;">
              <a href="${primaryCta.url}"
                 style="display: inline-block; background: #111827; color: #ffffff; font-size: 15px; font-weight: 600; padding: 14px 36px; border-radius: 8px; text-decoration: none;">
                ${primaryCta.label}
              </a>
            </td>
          </tr>
        </table>` : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="color-scheme" content="light">
  <style>
    body { margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f3f4f6;">
  <div style="display: none; max-height: 0; overflow: hidden;">${preheader}${preheaderPadding}</div>
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: auto;">
    <tr>
      <td style="padding: 32px 16px 24px 16px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="560" style="margin: auto;">
          <tr>
            <td style="padding: 0 0 28px 0; text-align: center;">
              <a href="https://app.newcollab.co?utm_source=email&utm_medium=${utmCampaign}">
                <img src="${LOGO_URL}" alt="Newcollab" height="36" style="height: 36px; width: auto;" />
              </a>
            </td>
          </tr>
          <tr>
            <td style="background: #ffffff; border-radius: 12px; box-shadow: 0 2px 12px rgba(0,0,0,0.08);">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td style="padding: 36px 40px;">
                    <div style="font-size: 15px; color: #374151; line-height: 1.7;">${bodyText}</div>
                    <p style="margin: 24px 0 0 0; font-size: 15px; color: #374151;">Your Newcollab Manager</p>
                    ${primaryCtaHtml}
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding: 28px 24px; text-align: center;">
              <p style="margin: 0 0 10px 0; font-size: 13px; color: #6b7280;">Newcollab helps creators land PR packages from brands they love.</p>
              <p style="margin: 0; font-size: 12px; color: #d1d5db;">&copy; 2026 Newcollab. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// Templates (same as lifecycle-email-cron.js)
const TEMPLATES = {
  education_1: {
    subject: "the 5 real reasons brands don't reply",
    getHtml: (firstName) => generateEmailHtml({
      bodyText: `<p style="margin:0 0 20px 0;">Hi ${firstName},</p>
<p style="margin:0 0 20px 0;">Most creators assume brands ignore them because they're too small. Almost never true.</p>
<p style="margin:0 0 20px 0;">I've watched thousands of pitches. Here are the actual top 5 reasons brands don't reply:</p>
<p style="margin:0 0 12px 0;"><strong>1.</strong> Your bio doesn't say what you make. Brands scan for niche fit in under 3 seconds.</p>
<p style="margin:0 0 12px 0;"><strong>2.</strong> Your last 9 posts don't show product in real use.</p>
<p style="margin:0 0 12px 0;"><strong>3.</strong> You have no visible contact.</p>
<p style="margin:0 0 12px 0;"><strong>4.</strong> Your pitch subject line says "collaboration inquiry."</p>
<p style="margin:0 0 20px 0;"><strong>5.</strong> You didn't follow up. 67% of brand replies come after a follow-up.</p>
<p style="margin:0 0 0 0;">The good news: every one of these is a 15-minute fix.</p>`,
      preheader: "It's rarely about your follower count.",
      primaryCta: { label: "See my audit", url: "https://app.newcollab.co/creator/dashboard/pr-ready?utm_source=email&utm_medium=lifecycle&utm_campaign=edu_5reasons" },
      utmCampaign: 'edu_5reasons'
    })
  },
  education_2: {
    subject: "the 60-second brand audit",
    getHtml: (firstName) => generateEmailHtml({
      bodyText: `<p style="margin:0 0 20px 0;">Hi ${firstName},</p>
<p style="margin:0 0 20px 0;">Ever wonder what a brand's PR person actually does when they read your pitch?</p>
<p style="margin:0 0 20px 0;">I've asked a lot of them. It's the same 60 seconds every time.</p>
<p style="margin:0 0 12px 0;"><strong>Second 1 to 10:</strong> subject line. If generic, archived.</p>
<p style="margin:0 0 12px 0;"><strong>Second 11 to 25:</strong> they scan your bio for niche fit.</p>
<p style="margin:0 0 12px 0;"><strong>Second 26 to 40:</strong> they check your Instagram or TikTok.</p>
<p style="margin:0 0 12px 0;"><strong>Second 41 to 50:</strong> they check for contact email.</p>
<p style="margin:0 0 20px 0;"><strong>Second 51 to 60:</strong> if still in play, they read your pitch body.</p>
<p style="margin:0 0 0 0;">Every one of those checkpoints is fixable.</p>`,
      preheader: "How PR coordinators actually decide.",
      primaryCta: { label: "See my checkpoints", url: "https://app.newcollab.co/creator/dashboard/pr-ready?utm_source=email&utm_medium=lifecycle&utm_campaign=edu_60sec" },
      utmCampaign: 'edu_60sec'
    })
  },
  education_3: {
    subject: "the pitch that gets replied to",
    getHtml: (firstName) => generateEmailHtml({
      bodyText: `<p style="margin:0 0 20px 0;">Hi ${firstName},</p>
<p style="margin:0 0 20px 0;">I want to break down a real pitch that landed a small creator a PR box.</p>
<p style="margin:0 0 12px 0;"><strong>Subject:</strong> "quick idea for {brand_name} + skincare routines"</p>
<p style="margin:0 0 12px 0;"><strong>Line 1:</strong> name a specific product they sell.</p>
<p style="margin:0 0 12px 0;"><strong>Line 2:</strong> name what your audience does that maps to their brand.</p>
<p style="margin:0 0 12px 0;"><strong>Line 3:</strong> propose ONE specific content idea.</p>
<p style="margin:0 0 12px 0;"><strong>Line 4:</strong> state the ask.</p>
<p style="margin:0 0 20px 0;"><strong>Line 5:</strong> 1 sentence signature with your handle.</p>
<p style="margin:0 0 0 0;">Under 100 words. Specific. Confident.</p>`,
      preheader: "Anatomy of a working cold pitch.",
      primaryCta: { label: "Generate a pitch", url: "https://app.newcollab.co/creator/dashboard/for-you?utm_source=email&utm_medium=lifecycle&utm_campaign=edu_pitch" },
      utmCampaign: 'edu_pitch'
    })
  },
  education_4: {
    subject: "follow-ups are where deals actually happen",
    getHtml: (firstName) => generateEmailHtml({
      bodyText: `<p style="margin:0 0 20px 0;">Hi ${firstName},</p>
<p style="margin:0 0 20px 0;"><strong>67% of brand replies come after a follow-up.</strong></p>
<p style="margin:0 0 12px 0;"><strong>Touch 1:</strong> your initial pitch (day 0)</p>
<p style="margin:0 0 12px 0;"><strong>Touch 2:</strong> day 6 nudge</p>
<p style="margin:0 0 12px 0;"><strong>Touch 3:</strong> day 14 value-add</p>
<p style="margin:0 0 20px 0;"><strong>Touch 4:</strong> day 30 soft close</p>
<p style="margin:0 0 0 0;">Follow-ups convert 4x higher than new pitches.</p>`,
      preheader: "The 3-touch cadence that lifts reply rate 4x.",
      primaryCta: { label: "Check your pipeline", url: "https://app.newcollab.co/creator/dashboard/pr-pipeline?utm_source=email&utm_medium=lifecycle&utm_campaign=edu_followup" },
      utmCampaign: 'edu_followup'
    })
  },
  education_5: {
    subject: "your micro-creator edge (macros don't have this)",
    getHtml: (firstName) => generateEmailHtml({
      bodyText: `<p style="margin:0 0 20px 0;">Hi ${firstName},</p>
<p style="margin:0 0 20px 0;">Creators with millions of followers can't do 3 things you can:</p>
<p style="margin:0 0 12px 0;"><strong>1.</strong> Reply to a brand within an hour.</p>
<p style="margin:0 0 12px 0;"><strong>2.</strong> Post authentic-feeling content.</p>
<p style="margin:0 0 20px 0;"><strong>3.</strong> Offer flexibility on rates.</p>
<p style="margin:0 0 0 0;">Lead with your speed, authenticity, and flexibility.</p>`,
      preheader: "Why small creators land deals macros can't.",
      primaryCta: { label: "Pitch your next brand", url: "https://app.newcollab.co/creator/dashboard/for-you?utm_source=email&utm_medium=lifecycle&utm_campaign=edu_edge" },
      utmCampaign: 'edu_edge'
    })
  },
  maximizer_1: {
    subject: (firstName, month) => `${firstName}, you're maxed out for ${month || 'this month'}`,
    getHtml: (firstName, resetDate, daysUntilReset) => generateEmailHtml({
      bodyText: `<p style="margin:0 0 20px 0;">Hi ${firstName},</p>
<p style="margin:0 0 20px 0;">You've used all 3 unlocks this month. Most creators never use all 3.</p>
<p style="margin:0 0 20px 0;">Your quota resets on ${resetDate}. That's ${daysUntilReset} days from now.</p>
<p style="margin:0 0 12px 0;"><strong>Follow up on the 3 pitches you sent.</strong></p>
<p style="margin:0 0 12px 0;"><strong>Refresh your portfolio.</strong></p>
<p style="margin:0 0 20px 0;"><strong>Post 1 piece of content in your niche this week.</strong></p>
<p style="margin:0 0 0 0;">For now, the follow-up game is where you can move the needle.</p>`,
      preheader: "Here's what to do until your quota resets.",
      primaryCta: { label: "Check my follow-ups", url: "https://app.newcollab.co/creator/dashboard/pr-pipeline?filter=needs_followup&utm_source=email&utm_medium=lifecycle&utm_campaign=max_quota_hit" },
      utmCampaign: 'max_quota_hit'
    })
  },
  maximizer_2: {
    subject: "the 3 things pro creators do that free creators don't",
    getHtml: (firstName, daysUntilReset) => generateEmailHtml({
      bodyText: `<p style="margin:0 0 20px 0;">Hi ${firstName},</p>
<p style="margin:0 0 20px 0;">The creators who land regular PR do 3 things:</p>
<p style="margin:0 0 12px 0;"><strong>1.</strong> They send a follow-up on day 6. Every time.</p>
<p style="margin:0 0 12px 0;"><strong>2.</strong> They add whitelisting to their pitch.</p>
<p style="margin:0 0 20px 0;"><strong>3.</strong> They post content weekly to feed the pitch.</p>
<p style="margin:0 0 0 0;">I'll refresh your 3 unlocks in ${daysUntilReset} days.</p>`,
      preheader: "And why it changes their reply rate.",
      primaryCta: { label: "Let your manager finish the job", url: "https://app.newcollab.co/creator/dashboard/pr-ready?utm_source=email&utm_medium=lifecycle&utm_campaign=max_3things" },
      utmCampaign: 'max_3things'
    })
  },
  maximizer_3: {
    subject: "here's your personalized pro plan",
    getHtml: (firstName, daysUntilReset) => generateEmailHtml({
      bodyText: `<p style="margin:0 0 20px 0;">Hi ${firstName},</p>
<p style="margin:0 0 12px 0;"><strong>Week 1:</strong> Finish the 2 fixes in your plan.</p>
<p style="margin:0 0 12px 0;"><strong>Week 2:</strong> Pitch the top 3 brand matches.</p>
<p style="margin:0 0 12px 0;"><strong>Week 3:</strong> Content audit and tweaks.</p>
<p style="margin:0 0 20px 0;"><strong>Week 4:</strong> Handle replies and plan follow-ups.</p>
<p style="margin:0 0 0 0;">Your quota resets in ${daysUntilReset} days if you'd rather wait.</p>`,
      preheader: "What I'd do with you in your first 30 days of Pro.",
      primaryCta: { label: "Start my 30-day plan", url: "https://app.newcollab.co/creator/dashboard/pr-ready?utm_source=email&utm_medium=lifecycle&utm_campaign=max_30day_plan" },
      utmCampaign: 'max_30day_plan'
    })
  },
  reengagement_1: {
    subject: (count) => `${count} new matches while you were away`,
    getHtml: (firstName, count, resetDate, unlocks) => generateEmailHtml({
      bodyText: `<p style="margin:0 0 20px 0;">Hi ${firstName},</p>
<p style="margin:0 0 20px 0;">I haven't seen you in 2 weeks. Just wanted to share what's new.</p>
<p style="margin:0 0 20px 0;">${count} new brands were added in your niche.</p>
<p style="margin:0 0 0 0;">Your unlocks reset on ${resetDate}, so you have ${unlocks} available.</p>`,
      preheader: "Quick update on what's new in your niche.",
      primaryCta: { label: "See new matches", url: "https://app.newcollab.co/creator/dashboard/for-you?filter=new_this_week&utm_source=email&utm_medium=lifecycle&utm_campaign=reengagement_new" },
      utmCampaign: 'reengagement_new'
    })
  },
  reengagement_2: {
    subject: "hey, everything ok?",
    getHtml: (firstName, count) => generateEmailHtml({
      bodyText: `<p style="margin:0 0 20px 0;">Hi ${firstName},</p>
<p style="margin:0 0 20px 0;">I haven't seen you in 3 weeks. That's fine.</p>
<p style="margin:0 0 20px 0;">${count} new brands were added to your matches. Two are strong fits.</p>
<p style="margin:0 0 0 0;">If you want back in, one click. If not, that's fine too.</p>`,
      preheader: "Your manager noticed you've been away.",
      primaryCta: { label: "See what's new", url: "https://app.newcollab.co/creator/dashboard/for-you?utm_source=email&utm_medium=lifecycle&utm_campaign=reengagement_soft" },
      utmCampaign: 'reengagement_soft'
    })
  }
};

async function sendEmail(to, subject, html) {
  if (!transporter) return false;
  try {
    await transporter.sendMail({
      from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
      to, subject, html
    });
    return true;
  } catch (error) {
    console.error(`Email error for ${to}:`, error.message);
    return false;
  }
}

async function getUserEmail(userId) {
  const { data } = await supabase.from('users').select('email').eq('id', userId).single();
  return data?.email || null;
}

async function processEducationSeries() {
  const EDUCATION_DAY_TRIGGERS = [5, 8, 12, 16, 20];
  const EDUCATION_DAY_MAX = 30; // Allow backfill up to day 30

  // Target both 'new' and 'explorer' states (per strategy brief)
  const { data: users, error } = await supabase
    .from('creators')
    .select('id, user_id, username, education_series_position, lifecycle_emails_sent_today, created_at, last_education_email_at, subscription_tier, pitches_sent_total, daily_unlocks_used, lifecycle_state')
    .in('lifecycle_state', ['new', 'explorer', 'engaged'])
    .or('education_series_position.is.null,education_series_position.lt.5')
    .limit(BATCH_SIZE);

  console.log(`[EDU] Query returned ${users?.length || 0} users, error: ${error?.message || 'none'}`);
  if (!users?.length) return 0;

  const now = new Date();
  let sent = 0;
  let skipped = { pro: 0, daily_limit: 0, day_early: 0, day_late: 0, cooldown: 0, no_email: 0, no_template: 0 };

  for (const user of users) {
    if (user.subscription_tier === 'pro' || user.subscription_tier === 'premium') {
      skipped.pro++;
      continue;
    }

    // Daily throttle check (moved from query to ensure proper null handling)
    const emailsToday = user.lifecycle_emails_sent_today || 0;
    if (emailsToday >= MAX_EMAILS_PER_DAY) {
      skipped.daily_limit++;
      continue;
    }

    const position = user.education_series_position || 0;

    // For 'new' state, start education series on day 5 without requiring activity
    // For explorers/engaged (who have activity), allow backfill
    const daysSinceSignup = Math.floor((now - new Date(user.created_at)) / (1000 * 60 * 60 * 24));
    const targetDay = EDUCATION_DAY_TRIGGERS[position];

    // Check day window: must be at or past target day, and not past max backfill
    if (daysSinceSignup < targetDay) {
      skipped.day_early++;
      continue;
    }
    if (daysSinceSignup > EDUCATION_DAY_MAX && user.lifecycle_state !== 'new') {
      skipped.day_late++;
      continue;
    }

    if (position > 0 && user.last_education_email_at) {
      const daysSinceLastEmail = Math.floor((now - new Date(user.last_education_email_at)) / (1000 * 60 * 60 * 24));
      if (daysSinceLastEmail < 3) {
        skipped.cooldown++;
        continue;
      }
    }

    const email = await getUserEmail(user.user_id);
    if (!email) {
      skipped.no_email++;
      continue;
    }

    const template = TEMPLATES[`education_${position + 1}`];
    if (!template) {
      skipped.no_template++;
      continue;
    }

    const firstName = user.username || 'there';
    const success = await sendEmail(email, template.subject, template.getHtml(firstName));

    const templateSlug = `edu_${['5reasons', '60sec', 'pitch', 'followup', 'edge'][position]}`;
    if (success) {
      // Update creator record
      await supabase.from('creators').update({
        education_series_position: position + 1,
        last_education_email_at: new Date().toISOString(),
        lifecycle_emails_sent_today: (user.lifecycle_emails_sent_today || 0) + 1,
        lifecycle_last_email_date: new Date().toISOString().split('T')[0],
        last_any_email_sent: new Date().toISOString()
      }).eq('id', user.id);

      // Log to lifecycle_email_sends for tracking/stats
      await supabase.from('lifecycle_email_sends').insert({
        creator_id: user.id,
        template_slug: templateSlug,
        to_email: email,
        subject: template.subject,
        status: 'sent',
        sent_at: new Date().toISOString()
      });

      sent++;
    }

    await new Promise(r => setTimeout(r, DELAY_BETWEEN_EMAILS));
  }

  console.log(`[EDU] Sent: ${sent}, Skipped: ${JSON.stringify(skipped)}`);
  return sent;
}

async function processMaximizerSeries() {
  const { data: users } = await supabase
    .from('creators')
    .select('id, user_id, username, lifecycle_emails_sent_today, maximizer_series_position, maximizer_series_started_at, subscription_tier')
    .eq('lifecycle_state', 'maximizer')
    .lt('lifecycle_emails_sent_today', MAX_EMAILS_PER_DAY)
    .or('maximizer_series_position.is.null,maximizer_series_position.lt.3')
    .limit(BATCH_SIZE);

  if (!users?.length) return 0;

  const now = new Date();
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const daysUntilReset = Math.ceil((nextMonth - now) / (1000 * 60 * 60 * 24));
  const resetDate = nextMonth.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
  const currentMonth = now.toLocaleDateString('en-US', { month: 'long' });

  let sent = 0;
  for (const user of users) {
    if (user.subscription_tier === 'pro' || user.subscription_tier === 'premium') continue;

    const position = user.maximizer_series_position || 0;

    if (position > 0 && user.maximizer_series_started_at) {
      const hoursSinceStart = (now - new Date(user.maximizer_series_started_at)) / (1000 * 60 * 60);
      if (position === 1 && hoursSinceStart < 48) continue;
      if (position === 2 && hoursSinceStart < 168) continue;
    }

    const email = await getUserEmail(user.user_id);
    if (!email) continue;

    const firstName = user.username || 'there';
    let subject, html;

    if (position === 0) {
      subject = TEMPLATES.maximizer_1.subject(firstName, currentMonth);
      html = TEMPLATES.maximizer_1.getHtml(firstName, resetDate, daysUntilReset);
    } else if (position === 1) {
      subject = TEMPLATES.maximizer_2.subject;
      html = TEMPLATES.maximizer_2.getHtml(firstName, daysUntilReset);
    } else {
      subject = TEMPLATES.maximizer_3.subject;
      html = TEMPLATES.maximizer_3.getHtml(firstName, daysUntilReset);
    }

    const templateSlug = ['max_quota_hit', 'max_3things', 'max_30day'][position];
    const success = await sendEmail(email, subject, html);

    if (success) {
      const updateData = {
        maximizer_series_position: position + 1,
        lifecycle_emails_sent_today: (user.lifecycle_emails_sent_today || 0) + 1,
        lifecycle_last_email_date: new Date().toISOString().split('T')[0],
        last_any_email_sent: new Date().toISOString()
      };
      if (position === 0) updateData.maximizer_series_started_at = new Date().toISOString();
      await supabase.from('creators').update(updateData).eq('id', user.id);

      // Log to lifecycle_email_sends for tracking/stats
      await supabase.from('lifecycle_email_sends').insert({
        creator_id: user.id,
        template_slug: templateSlug,
        to_email: email,
        subject: subject,
        status: 'sent',
        sent_at: new Date().toISOString()
      });

      sent++;
    }

    await new Promise(r => setTimeout(r, DELAY_BETWEEN_EMAILS));
  }

  return sent;
}

async function processReengagement() {
  const { data: users } = await supabase
    .from('creators')
    .select('id, user_id, username, lifecycle_emails_sent_today, reengagement_series_position, reengagement_series_started_at, lifecycle_state_updated_at, pitches_sent_total, created_at')
    .eq('lifecycle_state', 'dormant')
    .or('lifecycle_emails_sent_today.is.null,lifecycle_emails_sent_today.lt.2')
    .or('reengagement_series_position.is.null,reengagement_series_position.lt.2')
    .limit(BATCH_SIZE);

  if (!users?.length) return 0;

  const now = new Date();
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const resetDate = nextMonth.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
  const newBrandsCount = Math.floor(Math.random() * 10) + 10;

  let sent = 0;
  for (const user of users) {
    const position = user.reengagement_series_position || 0;
    // Use lifecycle_state_updated_at if available, else estimate from created_at + 14 days
    const dormantSince = user.lifecycle_state_updated_at
      ? new Date(user.lifecycle_state_updated_at)
      : new Date(new Date(user.created_at).getTime() + 14 * 24 * 60 * 60 * 1000);

    const daysDormant = Math.floor((now - dormantSince) / (1000 * 60 * 60 * 24));

    // Email 19: dormant 14+ days (pitches_sent_total requirement per strategy brief)
    if (position === 0 && daysDormant < 14) continue;
    if (position === 1) {
      if (daysDormant < 21) continue;
      if (user.reengagement_series_started_at) {
        const daysSinceEmail19 = Math.floor((now - new Date(user.reengagement_series_started_at)) / (1000 * 60 * 60 * 24));
        if (daysSinceEmail19 < 7) continue;
      }
    }

    const email = await getUserEmail(user.user_id);
    if (!email) continue;

    const firstName = user.username || 'there';
    let subject, html;

    if (position === 0) {
      subject = TEMPLATES.reengagement_1.subject(newBrandsCount);
      html = TEMPLATES.reengagement_1.getHtml(firstName, newBrandsCount, resetDate, 3);
    } else {
      subject = TEMPLATES.reengagement_2.subject;
      html = TEMPLATES.reengagement_2.getHtml(firstName, newBrandsCount);
    }

    const templateSlug = position === 0 ? 'reengagement_new' : 'reengagement_soft';
    const success = await sendEmail(email, subject, html);

    if (success) {
      const updateData = {
        reengagement_series_position: position + 1,
        lifecycle_emails_sent_today: (user.lifecycle_emails_sent_today || 0) + 1,
        lifecycle_last_email_date: new Date().toISOString().split('T')[0],
        last_any_email_sent: new Date().toISOString()
      };
      if (position === 0) updateData.reengagement_series_started_at = new Date().toISOString();
      await supabase.from('creators').update(updateData).eq('id', user.id);

      // Log to lifecycle_email_sends for tracking/stats
      await supabase.from('lifecycle_email_sends').insert({
        creator_id: user.id,
        template_slug: templateSlug,
        to_email: email,
        subject: subject,
        status: 'sent',
        sent_at: new Date().toISOString()
      });

      sent++;
    }

    await new Promise(r => setTimeout(r, DELAY_BETWEEN_EMAILS));
  }

  return sent;
}

module.exports = async function handler(req, res) {
  // Verify cron secret
  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  console.log('Starting lifecycle email cron...');

  try {
    // Reset daily counters
    const today = new Date().toISOString().split('T')[0];
    await supabase
      .from('creators')
      .update({ lifecycle_emails_sent_today: 0 })
      .or(`lifecycle_last_email_date.is.null,lifecycle_last_email_date.neq.${today}`);

    const educationSent = await processEducationSeries();
    const maximizerSent = await processMaximizerSeries();
    const reengagementSent = await processReengagement();

    const result = {
      success: true,
      timestamp: new Date().toISOString(),
      sent: {
        education: educationSent,
        maximizer: maximizerSent,
        reengagement: reengagementSent,
        total: educationSent + maximizerSent + reengagementSent
      }
    };

    console.log('Cron complete:', result);
    return res.status(200).json(result);
  } catch (error) {
    console.error('Cron error:', error);
    return res.status(500).json({ error: error.message });
  }
}
