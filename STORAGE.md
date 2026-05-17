# Local Storage Schema

## AsyncStorage Keys
- "reports_list" → Report[] (সব রিপোর্টের list)
- "report_{id}" → FullReport (individual রিপোর্ট detail)

## Report List Item Structure
{
  "id": "uuid",
  "createdAt": "ISO date string",
  "title": "University name বা document name",
  "riskScore": "SAFE|SUSPICIOUS|HIGH_RISK|SCAM",
  "language": "bn|en"
}

## Rules
- Max 50 reports store করা যাবে
- 50 পার হলে সবচেয়ে পুরনোটা delete হবে
- App uninstall হলে সব data যাবে
- Sidebar এ warning দেখাতে হবে এই বিষয়ে