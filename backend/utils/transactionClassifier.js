const CATEGORY_RULES = [
  {
    name: "Food",
    keywords: [
      "swiggy",
      "zomato",
      "blinkit",
      "zepto",
      "dominos",
      "pizza hut",
      "starbucks",
      "restaurant",
      "cafe",
      "eatclub",
    ],
  },
  {
    name: "Travel",
    keywords: [
      "uber",
      "ola",
      "rapido",
      "irctc",
      "makemytrip",
      "air india",
      "indigo",
      "goibibo",
      "metro",
      "fuel",
      "petrol",
      "diesel",
    ],
  },
  {
    name: "Shopping",
    keywords: [
      "amazon",
      "flipkart",
      "myntra",
      "meesho",
      "nykaa",
      "ajio",
      "shop",
      "store",
    ],
  },
  {
    name: "Bills",
    keywords: [
      "electricity",
      "water bill",
      "gas bill",
      "broadband",
      "wifi",
      "recharge",
      "postpaid",
      "prepaid",
      "billdesk",
      "airtel",
      "jio",
      "vi",
    ],
  },
  {
    name: "Health",
    keywords: ["apollo", "pharmacy", "hospital", "clinic", "medplus"],
  },
  {
    name: "Entertainment",
    keywords: [
      "netflix",
      "spotify",
      "youtube",
      "prime video",
      "bookmyshow",
      "hotstar",
      "sony liv",
    ],
  },
  {
    name: "Transfers",
    keywords: ["upi", "imps", "neft", "rtgs", "bank transfer", "transfer"],
  },
];

const TRANSACTION_MARKERS = [
  "debited",
  "spent",
  "paid",
  "payment of",
  "purchase",
  "sent",
  "credited",
  "received",
];

function normalizeText(value) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim();
}

function extractMerchantFromSms(rawSms = "") {
  const body = normalizeText(rawSms);
  if (!body) return null;

  const patterns = [
    /(?:at|to|from|on)\s+([A-Za-z0-9&.'\- ]{2,40}?)(?:\s+via|\s+using|\s+for|\s+on|\s+Ref|\s+Avl|\s+UPI|\s*$)/i,
    /merchant[:\s]+([A-Za-z0-9&.'\- ]{2,40})(?:\s|$)/i,
    /towards\s+([A-Za-z0-9&.'\- ]{2,40})(?:\s|$)/i,
  ];

  for (const pattern of patterns) {
    const match = body.match(pattern);
    if (match?.[1]) {
      return match[1].replace(/[.,]$/, "").trim();
    }
  }

  return null;
}

function classifyTransaction({ merchant, rawSms }) {
  const merchantText = normalizeText(merchant).toLowerCase();
  const smsText = normalizeText(rawSms).toLowerCase();
  const haystack = `${merchantText} ${smsText}`.trim();

  for (const rule of CATEGORY_RULES) {
    if (rule.keywords.some((keyword) => haystack.includes(keyword))) {
      return rule.name;
    }
  }

  if (TRANSACTION_MARKERS.some((marker) => smsText.includes(marker))) {
    return "General";
  }

  return "Others";
}

module.exports = {
  classifyTransaction,
  extractMerchantFromSms,
};
