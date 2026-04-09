# AI Pitch Feature - Backend API Specification

## Overview

This document specifies the backend API endpoints needed for the AI Pitch feature.
The frontend implementation is complete and ready to integrate.

## Required Endpoints

### 1. Generate AI Pitch

**Endpoint:** `POST /api/pr-crm/generate-pitch`

**Purpose:** Generate a personalized pitch email using AI based on creator profile and brand data.

**Request:**
```json
{
  "brand_id": 123
}
```

**Response:**
```json
{
  "subject": "Collaboration Inquiry - Love Your Brand!",
  "body": "Hi [Brand] Team,\n\nI'm [Creator Name], a [niche] content creator with [X] followers and a [Y]% engagement rate...\n\n[Personalized pitch body]\n\nBest regards,\n[Creator Name]",
  "creator_stats": {
    "followers": "12.5K",
    "engagement": "4.2",
    "niche": "Beauty & Skincare"
  },
  "media_kit_url": "https://newcollab.co/creator/123/media-kit" // optional
}
```

**AI Prompt Template (suggested):**
```
You are a PR pitch expert helping creators land brand collaborations.

Generate a warm, professional pitch email from:
- Creator: {creator_name}
- Niche: {niche}
- Followers: {followers_count}
- Engagement Rate: {engagement_rate}%
- Instagram: @{instagram_handle}

To brand:
- Brand Name: {brand_name}
- Category: {category}
- What they look for: {requirements or "influencer collaborations"}

Requirements:
1. Subject line: Compelling, professional, 6-10 words
2. Opening: Genuine compliment about the brand (specific)
3. Value prop: Why you're a great fit (include stats naturally)
4. Collaboration idea: One specific, creative proposal
5. CTA: Soft ask for a conversation
6. Tone: Professional but warm, authentic
7. Length: 100-150 words max

Output as JSON with "subject" and "body" fields.
```

### 2. Get Pitch Limits

**Endpoint:** `GET /api/pr-crm/pitch-limits`

**Purpose:** Check how many pitches the user has remaining this week.

**Response:**
```json
{
  "used": 2,
  "limit": 3,
  "canPitch": true,
  "resetsAt": "2026-04-14T00:00:00Z"
}
```

**Logic:**
- Free users: 3 pitches per week (resets Sunday midnight)
- Pro users: Unlimited (canPitch always true)
- Elite users: Unlimited

### 3. Track Pitch Sent

**Endpoint:** `POST /api/pr-crm/track-pitch`

**Purpose:** Record when a user sends a pitch (for analytics and quota tracking).

**Request:**
```json
{
  "brand_id": 123,
  "pipeline_id": 456
}
```

**Response:**
```json
{
  "success": true,
  "pitches_remaining": 2,
  "pitch_id": 789
}
```

**Side Effects:**
- Increment `pitches_sent_this_month` in creators table
- Increment `pitches_sent_total` in creators table
- Create entry in `pitch_history` table (if exists)
- Update pipeline stage to "pitched"

## Database Changes (Suggested)

### New Table: `pitch_history`
```sql
CREATE TABLE pitch_history (
  id SERIAL PRIMARY KEY,
  creator_id INTEGER REFERENCES creators(id),
  brand_id INTEGER REFERENCES brands(id),
  pipeline_id INTEGER REFERENCES pr_pipeline(id),
  subject TEXT,
  body TEXT,
  sent_at TIMESTAMP DEFAULT NOW(),
  opened BOOLEAN DEFAULT FALSE,
  responded BOOLEAN DEFAULT FALSE,
  response_at TIMESTAMP
);
```

### Update `creators` table
```sql
-- Already exists based on screenshot:
-- pitches_sent_this_month INTEGER DEFAULT 0
-- pitches_sent_total INTEGER DEFAULT 0

-- Add weekly tracking:
ALTER TABLE creators ADD COLUMN pitches_sent_this_week INTEGER DEFAULT 0;
ALTER TABLE creators ADD COLUMN week_reset_at TIMESTAMP;
```

## Integration with OpenAI/Claude

```python
# Example Python implementation
import openai

def generate_pitch(creator, brand):
    prompt = f"""
    Generate a professional collaboration pitch email.

    Creator: {creator['username']} ({creator['followers_count']} followers, {creator['engagement_rate']}% engagement)
    Niche: {creator['niche']}

    Brand: {brand['brand_name']} ({brand['category']})

    Write a 100-150 word pitch email that:
    1. Opens with a genuine compliment about the brand
    2. Explains why the creator is a great fit
    3. Proposes a specific collaboration idea
    4. Ends with a soft call-to-action

    Return JSON: {{"subject": "...", "body": "..."}}
    """

    response = openai.ChatCompletion.create(
        model="gpt-4",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.7
    )

    return json.loads(response.choices[0].message.content)
```

## Testing the Integration

Once backend is ready, the frontend will:
1. Call `GET /api/pr-crm/pitch-limits` on modal open
2. Call `POST /api/pr-crm/generate-pitch` to get AI pitch
3. Display pitch in modal
4. On "Send Email" click: `POST /api/pr-crm/track-pitch`
5. Open `mailto:` with pre-filled email

## Fallback Behavior

The frontend includes a fallback template if the AI endpoint fails.
This ensures the feature works even without AI, just with less personalization.

## Metrics to Track

After implementation, monitor:
- Pitches generated per day
- Pitch-to-send rate (how many generated pitches are actually sent)
- Response rate (requires manual tracking or email integration)
- Free-to-Pro conversion rate
