const express = require('express');
const router = express.Router();
const axios = require('axios');

async function callOpenRouter(systemPrompt, userMessage) {
  const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
    model: process.env.OPENROUTER_MODEL,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage }
    ],
    temperature: 0.7,
    max_tokens: 2000
  }, {
    headers: {
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'http://localhost:3000',
      'X-Title': 'Blood Bank Manager'
    }
  });
  return response.data.choices[0].message.content;
}

function parseAIResponse(content) {
  try {
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[1].trim());
    }
    return JSON.parse(content);
  } catch {
    return { raw_response: content };
  }
}

// POST /eligibility
router.post('/eligibility', async (req, res, next) => {
  try {
    const { questionnaire } = req.body;

    const systemPrompt = `You are a medical AI assistant specializing in blood donation eligibility screening. Analyze the following health questionnaire responses and determine donor eligibility based on FDA and AABB guidelines.

Evaluate each response carefully considering:
- Travel history to malaria-endemic or vCJD-risk regions
- Medication usage and its impact on blood safety
- Recent tattoos, piercings, or surgical procedures
- History of infectious diseases (HIV, Hepatitis B/C, syphilis, Zika)
- Pregnancy or recent childbirth
- Vital signs (hemoglobin, blood pressure, pulse, temperature, weight)
- Recent vaccinations
- High-risk behavioral factors

Respond in JSON format with these fields:
{
  "eligible": true/false,
  "status": "eligible" | "temporarily_deferred" | "permanently_deferred",
  "deferral_period_days": number or null,
  "deferral_end_date": "YYYY-MM-DD" or null,
  "reasons": ["list of specific reasons for the determination"],
  "risk_factors": ["any noted risk factors even if donor is eligible"],
  "recommendations": ["any recommendations for the donor"],
  "confidence": "high" | "medium" | "low",
  "notes": "additional clinical notes"
}`;

    const userMessage = `Health questionnaire responses:\n${JSON.stringify(questionnaire, null, 2)}`;
    const aiContent = await callOpenRouter(systemPrompt, userMessage);
    const result = parseAIResponse(aiContent);

    res.json({ success: true, data: result });
  } catch (err) {
    console.error('AI eligibility error:', err.message);
    next(err);
  }
});

// POST /expiration-prediction
router.post('/expiration-prediction', async (req, res, next) => {
  try {
    const { inventory } = req.body;

    const systemPrompt = `You are an AI inventory management specialist for a blood bank. Analyze the current blood product inventory and predict expiration risks. Consider standard shelf lives: whole blood (35 days), packed RBCs (42 days), platelets (5 days), fresh frozen plasma (1 year), cryoprecipitate (1 year).

Evaluate:
- Units approaching expiration within 48 hours, 7 days, and 14 days
- Current usage rates vs. available stock
- Blood type distribution and demand patterns
- Seasonal trends and upcoming events that may affect demand

Respond in JSON format:
{
  "critical_expirations": [{"blood_type": "...", "component": "...", "units": N, "expires_within_hours": N}],
  "at_risk_units": [{"blood_type": "...", "component": "...", "units": N, "days_until_expiry": N}],
  "redistribution_recommendations": [{"action": "...", "units": N, "from": "...", "to": "...", "reason": "..."}],
  "waste_prevention_score": 0-100,
  "estimated_waste_units": N,
  "priority_actions": ["ordered list of immediate actions to take"],
  "notes": "additional analysis"
}`;

    const userMessage = `Current inventory data:\n${JSON.stringify(inventory, null, 2)}`;
    const aiContent = await callOpenRouter(systemPrompt, userMessage);
    const result = parseAIResponse(aiContent);

    res.json({ success: true, data: result });
  } catch (err) {
    console.error('AI expiration prediction error:', err.message);
    next(err);
  }
});

// POST /campaign-content
router.post('/campaign-content', async (req, res, next) => {
  try {
    const { target_demographic, blood_type_needed, urgency, additional_context } = req.body;

    const systemPrompt = `You are a creative marketing AI assistant specializing in blood donation recruitment campaigns. Generate compelling, empathetic, and actionable campaign content that motivates people to donate blood. Your content should be medically accurate, culturally sensitive, and emotionally resonant.

Consider:
- The urgency level and tailor tone accordingly (routine, urgent, critical)
- Target demographic preferences and communication styles
- Facts about blood donation to dispel myths and encourage action
- Clear calls-to-action with specific next steps
- Compliance with health communication regulations

Respond in JSON format:
{
  "email": {
    "subject": "compelling email subject line",
    "body": "full HTML-friendly email body with greeting, message, and CTA"
  },
  "social_media": {
    "facebook": "Facebook post (max 500 chars)",
    "twitter": "Twitter/X post (max 280 chars)",
    "instagram": "Instagram caption with hashtags"
  },
  "sms": "SMS message (max 160 chars)",
  "talking_points": ["key messages for phone outreach"],
  "hashtags": ["relevant hashtags"],
  "campaign_name": "suggested campaign name"
}`;

    const userMessage = `Campaign parameters:
- Target demographic: ${target_demographic || 'general public'}
- Blood type needed: ${blood_type_needed || 'all types'}
- Urgency level: ${urgency || 'routine'}
- Additional context: ${additional_context || 'none'}`;

    const aiContent = await callOpenRouter(systemPrompt, userMessage);
    const result = parseAIResponse(aiContent);

    res.json({ success: true, data: result });
  } catch (err) {
    console.error('AI campaign content error:', err.message);
    next(err);
  }
});

// POST /deferral-reengagement
router.post('/deferral-reengagement', async (req, res, next) => {
  try {
    const { deferral_reason, deferral_date, donor_info } = req.body;

    const systemPrompt = `You are a compassionate AI communication specialist for a blood bank. Generate personalized re-engagement messaging for donors who were previously deferred from donating blood. Your messages should be:

- Empathetic and non-judgmental
- Medically accurate about the deferral reason and when they may become eligible again
- Encouraging without being pushy
- Clear about any steps the donor needs to take before their next attempt
- Personalized based on the donor's history and deferral reason

Respond in JSON format:
{
  "eligible_to_return": true/false,
  "return_date": "YYYY-MM-DD or null if still deferred",
  "email": {
    "subject": "personalized email subject",
    "body": "warm, personalized email body"
  },
  "sms": "brief, friendly SMS message",
  "phone_script": "script for phone outreach with key talking points",
  "pre_donation_checklist": ["steps donor should take before next visit"],
  "tone": "encouraging" | "informational" | "celebratory",
  "notes": "any additional considerations for staff"
}`;

    const userMessage = `Donor deferral information:
- Deferral reason: ${deferral_reason}
- Deferral date: ${deferral_date}
- Donor info: ${JSON.stringify(donor_info, null, 2)}`;

    const aiContent = await callOpenRouter(systemPrompt, userMessage);
    const result = parseAIResponse(aiContent);

    res.json({ success: true, data: result });
  } catch (err) {
    console.error('AI deferral re-engagement error:', err.message);
    next(err);
  }
});

// POST /demand-forecast
router.post('/demand-forecast', async (req, res, next) => {
  try {
    const { historical_data, current_inventory } = req.body;

    const systemPrompt = `You are an AI demand forecasting specialist for a blood bank. Analyze historical usage data and current inventory levels to forecast blood product demand by blood type for the next 30 days.

Consider:
- Historical usage patterns and trends (daily, weekly, seasonal)
- Current inventory levels and incoming scheduled donations
- Typical hospital order patterns
- Seasonal factors (holidays, summer shortages, flu season impacts)
- Emergency buffer requirements by blood type
- Special considerations for rare blood types (AB-, B-)

Respond in JSON format:
{
  "forecast_period": "next 30 days",
  "by_blood_type": {
    "A+": {"predicted_demand_units": N, "current_stock": N, "surplus_deficit": N, "risk_level": "low|medium|high|critical"},
    "A-": {"predicted_demand_units": N, "current_stock": N, "surplus_deficit": N, "risk_level": "..."},
    "B+": {"predicted_demand_units": N, "current_stock": N, "surplus_deficit": N, "risk_level": "..."},
    "B-": {"predicted_demand_units": N, "current_stock": N, "surplus_deficit": N, "risk_level": "..."},
    "AB+": {"predicted_demand_units": N, "current_stock": N, "surplus_deficit": N, "risk_level": "..."},
    "AB-": {"predicted_demand_units": N, "current_stock": N, "surplus_deficit": N, "risk_level": "..."},
    "O+": {"predicted_demand_units": N, "current_stock": N, "surplus_deficit": N, "risk_level": "..."},
    "O-": {"predicted_demand_units": N, "current_stock": N, "surplus_deficit": N, "risk_level": "..."}
  },
  "overall_risk": "low|medium|high|critical",
  "recommended_actions": ["prioritized list of actions"],
  "collection_targets": {"blood_type": "target units to collect"},
  "confidence_level": "high|medium|low",
  "assumptions": ["key assumptions made in the forecast"],
  "notes": "additional analysis and context"
}`;

    const userMessage = `Historical usage data:\n${JSON.stringify(historical_data, null, 2)}\n\nCurrent inventory:\n${JSON.stringify(current_inventory, null, 2)}`;
    const aiContent = await callOpenRouter(systemPrompt, userMessage);
    const result = parseAIResponse(aiContent);

    res.json({ success: true, data: result });
  } catch (err) {
    console.error('AI demand forecast error:', err.message);
    next(err);
  }
});

module.exports = router;
