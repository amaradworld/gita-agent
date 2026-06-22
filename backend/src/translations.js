// Verse translations for key verses in 9 Indian languages
// Format: { "chapter.verse": { lang_code: { translation, explanation, advice } } }

const verseTranslations = {
  // Chapter 2, Verse 47 — Most famous verse
  '2.47': {
    hi: {
      translation: 'तुम्हारा अधिकार कर्म करने में है, फल में कभी नहीं। अतः कर्म के हेतु मत बनो और कर्म में भी आसक्ति मत रखो।',
      explanation: 'यह सबसे प्रसिद्ध श्लोक है। चिंता फल के आसक्ति से आती है। अपने प्रयास पर ध्यान दें और बाकी सब छोड़ दें।',
      advice: 'अपना सर्वश्रेष्ठ करें और छोड़ दें। "क्या होगा" की चिंता एक भ्रम है। प्रक्रिया पर भरोसा करें।'
    },
    ta: {
      translation: 'உங்களுக்கு செயல்களைச் செய்வதில் மட்டுமே உரிமை உள்ளது, அவற்றின் விளைவுகளில் அல்ல. எனவே செயல்களின் விளைவுகளைக் காரணமாகக் கொள்ளாதீர்கள்.',
      explanation: 'இது மிகவும் பிரபலமான வசனம். விளைவுகளின் பற்று கவலையை உருவாக்குகிறது.',
      advice: 'உங்கள் சிறந்ததைச் செய்துவிட்டு விடுங்கள். செயல்முறையை நம்புங்கள்.'
    },
    te: {
      translation: 'మీకు కర్మలు చేయడంలో మాత్రమే అధికారం ఉంది, ఫలాలలో ఎప్పుడూ కాదు.',
      explanation: 'ఇది అత్యంత ప్రసిద్ధ శ్లోకం. ఫలాల పట్ల ఆసక్తి ఆందోళన కలిగిస్తుంది.',
      advice: 'మీ శ్రేష్ఠమైనది చేసి, మిగిలినదాన్ని వదిలివేయండి.'
    },
    mr: {
      translation: 'तुम्हाला कर्म करण्याचा अधिकार आहे, फळात कधी नाही. म्हणून कर्माचे कारण बनू नका.',
      explanation: 'हा सर्वात प्रसिद्ध श्लोक आहे. फळाशी आसक्ती चिंता निर्माण करते.',
      advice: 'तुमचे सर्वोत्तम करा आणि सोडा. प्रक्रियेवर विश्वास ठेवा.'
    },
    bn: {
      translation: 'আপনার কর্ম করার অধিকার মাত্রই আছে, ফলের ক্ষেত্রে কখনই নয়।',
      explanation: 'এটি সবচেয়ে বিখ্যাত শ্লোক। ফলাফলের আসক্তি উদ্বেগ সৃষ্টি করে।',
      advice: 'আপনার সেরাটি করুন এবং ছেড়ে দিন। প্রক্রিয়ায় বিশ্বাস করুন।'
    },
    kn: {
      translation: 'ನಿಮಗೆ ಕರ್ಮಗಳನ್ನು ಮಾಡುವ ಹಕ್ಕು ಮಾತ್ರ ಇದೆ, ಫಲಗಳಲ್ಲಿ ಎಂದಿಗೂ ಅಲ್ಲ.',
      explanation: 'ಇದು ಅತ್ಯಂತ ಪ್ರಸಿದ್ಧ ಶ್ಲೋಕ. ಫಲಗಳ ಬಗ್ಗೆ ಆಸಕ್ತಿ ಆತಂಕವನ್ನು ಉಂಟುಮಾಡುತ್ತದೆ.',
      advice: 'ನಿಮ್ಮ ಶ್ರೇಷ್ಠವನ್ನು ಮಾಡಿ ಮತ್ತು ಬಿಟ್ಟುಬಿಡಿ. ಪ್ರಕ್ರಿಯೆಯನ್ನು ನಂಬಿ.'
    },
    gu: {
      translation: 'તમને કર્મ કરવાનો અધિકાર છે, ફળમાં ક્યારેય નહીં.',
      explanation: 'આ સૌથી પ્રખ્યાત શ્લોક છે. ફળની આસક્તિ ચિંતા પેદા કરે છે.',
      advice: 'તમારું શ્રેષ્ઠ કરો અને છોડી દો. પ્રક્રિયા પર વિશ્વાસ રાખો.'
    },
    ml: {
      translation: 'നിങ്ങൾക്ക് കർമ്മങ്ങൾ ചെയ്യാനുള്ള അവകാശം മാത്രമേ ഉള്ളൂ, ഫലങ്ങളിൽ ഒരിക്കലും അല്ല.',
      explanation: 'ഇത് ഏറ്റവും പ്രശസ്തമായ ശ്ലോകമാണ്. ഫലങ്ങളിലുള്ള ആസക്തി ഉത്കണ്ഠ സൃഷ്ടിക്കുന്നു.',
      advice: 'നിങ്ങളുടെ ഏറ്റവും നല്ലത് ചെയ്യുക, പിന്നെ വിട്ടുകൊടുക്കുക.'
    },
  },

  // Chapter 18, Verse 66 — Ultimate surrender
  '18.66': {
    hi: {
      translation: 'सब धर्मों को त्यागकर मेरी शरण में आओ। मैं तुम्हें सब पापों से मुक्त कर दूंगा, शोक मत करो।',
      explanation: 'यह गीता का अंतिम और सबसे शक्तिशाली संदेश है — पूर्ण समर्पण। जब कुछ न काम करे, तो भगवान को सब सौंप दो।',
      advice: 'रात को सोने से पहले कहो: "कृष्ण, मैं सब कुछ तुम्हें सौंपता हूं।" हल्कापन महसूस करो।'
    },
    ta: {
      translation: 'அனைத்து கடமைகளையும் துறந்து என்னை மட்டுமே சரணடையுங்கள். நான் உங்களை அனைத்து பாவங்களிலிருந்தும் விடுவிக்கிறேன்.',
      explanation: 'இது கீதாவின் இறுதி மற்றும் மிகவும் சக்திவாய்ந்த செய்தி — முழுமையான சரணடைதல்.',
      advice: 'இரவு தூங்கும் முன் சொல்லுங்கள்: "கிருஷ்ணா, எல்லாவற்றையும் உன்னிடம் ஒப்படைக்கிறேன்."'
    },
    te: {
      translation: 'సమస్త ధర్మాలను విడిచిపెట్టి నాకు శరణు వచ్చండి. నేను మిమ్మల్ని సమస్త పాపాల నుండి విముక్తి చేస్తాను.',
      explanation: 'ఇది గీత యొక్క చివరి మరియు అత్యంత శక్తివంతమైన సందేశం — పూర్తి సమర్పణ.',
      advice: 'రాత్రి నిద్రపోయే ముందు చెప్పండి: "కృష్ణా, నేను సర్వస్వం నీకు అప్పగిస్తున్నాను."'
    },
    mr: {
      translation: 'सर्व धर्म सोडून माझ्या शरणात ये. मी तुझ्या सर्व पापांमुक्त करीन, शोक करू नकोस.',
      explanation: 'हा गीतेचा अंतिम आणि सर्वात शक्तिशाली संदेश आहे — पूर्ण समर्पण.',
      advice: 'रात्री झोपण्याआधी म्हणा: "कृष्ण, मी सर्व काही तुला सोपवतो." हलकेपणा जाणवा.'
    },
    bn: {
      translation: 'সমস্ত ধর্ম ত্যাগ করে আমার কাছে এসো। আমি তোমাকে সকল পাপ থেকে মুক্ত করব।',
      explanation: 'এটি গীতার শেষ এবং সবচেয়ে শক্তিশালী বার্তা — সম্পূর্ণ আত্মসমর্পণ।',
      advice: 'রাতে ঘুমানোর আগে বলুন: "কৃষ্ণ, আমি সবকিছু তোমাকে দিচ্ছি।"'
    },
    kn: {
      translation: 'ಎಲ್ಲಾ ಧರ್ಮಗಳನ್ನು ತೊರೆದು ನನಗೆ ಶರಣಾಗಿ. ನಾನು ನಿಮ್ಮನ್ನು ಎಲ್ಲಾ ಪಾಪಗಳಿಂದ ಮುಕ್ತಗೊಳಿಸುತ್ತೇನೆ.',
      explanation: 'ಇದು ಗೀತೆಯ ಕೊನೆಯ ಮತ್ತು ಅತ್ಯಂತ ಶಕ್ತಿಶಾಲಿ ಸಂದೇಶ — ಪೂರ್ಣ ಸಮರ್ಪಣೆ.',
      advice: 'ರಾತ್ರಿ ಮಲಗುವ ಮೊದಲು ಹೇಳಿ: "ಕೃಷ್ಣ, ನಾನು ಎಲ್ಲವನ್ನೂ ನಿಮಗೆ ಒಪ್ಪಿಸುತ್ತೇನೆ."'
    },
    gu: {
      translation: 'બધા ધર્મો છોડીને મારી શરણમાં આવો. હું તમને બધા પાપોથી મુક્ત કરીશ.',
      explanation: 'આ ગીતાનો અંતિમ અને સૌથી શક્તિશાળી સંદેશ છે — સંપૂર્ણ સમર્પણ.',
      advice: 'રાત્રે સૂતા પહેલાં કહો: "કૃષ્ણ, હું બધું તમને સોંપું છું."'
    },
    ml: {
      translation: 'എല്ലാ ധർമ്മങ്ങളും ഉപേക്ഷിച്ച് എന്നിലേക്ക് വരിക. ഞാൻ നിങ്ങളെ എല്ലാ പാപങ്ങളിൽ നിന്നും മോചിപ്പിക്കും.',
      explanation: 'ഇത് ഗീതയുടെ അവസാനവും ഏറ്റവും ശക്തമായ സന്ദേശവും — പൂർണ്ണ സമർപ്പണം.',
      advice: 'രാത്രി ഉറങ്ങുന്നതിന് മുമ്പ് പറയുക: "കൃഷ്ണാ, ഞാൻ എല്ലാം നിന്നെ ഏൽപ്പിക്കുന്നു."'
    },
  },

  // Chapter 2, Verse 20 — Soul is immortal
  '2.20': {
    hi: {
      translation: 'आत्मा का जन्म नहीं होता और न मृत्यु ही होती है। यह अजन्मा, नित्य, शाश्वत और पुरातन है।',
      explanation: 'यह सबसे गहरा श्लोक है — आत्मा मृत्यु से परे है। मृत्यु केवल शरीर के कपड़े बदलना है।',
      advice: 'तुम यह शरीर नहीं हो। तुम शाश्वत साक्षी हो। मृत्यु तुम्हें छू नहीं सकती।'
    },
  },

  // Chapter 2, Verse 48 — Yoga of equanimity
  '2.48': {
    hi: {
      translation: 'योग में स्थित होकर कर्म करो, आसक्ति छोड़कर, सिद्धि और असिद्धि में समान रहकर। इस समत्व को योग कहते हैं।',
      explanation: 'सच्चा योग फल से प्रभावित न होकर कर्म करना है। यही शांति का रहस्य है।',
      advice: 'सफल हों या असफल, अपना आंतरिक संतुलन बनाए रखें।'
    },
  },

  // Chapter 4, Verse 7 — God incarnates
  '4.7': {
    hi: {
      translation: 'जब-जब धर्म की हानि होती है और अधर्म की वृद्धि होती है, तब-तब मैं अपने आप को प्रकट करता हूं।',
      explanation: 'जब बुराई अच्छाई को खतरा पैदा करती है, तब भगवान अवतार लेते हैं।',
      advice: 'चाहे कितना भी अंधेरा हो, भगवान हमेशा संतुलन बहाल करेंगे।'
    },
  },

  // Chapter 3, Verse 21 — Leaders set examples
  '3.21': {
    hi: {
      translation: 'जो कुछ महान व्यक्ति करता है, साधारण मनुष्य भी वही करता है। जो प्रमाण वह स्थापित करता है, संसार उसका अनुसरण करता है।',
      explanation: 'आपके कर्म दूसरों को प्रभावित करते हैं। नेताओं पर एक उदाहरण स्थापित करने की जिम्मेदारी है।',
      advice: 'अपने कर्मों से सावधान रहें — यह लहरें बनाते हैं।'
    },
  },

  // Chapter 6, Verse 35 — Mind can be controlled
  '6.35': {
    hi: {
      translation: 'मन चंचल, उग्र और जिद्दी है। लेकिन अभ्यास और वैराग्य से इसे नियंत्रित किया जा सकता है।',
      explanation: 'कृष्ण मानते हैं कि मन को नियंत्रित करना कठिन है, लेकिन लगातार अभ्यास और वैराग्य से संभव है।',
      advice: 'रोज़ 5 मिनट ध्यान करें। मन भटकेगा — यह उसकी प्रकृति है। धीरे से वापस लाएं।'
    },
  },

  // Chapter 9, Verse 22 — God takes care of devotees
  '9.22': {
    hi: {
      translation: 'जो मेरे अलावा किसी अन्य का चिंतन नहीं करते, केवल मेरी उपासना करते हैं, मैं उनकी कमी पूरी करता हूं और जो उनके पास है उसे सुरक्षित रखता हूं।',
      explanation: 'भगवान भक्तों की देखभाल करते हैं। आप कभी अकेले नहीं हैं।',
      advice: 'जब अकेलापन महसूस हो, आंखें बंद करके कहो: "मैं अकेला नहीं हूं।"'
    },
  },
};

// Language display names for verse display
const langDisplayNames = {
  en: 'English',
  hi: 'हिन्दी',
  ta: 'தமிழ்',
  te: 'తెలుగు',
  mr: 'मराठी',
  bn: 'বাংলা',
  kn: 'ಕನ್ನಡ',
  gu: 'ગુજરાતી',
  ml: 'മലയാളം',
};

// Detect language from user text
function detectLanguage(text) {
  const lower = text.toLowerCase();

  // Hindi (Devanagari script)
  if (/[\u0900-\u097F]/.test(text)) return 'hi';
  // Tamil
  if (/[\u0B80-\u0BFF]/.test(text)) return 'ta';
  // Telugu
  if (/[\u0C00-\u0C7F]/.test(text)) return 'te';
  // Bengali
  if (/[\u0980-\u09FF]/.test(text)) return 'bn';
  // Gujarati
  if (/[\u0A80-\u0AFF]/.test(text)) return 'gu';
  // Kannada
  if (/[\u0C80-\u0CFF]/.test(text)) return 'kn';
  // Malayalam
  if (/[\u0D00-\u0D7F]/.test(text)) return 'ml';
  // Devanagari (Marathi also uses Devanagari, but we default to Hindi for Devanagari)
  // Marathi can be detected by specific words
  if (/[\u0900-\u097F]/.test(text)) {
    const marathiWords = ['आहे', 'आहेत', 'होय', 'नाही', 'करा', 'करू', 'म्हणून', 'माझ्या', 'तुम्हाला'];
    if (marathiWords.some(w => text.includes(w))) return 'mr';
    return 'hi';
  }

  // For Latin script, try to detect by language-specific words
  // For Latin script, default to English
  return 'en';
}

// Get translated verse data
function getTranslatedVerse(verse, lang) {
  if (!lang || lang === 'en') return verse;

  const key = `${verse.chapter}.${verse.verse}`;
  const translations = verseTranslations[key];

  if (translations && translations[lang]) {
    return {
      ...verse,
      translation: translations[lang].translation || verse.translation,
      explanation: translations[lang].explanation || verse.explanation,
      advice: translations[lang].advice || verse.advice,
    };
  }

  // No translation available — return English
  return verse;
}

// Language-specific system prompt additions
const langPrompts = {
  en: '',
  hi: '\n\nIMPORTANT: The user is communicating in Hindi. You MUST respond entirely in Hindi (Devanagari script). All your advice, explanations, and conversational text should be in Hindi. Keep Sanskrit verses as-is.',
  ta: '\n\nIMPORTANT: The user is communicating in Tamil. You MUST respond entirely in Tamil script. All your advice, explanations, and conversational text should be in Tamil. Keep Sanskrit verses as-is.',
  te: '\n\nIMPORTANT: The user is communicating in Telugu. You MUST respond entirely in Telugu script. All your advice, explanations, and conversational text should be in Telugu. Keep Sanskrit verses as-is.',
  mr: '\n\nIMPORTANT: The user is communicating in Marathi. You MUST respond entirely in Marathi (Devanagari script). All your advice, explanations, and conversational text should be in Marathi. Keep Sanskrit verses as-is.',
  bn: '\n\nIMPORTANT: The user is communicating in Bengali. You MUST respond entirely in Bengali script. All your advice, explanations, and conversational text should be in Bengali. Keep Sanskrit verses as-is.',
  kn: '\n\nIMPORTANT: The user is communicating in Kannada. You MUST respond entirely in Kannada script. All your advice, explanations, and conversational text should be in Kannada. Keep Sanskrit verses as-is.',
  gu: '\n\nIMPORTANT: The user is communicating in Gujarati. You MUST respond entirely in Gujarati script. All your advice, explanations, and conversational text should be in Gujarati. Keep Sanskrit verses as-is.',
  ml: '\n\nIMPORTANT: The user is communicating in Malayalam. You MUST respond entirely in Malayalam script. All your advice, explanations, and conversational text should be in Malayalam. Keep Sanskrit verses as-is.',
};

export {
  verseTranslations,
  langDisplayNames,
  detectLanguage,
  getTranslatedVerse,
  langPrompts,
};
