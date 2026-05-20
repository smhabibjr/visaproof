import type { FullReport, Language, RiskScore } from '@/types';

// ── Inline SVG logo ───────────────────────────────────────────────────────────

const LOGO_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 200 200">
  <rect width="200" height="200" rx="40" fill="#1e3a5f"/>
  <rect x="52" y="54" width="72" height="90" rx="8" fill="#2563eb"/>
  <rect x="52" y="54" width="11" height="90" rx="4" fill="#1d4ed8"/>
  <line x1="70" y1="76" x2="116" y2="76" stroke="#93c5fd" stroke-width="3" stroke-linecap="round"/>
  <line x1="70" y1="90" x2="116" y2="90" stroke="#93c5fd" stroke-width="3" stroke-linecap="round"/>
  <rect x="70" y="103" width="22" height="22" rx="3" fill="#1d4ed8" stroke="#93c5fd" stroke-width="1.5"/>
  <circle cx="81" cy="109" r="4" fill="#93c5fd"/>
  <path d="M73,125 Q81,118 89,125" fill="#93c5fd"/>
  <path d="M118,112 L152,96 L152,124 Q152,148 118,162 Q84,148 84,124 L84,96 Z" fill="#059669"/>
  <polyline points="103,130 115,142 142,112" fill="none" stroke="white" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

// ── Risk config ───────────────────────────────────────────────────────────────

type RiskCfg = { bg: string; border: string; labelColor: string };

const RISK_CONFIG: Record<RiskScore, RiskCfg> = {
  SAFE:       { bg: '#f0fdf4', border: '#16a34a', labelColor: '#15803d' },
  SUSPICIOUS: { bg: '#fef9c3', border: '#ca8a04', labelColor: '#92400e' },
  HIGH_RISK:  { bg: '#fff7ed', border: '#ea580c', labelColor: '#c2410c' },
  SCAM:       { bg: '#fef2f2', border: '#dc2626', labelColor: '#b91c1c' },
};

// ── Date helpers ──────────────────────────────────────────────────────────────

const BN_DIGITS = '০১২৩৪৫৬৭৮৯';
const BN_MONTHS = ['জানুয়ারি','ফেব্রুয়ারি','মার্চ','এপ্রিল','মে','জুন','জুলাই','আগস্ট','সেপ্টেম্বর','অক্টোবর','নভেম্বর','ডিসেম্বর'];
const EN_MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

function toBn(n: number): string {
  return String(n).split('').map(c => BN_DIGITS[parseInt(c)] ?? c).join('');
}

function fmtDate(iso: string, lang: Language): string {
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    const day = d.getDate(), m = d.getMonth(), y = d.getFullYear();
    if (lang === 'bn') return `${toBn(day)} ${BN_MONTHS[m]}, ${toBn(y)}`;
    return `${day} ${EN_MONTHS[m]}, ${y}`;
  } catch { return iso; }
}

// ── Content helpers ───────────────────────────────────────────────────────────

function safe(v: string | null | undefined, lang: Language): string {
  if (!v || v.trim() === '') return lang === 'bn' ? 'তথ্য নেই' : 'N/A';
  return v;
}

function escHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function clampPct(n: number | undefined): number {
  return Math.min(100, Math.max(0, n || 0));
}

function boolCell(v: boolean | null | undefined, lang: Language): string {
  const isBn = lang === 'bn';
  if (v === null || v === undefined)
    return `<span style="color:#999;">— ${isBn ? 'তথ্য নেই' : 'N/A'}</span>`;
  if (v)
    return `<span style="color:#15803d;font-weight:500;">✓ ${isBn ? 'হ্যাঁ' : 'Yes'}</span>`;
  return `<span style="color:#b45309;font-weight:500;">✗ ${isBn ? 'না' : 'No'}</span>`;
}

function grammarCell(q: string | undefined, lang: Language): string {
  const isBn = lang === 'bn';
  if (q === 'GOOD')
    return `<span style="color:#15803d;font-weight:500;">✓ ${isBn ? 'ভালো' : 'Good'}</span>`;
  if (q === 'POOR')
    return `<span style="color:#b45309;font-weight:500;">⚠ ${isBn ? 'দুর্বল' : 'Poor'}</span>`;
  if (q === 'VERY_POOR')
    return `<span style="color:#dc2626;font-weight:500;">✗ ${isBn ? 'খুব দুর্বল' : 'Very Poor'}</span>`;
  return `<span style="color:#999;">—</span>`;
}

// ── Layout helpers ────────────────────────────────────────────────────────────

function divider(): string {
  return `<hr style="border:none;border-top:0.5px solid #ddd;margin:16px 0;" />`;
}

function sectionTitle(text: string): string {
  return `<div class="section-title">${text}</div>`;
}

function tableRow(label: string, value: string): string {
  return `<tr>
    <td class="td-label">${label}</td>
    <td class="td-value">${value}</td>
  </tr>`;
}

function verdictBox(text: string): string {
  if (!text?.trim()) return '';
  return `<div class="verdict">${escHtml(text)}</div>`;
}

function suspiciousList(items: string[], lang: Language): string {
  if (!items.length) return '';
  const heading = lang === 'bn' ? 'সন্দেহজনক বিষয়' : 'Suspicious Elements';
  const rows    = items.map(item =>
    `<div class="susp-item"><span class="bullet-amber">—</span>${escHtml(item)}</div>`
  ).join('');
  return `<div style="margin-top:8px;">
    <div style="font-size:9px;font-weight:bold;text-transform:uppercase;color:#b45309;margin-bottom:4px;">${heading}</div>
    ${rows}
  </div>`;
}

function flagItem(text: string, bulletColor: string): string {
  return `<div class="flag-row">
    <span style="color:${bulletColor};margin-right:5px;flex-shrink:0;">—</span>
    <span class="flag-text">${escHtml(text)}</span>
  </div>`;
}

function actionItem(text: string, index: number): string {
  return `<div class="action-row">
    <div class="action-num">${index + 1}</div>
    <span class="action-text">${escHtml(text)}</span>
  </div>`;
}

// ── Main export ───────────────────────────────────────────────────────────────

export function buildPDFHTML(report: FullReport, qrSvg: string): string {
  try {
    const lang  = report.language ?? 'bn';
    const isBn  = lang === 'bn';
    const a     = report.analysis;
    const uv    = a.universityVerification;
    const ol    = a.offerLetterAnalysis;
    const inv   = a.invoiceAnalysis;
    const pct   = clampPct(a.riskPercentage);
    const risk  = RISK_CONFIG[a.riskScore] ?? RISK_CONFIG.HIGH_RISK;

    // ── Bilingual labels ──────────────────────────────────────────────────────
    const L = isBn ? {
      universityVerification: 'বিশ্ববিদ্যালয় যাচাই',
      offerLetterAnalysis:    'অফার লেটার বিশ্লেষণ',
      invoiceAnalysis:        'ইনভয়েস বিশ্লেষণ',
      flagsTitle:             'সতর্কতা ও ইতিবাচক দিক',
      redFlags:               'সতর্কতা',
      positivePoints:         'ইতিবাচক দিক',
      recommendedActions:     'পরামর্শ',
      riskAssessment:         'ঝুঁকি মূল্যায়ন',
      riskScore:              'ঝুঁকির মাত্রা',
      university:             'বিশ্ববিদ্যালয়',
      country:                'দেশ',
      founded:                'প্রতিষ্ঠার বছর',
      accredited:             'স্বীকৃতি',
      accreditationBody:      'স্বীকৃতিপ্রদানকারী',
      regNumber:              'নিবন্ধন নম্বর',
      website:                'ওয়েবসাইট',
      websiteMatch:           'ওয়েবসাইট মিলেছে',
      ugcRecognized:          'UGC স্বীকৃত',
      worldRanking:           'বিশ্ব র‍্যাংকিং',
      officialLetterhead:     'অফিসিয়াল লেটারহেড',
      emailLegitimate:        'ইমেইল বৈধ',
      detectedEmail:          'শনাক্ত ইমেইল',
      digitalSignature:       'ডিজিটাল স্বাক্ষর',
      grammarQuality:         'ব্যাকরণের মান',
      paymentDestination:     'পেমেন্ট গন্তব্য',
      personalAccount:        'ব্যক্তিগত অ্যাকাউন্ট',
      amountReasonable:       'পরিমাণ যুক্তিসঙ্গত',
      currency:               'মুদ্রা',
      paymentMethod:          'পেমেন্ট পদ্ধতি',
      getApp:                 'অ্যাপটি ডাউনলোড করুন',
      noneFound:              'কোনো তথ্য নেই',
      noRecommendations:      'কোনো পরামর্শ নেই',
    } : {
      universityVerification: 'University Verification',
      offerLetterAnalysis:    'Offer Letter Analysis',
      invoiceAnalysis:        'Invoice Analysis',
      flagsTitle:             'Flags & Positive Points',
      redFlags:               'Red Flags',
      positivePoints:         'Positive Points',
      recommendedActions:     'Recommended Actions',
      riskAssessment:         'Risk Assessment',
      riskScore:              'Risk Score',
      university:             'University',
      country:                'Country',
      founded:                'Founded',
      accredited:             'Accredited',
      accreditationBody:      'Accreditation Body',
      regNumber:              'Registration No.',
      website:                'Official Website',
      websiteMatch:           'Website Match',
      ugcRecognized:          'UGC Recognized',
      worldRanking:           'World Ranking',
      officialLetterhead:     'Official Letterhead',
      emailLegitimate:        'Email Legitimate',
      detectedEmail:          'Detected Email',
      digitalSignature:       'Digital Signature',
      grammarQuality:         'Grammar Quality',
      paymentDestination:     'Payment Destination',
      personalAccount:        'Personal Account',
      amountReasonable:       'Amount Reasonable',
      currency:               'Currency',
      paymentMethod:          'Payment Method',
      getApp:                 'Get the App',
      noneFound:              'None found',
      noRecommendations:      'No recommendations',
    };

    // ── Risk label ────────────────────────────────────────────────────────────
    const riskLabel = (isBn
      ? { SAFE: 'নিরাপদ', SUSPICIOUS: 'সন্দেহজনক', HIGH_RISK: 'উচ্চ ঝুঁকি', SCAM: 'স্ক্যাম' } as Record<RiskScore, string>
      : { SAFE: 'Safe',   SUSPICIOUS: 'Suspicious',  HIGH_RISK: 'High Risk',  SCAM: 'Scam'  } as Record<RiskScore, string>
    )[a.riskScore];

    // ── Arrays ────────────────────────────────────────────────────────────────
    const redFlags  = a.redFlags         ?? [];
    const posPoints = a.positivePoints   ?? [];
    const actions   = a.recommendedActions ?? [];

    // ── Flags HTML ────────────────────────────────────────────────────────────
    const redFlagsHtml = redFlags.length
      ? redFlags.map(f => flagItem(f, '#b45309')).join('')
      : `<div style="font-size:9px;color:#999;font-style:italic;">${L.noneFound}</div>`;

    const posPointsHtml = posPoints.length
      ? posPoints.map(p => flagItem(p, '#15803d')).join('')
      : `<div style="font-size:9px;color:#999;font-style:italic;">${L.noneFound}</div>`;

    // ── Actions HTML ──────────────────────────────────────────────────────────
    const actionsHtml = actions.length
      ? actions.map((action, i) => actionItem(action, i)).join('')
      : `<div style="font-size:9.5px;color:#999;font-style:italic;">${L.noRecommendations}</div>`;

    // ── Invoice section (only if found === true) ──────────────────────────────
    const invoiceSection = inv?.found === true ? `
      ${divider()}
      <div class="section">
        ${sectionTitle(L.invoiceAnalysis)}
        <table class="info-table">
          ${tableRow(L.paymentDestination, escHtml(safe(inv.paymentDestination, lang)))}
          <tr${inv.isPersonalAccount === true ? ' style="background:#fff0f0;"' : ''}>
            <td class="td-label">${L.personalAccount}</td>
            <td class="td-value">${
              inv.isPersonalAccount === true
                ? `<span style="color:#dc2626;font-weight:600;">⚠ ${isBn ? 'হ্যাঁ — বিপজ্জনক' : 'Yes — DANGEROUS'}</span>`
                : boolCell(inv.isPersonalAccount ?? null, lang)
            }</td>
          </tr>
          ${tableRow(L.amountReasonable, boolCell(inv.amountReasonable ?? null, lang))}
          ${tableRow(L.currency,         escHtml(safe(inv.currency,        lang)))}
          ${tableRow(L.paymentMethod,    escHtml(safe(inv.paymentMethod,   lang)))}
        </table>
        ${suspiciousList(inv.suspiciousElements ?? [], lang)}
        ${verdictBox(inv.verdict ?? '')}
      </div>` : '';

    // ── Full document ─────────────────────────────────────────────────────────
    return `<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="UTF-8" />
  <style>
    /* ── Bengali conjunct fix: letter-spacing MUST be 0 ── */
    * {
      letter-spacing: 0 !important;
      word-spacing:   0 !important;
      -webkit-font-smoothing: antialiased;
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    /* ── A4 page setup ── */
    @page {
      size: A4;
      margin: 2.54cm 2cm 2cm 2cm;
    }
    /* ── Base typography ── */
    body {
      font-family: 'Noto Sans Bengali', 'Noto Sans', Arial, sans-serif;
      font-size: 10.5px;
      color: #111;
      background: #fff;
      width: 100%;
    }
    /* ── Language-specific rules ── */
    .lang-bn {
      font-family: 'Noto Sans Bengali', Arial, sans-serif;
      line-height: 1.9;
      word-break: keep-all;
    }
    .lang-en {
      font-family: Arial, Helvetica, sans-serif;
      line-height: 1.6;
    }
    /* ── Page break control ── */
    .section       { page-break-inside: avoid; break-inside: avoid; }
    .section-title { page-break-after:  avoid; break-after:  avoid;
                     font-size:8.5px; font-weight:bold; text-transform:uppercase;
                     color:#888; margin-bottom:10px; }
    .no-break      { page-break-inside: avoid; break-inside: avoid; }
    .page-break    { page-break-before: always; break-before: always; }
    table          { page-break-inside: auto; width:100%; border-collapse:collapse; }
    tr             { page-break-inside: avoid; break-inside: avoid; }
    /* ── Info table ── */
    .info-table    { width:100%; border-collapse:collapse; font-size:10px; }
    .td-label      { padding:5px 8px 5px 0; border-bottom:0.5px solid #f0f0f0;
                     color:#888; width:38%; font-size:9.5px; vertical-align:top; }
    .td-value      { padding:5px 0; border-bottom:0.5px solid #f0f0f0;
                     color:#111; font-weight:500; vertical-align:top; }
    /* ── Verdict ── */
    .verdict       { font-size:9.5px; color:#666; font-style:italic; line-height:1.6;
                     margin-top:8px; padding-top:8px; border-top:0.5px solid #eee; }
    /* ── Suspicious items ── */
    .susp-item     { display:flex; align-items:flex-start;
                     font-size:9.5px; color:#444;
                     padding:4px 0 4px 0; border-bottom:0.5px solid #f5f5f5; }
    .bullet-amber  { color:#b45309; margin-right:5px; flex-shrink:0; }
    /* ── Flag rows ── */
    .flag-row      { display:flex; align-items:flex-start; padding:4px 0; border-bottom:0.5px solid #f5f5f5; }
    .flag-text     { font-size:9.5px; color:#333; line-height:1.4; }
    /* ── Action rows ── */
    .action-row    { display:flex; align-items:flex-start; padding:6px 0;
                     border-bottom:0.5px solid #f5f5f5; line-height:1.4; }
    .action-num    { width:16px; height:16px; border-radius:50%;
                     background:#111; color:#fff;
                     font-size:8px; font-weight:bold;
                     text-align:center; line-height:16px;
                     flex-shrink:0; margin-right:10px; margin-top:1px; }
    .action-text   { font-size:9.5px; color:#222; padding-top:1px; }
  </style>
</head>
<body class="${isBn ? 'lang-bn' : 'lang-en'}">

  <!-- ── HEADER ───────────────────────────────────────────────────────────── -->
  <div style="display:flex;justify-content:space-between;align-items:flex-start;padding-bottom:14px;border-bottom:1.5px solid #111;">
    <div style="display:flex;align-items:center;gap:10px;">
      ${LOGO_SVG}
      <div>
        <div style="font-size:17px;font-weight:bold;color:#1e3a5f;line-height:1.1;">VisaProof</div>
        <div style="font-size:8px;color:#888;text-transform:uppercase;margin-top:3px;">Analysis Report</div>
      </div>
    </div>
    <div style="text-align:right;">
      <div style="font-size:9px;color:#999;text-transform:uppercase;">Report ID</div>
      <div style="font-size:10px;font-weight:bold;font-family:monospace;margin-top:2px;">${report.id.substring(0, 16)}</div>
      <div style="font-size:9px;color:#999;text-transform:uppercase;margin-top:6px;">Generated</div>
      <div style="font-size:10px;font-weight:bold;margin-top:2px;">${fmtDate(report.createdAt, lang)}</div>
    </div>
  </div>

  <!-- ── RISK ASSESSMENT BLOCK ────────────────────────────────────────────── -->
  <div class="no-break" style="margin-top:20px;background:${risk.bg};border-left:4px solid ${risk.border};padding:14px 16px;">
    <div style="font-size:10px;font-weight:bold;text-transform:uppercase;color:${risk.labelColor};margin-bottom:8px;">${L.riskAssessment}</div>
    <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:6px;">
      <div style="font-size:20px;font-weight:bold;color:#111;">${riskLabel}</div>
      <div style="font-size:13px;color:#555;">
        ${L.riskScore}: <span style="font-size:16px;font-weight:bold;color:${risk.labelColor};margin-left:4px;">${pct}%</span>
      </div>
    </div>
    <div style="font-size:11px;font-weight:500;color:#444;margin-bottom:8px;">
      ${escHtml(safe(uv?.name, lang))}${uv?.country ? ` — ${escHtml(uv.country)}` : ''}
    </div>
    <div style="font-size:10.5px;color:#444;">${escHtml(safe(a.summary, lang))}</div>
  </div>

  ${divider()}

  <!-- ── UNIVERSITY VERIFICATION ──────────────────────────────────────────── -->
  <div class="section">
    ${sectionTitle(L.universityVerification)}
    <table class="info-table">
      ${tableRow(L.university,        escHtml(safe(uv?.name,               lang)))}
      ${tableRow(L.country,           escHtml(safe(uv?.country,            lang)))}
      ${tableRow(L.founded,           escHtml(safe(uv?.foundedYear,        lang)))}
      ${tableRow(L.accredited,        boolCell(uv?.isAccredited    ?? null, lang))}
      ${tableRow(L.accreditationBody, escHtml(safe(uv?.accreditationBody,  lang)))}
      ${tableRow(L.regNumber,         escHtml(safe(uv?.registrationNumber, lang)))}
      ${tableRow(L.website,           escHtml(safe(uv?.officialWebsite,    lang)))}
      ${tableRow(L.websiteMatch,      boolCell(uv?.websiteMatch    ?? null, lang))}
      ${tableRow(L.ugcRecognized,     boolCell(uv?.ugcRecognized   ?? null, lang))}
      ${tableRow(L.worldRanking,      escHtml(safe(uv?.worldRanking,       lang)))}
    </table>
    ${verdictBox(uv?.verdict ?? '')}
  </div>

  ${divider()}

  <!-- ── OFFER LETTER ANALYSIS ────────────────────────────────────────────── -->
  <div class="section">
    ${sectionTitle(L.offerLetterAnalysis)}
    <table class="info-table">
      ${tableRow(L.officialLetterhead, boolCell(ol?.hasOfficialLetterhead  ?? null, lang))}
      ${tableRow(L.emailLegitimate,    boolCell(ol?.emailDomainLegitimate  ?? null, lang))}
      ${tableRow(L.detectedEmail,      escHtml(safe(ol?.detectedEmail,     lang)))}
      ${tableRow(L.digitalSignature,   boolCell(ol?.hasDigitalSignature    ?? null, lang))}
      ${tableRow(L.grammarQuality,     grammarCell(ol?.grammarQuality,     lang))}
    </table>
    ${suspiciousList(ol?.suspiciousElements ?? [], lang)}
    ${verdictBox(ol?.verdict ?? '')}
  </div>

  ${invoiceSection}

  ${divider()}

  <!-- ── FLAGS & POSITIVE POINTS ──────────────────────────────────────────── -->
  <div class="section no-break">
    ${sectionTitle(L.flagsTitle)}
    <table style="width:100%;border-collapse:collapse;">
      <tr>
        <td style="width:50%;vertical-align:top;padding-right:12px;">
          <div style="font-size:9px;font-weight:bold;text-transform:uppercase;color:#b45309;margin-bottom:6px;">${L.redFlags}</div>
          ${redFlagsHtml}
        </td>
        <td style="width:50%;vertical-align:top;padding-left:12px;border-left:0.5px solid #eee;">
          <div style="font-size:9px;font-weight:bold;text-transform:uppercase;color:#15803d;margin-bottom:6px;">${L.positivePoints}</div>
          ${posPointsHtml}
        </td>
      </tr>
    </table>
  </div>

  ${divider()}

  <!-- ── RECOMMENDED ACTIONS ──────────────────────────────────────────────── -->
  <div class="section">
    ${sectionTitle(L.recommendedActions)}
    ${actionsHtml}
  </div>

  <!-- ── AI DISCLAIMER ────────────────────────────────────────────────────── -->
  <div class="no-break" style="margin-top:14px;padding:10px 12px;background:#f9f9f9;border-left:2px solid #ccc;">
    <p style="font-size:8.5px;color:#555;font-style:italic;line-height:1.7;margin:0;">
      This report was generated using deep AI analysis across multiple verification parameters.
      Like all AI systems,
      <a href="https://support.anthropic.com/en/articles/8525154-claude-is-providi" style="color:#555;">it may occasionally produce incorrect or incomplete results</a>.
      Always independently verify findings through official government channels, the institution's
      official website, and relevant embassies before making any financial commitment.
      This report does not constitute legal or financial advice.
    </p>
  </div>

  <!-- ── APP PROMO ─────────────────────────────────────────────────────────── -->
  <div class="no-break" style="margin-top:16px;border:1px solid #e5e7eb;border-radius:6px;padding:14px 16px;display:flex;align-items:center;gap:16px;">
    <div style="flex:1;">
      <div style="font-size:9px;font-weight:bold;text-transform:uppercase;color:#888;margin-bottom:8px;">${L.getApp}</div>
      <div style="font-size:13px;font-weight:500;color:#111;margin-bottom:4px;">Verify any university offer letter or invoice instantly.</div>
      <div style="font-size:12px;margin-bottom:10px;">
        <span style="font-weight:bold;color:#1e3a5f;">VisaProof</span>
        <span style="color:#444;"> — স্ক্যাম থেকে সুরিক্ষত থাকুন।</span>
      </div>
      <div style="font-size:9px;color:#888;margin-bottom:3px;">Download on Google Play Store</div>
      <div style="font-size:9px;">
        <span style="color:#1e3a5f;font-weight:500;">play.google.com/store/apps/visaproof</span>
        <span style="color:#aaa;margin-left:6px;">· coming soon</span>
      </div>
    </div>
    <div style="text-align:center;flex-shrink:0;">
      <div style="width:80px;height:80px;">${qrSvg}</div>
      <div style="font-size:8px;color:#888;margin-top:4px;">Scan to download</div>
    </div>
  </div>

  <!-- ── FOOTER ────────────────────────────────────────────────────────────── -->
  <div class="no-break" style="margin-top:20px;border-top:1.5px solid #111;padding-top:10px;display:flex;justify-content:space-between;align-items:center;">
    <div style="font-size:8.5px;color:#777;font-style:italic;">
      Verify before you trust · বিশ্বাস করার আগে যাচাই করুন
    </div>
    <div style="font-size:8.5px;color:#555;">
      Built with ♥ by
      <a href="https://www.linkedin.com/in/smhabibjr/" style="color:#1e3a5f;">smhabibjr</a>
      at
      <a href="https://www.adaptifyloop.com" style="color:#1e3a5f;">Adaptify Loop</a>
      &nbsp;·&nbsp; VisaProof © ${new Date().getFullYear()}
    </div>
  </div>

</body>
</html>`;
  } catch {
    // যদি কোনো কারণে crash হয়, minimal fallback দেওয়া হয়
    return `<!DOCTYPE html><html><head><meta charset="UTF-8"/></head><body style="font-family:Arial;padding:20px;color:#666;"><p>Report generation error. Please try again.</p></body></html>`;
  }
}
