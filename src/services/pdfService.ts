import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

import type { FullReport, Language, RiskScore } from '@/types';

// ── Brand ────────────────────────────────────────────────────────────────────

const BRAND_GREEN = '#006A4E';

const RISK_BG: Record<RiskScore, string> = {
  SAFE:       '#16a34a',
  SUSPICIOUS: '#ca8a04',
  HIGH_RISK:  '#ea580c',
  SCAM:       '#dc2626',
};

// ── Helpers ──────────────────────────────────────────────────────────────────

function safeStr(value: string | null | undefined, lang: Language): string {
  if (!value || value.trim() === '') return lang === 'bn' ? 'তথ্য নেই' : 'N/A';
  return value;
}

function boolCell(value: boolean | null | undefined, lang: Language): string {
  if (value === null || value === undefined) return `<span class="na">—</span>`;
  if (value) return `<span class="yes">✓ ${lang === 'bn' ? 'হ্যাঁ' : 'Yes'}</span>`;
  return `<span class="no">✗ ${lang === 'bn' ? 'না' : 'No'}</span>`;
}

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

function clampPct(n: number | undefined): number {
  return Math.min(100, Math.max(0, n || 0));
}

function escHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ── Logo loader ───────────────────────────────────────────────────────────────

async function loadLogoBase64(): Promise<string> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const asset = Asset.fromModule(require('../../assets/images/logo-glow.png'));
    await asset.downloadAsync();
    if (!asset.localUri) return '';
    const b64 = await FileSystem.readAsStringAsync(asset.localUri, {
      encoding: 'base64',
    });
    return `data:image/png;base64,${b64}`;
  } catch {
    return '';
  }
}

// ── HTML template helpers ────────────────────────────────────────────────────

function infoRow(label: string, value: string): string {
  return `<tr>
    <td class="td-label">${label}</td>
    <td class="td-value">${value}</td>
  </tr>`;
}

function sectionHeading(text: string): string {
  return `<div class="sec-title">${text}</div>`;
}

function suspiciousBox(items: string[], lang: Language): string {
  if (!items?.length) return '';
  const rows = items.map(item => `<div class="susp-row">⚠ ${escHtml(item)}</div>`).join('');
  return `<div class="susp-box">
    <div class="susp-title">${lang === 'bn' ? 'সন্দেহজনক বিষয়' : 'Suspicious Elements'}</div>
    ${rows}
  </div>`;
}

function chipList(items: string[], variant: 'red' | 'green', emptyText: string): string {
  if (!items?.length) return `<span class="flag-empty">${emptyText}</span>`;
  return items.map(item => `<span class="chip-${variant}">${escHtml(item)}</span>`).join(' ');
}

function grammarHtml(q: string | undefined, lang: Language): string {
  const isBn = lang === 'bn';
  if (q === 'GOOD')      return `<span class="yes">✓ ${isBn ? 'ভালো' : 'Good'}</span>`;
  if (q === 'POOR')      return `<span class="warn">⚠ ${isBn ? 'দুর্বল' : 'Poor'}</span>`;
  if (q === 'VERY_POOR') return `<span class="no">✗ ${isBn ? 'খুব দুর্বল' : 'Very Poor'}</span>`;
  return `<span class="na">—</span>`;
}

// ── Full HTML document ────────────────────────────────────────────────────────

function buildReportHTML(report: FullReport, logoDataUrl: string): string {
  const lang  = report.language ?? 'bn';
  const isBn  = lang === 'bn';
  const a     = report.analysis;
  const uv    = a.universityVerification;
  const ol    = a.offerLetterAnalysis;
  const inv   = a.invoiceAnalysis;
  const pct   = clampPct(a.riskPercentage);
  const bannerBg = RISK_BG[a.riskScore] ?? '#6b7280';

  const l = (bn: string, en: string) => (isBn ? bn : en);

  const riskLabel = isBn
    ? ({ SAFE: 'নিরাপদ', SUSPICIOUS: 'সন্দেহজনক', HIGH_RISK: 'উচ্চ ঝুঁকি', SCAM: 'স্ক্যাম' } as Record<RiskScore, string>)[a.riskScore]
    : ({ SAFE: 'SAFE', SUSPICIOUS: 'SUSPICIOUS', HIGH_RISK: 'HIGH RISK', SCAM: 'SCAM' } as Record<RiskScore, string>)[a.riskScore];

  const logoImg = logoDataUrl
    ? `<img src="${logoDataUrl}" style="width:46px;height:46px;border-radius:10px;object-fit:cover;flex-shrink:0;" />`
    : `<div style="width:46px;height:46px;background:rgba(255,255,255,0.25);border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:800;color:white;flex-shrink:0;">VP</div>`;

  // Recommended actions
  const actions = (a.recommendedActions ?? []);
  const actionsHtml = actions.length === 0
    ? `<p class="na" style="padding:8px 0;">${l('কোনো পরামর্শ নেই', 'No recommendations')}</p>`
    : actions.map((action, i) => `
        <div class="action-row">
          <div class="action-num">${i + 1}</div>
          <div class="action-text">${escHtml(action)}</div>
        </div>`).join('');

  // Invoice section (only if found)
  const invoiceSection = inv?.found === true ? `
    <div class="section">
      ${sectionHeading(l('ইনভয়েস বিশ্লেষণ', 'Invoice Analysis'))}
      <table class="info-table">
        ${infoRow(l('পেমেন্ট গন্তব্য', 'Payment Destination'), safeStr(inv.paymentDestination, lang))}
        <tr${inv.isPersonalAccount === true ? ' class="danger-row"' : ''}>
          <td class="td-label">${l('ব্যক্তিগত অ্যাকাউন্ট', 'Personal Account')}</td>
          <td class="td-value">${boolCell(inv.isPersonalAccount ?? null, lang)}</td>
        </tr>
        ${infoRow(l('পরিমাণ যুক্তিসংগত', 'Amount Reasonable'), boolCell(inv.amountReasonable ?? null, lang))}
        ${infoRow(l('মুদ্রা', 'Currency'), safeStr(inv.currency, lang))}
        ${infoRow(l('পেমেন্ট পদ্ধতি', 'Payment Method'), safeStr(inv.paymentMethod, lang))}
      </table>
      ${suspiciousBox(inv.suspiciousElements ?? [], lang)}
      ${inv.verdict ? `<p class="verdict">${escHtml(inv.verdict)}</p>` : ''}
    </div>` : '';

  const disclaimerSection = a.disclaimer ? `
    <div class="disclaimer-wrap">
      <p class="disclaimer-text">${escHtml(a.disclaimer)}</p>
    </div>` : '';

  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=794px, initial-scale=1" />
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      font-family: -apple-system, 'Helvetica Neue', 'Noto Sans Bengali', 'Hind Siliguri', Arial, sans-serif;
      font-size: 13px;
      line-height: 1.5;
      color: #111827;
      background: #ffffff;
    }

    /* ── Header ─────────────────────────────── */
    .header {
      background: ${BRAND_GREEN};
      padding: 22px 32px;
      display: flex;
      align-items: center;
      gap: 14px;
    }
    .hdr-meta { flex: 1; }
    .hdr-name { font-size: 24px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px; }
    .hdr-sub  { font-size: 12px; color: rgba(255,255,255,0.7); margin-top: 3px; }
    .hdr-id   { text-align: right; }
    .hdr-id-label { font-size: 9px; color: rgba(255,255,255,0.55); text-transform: uppercase; letter-spacing: 0.8px; }
    .hdr-id-val   { font-size: 11px; color: rgba(255,255,255,0.8); font-family: monospace; margin-top: 2px; }

    /* ── Risk Banner ─────────────────────────── */
    .risk-banner {
      background: ${bannerBg};
      padding: 20px 32px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .risk-label { font-size: 32px; font-weight: 800; color: #ffffff; letter-spacing: 0.5px; }
    .risk-uni   { font-size: 14px; color: rgba(255,255,255,0.9); font-weight: 500; margin-top: 5px; }
    .risk-date  { font-size: 12px; color: rgba(255,255,255,0.65); margin-top: 3px; }
    .risk-circle {
      width: 82px; height: 82px;
      border-radius: 50%;
      border: 4px solid rgba(255,255,255,0.65);
      background: rgba(255,255,255,0.12);
      display: flex; flex-direction: column;
      align-items: center; justify-content: center;
    }
    .risk-pct     { font-size: 22px; font-weight: 800; color: #ffffff; line-height: 1; }
    .risk-pct-sub { font-size: 9px; color: rgba(255,255,255,0.7); font-weight: 600; letter-spacing: 0.8px; margin-top: 3px; }

    /* ── Section wrapper ─────────────────────── */
    .section {
      padding: 18px 32px;
      border-bottom: 1px solid #E5E7EB;
      page-break-inside: avoid;
    }
    .sec-title {
      font-size: 10px;
      font-weight: 700;
      color: ${BRAND_GREEN};
      text-transform: uppercase;
      letter-spacing: 1.2px;
      padding-left: 9px;
      border-left: 3px solid ${BRAND_GREEN};
      margin-bottom: 13px;
    }

    /* ── Summary ─────────────────────────────── */
    .summary-text { font-size: 13px; color: #374151; line-height: 1.75; }

    /* ── Info table ──────────────────────────── */
    .info-table { width: 100%; border-collapse: collapse; }
    .info-table tr { border-bottom: 1px solid #F3F4F6; }
    .info-table tr:last-child { border-bottom: none; }
    .td-label {
      padding: 8px 14px 8px 0;
      color: #6B7280;
      font-size: 12px;
      width: 44%;
      vertical-align: middle;
    }
    .td-value {
      padding: 8px 0;
      color: #111827;
      font-size: 12px;
      font-weight: 500;
      vertical-align: middle;
    }
    .yes  { color: #16a34a; font-weight: 600; }
    .no   { color: #dc2626; font-weight: 600; }
    .warn { color: #ca8a04; font-weight: 600; }
    .na   { color: #9CA3AF; }
    .danger-row td { background: #FEF2F2 !important; }

    /* ── Verdict ─────────────────────────────── */
    .verdict {
      font-style: italic;
      color: #6B7280;
      font-size: 12px;
      margin-top: 12px;
      line-height: 1.65;
      padding-top: 10px;
      border-top: 1px dashed #E5E7EB;
    }

    /* ── Suspicious box ──────────────────────── */
    .susp-box  { background: #FEF2F2; border-radius: 7px; padding: 10px 14px; margin-top: 10px; }
    .susp-title { font-size: 10px; font-weight: 700; color: #dc2626; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px; }
    .susp-row  { font-size: 12px; color: #dc2626; padding: 2px 0; }

    /* ── Flags section ───────────────────────── */
    .flags-grid { display: flex; gap: 24px; }
    .flags-col  { flex: 1; }
    .flags-head { font-size: 12px; font-weight: 700; color: #111827; margin-bottom: 9px; }
    .chip-red {
      display: inline-block;
      background: #FEF2F2; border: 1px solid #fecaca; border-radius: 12px;
      padding: 3px 10px; font-size: 11px; color: #dc2626; margin: 2px;
    }
    .chip-green {
      display: inline-block;
      background: #F0FDF4; border: 1px solid #bbf7d0; border-radius: 12px;
      padding: 3px 10px; font-size: 11px; color: #16a34a; margin: 2px;
    }
    .flag-empty { font-size: 12px; font-style: italic; color: #9CA3AF; }

    /* ── Actions ─────────────────────────────── */
    .action-row { display: flex; align-items: flex-start; gap: 10px; padding: 7px 0; border-bottom: 1px solid #F3F4F6; }
    .action-row:last-child { border-bottom: none; }
    .action-num {
      min-width: 22px; height: 22px;
      background: #EFF6FF; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 11px; font-weight: 700; color: #3B82F6; flex-shrink: 0;
      text-align: center; line-height: 22px;
    }
    .action-text { font-size: 12px; color: #111827; padding-top: 3px; line-height: 1.55; }

    /* ── Disclaimer ──────────────────────────── */
    .disclaimer-wrap {
      background: #F3F4F6; border-radius: 8px;
      padding: 12px 16px; margin: 0 32px 16px;
    }
    .disclaimer-text { font-size: 11px; font-style: italic; color: #6B7280; line-height: 1.75; }

    /* ── Footer ──────────────────────────────── */
    .footer {
      padding: 14px 32px;
      background: #F8F9FA;
      border-top: 2px solid ${BRAND_GREEN};
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .footer-brand { font-size: 14px; font-weight: 800; color: ${BRAND_GREEN}; }
    .footer-tagline { font-size: 11px; color: #6B7280; margin-top: 2px; }
    .footer-right { text-align: right; font-size: 11px; color: #9CA3AF; line-height: 1.6; }
  </style>
</head>
<body>

  <!-- HEADER -->
  <div class="header">
    ${logoImg}
    <div class="hdr-meta">
      <div class="hdr-name">VisaProof</div>
      <div class="hdr-sub">${l('বিশ্লেষণ রিপোর্ট', 'Analysis Report')} · ${l('স্ক্যাম সুরক্ষা', 'Scam Protection')}</div>
    </div>
    <div class="hdr-id">
      <div class="hdr-id-label">Report ID</div>
      <div class="hdr-id-val">${report.id.substring(0, 16)}</div>
    </div>
  </div>

  <!-- RISK BANNER -->
  <div class="risk-banner">
    <div>
      <div class="risk-label">${riskLabel}</div>
      <div class="risk-uni">${escHtml(safeStr(uv?.name, lang))}</div>
      <div class="risk-date">${fmtDate(report.createdAt, lang)}</div>
    </div>
    <div class="risk-circle">
      <div class="risk-pct">${pct}%</div>
      <div class="risk-pct-sub">RISK</div>
    </div>
  </div>

  <!-- SUMMARY -->
  <div class="section">
    ${sectionHeading(l('সারসংক্ষেপ', 'Summary'))}
    <p class="summary-text">${escHtml(safeStr(a.summary, lang))}</p>
  </div>

  <!-- UNIVERSITY VERIFICATION -->
  <div class="section">
    ${sectionHeading(l('বিশ্ববিদ্যালয় যাচাই', 'University Verification'))}
    <table class="info-table">
      ${infoRow(l('বিশ্ববিদ্যালয়', 'University'),          safeStr(uv?.name, lang))}
      ${infoRow(l('দেশ', 'Country'),                        safeStr(uv?.country, lang))}
      ${infoRow(l('প্রতিষ্ঠা বছর', 'Founded'),              safeStr(uv?.foundedYear, lang))}
      ${infoRow(l('স্বীকৃতিপ্রাপ্ত', 'Accredited'),        boolCell(uv?.isAccredited ?? null, lang))}
      ${infoRow(l('স্বীকৃতি প্রদানকারী', 'Accreditation'), safeStr(uv?.accreditationBody, lang))}
      ${infoRow(l('রেজিস্ট্রেশন নম্বর', 'Reg. Number'),    safeStr(uv?.registrationNumber, lang))}
      ${infoRow(l('অফিশিয়াল ওয়েবসাইট', 'Website'),       safeStr(uv?.officialWebsite, lang))}
      ${infoRow(l('ওয়েবসাইট মিলেছে', 'Website Match'),    boolCell(uv?.websiteMatch ?? null, lang))}
      ${infoRow(l('UGC স্বীকৃত', 'UGC Recognized'),        boolCell(uv?.ugcRecognized ?? null, lang))}
      ${infoRow(l('বিশ্ব র‍্যাংকিং', 'World Ranking'),     safeStr(uv?.worldRanking, lang))}
    </table>
    ${uv?.verdict ? `<p class="verdict">${escHtml(uv.verdict)}</p>` : ''}
  </div>

  <!-- OFFER LETTER ANALYSIS -->
  <div class="section">
    ${sectionHeading(l('অফার লেটার বিশ্লেষণ', 'Offer Letter Analysis'))}
    <table class="info-table">
      ${infoRow(l('অফিশিয়াল লেটারহেড', 'Official Letterhead'), boolCell(ol?.hasOfficialLetterhead ?? null, lang))}
      ${infoRow(l('ইমেইল ডোমেইন বৈধ', 'Email Legitimate'),      boolCell(ol?.emailDomainLegitimate ?? null, lang))}
      ${infoRow(l('শনাক্ত ইমেইল', 'Detected Email'),            safeStr(ol?.detectedEmail, lang))}
      ${infoRow(l('ডিজিটাল স্বাক্ষর', 'Digital Signature'),     boolCell(ol?.hasDigitalSignature ?? null, lang))}
      ${infoRow(l('ব্যাকরণের মান', 'Grammar Quality'),          grammarHtml(ol?.grammarQuality, lang))}
    </table>
    ${suspiciousBox(ol?.suspiciousElements ?? [], lang)}
    ${ol?.verdict ? `<p class="verdict">${escHtml(ol.verdict)}</p>` : ''}
  </div>

  ${invoiceSection}

  <!-- RED FLAGS & POSITIVES -->
  <div class="section">
    ${sectionHeading(l('সতর্কতা ও ইতিবাচক দিক', 'Flags & Positive Points'))}
    <div class="flags-grid">
      <div class="flags-col">
        <div class="flags-head">🚩 ${l('সতর্কতা', 'Red Flags')}</div>
        ${chipList(a.redFlags ?? [], 'red', l('কোনো সতর্কতা নেই', 'None found'))}
      </div>
      <div class="flags-col">
        <div class="flags-head">✅ ${l('ইতিবাচক দিক', 'Positive Points')}</div>
        ${chipList(a.positivePoints ?? [], 'green', l('কোনো ইতিবাচক দিক নেই', 'None found'))}
      </div>
    </div>
  </div>

  <!-- RECOMMENDED ACTIONS -->
  <div class="section">
    ${sectionHeading(l('পরামর্শ', 'Recommended Actions'))}
    ${actionsHtml}
  </div>

  ${disclaimerSection}

  <!-- FOOTER -->
  <div class="footer">
    <div>
      <div class="footer-brand">VisaProof</div>
      <div class="footer-tagline">${l('স্ক্যাম থেকে নিরাপদ থাকুন', 'Stay safe from scams')}</div>
    </div>
    <div class="footer-right">
      <div>${l('তৈরির তারিখ', 'Generated')}: ${fmtDate(report.createdAt, lang)}</div>
      <div>ID: ${report.id.substring(0, 20)}</div>
    </div>
  </div>

</body>
</html>`;
}

// ── Public API ────────────────────────────────────────────────────────────────

export async function generateAndShareReport(report: FullReport): Promise<void> {
  const logoDataUrl = await loadLogoBase64();
  const html        = buildReportHTML(report, logoDataUrl);

  const { uri } = await Print.printToFileAsync({ html, base64: false });

  await Sharing.shareAsync(uri, {
    mimeType:    'application/pdf',
    UTI:         'com.adobe.pdf',
    dialogTitle: `VisaProof — ${report.title}`,
  });
}
