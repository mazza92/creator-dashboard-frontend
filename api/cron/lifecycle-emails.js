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
const { Resend } = require('resend');

const FROM_NAME = 'Your Newcollab Manager';
const FROM_EMAIL = 'manager@newcollab.co';
const LOGO_URL = 'https://app.newcollab.co/newcollab-logo-dark.png';
const CRON_SECRET = process.env.CRON_SECRET;
const MAX_EMAILS_PER_DAY = 2;
const BATCH_SIZE = 50;
const DELAY_BETWEEN_EMAILS = 100; // Resend handles rate limiting, minimal delay needed

export const config = {
  maxDuration: 300, // 5 minutes max for Vercel Pro
};

// Lazy-initialized clients (created on first request to ensure env vars are loaded)
let supabase = null;
let resendClient = null;
let nodemailerTransporter = null;

function getSupabase() {
  if (!supabase) {
    const url = process.env.REACT_APP_SUPABASE_URL || process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
      throw new Error(`Missing Supabase config: url=${!!url}, key=${!!key}`);
    }
    supabase = createClient(url, key);
  }
  return supabase;
}

function getResend() {
  if (!resendClient && process.env.RESEND_API_KEY) {
    resendClient = new Resend(process.env.RESEND_API_KEY);
  }
  return resendClient;
}

function getNodemailer() {
  if (!nodemailerTransporter) {
    const user = process.env.SMTP_USER || process.env.GMAIL_USER;
    const pass = process.env.SMTP_PASSWORD || process.env.GMAIL_PASSWORD;
    if (user && pass) {
      nodemailerTransporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user, pass }
      });
    }
  }
  return nodemailerTransporter;
}

/**
 * Build weekly digest context from Supabase when Python API is unavailable
 * Fetches real user data instead of returning zeros
 */
async function buildFallbackDigestContext(user) {
  try {
    // Get full creator data including first_name from users table
    const { data: creator, error: creatorError } = await getSupabase()
      .from('creators')
      .select(`
        id, username, subscription_tier, unlocks_remaining,
        total_pitches_sent, total_replies_received, kit_published,
        user_id
      `)
      .eq('id', user.id)
      .single();

    if (creatorError || !creator) {
      console.log(`[DIGEST FALLBACK] No creator data for ${user.id}`);
      return {
        first_name: user.username || 'there',
        current_score: 0,
        score_delta: 0,
        unlocks_used: 0,
        unlocks_quota: user.subscription_tier === 'pro' ? '∞' : 3,
        pending_plans: [],
        new_brands: []
      };
    }

    // Get user's first name
    const { data: userData } = await getSupabase()
      .from('users')
      .select('first_name, email')
      .eq('id', creator.user_id)
      .single();

    const firstName = userData?.first_name || creator.username || 'there';
    const isPro = creator.subscription_tier === 'pro';

    let unlocksUsed = 0;
    let unlocksQuota = 3;
    if (isPro) {
      unlocksUsed = 0;
      unlocksQuota = '∞';
    } else {
      const monthStart = new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), 1)).toISOString();
      const { count: packCount } = await getSupabase()
        .from('pr_packages')
        .select('id', { count: 'exact', head: true })
        .eq('creator_id', creator.id)
        .gte('generated_at', monthStart);
      unlocksUsed = Math.min(3, packCount || 0);
    }

    // Calculate a basic reply chance based on profile completeness
    let replyChance = 0;
    if (creator.kit_published) replyChance += 15;
    if (creator.total_pitches_sent > 0) replyChance += 10;
    if (creator.total_replies_received > 0) replyChance += 20;

    // Get 3 recent brands from pr_brands as recommendations
    const { data: brands } = await getSupabase()
      .from('pr_brands')
      .select('brand_name, category')
      .eq('status', 'active')
      .eq('is_hidden', false)
      .order('updated_at', { ascending: false })
      .limit(3);

    const newBrands = (brands || []).map(b => ({
      name: b.brand_name,
      category: b.category || '',
      reason: `New in ${b.category || 'directory'}`
    }));

    console.log(`[DIGEST FALLBACK] Built context for ${user.id}: score=${replyChance}, unlocks=${unlocksUsed}, brands=${newBrands.length}`);

    return {
      first_name: firstName,
      current_score: replyChance,
      score_delta: creator.kit_published ? 0 : 15,
      unlocks_used: unlocksUsed,
      unlocks_quota: unlocksQuota,
      pending_plans: creator.kit_published ? [] : [
        { number: 1, title: 'Publish your Media Kit' }
      ],
      new_brands: newBrands.length > 0 ? newBrands : [
        { name: 'Explore brands', category: 'Various', reason: 'Browse the directory' }
      ]
    };
  } catch (err) {
    console.log(`[DIGEST FALLBACK] Error building context: ${err.message}`);
    return {
      first_name: user.username || 'there',
      current_score: 0,
      score_delta: 0,
      unlocks_used: 0,
      unlocks_quota: 3,
      pending_plans: [],
      new_brands: []
    };
  }
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
  },
  doubter_1: {
    subject: "a story you'll want to read",
    getHtml: (firstName) => generateEmailHtml({
      bodyText: `<p style="margin:0 0 20px 0;">Hi ${firstName},</p>
<p style="margin:0 0 20px 0;">I want to tell you about Sarah.</p>
<p style="margin:0 0 20px 0;">She joined Newcollab 6 weeks ago with 340 followers. She's a nursing student who posts skincare content between shifts.</p>
<p style="margin:0 0 20px 0;">Her first 3 pitches got 0 replies. She almost quit.</p>
<p style="margin:0 0 20px 0;">On pitch 4 — she used the follow-up sequence I laid out in your plan — she got a reply from a small clean-beauty brand offering to send her their new serum.</p>
<p style="margin:0 0 20px 0;">Pitch 5: another yes. Pitch 6: no reply. Pitch 7: yes.</p>
<p style="margin:0 0 20px 0;">By pitch 10, she had 4 brand replies, 2 free PR boxes, and 1 conversation about a paid post.</p>
<p style="margin:0 0 20px 0;"><strong>She has 340 followers.</strong></p>
<p style="margin:0 0 12px 0;">Here's what she did differently:</p>
<p style="margin:0 0 12px 0;"><strong>1.</strong> Every pitch had a specific creative angle for that brand</p>
<p style="margin:0 0 12px 0;"><strong>2.</strong> Every unanswered pitch got a follow-up on day 6</p>
<p style="margin:0 0 20px 0;"><strong>3.</strong> Her bio included "collab: sarah@..." so brands could find her</p>
<p style="margin:0 0 0 0;">You're a few pitches in. Statistically, your reply is close. Most creators who quit at pitch 3-5 would have gotten one on pitch 6-8.</p>`,
      preheader: "Sarah has 340 followers.",
      primaryCta: { label: "Send your next pitch", url: "https://app.newcollab.co/creator/dashboard/for-you?utm_source=email&utm_medium=lifecycle&utm_campaign=doubter_story" },
      utmCampaign: 'doubter_story'
    })
  },
  doubter_2: {
    subject: "the 5-pitch rule nobody talks about",
    getHtml: (firstName, pitchesSent, unlocksUsed) => {
      // Dynamic copy based on unlock count
      let unlockMessage;
      const remaining = 3 - (unlocksUsed || 0);
      if (unlocksUsed === 1) {
        unlockMessage = `You've used 1 unlock so far. You have 2 more this month — use them.`;
      } else if (unlocksUsed === 2) {
        unlockMessage = `You've used 2 unlocks. One more pitch could be the one that lands.`;
      } else {
        unlockMessage = `You still have ${remaining > 0 ? remaining : 'more'} unlocks this month. Use them before they reset.`;
      }

      return generateEmailHtml({
        bodyText: `<p style="margin:0 0 20px 0;">Hi ${firstName},</p>
<p style="margin:0 0 20px 0;">Here's something most creators don't know:</p>
<p style="margin:0 0 20px 0;"><strong>The average creator who lands their first brand deal sends 5-8 pitches before getting a yes.</strong></p>
<p style="margin:0 0 20px 0;">You've sent ${pitchesSent || 'a few'} so far. That's not failure — that's progress.</p>
<p style="margin:0 0 20px 0;"><strong>${unlockMessage}</strong></p>
<p style="margin:0 0 20px 0;">The creators who quit at pitch 2 or 3 never find out they were one or two pitches away.</p>
<p style="margin:0 0 12px 0;">Here's what changes after pitch 5:</p>
<p style="margin:0 0 12px 0;"><strong>1.</strong> Your pitches get sharper (you learn what works)</p>
<p style="margin:0 0 12px 0;"><strong>2.</strong> Your profile gets stronger (you optimize as you go)</p>
<p style="margin:0 0 20px 0;"><strong>3.</strong> Law of numbers kicks in (more shots = more replies)</p>
<p style="margin:0 0 0 0;">Most brand deals don't come from luck. They come from persistence.</p>`,
        preheader: "The stat that changes everything.",
        primaryCta: { label: "Keep going", url: "https://app.newcollab.co/creator/dashboard/for-you?utm_source=email&utm_medium=lifecycle&utm_campaign=doubter_5pitch" },
        utmCampaign: 'doubter_5pitch'
      });
    }
  },
  weekly_digest: {
    subject: "your monday brief from your manager",
    getHtml: (context) => {
      // Build the progress section
      const progressHtml = `
        <div style="background:#f8f9fa;border-radius:8px;padding:20px;margin:20px 0;">
          <p style="margin:0 0 12px 0;font-weight:600;color:#374151;text-transform:uppercase;font-size:12px;letter-spacing:0.5px;">YOUR PROGRESS</p>
          <table width="100%" cellpadding="0" cellspacing="0" style="font-size:15px;">
            <tr>
              <td style="padding:8px 0;color:#6b7280;">Reply Chance:</td>
              <td style="padding:8px 0;text-align:right;font-weight:600;">${context.current_score || 0}% ${context.score_delta > 0 ? `<span style="color:#22c55e;">(+${context.score_delta} potential)</span>` : ''}</td>
            </tr>
            <tr>
              <td style="padding:8px 0;color:#6b7280;">Unlocks:</td>
              <td style="padding:8px 0;text-align:right;font-weight:600;">${context.unlocks_used || 0} used of ${context.unlocks_quota || 3}</td>
            </tr>
          </table>
        </div>`;

      // Build the manager plan section
      let planHtml = '';
      if (context.pending_plans && context.pending_plans.length > 0) {
        const planItems = context.pending_plans.map(p =>
          `<p style="margin:0 0 8px 0;"><strong>#${p.number}</strong> ${p.title}</p>`
        ).join('');
        planHtml = `
          <div style="margin:20px 0;">
            <p style="margin:0 0 12px 0;font-weight:600;color:#374151;text-transform:uppercase;font-size:12px;letter-spacing:0.5px;">YOUR MANAGER'S PLAN</p>
            ${planItems}
          </div>`;
      }

      // Build the new brands section
      let brandsHtml = '';
      if (context.new_brands && context.new_brands.length > 0) {
        const brandItems = context.new_brands.map(b =>
          `<p style="margin:0 0 12px 0;"><strong>${b.name}</strong> — ${b.reason || b.category || ''}</p>`
        ).join('');
        brandsHtml = `
          <div style="margin:20px 0;">
            <p style="margin:0 0 12px 0;font-weight:600;color:#374151;text-transform:uppercase;font-size:12px;letter-spacing:0.5px;">NEW BRANDS IN YOUR <span style="background:#fef3c7;padding:2px 6px;border-radius:4px;">MATCH</span> LIST</p>
            ${brandItems}
          </div>`;
      }

      return generateEmailHtml({
        bodyText: `<p style="margin:0 0 20px 0;">Hi ${context.first_name || 'there'},</p>
<p style="margin:0 0 20px 0;">Here's what's new this week.</p>
${progressHtml}
${planHtml}
${brandsHtml}`,
        preheader: "Your weekly update from your Newcollab manager.",
        primaryCta: { label: "See my full plan", url: "https://app.newcollab.co/creator/dashboard/pr-ready?utm_source=email&utm_medium=lifecycle&utm_campaign=weekly_digest" },
        utmCampaign: 'weekly_digest'
      });
    }
  },

  // ============================================
  // FOLLOW-UP REMINDER TEMPLATES (Pro only)
  // Sent at Day 6, 10, and 14 after initial pitch
  // ============================================

  followup_day_6: {
    subject: (brandName) => `Time to follow up with ${brandName} - draft ready`,
    getHtml: (firstName, brandName, deepLink, heroProduct) => generateEmailHtml({
      bodyText: `<p style="margin:0 0 20px 0;">Hi ${firstName},</p>
<p style="margin:0 0 20px 0;">It's been 6 days since you pitched <strong>${brandName}</strong>. This is the sweet spot for follow-ups.</p>
<p style="margin:0 0 20px 0;font-size:18px;font-weight:700;color:#059669;">67% of brand replies come after a follow-up.</p>
<p style="margin:0 0 20px 0;">I've drafted a follow-up for you${heroProduct ? ` that references their ${heroProduct}` : ''} and adds a fresh angle. One click to review and send.</p>`,
      preheader: `Day 6 - optimal follow-up timing for ${brandName}`,
      primaryCta: {
        label: "Review your follow-up",
        url: deepLink
      },
      utmCampaign: 'followup_day_6'
    })
  },

  followup_day_10: {
    subject: (brandName) => `Last chance reminder for ${brandName}`,
    getHtml: (firstName, brandName, deepLink) => generateEmailHtml({
      bodyText: `<p style="margin:0 0 20px 0;">Hi ${firstName},</p>
<p style="margin:0 0 20px 0;">10 days since your pitch to <strong>${brandName}</strong>. Window's still open, but closing.</p>
<p style="margin:0 0 20px 0;">Brands get flooded with emails. A friendly nudge now could be the difference between getting noticed and getting buried.</p>
<p style="margin:0 0 20px 0;">Your follow-up draft is ready.</p>`,
      preheader: `Don't let ${brandName} slip away - follow up today`,
      primaryCta: {
        label: "Send your follow-up",
        url: deepLink
      },
      utmCampaign: 'followup_day_10'
    })
  },

  followup_day_14: {
    subject: (brandName) => `Window closing today for ${brandName}`,
    getHtml: (firstName, brandName, deepLink) => generateEmailHtml({
      bodyText: `<p style="margin:0 0 20px 0;">Hi ${firstName},</p>
<p style="margin:0 0 20px 0;"><strong>Day 14.</strong> After today, reply rates for <strong>${brandName}</strong> drop significantly.</p>
<p style="margin:0 0 20px 0;">This is your final follow-up window. If you're going to send one more note, make it today.</p>
<p style="margin:0 0 20px 0;">I've kept your draft short and direct. Perfect for a last touch.</p>`,
      preheader: `Final day to follow up with ${brandName}`,
      primaryCta: {
        label: "Send final follow-up",
        url: deepLink
      },
      utmCampaign: 'followup_day_14'
    })
  }
};

async function sendEmail(to, subject, html) {
  // Try Resend first (preferred - no rate limits)
  const resend = getResend();
  if (resend) {
    try {
      await resend.emails.send({
        from: `${FROM_NAME} <${FROM_EMAIL}>`,
        to,
        subject,
        html
      });
      return true;
    } catch (error) {
      console.error(`Resend error for ${to}:`, error.message);
      return false;
    }
  }

  // Fallback to nodemailer/Gmail
  const mailer = getNodemailer();
  if (!mailer) {
    console.error('No email provider configured (need RESEND_API_KEY or SMTP credentials)');
    return false;
  }
  try {
    const fromEmail = process.env.FROM_EMAIL || process.env.SMTP_USER || process.env.GMAIL_USER;
    await mailer.sendMail({
      from: `"${FROM_NAME}" <${fromEmail}>`,
      to, subject, html
    });
    return true;
  } catch (error) {
    console.error(`Email error for ${to}:`, error.message);
    return false;
  }
}

async function getUserEmail(userId) {
  const { data } = await getSupabase().from('users').select('email').eq('id', userId).single();
  return data?.email || null;
}

async function processEducationSeries() {
  const EDUCATION_DAY_TRIGGERS = [5, 8, 12, 16, 20];
  const EDUCATION_DAY_MAX = 30; // Allow backfill up to day 30

  // Target both 'new' and 'explorer' states (per strategy brief)
  // Order by education_series_position ASC NULLS FIRST to prioritize users who haven't started
  const { data: users, error } = await getSupabase()
    .from('creators')
    .select('id, user_id, username, education_series_position, lifecycle_emails_sent_today, created_at, last_education_email_at, subscription_tier, pitches_sent_total, daily_unlocks_used, lifecycle_state')
    .in('lifecycle_state', ['new', 'explorer', 'engaged'])
    .or('education_series_position.is.null,education_series_position.lt.5')
    .order('education_series_position', { ascending: true, nullsFirst: true })
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

    // Check day window: must be at or past target day
    if (daysSinceSignup < targetDay) {
      skipped.day_early++;
      continue;
    }
    // For users who never received any education email (position 0), allow unlimited backfill
    // This catches existing users who signed up before lifecycle system was implemented
    // For subsequent emails (position > 0), apply the 30-day limit to avoid overwhelming old users
    if (position > 0 && daysSinceSignup > EDUCATION_DAY_MAX && user.lifecycle_state !== 'new') {
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
      await getSupabase().from('creators').update({
        education_series_position: position + 1,
        last_education_email_at: new Date().toISOString(),
        lifecycle_emails_sent_today: (user.lifecycle_emails_sent_today || 0) + 1,
        lifecycle_last_email_date: new Date().toISOString().split('T')[0],
        last_any_email_sent: new Date().toISOString()
      }).eq('id', user.id);

      // Log to lifecycle_email_sends for tracking/stats
      await getSupabase().from('lifecycle_email_sends').insert({
        creator_id: user.id,
        template_slug: templateSlug,
        email_address: email,
        subject_rendered: template.subject,
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
  const { data: users, error } = await getSupabase()
    .from('creators')
    .select('id, user_id, username, lifecycle_emails_sent_today, maximizer_series_position, maximizer_series_started_at, subscription_tier')
    .eq('lifecycle_state', 'maximizer')
    .or('maximizer_series_position.is.null,maximizer_series_position.lt.3')
    .order('maximizer_series_position', { ascending: true, nullsFirst: true })
    .limit(BATCH_SIZE);

  console.log(`[MAX] Query returned ${users?.length || 0} users, error: ${error?.message || 'none'}`);
  if (!users?.length) return 0;

  const now = new Date();
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const daysUntilReset = Math.ceil((nextMonth - now) / (1000 * 60 * 60 * 24));
  const resetDate = nextMonth.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
  const currentMonth = now.toLocaleDateString('en-US', { month: 'long' });

  let sent = 0;
  let skipped = { pro: 0, daily_limit: 0, cooldown: 0, no_email: 0 };

  for (const user of users) {
    if (user.subscription_tier === 'pro' || user.subscription_tier === 'premium') {
      skipped.pro++;
      continue;
    }

    // Daily throttle check
    const emailsToday = user.lifecycle_emails_sent_today || 0;
    if (emailsToday >= MAX_EMAILS_PER_DAY) {
      skipped.daily_limit++;
      continue;
    }

    const position = user.maximizer_series_position || 0;

    if (position > 0 && user.maximizer_series_started_at) {
      const hoursSinceStart = (now - new Date(user.maximizer_series_started_at)) / (1000 * 60 * 60);
      if (position === 1 && hoursSinceStart < 48) {
        skipped.cooldown++;
        continue;
      }
      if (position === 2 && hoursSinceStart < 168) {
        skipped.cooldown++;
        continue;
      }
    }

    const email = await getUserEmail(user.user_id);
    if (!email) {
      skipped.no_email++;
      continue;
    }

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
      await getSupabase().from('creators').update(updateData).eq('id', user.id);

      // Log to lifecycle_email_sends for tracking/stats
      await getSupabase().from('lifecycle_email_sends').insert({
        creator_id: user.id,
        template_slug: templateSlug,
        email_address: email,
        subject_rendered: subject,
        status: 'sent',
        sent_at: new Date().toISOString()
      });

      sent++;
    }

    await new Promise(r => setTimeout(r, DELAY_BETWEEN_EMAILS));
  }

  console.log(`[MAX] Sent: ${sent}, Skipped: ${JSON.stringify(skipped)}`);
  return sent;
}

async function resetMonthlyUnlocks() {
  // Free quota is packs delivered this calendar month. Refilling
  // unlocks_remaining to 3 here (and stamping unlocks_reset_at = now)
  // made the next unlock look expired and refund the credit.
  console.log('[UNLOCK_RESET] skipped; remaining is derived from delivered packs');
  return 0;
}

async function processReengagement() {
  const { data: users, error } = await getSupabase()
    .from('creators')
    .select('id, user_id, username, lifecycle_emails_sent_today, reengagement_series_position, reengagement_series_started_at, lifecycle_state_updated_at, pitches_sent_total, created_at')
    .eq('lifecycle_state', 'dormant')
    .or('reengagement_series_position.is.null,reengagement_series_position.lt.2')
    .order('reengagement_series_position', { ascending: true, nullsFirst: true })
    .limit(BATCH_SIZE);

  console.log(`[REENG] Query returned ${users?.length || 0} users, error: ${error?.message || 'none'}`);
  if (!users?.length) return 0;

  const now = new Date();
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const resetDate = nextMonth.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
  const newBrandsCount = Math.floor(Math.random() * 10) + 10;

  let sent = 0;
  let skipped = { daily_limit: 0, not_dormant_long: 0, cooldown: 0, no_email: 0 };

  for (const user of users) {
    // Daily throttle check
    const emailsToday = user.lifecycle_emails_sent_today || 0;
    if (emailsToday >= MAX_EMAILS_PER_DAY) {
      skipped.daily_limit++;
      continue;
    }

    const position = user.reengagement_series_position || 0;
    // Use lifecycle_state_updated_at if available, else estimate from created_at + 14 days
    const dormantSince = user.lifecycle_state_updated_at
      ? new Date(user.lifecycle_state_updated_at)
      : new Date(new Date(user.created_at).getTime() + 14 * 24 * 60 * 60 * 1000);

    const daysDormant = Math.floor((now - dormantSince) / (1000 * 60 * 60 * 24));

    // Email 19: dormant 14+ days
    if (position === 0 && daysDormant < 14) {
      skipped.not_dormant_long++;
      continue;
    }
    if (position === 1) {
      if (daysDormant < 21) {
        skipped.not_dormant_long++;
        continue;
      }
      if (user.reengagement_series_started_at) {
        const daysSinceEmail19 = Math.floor((now - new Date(user.reengagement_series_started_at)) / (1000 * 60 * 60 * 24));
        if (daysSinceEmail19 < 7) {
          skipped.cooldown++;
          continue;
        }
      }
    }

    const email = await getUserEmail(user.user_id);
    if (!email) {
      skipped.no_email++;
      continue;
    }

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
      await getSupabase().from('creators').update(updateData).eq('id', user.id);

      // Log to lifecycle_email_sends for tracking/stats
      await getSupabase().from('lifecycle_email_sends').insert({
        creator_id: user.id,
        template_slug: templateSlug,
        email_address: email,
        subject_rendered: subject,
        status: 'sent',
        sent_at: new Date().toISOString()
      });

      sent++;
    }

    await new Promise(r => setTimeout(r, DELAY_BETWEEN_EMAILS));
  }

  console.log(`[REENG] Sent: ${sent}, Skipped: ${JSON.stringify(skipped)}`);
  return sent;
}

async function processWeeklyDigest() {
  // Only run on Mondays (day 1 in JS, 0 = Sunday)
  const dayOfWeek = new Date().getDay();
  if (dayOfWeek !== 1) {
    console.log(`[DIGEST] Skipping - not Monday (day ${dayOfWeek})`);
    return 0;
  }

  // Get eligible creators for weekly digest (verified, not unsubscribed)
  const { data: users, error } = await getSupabase()
    .from('creators')
    .select('id, user_id, username, last_weekly_digest_at, subscription_tier')
    .not('lifecycle_state', 'eq', 'dormant')
    .limit(BATCH_SIZE);

  console.log(`[DIGEST] Query returned ${users?.length || 0} users, error: ${error?.message || 'none'}`);
  if (!users?.length) return 0;

  const now = new Date();
  const weekKey = `${now.getFullYear()}-W${Math.ceil((now - new Date(now.getFullYear(), 0, 1)) / (7 * 24 * 60 * 60 * 1000))}`;
  let sent = 0;
  let skipped = { already_sent: 0, no_context: 0, no_email: 0, api_error: 0 };

  for (const user of users) {
    // Check if already sent this week
    if (user.last_weekly_digest_at) {
      const lastSent = new Date(user.last_weekly_digest_at);
      const lastWeekKey = `${lastSent.getFullYear()}-W${Math.ceil((lastSent - new Date(lastSent.getFullYear(), 0, 1)) / (7 * 24 * 60 * 60 * 1000))}`;
      if (lastWeekKey === weekKey) {
        skipped.already_sent++;
        continue;
      }
    }

    const email = await getUserEmail(user.user_id);
    if (!email) {
      skipped.no_email++;
      continue;
    }

    // Fetch context from Python backend API
    let context;
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'https://api.newcollab.co';
      const response = await fetch(`${apiUrl}/api/lifecycle-email/context/weekly-digest/${user.id}`, {
        headers: { 'X-Admin-Token': process.env.ADMIN_TOKEN || 'pr-hunter-admin-2026' }
      });

      if (response.ok) {
        context = await response.json();
        console.log(`[DIGEST] Got context for ${user.id}: score=${context.current_score}, unlocks=${context.unlocks_used}`);
      } else {
        const errorText = await response.text().catch(() => 'unknown');
        console.log(`[DIGEST] API returned ${response.status} for ${user.id}: ${errorText.substring(0, 200)}`);
        // Fallback: build context from Supabase data
        context = await buildFallbackDigestContext(user);
      }
    } catch (err) {
      console.log(`[DIGEST] API error for ${user.id}: ${err.message}, using fallback`);
      context = await buildFallbackDigestContext(user);
    }

    if (!context || !context.first_name) {
      skipped.no_context++;
      continue;
    }

    const subject = TEMPLATES.weekly_digest.subject;
    const html = TEMPLATES.weekly_digest.getHtml(context);

    const success = await sendEmail(email, subject, html);

    if (success) {
      await getSupabase()
        .from('creators')
        .update({ last_weekly_digest_at: new Date().toISOString() })
        .eq('id', user.id);

      await getSupabase().from('lifecycle_email_sends').insert({
        creator_id: user.id,
        template_slug: 'weekly_digest',
        email_address: email,
        subject_rendered: subject,
        status: 'sent',
        sent_at: new Date().toISOString()
      });

      sent++;
    }

    await new Promise(r => setTimeout(r, DELAY_BETWEEN_EMAILS));
  }

  console.log(`[DIGEST] Sent: ${sent}, Skipped: ${JSON.stringify(skipped)}`);
  return sent;
}

async function processDoubterSeries() {
  // Doubter: 2+ total unlocks used (lifetime), 14+ days since signup, still in explorer/engaged state
  // These are users who tried the product but haven't progressed to maximizer/winner

  // Step 1: Get creators who might be eligible (explorer/engaged, not completed doubter series)
  const { data: potentialUsers, error: usersError } = await getSupabase()
    .from('creators')
    .select('id, user_id, username, lifecycle_emails_sent_today, doubter_series_position, doubter_series_started_at, created_at, pitches_sent_total, subscription_tier')
    .in('lifecycle_state', ['explorer', 'engaged'])
    .or('doubter_series_position.is.null,doubter_series_position.lt.2')
    .order('doubter_series_position', { ascending: true, nullsFirst: true })
    .limit(200); // Fetch more to filter down

  if (usersError || !potentialUsers?.length) {
    console.log(`[DOUBT] Query returned ${potentialUsers?.length || 0} potential users, error: ${usersError?.message || 'none'}`);
    return 0;
  }

  // Step 2: Get total unlock counts for these creators from brand_unlocks table
  const creatorIds = potentialUsers.map(u => u.id);
  const { data: unlockCounts, error: unlockError } = await getSupabase()
    .from('brand_unlocks')
    .select('creator_id')
    .in('creator_id', creatorIds);

  if (unlockError) {
    console.log(`[DOUBT] Error fetching unlock counts: ${unlockError.message}`);
    return 0;
  }

  // Count unlocks per creator
  const unlocksByCreator = {};
  for (const unlock of (unlockCounts || [])) {
    unlocksByCreator[unlock.creator_id] = (unlocksByCreator[unlock.creator_id] || 0) + 1;
  }

  // Step 3: Filter to only creators with 1+ total unlocks (tried the product but stuck)
  const users = potentialUsers.filter(u => (unlocksByCreator[u.id] || 0) >= 1).slice(0, BATCH_SIZE);

  console.log(`[DOUBT] Query returned ${users?.length || 0} users with 1+ unlocks (from ${potentialUsers.length} potential), error: none`);
  if (!users?.length) return 0;

  const now = new Date();
  let sent = 0;
  let skipped = { pro: 0, daily_limit: 0, not_old_enough: 0, cooldown: 0, no_email: 0 };

  for (const user of users) {
    if (user.subscription_tier === 'pro' || user.subscription_tier === 'premium') {
      skipped.pro++;
      continue;
    }

    // Daily throttle check
    const emailsToday = user.lifecycle_emails_sent_today || 0;
    if (emailsToday >= MAX_EMAILS_PER_DAY) {
      skipped.daily_limit++;
      continue;
    }

    const position = user.doubter_series_position || 0;
    const daysSinceSignup = Math.floor((now - new Date(user.created_at)) / (1000 * 60 * 60 * 24));

    // Doubter email 1: 14+ days since signup
    if (position === 0 && daysSinceSignup < 14) {
      skipped.not_old_enough++;
      continue;
    }
    // Doubter email 2: 4+ days after email 1
    if (position === 1 && user.doubter_series_started_at) {
      const daysSinceEmail1 = Math.floor((now - new Date(user.doubter_series_started_at)) / (1000 * 60 * 60 * 24));
      if (daysSinceEmail1 < 4) {
        skipped.cooldown++;
        continue;
      }
    }

    const email = await getUserEmail(user.user_id);
    if (!email) {
      skipped.no_email++;
      continue;
    }

    const firstName = user.username || 'there';
    const userUnlockCount = unlocksByCreator[user.id] || 0;
    let subject, html, templateSlug;

    if (position === 0) {
      subject = TEMPLATES.doubter_1.subject;
      html = TEMPLATES.doubter_1.getHtml(firstName);
      templateSlug = 'doubter_story';
    } else {
      subject = TEMPLATES.doubter_2.subject;
      html = TEMPLATES.doubter_2.getHtml(firstName, user.pitches_sent_total, userUnlockCount);
      templateSlug = 'doubter_5pitch';
    }

    const success = await sendEmail(email, subject, html);

    if (success) {
      const updateData = {
        doubter_series_position: position + 1,
        lifecycle_emails_sent_today: (user.lifecycle_emails_sent_today || 0) + 1,
        lifecycle_last_email_date: new Date().toISOString().split('T')[0],
        last_any_email_sent: new Date().toISOString()
      };
      if (position === 0) updateData.doubter_series_started_at = new Date().toISOString();
      await getSupabase().from('creators').update(updateData).eq('id', user.id);

      // Log to lifecycle_email_sends
      await getSupabase().from('lifecycle_email_sends').insert({
        creator_id: user.id,
        template_slug: templateSlug,
        email_address: email,
        subject_rendered: subject,
        status: 'sent',
        sent_at: new Date().toISOString()
      });

      sent++;
    }

    await new Promise(r => setTimeout(r, DELAY_BETWEEN_EMAILS));
  }

  console.log(`[DOUBT] Sent: ${sent}, Skipped: ${JSON.stringify(skipped)}`);
  return sent;
}

// ============================================
// FOLLOW-UP REMINDERS (Pro only)
// Sends reminder emails at Day 6, 10, 14 after pitch
// ============================================

async function processFollowupReminders() {
  const now = new Date();

  // Query pipeline items needing reminders (Pro users only, not already sent)
  // Uses raw SQL through Supabase RPC or direct query
  const { data: items, error } = await getSupabase()
    .from('creator_pipeline')
    .select(`
      id,
      creator_id,
      brand_id,
      pitched_at,
      day_6_reminder_sent,
      day_10_reminder_sent,
      day_14_reminder_sent,
      pr_brands!inner(brand_name, hero_product, category),
      creators!inner(id, user_id, username, subscription_tier, lifecycle_emails_sent_today, followup_notifications_enabled)
    `)
    .in('stage', ['waiting', 'pitched'])
    .eq('send_confirmed', true)
    .not('pitched_at', 'is', null)
    .eq('creators.subscription_tier', 'pro')
    .eq('creators.followup_notifications_enabled', true)
    .limit(BATCH_SIZE);

  console.log(`[FOLLOWUP] Query returned ${items?.length || 0} items, error: ${error?.message || 'none'}`);
  if (!items?.length) return 0;

  let sent = 0;
  const skipped = { daily_limit: 0, already_sent: 0, not_ready: 0, no_email: 0 };

  for (const item of items) {
    const creator = item.creators;
    const brand = item.pr_brands;

    // Daily limit check
    if ((creator.lifecycle_emails_sent_today || 0) >= MAX_EMAILS_PER_DAY) {
      skipped.daily_limit++;
      continue;
    }

    // Calculate days since pitch
    const pitchedAt = new Date(item.pitched_at);
    const daysSincePitch = Math.floor((now - pitchedAt) / (1000 * 60 * 60 * 24));

    // Determine which reminder to send
    let reminderType = null;
    let template = null;
    let updateColumn = null;

    if (daysSincePitch >= 6 && daysSincePitch < 8 && !item.day_6_reminder_sent) {
      reminderType = 'day_6';
      template = TEMPLATES.followup_day_6;
      updateColumn = 'day_6_reminder_sent';
    } else if (daysSincePitch >= 10 && daysSincePitch < 12 && !item.day_10_reminder_sent) {
      reminderType = 'day_10';
      template = TEMPLATES.followup_day_10;
      updateColumn = 'day_10_reminder_sent';
    } else if (daysSincePitch >= 14 && daysSincePitch <= 15 && !item.day_14_reminder_sent) {
      reminderType = 'day_14';
      template = TEMPLATES.followup_day_14;
      updateColumn = 'day_14_reminder_sent';
    } else {
      skipped.not_ready++;
      continue;
    }

    // Get user email
    const email = await getUserEmail(creator.user_id);
    if (!email) {
      skipped.no_email++;
      continue;
    }

    // Build deep link
    const brandName = brand.brand_name || 'the brand';
    const heroProduct = brand.hero_product || brand.category;
    const deepLink = `https://app.newcollab.co/creator/dashboard/pr-pipeline?` +
      `followup=${item.id}&brand=${encodeURIComponent(brandName)}` +
      `&utm_source=email&utm_medium=followup_reminder&utm_campaign=${reminderType}`;

    // Generate email
    const firstName = creator.username || 'there';
    const subject = template.subject(brandName);
    const html = template.getHtml(firstName, brandName, deepLink, heroProduct);

    const success = await sendEmail(email, subject, html);

    if (success) {
      // Update pipeline item to mark reminder as sent
      await getSupabase()
        .from('creator_pipeline')
        .update({ [updateColumn]: true })
        .eq('id', item.id);

      // Log the send
      await getSupabase().from('followup_reminder_sends').insert({
        creator_id: creator.id,
        pipeline_id: item.id,
        brand_name: brandName,
        reminder_type: reminderType,
        email_address: email,
        sent_at: new Date().toISOString()
      });

      // Update creator email count
      await getSupabase()
        .from('creators')
        .update({
          lifecycle_emails_sent_today: (creator.lifecycle_emails_sent_today || 0) + 1,
          lifecycle_last_email_date: new Date().toISOString().split('T')[0],
          last_followup_notification_at: new Date().toISOString()
        })
        .eq('id', creator.id);

      sent++;
      console.log(`[FOLLOWUP] Sent ${reminderType} to ${email} for ${brandName}`);
    }

    await new Promise(r => setTimeout(r, DELAY_BETWEEN_EMAILS));
  }

  console.log(`[FOLLOWUP] Sent: ${sent}, Skipped: ${JSON.stringify(skipped)}`);
  return sent;
}

module.exports = async function handler(req, res) {
  // Verify cron secret - accept both Vercel internal cron and manual triggers
  const authHeader = req.headers.authorization;
  const isVercelCron = req.headers['x-vercel-cron'] === '1' || req.headers['user-agent']?.includes('vercel-cron');

  if (!isVercelCron && authHeader !== `Bearer ${CRON_SECRET}`) {
    console.log('[AUTH] Rejected - not Vercel cron and invalid token');
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Same vercel.json is deployed on both Vercel projects. Only the CRA app
  // (newcollab-app) should send mail. The Next.js marketing site (appfrontend)
  // would 500 on missing CRA env vars and double-send if it succeeded.
  const CRON_OWNER_PROJECT_ID = 'prj_3hHiValCI1iukctHkpAJmMxG2aLG';
  const projectId = process.env.VERCEL_PROJECT_ID;
  if (projectId && projectId !== CRON_OWNER_PROJECT_ID) {
    console.log(`Skipping lifecycle cron on project ${projectId} (owner is newcollab-app)`);
    return res.status(200).json({ skipped: true, reason: 'duplicate_project' });
  }

  console.log('Starting lifecycle email cron...');

  try {
    // Reset monthly unlocks for free users (at start of each month)
    const unlocksReset = await resetMonthlyUnlocks();

    // Reset daily counters
    const today = new Date().toISOString().split('T')[0];
    await getSupabase()
      .from('creators')
      .update({ lifecycle_emails_sent_today: 0 })
      .or(`lifecycle_last_email_date.is.null,lifecycle_last_email_date.neq.${today}`);

    const educationSent = await processEducationSeries();
    const maximizerSent = await processMaximizerSeries();
    const doubterSent = await processDoubterSeries();
    const reengagementSent = await processReengagement();
    const digestSent = await processWeeklyDigest();
    const followupRemindersSent = await processFollowupReminders();

    const result = {
      success: true,
      timestamp: new Date().toISOString(),
      unlocksReset,
      sent: {
        education: educationSent,
        maximizer: maximizerSent,
        doubter: doubterSent,
        reengagement: reengagementSent,
        weekly_digest: digestSent,
        followup_reminders: followupRemindersSent,
        total: educationSent + maximizerSent + doubterSent + reengagementSent + digestSent + followupRemindersSent
      }
    };

    console.log('Cron complete:', result);
    return res.status(200).json(result);
  } catch (error) {
    console.error('Cron error:', error);
    return res.status(500).json({ error: error.message });
  }
}
