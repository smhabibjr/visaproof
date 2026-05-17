# Report Structure

## JSON Output Format (Claude API থেকে এই format চাই)
{
  "riskScore": "SAFE" | "SUSPICIOUS" | "HIGH_RISK" | "SCAM",
  "riskPercentage": 0-100,
  "summary": "সংক্ষিপ্ত বাংলা/ইংরেজি সারসংক্ষেপ",
  
  "universityVerification": {
    "name": "",
    "country": "",
    "foundedYear": "",
    "isAccredited": true/false/null,
    "accreditationBody": "",
    "registrationNumber": "",
    "officialWebsite": "",
    "websiteMatch": true/false,
    "ugcRecognized": true/false/null,
    "worldRanking": "",
    "verdict": ""
  },
  
  "offerLetterAnalysis": {
    "hasOfficialLetterhead": true/false,
    "emailDomainLegitimate": true/false,
    "detectedEmail": "",
    "hasDigitalSignature": true/false,
    "grammarQuality": "GOOD"|"POOR"|"VERY_POOR",
    "suspiciousElements": ["list of issues"],
    "verdict": ""
  },
  
  "invoiceAnalysis": {
    "found": true/false,
    "paymentDestination": "",
    "isPersonalAccount": true/false,
    "amountReasonable": true/false,
    "currency": "",
    "paymentMethod": "",
    "suspiciousElements": ["list"],
    "verdict": ""
  },
  
  "redFlags": ["flag1", "flag2"],
  "positivePoints": ["point1"],
  "recommendedActions": ["action1", "action2"],
  "disclaimer": ""
}

## Risk Score Rules
- SAFE: কোনো red flag নেই, সব verified
- SUSPICIOUS: 1-2টা minor issue
- HIGH_RISK: একাধিক major issue
- SCAM: clear scam indicators আছে