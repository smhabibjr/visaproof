import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import QRCode from 'qrcode';

import type { FullReport } from '@/types';
import { buildPDFHTML } from './pdfTemplate';

const PLAY_STORE_URL = 'https://play.google.com/store/apps/visaproof';

export async function generateAndShareReport(report: FullReport): Promise<void> {
  // QR কোড আগে generate করা হয় (offline, no API call)
  const qrSvg = await QRCode.toString(PLAY_STORE_URL, {
    type:   'svg',
    width:  80,
    margin: 1,
  });

  const html    = buildPDFHTML(report, qrSvg);
  const { uri } = await Print.printToFileAsync({
    html,
    base64: false,
    width:  595,   // A4 width in points
    height: 842,   // A4 height in points
  });

  await Sharing.shareAsync(uri, {
    mimeType:    'application/pdf',
    UTI:         'com.adobe.pdf',
    dialogTitle: `VisaProof — ${report.title}`,
  });
}
