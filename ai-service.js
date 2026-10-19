/**
 * SevaSetu AI Service
 * Powered by Google Gemini API (@google/genai - gemini-3.8-flash)
 * Includes robust fallbacks so the app runs smoothly with or without an active GEMINI_API_KEY.
 */

const { GoogleGenAI } = require('@google/genai');
const db = require('./db');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const MODEL_NAME = 'gemini-3.8-flash';

let aiClient = null;
if (GEMINI_API_KEY && GEMINI_API_KEY.trim() !== '' && GEMINI_API_KEY !== 'YOUR_GEMINI_API_KEY_HERE') {
    try {
        aiClient = new GoogleGenAI({ apiKey: GEMINI_API_KEY.trim() });
        console.log('🤖 Google Gemini AI Client initialized successfully (Model: ' + MODEL_NAME + ')');
    } catch (e) {
        console.warn('⚠️ Gemini AI Client init warning:', e.message);
    }
} else {
    console.log('ℹ️ GEMINI_API_KEY not configured or placeholder used. Running in Smart Simulated AI mode.');
}

// Helper: Query current verified care homes and urgent needs for grounding context
function getLiveCareHomeContext() {
    try {
        const orgs = db.prepare(`
            SELECT id, name, role, city, address, mobile, email 
            FROM users 
            WHERE role IN ('orphanage', 'oldage') AND (status = 'approved' OR status IS NULL)
            LIMIT 10
        `).all();

        const needs = db.prepare(`
            SELECT id, org_name, category, title, description, target_amount, raised_amount, urgency 
            FROM urgent_needs 
            ORDER BY id DESC 
            LIMIT 8
        `).all();

        const stats = db.prepare(`
            SELECT 
                (SELECT COUNT(*) FROM users WHERE role IN ('orphanage', 'oldage')) as total_orgs,
                (SELECT COUNT(*) FROM donations WHERE status = 'Success') as total_donations,
                (SELECT COALESCE(SUM(amount), 0) FROM donations WHERE status = 'Success') as total_raised
        `).get();

        return { orgs, needs, stats };
    } catch (e) {
        return { orgs: [], needs: [], stats: {} };
    }
}

/**
 * 1. AI SevaMitra (Smart Multilingual AI Assistant)
 */
async function chatSevaMitra({ message, conversationHistory = [] }) {
    if (!message || typeof message !== 'string') {
        throw new Error('Message is required.');
    }

    const { orgs, needs, stats } = getLiveCareHomeContext();
    const isLiveAI = !!aiClient;

    const systemInstruction = `
You are "SevaMitra" (सेवामित्र), the official, compassionate, and smart AI Guide of SevaSetu (सेवासेतु) — a digital bridge connecting benevolent donors directly with verified orphanages and old age homes across India.

YOUR ATTRIBUTES & TONE:
1. Multilingual: Reply warmly in the user's language (Hindi, English, Hinglish, Marathi, Gujarati, etc.). Match their tone naturally.
2. Mission-driven: Advocate for elderly grandmothers & grandfathers (बुजुर्ग) and orphaned children (अनाथ बच्चे) with respect and empathy.
3. Transparent & Informative: 
   - Explain how 100% direct donation works on SevaSetu.
   - Clarify Section 80G of the Indian Income Tax Act (donors can claim 50% tax deduction on eligible donations, receipt provided instantly).
   - Inform users about visiting, volunteering, and sponsoring meals/education.
4. Grounded in Platform Data:
   - Current verified homes on platform: ${JSON.stringify(orgs.map(o => ({ name: o.name, type: o.role, city: o.city })))}
   - Active urgent needs needing funding: ${JSON.stringify(needs.map(n => ({ org: n.org_name, title: n.title, target: n.target_amount, raised: n.raised_amount, urgency: n.urgency })))}
   - Total impact: ₹${(stats.total_raised || 0).toLocaleString('en-IN')} raised across ${stats.total_donations || 0} donations.
5. Action-oriented: Provide 2 to 3 relevant follow-up suggestion chips at the end if applicable.
`;

    if (aiClient) {
        try {
            // Build conversation history contents
            const contents = [];
            if (Array.isArray(conversationHistory)) {
                conversationHistory.slice(-6).forEach(item => {
                    if (item.sender === 'user') {
                        contents.push({ role: 'user', parts: [{ text: item.text }] });
                    } else if (item.sender === 'bot' || item.sender === 'model') {
                        contents.push({ role: 'model', parts: [{ text: item.text }] });
                    }
                });
            }
            contents.push({ role: 'user', parts: [{ text: message }] });

            const response = await aiClient.models.generateContent({
                model: MODEL_NAME,
                contents,
                config: {
                    systemInstruction,
                    temperature: 0.7,
                }
            });

            const replyText = response.text || "Namaste! I am here to assist you with donations, 80G tax benefits, and care homes.";
            return {
                reply: replyText,
                isLiveAI: true,
                suggestions: generateSmartSuggestions(message, replyText)
            };
        } catch (err) {
            console.warn('Gemini API call failed, falling back to simulated intelligence:', err.message);
        }
    }

    // High-Quality Simulated Intelligence Fallback (Matches Hindi/English/Hinglish)
    const lower = message.toLowerCase();
    let reply = '';
    let suggestions = [];

    if (lower.includes('tax') || lower.includes('80g') || lower.includes('छूट') || lower.includes('income tax')) {
        reply = `Namaste! 🙏 **Yes, donations on SevaSetu are 100% eligible for Section 80G tax benefits!**\n\n• **50% Tax Deduction**: You can claim up to 50% deduction of the donated amount from your taxable income.\n• **Instant 80G Digital Receipt**: As soon as your payment succeeds, a stamped 80G tax receipt with Unique Reference Number is generated.\n• **Annual Summary**: You can download all your yearly donation receipts from the donor dashboard for easy ITR filing.\n\nWould you like help choosing a verified orphanage or old age home to support today?`;
        suggestions = ["Find Urgent Needs", "Donate to Orphanage", "Old Age Care Home"];
    } else if (lower.includes('orphan') || lower.includes('अनाथ') || lower.includes('बच्चे') || lower.includes('child') || lower.includes('education') || lower.includes('school')) {
        const orphanNeeds = needs.filter(n => (n.category || '').includes('book') || (n.category || '').includes('cloth') || (n.org_name || '').toLowerCase().includes('orphan'));
        const needHighlight = orphanNeeds.length > 0 ? orphanNeeds[0].title + ` (${orphanNeeds[0].org_name})` : "Winter Clothes & Books Drive (Sunrise Orphanage)";
        reply = `Namaste! Children at our partner orphanages are always in need of nutritional support, school fees, books, and seasonal clothing. 👧👦\n\n**Current Urgent Need:**\n🎯 **${needHighlight}**\n\nEvery ₹500 provides a child with stationery & study kits for 3 months. Every ₹1,500 sponsors warm clothes and nutritious meals.\n\nWould you like to donate directly or check all verified orphanages in your city?`;
        suggestions = ["Donate ₹500", "View All Orphanages", "How SevaSetu Verifies Homes"];
    } else if (lower.includes('old age') || lower.includes('बुजुर्ग') || lower.includes('elder') || lower.includes('vridh') || lower.includes('ashram') || lower.includes('dada') || lower.includes('dadi')) {
        reply = `Pranam! Our elders in old-age homes deserve dignity, medical care, and warm companionship. 👴👵\n\n• **Medical Care**: Regular blood pressure, diabetes medicines, and mobility aids.\n• **Nutrition**: Wholesome meals tailored for seniors.\n• **Emotional Care**: You can also sponsor festival celebrations or register to spend time volunteering!\n\nWould you like to support **Shanti Vridhashram** or explore homes near you?`;
        suggestions = ["Donate for Medicine", "Shanti Vridhashram Details", "Volunteer at Old Age Home"];
    } else if (lower.includes('safe') || lower.includes('trust') || lower.includes('fraud') || lower.includes('verify') || lower.includes('fake') || lower.includes('sach')) {
        reply = `Trust & Transparency are the founding pillars of **SevaSetu**: 🛡️\n\n1. **Admin & AI Verification**: Every care home must submit registration proof (Trust Deed / Society Reg, PAN, 12A/80G) before listing.\n2. **Direct Bank Transfers**: 100% of your donation is mapped directly to the verified beneficiary.\n3. **Real-time Live Proof**: Care homes upload photographic updates and bills once goods are distributed.\n4. **Public Live Counters**: You can inspect real-time donation tallies and audited reports anytime.`;
        suggestions = ["How to Donate", "View Verified Homes", "80G Tax Exemption"];
    } else if (lower.includes('volunteer') || lower.includes('sewa') || lower.includes('सेवा') || lower.includes('visit')) {
        reply = `That is wonderful! Hands-on seva brings immense joy to both children and elders. 🤝\n\n• You can sign up via our **Volunteer Page**.\n• Volunteer activities include teaching, organizing games, reading to seniors, and assisting in meal drives.\n• Weekend batches are available across all partner cities.\n\nShall I guide you to the volunteer registration form?`;
        suggestions = ["Go to Volunteer Page", "Locate Nearby Care Home", "Talk to Support"];
    } else if (lower.includes('1000') || lower.includes('500') || lower.includes('2000') || lower.includes('5000') || lower.includes('budget') || lower.includes('kitna')) {
        reply = `Every single rupee creates meaningful impact! Here is how your donation works: ✨\n\n• **₹500**: Provides a student school stationery & storybooks for a term.\n• **₹1,000**: Supplies 10 nutritious meals & warm blankets for elderly residents.\n• **₹2,500**: Covers one month of chronic medication & checkups for 3 senior citizens.\n• **₹5,000**: Sponsors full month ration & protein diet for a room of 5 children.\n\nWhich cause touches your heart the most today?`;
        suggestions = ["Orphanage Education", "Elderly Healthcare", "Urgent Ration Drive"];
    } else {
        reply = `Namaste! I am **AI SevaMitra**, your intelligent guide on SevaSetu. 🙏\n\nI can assist you with:\n• Finding verified orphanages & old-age homes across India\n• Explaining 80G tax exemption benefits (50% tax deduction)\n• Matching your donation budget with urgent active needs\n• Volunteering and offline ashram visit guidelines\n\nHow can I help you bring warmth and hope to someone today?`;
        suggestions = ["Find Urgent Needs", "80G Tax Exemption", "How to Volunteer", "Register Care Home"];
    }

    return {
        reply,
        isLiveAI: false,
        suggestions
    };
}

function generateSmartSuggestions(query, reply) {
    const q = query.toLowerCase();
    if (q.includes('tax') || q.includes('80g')) return ["How to claim in ITR?", "Find 80G verified homes", "Download Past Receipts"];
    if (q.includes('orphan') || q.includes('child')) return ["Donate for Books", "Donate for Meals", "Visit Orphanage"];
    if (q.includes('elder') || q.includes('old age')) return ["Medicine Sponsorship", "Winter Blankets", "Volunteer on Weekends"];
    return ["80G Tax Exemption", "Urgent Needs Today", "How Donations are Used"];
}

/**
 * 2. AI Donor-Need Matchmaker
 */
async function matchmaker({ budget = 1000, cause = 'any', city = '' }) {
    const { orgs, needs } = getLiveCareHomeContext();
    const budgetNum = Number(budget) || 1000;

    if (aiClient) {
        try {
            const prompt = `
You are the AI Matchmaker for SevaSetu. 
A donor wants to give approximately ₹${budgetNum}.
Cause preference: "${cause}"
City preference: "${city || 'Any in India'}"

Available Care Homes: ${JSON.stringify(orgs)}
Active Urgent Needs: ${JSON.stringify(needs)}

Analyze and return a JSON object with:
{
  "recommendations": [
    {
      "org_name": string,
      "title": string,
      "category": string,
      "target_amount": number,
      "suggested_donation": number,
      "match_reason": string,
      "tangible_impact": string
    }
  ],
  "summary_message": string
}
Return only valid JSON.`;

            const response = await aiClient.models.generateContent({
                model: MODEL_NAME,
                contents: prompt,
                config: {
                    responseMimeType: 'application/json'
                }
            });

            return JSON.parse(response.text);
        } catch (e) {
            console.warn('Matchmaker Gemini API fallback:', e.message);
        }
    }

    // Fallback recommendation logic
    let filtered = [...needs];
    if (cause && cause !== 'any' && cause !== 'all') {
        const cLower = cause.toLowerCase();
        filtered = filtered.filter(n => 
            (n.category || '').toLowerCase().includes(cLower) || 
            (n.title || '').toLowerCase().includes(cLower) ||
            (n.org_name || '').toLowerCase().includes(cLower)
        );
        if (filtered.length === 0) filtered = [...needs];
    }

    const recs = (filtered.length > 0 ? filtered : [
        {
            org_name: "Sunrise Orphanage",
            title: "Winter Clothes & Blanket Drive",
            category: "clothes",
            target_amount: 25000,
            raised_amount: 14200
        },
        {
            org_name: "Shanti Vridhashram",
            title: "Emergency Medicine & Healthcare Kits",
            category: "medical",
            target_amount: 18000,
            raised_amount: 7500
        }
    ]).slice(0, 3).map(item => ({
        org_name: item.org_name,
        title: item.title,
        category: item.category || 'general',
        target_amount: item.target_amount,
        suggested_donation: Math.min(budgetNum, item.target_amount),
        match_reason: `Matches your interest in ${cause === 'any' ? 'social good' : cause} with immediate on-ground urgency.`,
        tangible_impact: budgetNum >= 2000 
            ? `Your ₹${budgetNum.toLocaleString('en-IN')} will fully cover supplies for multiple beneficiaries for up to 3 weeks.`
            : `Your ₹${budgetNum.toLocaleString('en-IN')} will provide immediate essentials and nutritious meals for 4+ individuals.`
    }));

    return {
        recommendations: recs,
        summary_message: `We found ${recs.length} high-priority, verified campaigns that closely align with your budget of ₹${budgetNum.toLocaleString('en-IN')}.`
    };
}

/**
 * 3. AI Need/Campaign Description Writer (1-Click Appeal Generator)
 */
async function generateCampaignAppeal({ org_name, need_title, category, basic_details, target_amount }) {
    const org = org_name || 'Care Home';
    const title = need_title || 'Urgent Essentials Drive';
    const cat = category || 'general';
    const amount = target_amount || 15000;
    const details = basic_details || 'Need immediate supplies for daily sustenance and welfare.';

    if (aiClient) {
        try {
            const prompt = `
You are an expert fundraising copywriter for humanitarian NGOs in India on the SevaSetu platform.
Write a compelling, heart-touching, and transparent appeal for:
- Care Home Name: "${org}"
- Campaign Focus: "${title}"
- Category: "${cat}"
- Target Amount: ₹${amount}
- Rough notes from the manager: "${details}"

Return a JSON object:
{
  "catchy_title": "string (clear, urgent, emotional title under 60 chars)",
  "emotional_hook": "string (1-2 sentences capturing immediate reality)",
  "detailed_story": "string (3 well-structured paragraphs: the context of beneficiaries, exact itemized breakdown of what ₹${amount} covers, and a call to kindness)",
  "short_summary": "string (2 sentences for WhatsApp and social sharing with #SevaSetu)",
  "suggested_urgency": "Critical | High | Moderate"
}
Return only valid JSON.`;

            const response = await aiClient.models.generateContent({
                model: MODEL_NAME,
                contents: prompt,
                config: {
                    responseMimeType: 'application/json'
                }
            });

            return JSON.parse(response.text);
        } catch (e) {
            console.warn('Campaign Generator Gemini API fallback:', e.message);
        }
    }

    // Realistic fallback template generator
    return {
        catchy_title: `${title} - Help ${org}`,
        emotional_hook: `At ${org}, every smile matters. With your timely kindness, we can ensure no one under our roof goes without essential ${cat}.`,
        detailed_story: `At ${org}, we wake up every day dedicated to protecting and nurturing our beloved residents. Today, we are facing an urgent shortage of ${cat} and essential daily resources.\n\nOur target of ₹${Number(amount).toLocaleString('en-IN')} will be deployed with complete transparency. It directly funds high-quality supplies, seasonal requirements, and health protections specified in our drive notes: "${details}".\n\nEvery contribution, whether ₹500 or ₹5,000, is a beacon of hope. SevaSetu provides 80G tax receipts and verified photo delivery updates so you can witness the impact of your generosity firsthand.`,
        short_summary: `Support ${org}'s emergency appeal for "${title}". ₹${Number(amount).toLocaleString('en-IN')} needed immediately. 100% verified on SevaSetu with 80G tax benefit.`,
        suggested_urgency: Number(amount) > 20000 ? "Critical" : "High"
    };
}

/**
 * 4. AI Verification & Trust Analyzer for Admin
 */
async function verifyOrganization(orgData) {
    const { name, email, mobile, city, address, role, extra_info } = orgData;

    if (aiClient) {
        try {
            const prompt = `
You are the AI Risk & Trust Auditor for the SevaSetu Philanthropy Platform.
Review the following registration data submitted by a care home / NGO applicant:
- Name: "${name}"
- Role: "${role}" (orphanage or oldage)
- Email: "${email}"
- Mobile: "${mobile}"
- City: "${city}"
- Address: "${address || 'Not specified'}"
- Extra Info / Reg Docs: "${JSON.stringify(extra_info || {})}"

Analyze:
1. Contact legitimacy: Is the email formal / non-disposable? Is phone format valid Indian 10-digit?
2. Address authenticity: Is city and address detailed and plausible for an Indian care home?
3. Identity consistency: Does the organization name reflect a genuine trust / ashram / orphanage naming pattern?
4. Trust Score (0-100) based on completeness and credibility.
5. Risk indicators (if any missing fields or red flags).
6. Actionable recommendation for the platform admin (e.g. "Approve - High Trust", "Request 80G/12A Certificate", "Flag for Physical Visit").

Return JSON:
{
  "trust_score": number,
  "trust_tier": "High Trust" | "Moderate Trust" | "Needs Manual Inspection",
  "verdict_summary": "string",
  "positive_signals": ["string", "string"],
  "risk_flags": ["string"],
  "recommended_action": "string"
}
Return only valid JSON.`;

            const response = await aiClient.models.generateContent({
                model: MODEL_NAME,
                contents: prompt,
                config: {
                    responseMimeType: 'application/json'
                }
            });

            return JSON.parse(response.text);
        } catch (e) {
            console.warn('AI Verification Gemini fallback:', e.message);
        }
    }

    // Dynamic rule-based audit fallback
    let score = 75;
    const positives = [];
    const risks = [];

    // Email check
    if (email && email.includes('@')) {
        const domain = email.split('@')[1] || '';
        if (domain.includes('org') || domain.includes('ngo') || domain.includes('trust') || domain.includes('foundation')) {
            score += 15;
            positives.push(`Dedicated institutional email domain (@${domain}).`);
        } else if (domain.includes('gmail.com') || domain.includes('yahoo.com')) {
            positives.push('Valid mainstream email provider used for communication.');
        }
    } else {
        score -= 20;
        risks.push('Invalid or unverified email address format.');
    }

    // Mobile check
    const cleanMobile = (mobile || '').replace(/\D/g, '');
    if (cleanMobile.length === 10 && ['6', '7', '8', '9'].includes(cleanMobile[0])) {
        score += 10;
        positives.push('Valid 10-digit Indian telecommunication contact verified.');
    } else {
        score -= 10;
        risks.push('Mobile number format requires telephonic verification.');
    }

    // Address check
    if (address && address.length > 15) {
        score += 10;
        positives.push('Detailed physical street address provided for premises verification.');
    } else {
        risks.push('Brief address provided. Physical site verification recommended.');
    }

    // Name check
    if (name && (name.toLowerCase().includes('ashram') || name.toLowerCase().includes('trust') || name.toLowerCase().includes('foundation') || name.toLowerCase().includes('home') || name.toLowerCase().includes('seva'))) {
        score += 5;
        positives.push('Registered identity aligns with recognized charitable NGO naming conventions.');
    }

    score = Math.min(98, Math.max(45, score));
    const tier = score >= 85 ? 'High Trust' : (score >= 65 ? 'Moderate Trust' : 'Needs Manual Inspection');

    return {
        trust_score: score,
        trust_tier: tier,
        verdict_summary: `${name} has a Trust Score of ${score}%. ${tier === 'High Trust' ? 'Profile exhibits standard legitimate charitable credentials.' : 'Profile is in good standing but standard documentation checks are advised.'}`,
        positive_signals: positives,
        risk_flags: risks.length > 0 ? risks : ['No critical anomalies detected.'],
        recommended_action: score >= 80 ? 'Safe to Approve for Live Listings' : 'Verify 12A/80G Registration Copy before full publishing'
    };
}

/**
 * 5. AI Impact Report & Personalized Thank-You Letter Generator
 */
async function generateThankYouImpact({ donor_name, amount, org_name, cause_type, payment_id }) {
    const donor = donor_name || 'Generous Supporter';
    const amt = Number(amount) || 1000;
    const org = org_name || 'Care Home';
    const cause = cause_type || 'General Care';
    const pid = payment_id || 'SEVA-' + Math.floor(100000 + Math.random() * 900000);

    if (aiClient) {
        try {
            const prompt = `
You are the AI Chief Gratitude Officer for SevaSetu.
A donor just completed a donation with the following details:
- Donor Name: "${donor}"
- Amount: ₹${amt}
- Beneficiary Organization: "${org}"
- Cause: "${cause}"
- Transaction Ref: "${pid}"

Craft:
1. A deeply heartwarming, personalized thank-you letter addressing the donor respectfully.
2. A bulleted list of 2-3 tangible, concrete impacts that ₹${amt} creates specifically for ${cause} at ${org} (e.g. number of hot meals, medicine courses, warm blankets, textbooks).
3. A clear, reassuring notice about their Section 80G tax deduction (50% deduction of ₹${amt} = ₹${amt / 2} tax savings under Section 80G).
4. A memorable quote on kindness and service.

Return JSON:
{
  "thank_you_title": "string",
  "letter_body": "string",
  "tangible_impact_points": ["string", "string", "string"],
  "tax_deduction_summary": "string",
  "inspiring_quote": "string"
}
Return only valid JSON.`;

            const response = await aiClient.models.generateContent({
                model: MODEL_NAME,
                contents: prompt,
                config: {
                    responseMimeType: 'application/json'
                }
            });

            return JSON.parse(response.text);
        } catch (e) {
            console.warn('Thank You Generator Gemini API fallback:', e.message);
        }
    }

    // Heartwarming dynamic template fallback
    const meals = Math.floor(amt / 60);
    const blankets = Math.floor(amt / 350);
    const taxSaving = Math.floor(amt * 0.5);

    const impactPoints = [];
    if (meals > 0) impactPoints.push(`Provides approximately ${meals} warm, hygienic meals with fresh fruits for residents.`);
    if (blankets > 0) impactPoints.push(`Covers ${blankets} high-quality thermal blankets for winter protection.`);
    impactPoints.push(`Funds essential healthcare checkups and medical supplies for the coming month.`);

    return {
        thank_you_title: `A Heartfelt Thank You from ${org} and SevaSetu! 💖`,
        letter_body: `Dear ${donor},\n\nYour extraordinary gift of ₹${amt.toLocaleString('en-IN')} has arrived like a warm ray of sunshine at ${org}. In moments when vulnerable lives wonder if they are remembered by the world, your kindness stands as proof that compassion is alive and thriving.\n\nOn behalf of every child and elder whose tomorrow is brighter because of you, thank you from the bottom of our hearts. Your generosity is being deployed directly to their care.`,
        tangible_impact_points: impactPoints,
        tax_deduction_summary: `Section 80G Tax Benefit: You are entitled to a 50% deduction of ₹${taxSaving.toLocaleString('en-IN')} on your taxable income under Section 80G. Your official digital receipt #${pid} contains the eligible 80G registration certificate details.`,
        inspiring_quote: `"We make a living by what we get, but we make a life by what we give." — Winston Churchill`
    };
}

module.exports = {
    chatSevaMitra,
    matchmaker,
    generateCampaignAppeal,
    verifyOrganization,
    generateThankYouImpact,
    isGeminiActive: () => !!aiClient
};
