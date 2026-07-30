const CATEGORY_RULES = [
  {
    name: "Food",
    keywords: [
      "swiggy",
      "zomato",
      "blinkit",
      "zepto",
      "restaurant",
      "cafe",
      "starbucks",
      "dominos",
    ],
  },
  {
    name: "Travel",
    keywords: [
      "uber",
      "ola",
      "rapido",
      "metro",
      "irctc",
      "makemytrip",
      "petrol",
      "diesel",
      "fuel",
    ],
  },
  {
    name: "Shopping",
    keywords: ["amazon", "flipkart", "myntra", "nykaa", "ajio", "meesho"],
  },
  {
    name: "Bills",
    keywords: [
      "electricity",
      "water bill",
      "gas bill",
      "recharge",
      "postpaid",
      "prepaid",
      "broadband",
      "wifi",
      "airtel",
      "jio",
      "vi",
    ],
  },
  {
    name: "Health",
    keywords: ["hospital", "clinic", "pharmacy", "apollo", "medplus"],
  },
  {
    name: "Entertainment",
    keywords: [
      "netflix",
      "spotify",
      "youtube",
      "bookmyshow",
      "prime video",
      "hotstar",
    ],
  },
  {
    name: "Transfers",
    keywords: ["upi", "bank transfer", "imps", "neft", "rtgs", "transfer"],
  },
];

const TRANSACTION_REGEX =
  /(rs\.?|inr|mrp)\s*([0-9]+(?:,[0-9]{3})*(?:\.[0-9]{1,2})?)|([0-9]+(?:,[0-9]{3})*(?:\.[0-9]{1,2})?)\s*(rs\.?|inr)/i;

function normalizeText(value) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim();
}

export function extractMerchantFromSms(rawSms = "") {
  const body = normalizeText(rawSms);
  if (!body) return null;

  const patterns = [
    /(?:at|to|from|on)\s+([A-Za-z0-9&.'\- ]{2,40}?)(?:\s+via|\s+using|\s+for|\s+on|\s+Ref|\s+UPI|\s*$)/i,
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

export function classifyTransaction({ merchant, rawSms }) {
  const merchantText = normalizeText(merchant).toLowerCase();
  const smsText = normalizeText(rawSms).toLowerCase();
  const haystack = `${merchantText} ${smsText}`.trim();

  for (const rule of CATEGORY_RULES) {
    if (rule.keywords.some((keyword) => haystack.includes(keyword))) {
      return rule.name;
    }
  }

  if (
    ["debited", "spent", "paid", "purchase", "sent", "payment"]
      .some((marker) => smsText.includes(marker))
  ) {
    return "General";
  }

  return "Others";
}

export function parseSmsTransaction(body, address = "") {
  const normalizedBody = normalizeText(body);
  if (!normalizedBody) return null;

  const lowerBody = normalizedBody.toLowerCase();
  const looksLikeTransaction = [
    "debited",
    "credited",
    "spent",
    "paid",
    "received",
    "purchase",
    "upi",
    "transaction",
  ].some((marker) => lowerBody.includes(marker));

  if (!looksLikeTransaction) {
    return null;
  }

  const amountMatch = normalizedBody.match(TRANSACTION_REGEX);
  const rawAmount = amountMatch?.[2] || amountMatch?.[3];
  const amount = rawAmount ? Number(rawAmount.replace(/,/g, "")) : null;

  if (!amount || Number.isNaN(amount)) {
    return null;
  }

  const type = ["credited", "received", "refund", "cashback"].some((marker) =>
    lowerBody.includes(marker),
  )
    ? "income"
    : "expense";

  const merchant =
    extractMerchantFromSms(normalizedBody) ||
    normalizeText(address).replace(/[^a-z0-9]/gi, " ").trim() ||
    "SMS Transaction";
  const category = classifyTransaction({ merchant, rawSms: normalizedBody });

  return {
    amount,
    merchant,
    merchant_category: category,
    raw_sms: normalizedBody,
    type,
    is_cashback: lowerBody.includes("cashback"),
    is_recurring:
      lowerBody.includes("autopay") ||
      lowerBody.includes("standing instruction") ||
      lowerBody.includes("subscription"),
  };
}
