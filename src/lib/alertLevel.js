export const LEVELS = {
  green: {
    word: "Normal",
    color: "#27AE60",
    deep: "#0E3D26",
    glow: "rgba(39,174,96,0.15)",
    action:
      "Nothing urgent. Check alerts once a day and keep this page bookmarked.",
  },
  orange: {
    word: "Warning",
    color: "#F39C12",
    deep: "#4A2E05",
    glow: "rgba(243,156,18,0.15)",
    action:
      "Charge phones, store 3 days of water and dry food, keep documents in a sealed plastic bag.",
  },
  red: {
    word: "Danger",
    color: "#E74C3C",
    deep: "#4A120C",
    glow: "rgba(231,76,60,0.15)",
    action:
      "Move to your nearest cyclone shelter immediately. Do not wait for the storm to arrive.",
  },
};

/**
 * Odia and Hindi are fixed here rather than translated at runtime.
 * The set is closed — three levels, one headline and one action each — so a
 * live model call bought nothing and cost plenty: Groq dropped the "seal
 * documents in plastic" line from the Odia orange action entirely, rendered
 * "landfall" as the transliterated ଲାନ୍ଡ ଫଲ, and reworded on every request.
 * Hardcoding also means the alert still speaks Odia when the network is down,
 * which during a cyclone is exactly when it has to.
 *
 * ବାତ୍ୟା is the everyday Odia word for cyclone; ଚକ୍ରବାତ is the formal term and
 * is not what people in the coastal blocks actually say.
 *
 * NOT YET REVIEWED BY A NATIVE SPEAKER — verify both languages with someone
 * fluent, ideally from a coastal district, before this goes public.
 */
export const LOCALIZED = {
  green: {
    odia: {
      headline: "ଏବେ ଓଡ଼ିଶାର ଉପକୂଳରେ ବାତ୍ୟାର କୌଣସି ଆଶଙ୍କା ନାହିଁ।",
      action:
        "ତତ୍‌କ୍ଷଣାତ୍ କିଛି କରିବାର ନାହିଁ। ଦିନକୁ ଥରେ ସୂଚନା ଦେଖନ୍ତୁ ଓ ଏହି ପୃଷ୍ଠାଟିକୁ ସାଇତି ରଖନ୍ତୁ।",
    },
    hindi: {
      headline: "अभी ओडिशा के तटीय इलाकों में तूफान का कोई खतरा नहीं है।",
      action:
        "कोई जल्दी की बात नहीं। दिन में एक बार चेतावनी देख लें और इस पेज को सहेज कर रखें।",
    },
  },
  orange: {
    odia: {
      headline:
        "ଉପକୂଳ ଜିଲ୍ଲାଗୁଡ଼ିକରେ ବାତ୍ୟା ସତର୍କତା — ୪୮ ଘଣ୍ଟା ଭିତରେ ବାତ୍ୟା ଉପକୂଳରେ ପହଞ୍ଚିବ।",
      action:
        "ଫୋନ ଚାର୍ଜ କରି ରଖନ୍ତୁ, ତିନି ଦିନର ପାଣି ଓ ଶୁଖିଲା ଖାଦ୍ୟ ସାଇତି ରଖନ୍ତୁ, କାଗଜପତ୍ର ପ୍ଲାଷ୍ଟିକ ପ୍ୟାକେଟରେ ବନ୍ଦ କରି ରଖନ୍ତୁ।",
    },
    hindi: {
      headline:
        "तटीय जिलों में तूफान की चेतावनी — 48 घंटे के भीतर तूफान तट से टकराएगा।",
      action:
        "फोन चार्ज कर लें, तीन दिन का पानी और सूखा खाना रख लें, कागजात प्लास्टिक की थैली में बंद कर लें।",
    },
  },
  red: {
    odia: {
      headline: "ପ୍ରବଳ ବାତ୍ୟା ଉପକୂଳ ଅତିକ୍ରମ କରୁଛି — ୧୨ ଘଣ୍ଟା ଭିତରେ ପହଞ୍ଚିବ।",
      action:
        "ତୁରନ୍ତ ଆପଣଙ୍କ ନିକଟତମ ବାତ୍ୟା ଆଶ୍ରୟସ୍ଥଳୀକୁ ଚାଲିଯାଆନ୍ତୁ। ଝଡ଼ ଆସିବା ପର୍ଯ୍ୟନ୍ତ ଅପେକ୍ଷା କରନ୍ତୁ ନାହିଁ।",
    },
    hindi: {
      headline: "भीषण तूफान तट से टकरा रहा है — 12 घंटे के भीतर पहुंचेगा।",
      action:
        "तुरंत अपने सबसे नजदीकी चक्रवात आश्रय केंद्र में चले जाएं। तूफान आने का इंतजार न करें।",
    },
  },
};

/** The "Do now:" lead-in, so the instruction box isn't half-English. */
export const DO_NOW = {
  english: "Do now:",
  odia: "ଏବେ କରନ୍ତୁ:",
  hindi: "अभी करें:",
};

export function computeLevel(maxGustKmh, rain24mm) {
  if (maxGustKmh >= 118 || rain24mm >= 204) return "red";
  if (maxGustKmh >= 62 || rain24mm >= 115) return "orange";
  return "green";
}

export function buildHeadline(district, level, gusts, rain) {
  if (level === "red")
    return `Severe cyclone crossing the coast \u2014 landfall expected within 12 hours.`;

  if (level === "orange")
    return `Cyclone alert for coastal districts \u2014 landfall expected within 48 hours.`;

  return `No cyclone threat for coastal Odisha right now.`;
}

export function getSeaCondition(gustsKmh) {
  if (gustsKmh >= 90) return "VERY ROUGH";
  if (gustsKmh >= 50) return "ROUGH";
  if (gustsKmh >= 30) return "MODERATE";
  return "CALM";
}