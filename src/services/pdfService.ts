import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import QRCode from 'qrcode';

import type { FullReport, Language, RiskScore } from '@/types';

const PLAY_STORE_URL = 'https://play.google.com/store/apps/visaproof';

// ── Risk config ───────────────────────────────────────────────────────────────

type RiskConfig = { bg: string; border: string };

const RISK_CONFIG: Record<RiskScore, RiskConfig> = {
  SAFE:       { bg: '#f0fdf4', border: '#16a34a' },
  SUSPICIOUS: { bg: '#fef3c7', border: '#d97706' },
  HIGH_RISK:  { bg: '#fffbf5', border: '#b45309' },
  SCAM:       { bg: '#fee2e2', border: '#dc2626' },
};

// ── Inline SVG logo (passport + shield, 36×36) ───────────────────────────────

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

function safeStr(value: string | null | undefined, lang: Language): string {
  if (!value || value.trim() === '') return lang === 'bn' ? 'তথ্য নেই' : 'N/A';
  return value;
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

function boolCell(value: boolean | null | undefined, lang: Language): string {
  if (value === null || value === undefined)
    return `<span style="color:#999;">—</span>`;
  if (value)
    return `<span style="color:#15803d;font-weight:500;">✓ ${lang === 'bn' ? 'হ্যাঁ' : 'Yes'}</span>`;
  return `<span style="color:#b45309;font-weight:500;">✗ ${lang === 'bn' ? 'না' : 'No'}</span>`;
}

function grammarCell(q: string | undefined, lang: Language): string {
  const isBn = lang === 'bn';
  if (q === 'GOOD')      return `<span style="color:#15803d;font-weight:500;">✓ ${isBn ? 'ভালো' : 'Good'}</span>`;
  if (q === 'POOR')      return `<span style="color:#b45309;font-weight:500;">⚠ ${isBn ? 'দুর্বল' : 'Poor'}</span>`;
  if (q === 'VERY_POOR') return `<span style="color:#dc2626;font-weight:500;">✗ ${isBn ? 'খুব দুর্বল' : 'Very Poor'}</span>`;
  return `<span style="color:#999;">—</span>`;
}

// ── Layout helpers ────────────────────────────────────────────────────────────

function divider(): string {
  return `<hr style="border:none;border-top:0.5px solid #ddd;margin:16px 0;" />`;
}

function sectionTitle(text: string): string {
  return `<div style="font-size:8.5px;font-weight:bold;text-transform:uppercase;color:#666;letter-spacing:2px;margin-bottom:10px;">${text}</div>`;
}

function tableRow(label: string, value: string): string {
  return `<tr>
    <td style="padding:5px 0;font-size:9.5px;color:#666;width:38%;vertical-align:top;border-bottom:0.5px solid #f0f0f0;">${label}</td>
    <td style="padding:5px 0;font-size:10px;font-weight:500;color:#111;vertical-align:top;border-bottom:0.5px solid #f0f0f0;">${value}</td>
  </tr>`;
}

function verdictBox(text: string): string {
  if (!text.trim()) return '';
  return `<div style="font-size:9.5px;color:#666;font-style:italic;line-height:1.5;margin-top:8px;padding-top:8px;border-top:0.5px solid #eee;">${escHtml(text)}</div>`;
}

function suspiciousList(items: string[], lang: Language): string {
  if (!items.length) return '';
  const label = lang === 'bn' ? 'সন্দেহজনক বিষয়' : 'Suspicious Elements';
  const rows  = items.map(item => `
    <div style="display:flex;align-items:flex-start;padding:4px 0 4px 14px;border-bottom:0.5px solid #f5f5f5;">
      <span style="color:#b45309;margin-right:6px;flex-shrink:0;">—</span>
      <span style="font-size:9.5px;color:#333;">${escHtml(item)}</span>
    </div>`).join('');
  return `<div style="margin-top:8px;">
    <div style="font-size:9px;font-weight:bold;text-transform:uppercase;color:#b45309;letter-spacing:0.5px;margin-bottom:4px;">${label}</div>
    ${rows}
  </div>`;
}

function flagItem(text: string, bulletColor: string): string {
  return `<div style="display:flex;align-items:flex-start;padding:4px 0;border-bottom:0.5px solid #f5f5f5;">
    <span style="color:${bulletColor};margin-right:6px;flex-shrink:0;">—</span>
    <span style="font-size:9.5px;color:#333;line-height:1.4;">${escHtml(text)}</span>
  </div>`;
}

function actionItem(text: string, index: number): string {
  return `<div style="display:flex;align-items:flex-start;padding:6px 0;border-bottom:0.5px solid #f5f5f5;line-height:1.4;">
    <div style="width:16px;height:16px;border-radius:50%;background:#111;flex-shrink:0;margin-right:10px;margin-top:1px;text-align:center;line-height:16px;">
      <span style="font-size:8px;font-weight:bold;color:#fff;font-family:Arial;">${index + 1}</span>
    </div>
    <span style="font-size:9.5px;color:#222;padding-top:1px;">${escHtml(text)}</span>
  </div>`;
}

// ── Full HTML document ────────────────────────────────────────────────────────

function buildReportHTML(report: FullReport, qrSvg: string): string {
  const lang  = report.language ?? 'bn';
  const isBn  = lang === 'bn';
  const a     = report.analysis;
  const uv    = a.universityVerification;
  const ol    = a.offerLetterAnalysis;
  const inv   = a.invoiceAnalysis;
  const pct   = clampPct(a.riskPercentage);
  const risk  = RISK_CONFIG[a.riskScore] ?? RISK_CONFIG.HIGH_RISK;

  const l = (bn: string, en: string) => (isBn ? bn : en);

  const riskLabel = (isBn
    ? { SAFE: 'নিরাপদ', SUSPICIOUS: 'সন্দেহজনক', HIGH_RISK: 'উচ্চ ঝুঁকি', SCAM: 'স্ক্যাম' } as Record<RiskScore, string>
    : { SAFE: 'Safe',    SUSPICIOUS: 'Suspicious',  HIGH_RISK: 'High Risk',   SCAM: 'Scam'  } as Record<RiskScore, string>
  )[a.riskScore];

  const redFlags  = a.redFlags    ?? [];
  const posPoints = a.positivePoints ?? [];
  const actions   = a.recommendedActions ?? [];

  const redFlagsHtml  = redFlags.length
    ? redFlags.map(f => flagItem(f, '#b45309')).join('')
    : `<div style="font-size:9px;color:#999;font-style:italic;">${l('কোনো সতর্কতা নেই', 'None found')}</div>`;

  const posPointsHtml = posPoints.length
    ? posPoints.map(p => flagItem(p, '#15803d')).join('')
    : `<div style="font-size:9px;color:#999;font-style:italic;">${l('কোনো ইতিবাচক দিক নেই', 'None found')}</div>`;

  const actionsHtml = actions.length
    ? actions.map((action, i) => actionItem(action, i)).join('')
    : `<div style="font-size:9.5px;color:#999;font-style:italic;">${l('কোনো পরামর্শ নেই', 'No recommendations')}</div>`;

  const invoiceSection = inv?.found === true ? `
    ${divider()}
    <div>
      ${sectionTitle(l('ইনভয়েস বিশ্লেষণ', 'Invoice Analysis'))}
      <table style="width:100%;border-collapse:collapse;">
        ${tableRow(l('পেমেন্ট গন্তব্য',      'Payment Destination'), escHtml(safeStr(inv.paymentDestination, lang)))}
        ${tableRow(l('ব্যক্তিগত অ্যাকাউন্ট', 'Personal Account'),
            inv.isPersonalAccount === true
              ? `<span style="color:#dc2626;font-weight:600;">⚠ ${l('হ্যাঁ — বিপজ্জনক', 'Yes — Dangerous')}</span>`
              : boolCell(inv.isPersonalAccount ?? null, lang))}
        ${tableRow(l('পরিমাণ যুক্তিসংগত',   'Amount Reasonable'),   boolCell(inv.amountReasonable ?? null, lang))}
        ${tableRow(l('মুদ্রা',               'Currency'),            escHtml(safeStr(inv.currency, lang)))}
        ${tableRow(l('পেমেন্ট পদ্ধতি',       'Payment Method'),      escHtml(safeStr(inv.paymentMethod, lang)))}
      </table>
      ${suspiciousList(inv.suspiciousElements ?? [], lang)}
      ${verdictBox(inv.verdict ?? '')}
    </div>` : '';

  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="UTF-8" />
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: Arial, Helvetica, sans-serif;
      background: #ffffff;
      color: #111111;
      font-size: 10px;
      padding: 2.54cm 2cm 2cm 2cm;
    }
  </style>
</head>
<body>

  <!-- ── SECTION 1: HEADER ───────────────────────────────────────────────── -->
  <div style="display:flex;justify-content:space-between;align-items:flex-start;padding-bottom:14px;border-bottom:1.5px solid #111;">
    <div style="display:flex;align-items:center;gap:10px;">
      ${LOGO_SVG}
      <div>
        <div style="font-size:17px;font-weight:bold;color:#1e3a5f;letter-spacing:-0.3px;line-height:1.1;">VisaProof</div>
        <div style="font-size:8px;color:#888;text-transform:uppercase;letter-spacing:1.5px;margin-top:3px;">Analysis Report</div>
      </div>
    </div>
    <div style="text-align:right;">
      <div style="font-size:9px;color:#999;text-transform:uppercase;letter-spacing:0.8px;">Report ID</div>
      <div style="font-size:10px;font-weight:bold;font-family:monospace;margin-top:2px;">${report.id.substring(0, 16)}</div>
      <div style="font-size:9px;color:#999;text-transform:uppercase;letter-spacing:0.8px;margin-top:6px;">Generated</div>
      <div style="font-size:10px;font-weight:bold;margin-top:2px;">${fmtDate(report.createdAt, lang)}</div>
    </div>
  </div>

  <!-- ── SECTION 2: RISK ASSESSMENT ─────────────────────────────────────── -->
  <div style="margin-top:20px;background:${risk.bg};border-left:4px solid ${risk.border};padding:14px 16px;">
    <div style="font-size:10px;font-weight:bold;text-transform:uppercase;color:#b45309;letter-spacing:1.5px;margin-bottom:8px;">
      ${l('ঝুঁকি মূল্যায়ন', 'Risk Assessment')}
    </div>
    <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:6px;">
      <div style="font-size:20px;font-weight:bold;color:#111;">${riskLabel}</div>
      <div style="font-size:13px;color:#555;">
        ${l('ঝুঁকির মাত্রা:', 'Risk Score:')}
        <span style="font-size:16px;font-weight:bold;color:#b45309;margin-left:4px;">${pct}%</span>
      </div>
    </div>
    <div style="font-size:11px;font-weight:500;color:#444;margin-bottom:8px;">${escHtml(safeStr(uv?.name, lang))}</div>
    <div style="font-size:10.5px;color:#444;line-height:1.6;">${escHtml(safeStr(a.summary, lang))}</div>
  </div>

  ${divider()}

  <!-- ── SECTION 4: UNIVERSITY VERIFICATION ─────────────────────────────── -->
  <div>
    ${sectionTitle(l('বিশ্ববিদ্যালয় যাচাই', 'University Verification'))}
    <table style="width:100%;border-collapse:collapse;">
      ${tableRow(l('বিশ্ববিদ্যালয়',           'University'),       escHtml(safeStr(uv?.name, lang)))}
      ${tableRow(l('দেশ',                       'Country'),          escHtml(safeStr(uv?.country, lang)))}
      ${tableRow(l('প্রতিষ্ঠা বছর',            'Founded'),          escHtml(safeStr(uv?.foundedYear, lang)))}
      ${tableRow(l('স্বীকৃতিপ্রাপ্ত',          'Accredited'),       boolCell(uv?.isAccredited ?? null, lang))}
      ${tableRow(l('স্বীকৃতি প্রদানকারী',      'Accreditation By'), escHtml(safeStr(uv?.accreditationBody, lang)))}
      ${tableRow(l('রেজিস্ট্রেশন নম্বর',       'Reg. Number'),      escHtml(safeStr(uv?.registrationNumber, lang)))}
      ${tableRow(l('অফিশিয়াল ওয়েবসাইট',      'Website'),          escHtml(safeStr(uv?.officialWebsite, lang)))}
      ${tableRow(l('ওয়েবসাইট মিলেছে',         'Website Match'),    boolCell(uv?.websiteMatch ?? null, lang))}
      ${tableRow(l('UGC স্বীকৃত',              'UGC Recognized'),   boolCell(uv?.ugcRecognized ?? null, lang))}
      ${tableRow(l('বিশ্ব র‍্যাংকিং',          'World Ranking'),    escHtml(safeStr(uv?.worldRanking, lang)))}
    </table>
    ${verdictBox(uv?.verdict ?? '')}
  </div>

  ${divider()}

  <!-- ── SECTION 5: OFFER LETTER ANALYSIS ───────────────────────────────── -->
  <div>
    ${sectionTitle(l('অফার লেটার বিশ্লেষণ', 'Offer Letter Analysis'))}
    <table style="width:100%;border-collapse:collapse;">
      ${tableRow(l('অফিশিয়াল লেটারহেড', 'Official Letterhead'), boolCell(ol?.hasOfficialLetterhead ?? null, lang))}
      ${tableRow(l('ইমেইল ডোমেইন বৈধ',   'Email Legitimate'),    boolCell(ol?.emailDomainLegitimate ?? null, lang))}
      ${tableRow(l('শনাক্ত ইমেইল',        'Detected Email'),      escHtml(safeStr(ol?.detectedEmail, lang)))}
      ${tableRow(l('ডিজিটাল স্বাক্ষর',   'Digital Signature'),   boolCell(ol?.hasDigitalSignature ?? null, lang))}
      ${tableRow(l('ব্যাকরণের মান',       'Grammar Quality'),     grammarCell(ol?.grammarQuality, lang))}
    </table>
    ${suspiciousList(ol?.suspiciousElements ?? [], lang)}
    ${verdictBox(ol?.verdict ?? '')}
  </div>

  ${invoiceSection}

  ${divider()}

  <!-- ── SECTION 7: FLAGS & POSITIVE POINTS ─────────────────────────────── -->
  <div>
    ${sectionTitle(l('সতর্কতা ও ইতিবাচক দিক', 'Flags & Positive Points'))}
    <div style="display:flex;gap:16px;">
      <div style="flex:1;">
        <div style="font-size:9px;font-weight:bold;text-transform:uppercase;color:#b45309;letter-spacing:1px;margin-bottom:6px;">
          ${l('সতর্কতা', 'Red Flags')}
        </div>
        ${redFlagsHtml}
      </div>
      <div style="flex:1;">
        <div style="font-size:9px;font-weight:bold;text-transform:uppercase;color:#15803d;letter-spacing:1px;margin-bottom:6px;">
          ${l('ইতিবাচক দিক', 'Positive Points')}
        </div>
        ${posPointsHtml}
      </div>
    </div>
  </div>

  ${divider()}

  <!-- ── SECTION 8: RECOMMENDED ACTIONS ─────────────────────────────────── -->
  <div>
    ${sectionTitle(l('পরামর্শ', 'Recommended Actions'))}
    ${actionsHtml}
  </div>

  <!-- ── SECTION 9: AI DISCLAIMER ───────────────────────────────────────── -->
  <div style="margin-top:14px;padding:10px 12px;background:#f9f9f9;border-left:2px solid #ccc;">
    <p style="font-size:8.5px;color:#555;font-style:italic;line-height:1.7;margin:0;">
      This report was generated using deep AI analysis across multiple verification parameters.
      Like all AI systems,
      <a href="https://support.anthropic.com/en/articles/8525154-claude-is-providi" style="color:#555;">it may occasionally produce incorrect or incomplete results</a>.
      Always independently verify findings through official government channels, the institution's
      official website, and relevant embassies before making any financial commitment.
      This report does not constitute legal or financial advice.
    </p>
  </div>

  <!-- ── GET THE APP PROMO CARD ───────────────────────────────────────────── -->
  <div style="margin-top:16px;border:1px solid #e5e7eb;border-radius:6px;padding:14px 16px;background:#fff;display:flex;align-items:center;gap:16px;">
    <div style="flex:1;">
      <div style="font-size:9px;font-weight:bold;text-transform:uppercase;color:#888;letter-spacing:1.5px;margin-bottom:8px;">Get the App</div>
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

  <!-- ── BOTTOM FOOTER BAR ────────────────────────────────────────────────── -->
  <div style="margin-top:20px;border-top:1px solid #111;padding-top:10px;display:flex;justify-content:space-between;align-items:center;">
    <div style="font-size:8.5px;color:#777;font-style:italic;">
      Verify before you trust &nbsp;·&nbsp; বিশ্বাস করার আগে যাচাই করুন
    </div>
    <div style="font-size:8.5px;color:#555;">
      Built with ♥ by
      <a href="https://github.com/smhabibjr" style="color:#1e3a5f;text-decoration:none;">smhabibjr</a>
      at
      <a href="https://adaptifyloop.com" style="color:#1e3a5f;text-decoration:none;">Adaptify Loop</a>
      &nbsp;·&nbsp; VisaProof © ${new Date().getFullYear()}
    </div>
  </div>

</body>
</html>`;
}

// ── Public API (signature unchanged) ─────────────────────────────────────────

export async function generateAndShareReport(report: FullReport): Promise<void> {
  const qrSvg = await QRCode.toString(PLAY_STORE_URL, {
    type:   'svg',
    width:  80,
    margin: 1,
  });

  const html    = buildReportHTML(report, qrSvg);
  const { uri } = await Print.printToFileAsync({ html, base64: false });

  await Sharing.shareAsync(uri, {
    mimeType:    'application/pdf',
    UTI:         'com.adobe.pdf',
    dialogTitle: `VisaProof — ${report.title}`,
  });
}
