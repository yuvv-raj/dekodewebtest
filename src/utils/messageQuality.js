const COMMON_BIGRAMS = new Set([
  "ab", "ac", "ad", "ai", "al", "am", "an", "ap", "ar", "as", "at",
  "ba", "be", "bi", "bl", "bo", "br", "bu", "ca", "ce", "ch", "ci",
  "cl", "co", "cr", "cu", "da", "de", "di", "do", "dr", "ea", "ed",
  "el", "em", "en", "er", "es", "et", "ex", "fa", "fe", "fi", "fo",
  "fr", "ga", "ge", "gi", "go", "gr", "ha", "he", "hi", "ho", "ia",
  "ic", "id", "ie", "if", "ig", "il", "im", "in", "io", "ir", "is",
  "it", "la", "le", "li", "ll", "lo", "ly", "ma", "me", "mi", "mo",
  "mp", "na", "nd", "ne", "ng", "ni", "no", "nt", "oa", "oc", "of",
  "ol", "om", "on", "op", "or", "ou", "ow", "pa", "pe", "ph", "pi",
  "pl", "po", "pr", "ra", "re", "ri", "ro", "sa", "se", "sh", "si",
  "so", "sp", "st", "ta", "te", "th", "ti", "to", "tr", "tu", "ul",
  "un", "ur", "us", "va", "ve", "vi", "wa", "we", "wh", "wi", "wo",
]);

const SHORT_MEANINGFUL_INPUTS = new Set([
  "asap", "businesses", "children", "customers", "developers", "doctors",
  "employees", "everyone", "families", "farmers", "internal", "maybe",
  "months", "parents", "patients", "public", "schools", "soon", "students",
  "teams", "unsure", "users", "weeks",
]);

function wordLooksRandom(word) {
  if (word.length < 5 || SHORT_MEANINGFUL_INPUTS.has(word)) return false;
  if (/^(.)\1{3,}$/.test(word) || /[bcdfghjklmnpqrstvwxyz]{4,}/.test(word)) {
    return true;
  }

  let commonPairs = 0;
  for (let index = 0; index < word.length - 1; index += 1) {
    if (COMMON_BIGRAMS.has(word.slice(index, index + 2))) commonPairs += 1;
  }
  return commonPairs / (word.length - 1) < 0.2;
}

export function isLikelyGibberish(value) {
  const text = String(value ?? "").trim().toLowerCase();
  if (!text) return false;
  if (/^(?:hi|hello|hey|thanks|thank you|yes|no|not sure|i don't know)$/i.test(text)) {
    return false;
  }

  const words = text.match(/[a-z]+/g) || [];
  const digits = text.match(/\d/g) || [];
  if (!words.length) return digits.length === 0;

  const letterCount = words.join("").length;
  const punctuationCount = (text.match(/[^a-z0-9\s]/g) || []).length;
  if (punctuationCount >= 2 && punctuationCount * 3 >= letterCount) return true;

  const substantialWords = words.filter((word) => word.length >= 5);
  return substantialWords.length > 0 &&
    substantialWords.every(wordLooksRandom) &&
    words.length <= 3;
}

const CLARIFICATIONS = {
  gathering_audience:
    "I didn't quite understand that audience. Is this for customers, employees, students, patients, or another group?",
  gathering_features:
    "I didn't quite understand the feature request. Tell me one thing the product must let users do, such as sign in, make payments, book, search, or chat.",
  gathering_timeline:
    "I didn't catch the timeline. You can answer with something like “ASAP,” “in 3 months,” or “no fixed deadline.”",
  custom_discovery_problem:
    "I didn't quite understand the problem yet. In one sentence, what should this product help someone do?",
  custom_discovery_platform:
    "I didn't catch the platform. Should this be web, mobile, desktop, backend, or hardware?",
  custom_discovery_complexity:
    "I didn't quite understand that requirement. What is the hardest feature, integration, or technical constraint you expect?",
};

export function getIntakeClarification(step, value) {
  if (!CLARIFICATIONS[step] || !isLikelyGibberish(value)) return null;
  return CLARIFICATIONS[step];
}
