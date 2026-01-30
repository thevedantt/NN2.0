
export interface OfflineSupportMap {
    [key: string]: {
        [lang: string]: string;
    };
}

export const offlineSupportMap: OfflineSupportMap = {
    sad: {
        en: "I’m sorry you’re feeling sad. I’m here with you.",
        hi: "मुझे दुख है कि आप उदास हैं। मैं आपके साथ हूँ।",
        mr: "तुम्ही उदास आहात याचे वाईट वाटते. मी तुमच्यासोबत आहे."
    },
    alone: {
        en: "You are not alone. Your feelings matter.",
        hi: "आप अकेले नहीं हैं। आपकी भावनाएँ मायने रखती हैं।",
        mr: "तुम्ही एकटे नाही. तुमच्या भावना महत्त्वाच्या आहेत."
    },
    lonely: {
        en: "Feeling lonely happens to many people. You deserve connection.",
        hi: "अकेलापन बहुत लोगों को महसूस होता है। आप जुड़ाव के हकदार हैं।",
        mr: "एकटेपणा अनेकांना वाटतो. तुम्ही जोडणीस पात्र आहात."
    },
    anxious: {
        en: "Take a slow breath. You are safe right now.",
        hi: "धीरे साँस लें। आप अभी सुरक्षित हैं।",
        mr: "हळू श्वास घ्या. तुम्ही आत्ता सुरक्षित आहात."
    },
    angry: {
        en: "It’s okay to feel angry. Let’s pause together.",
        hi: "गुस्सा आना ठीक है। चलिए थोड़ी देर रुकते हैं।",
        mr: "राग येणे ठीक आहे. चला थोडा थांबूया."
    },
    tired: {
        en: "You sound tired. Rest can help.",
        hi: "आप थके हुए लगते हैं। आराम मदद कर सकता है।",
        mr: "तुम्ही थकलेले वाटता. विश्रांती उपयोगी पडेल."
    },
    stressed: {
        en: "Stress can be heavy. Try relaxing your shoulders.",
        hi: "तनाव भारी लग सकता है। कंधे ढीले छोड़ें।",
        mr: "ताण जड वाटू शकतो. खांदे सैल सोडा."
    },
    scared: {
        en: "It’s okay to feel scared. You’re not alone.",
        hi: "डर लगना ठीक है। आप अकेले नहीं हैं।",
        mr: "भीती वाटणे ठीक आहे. तुम्ही एकटे नाही."
    },
    worried: {
        en: "Worry can pass. Focus on one breath.",
        hi: "चिंता गुजर सकती है। एक साँस पर ध्यान दें।",
        mr: "काळजी कमी होऊ शकते. एका श्वासावर लक्ष द्या."
    },
    confused: {
        en: "It’s okay to feel confused. Take your time.",
        hi: "उलझन महसूस होना ठीक है। समय लें।",
        mr: "गोंधळ होणे ठीक आहे. वेळ घ्या."
    },
    hurt: {
        en: "I’m sorry you’re hurting. Your pain is valid.",
        hi: "मुझे दुख है कि आपको दर्द है। आपका दर्द सही है।",
        mr: "तुम्हाला वेदना आहेत याचे वाईट वाटते. तुमची वेदना खरी आहे."
    },
    guilty: {
        en: "Guilt is human. Be gentle with yourself.",
        hi: "गलती का एहसास इंसानी है। खुद से नरमी रखें।",
        mr: "गिल्ट मानवी आहे. स्वतःशी सौम्य राहा."
    },
    ashamed: {
        en: "You deserve kindness, even from yourself.",
        hi: "आप दया के हकदार हैं, खुद से भी।",
        mr: "तुम्ही दयेस पात्र आहात, स्वतःकडूनही."
    },
    hopeless: {
        en: "Even small hope matters. I’m here.",
        hi: "छोटी उम्मीद भी मायने रखती है। मैं यहाँ हूँ।",
        mr: "लहान आशाही महत्त्वाची आहे. मी येथे आहे."
    },
    overwhelmed: {
        en: "Let’s take one step at a time.",
        hi: "एक समय में एक कदम लें।",
        mr: "एकावेळी एक पाऊल टाका."
    },
    numb: {
        en: "Feeling numb can happen. You’re still here.",
        hi: "सुन्न महसूस होना हो सकता है। आप यहाँ हैं।",
        mr: "बधिर वाटणे शक्य आहे. तुम्ही येथे आहात."
    },
    panic: {
        en: "Try slow breathing with me.",
        hi: "मेरे साथ धीरे साँस लें।",
        mr: "माझ्यासोबत हळू श्वास घ्या."
    },
    fear: {
        en: "Fear passes. You are safe now.",
        hi: "डर गुजर जाता है। आप सुरक्षित हैं।",
        mr: "भीती कमी होते. तुम्ही सुरक्षित आहात."
    },
    failure: {
        en: "Failure doesn’t define you.",
        hi: "असफलता आपको परिभाषित नहीं करती।",
        mr: "अपयश तुम्हाला ठरवत नाही."
    },
    rejection: {
        en: "Rejection hurts, but you still matter.",
        hi: "ठुकराया जाना दुख देता है, पर आप मायने रखते हैं।",
        mr: "नकार दुख देतो, पण तुम्ही महत्त्वाचे आहात."
    },

    // --- repeat supportive patterns for coverage ---
    mood1: { en: "Your feelings are valid.", hi: "आपकी भावनाएँ सही हैं।", mr: "तुमच्या भावना योग्य आहेत." },
    mood2: { en: "You deserve support.", hi: "आप समर्थन के हकदार हैं।", mr: "तुम्ही आधारास पात्र आहात." },
    mood3: { en: "Take a gentle breath.", hi: "धीरे साँस लें।", mr: "हळू श्वास घ्या." },
    mood4: { en: "You are doing your best.", hi: "आप अपना सर्वश्रेष्ठ कर रहे हैं।", mr: "तुम्ही तुमचे सर्वोत्तम करत आहात." },
    mood5: { en: "It’s okay to pause.", hi: "रुकना ठीक है।", mr: "थांबणे ठीक आहे." },
    mood6: { en: "Small steps matter.", hi: "छोटे कदम मायने रखते हैं।", mr: "लहान पावले महत्त्वाची आहेत." },
    mood7: { en: "Be kind to yourself.", hi: "खुद से दया रखें।", mr: "स्वतःशी दयाळू राहा." },
    mood8: { en: "You are enough.", hi: "आप पर्याप्त हैं।", mr: "तुम्ही पुरेसे आहात." },
    mood9: { en: "You can take your time.", hi: "आप समय ले सकते हैं।", mr: "वेळ घेऊ शकता." },
    mood10: { en: "I’m here to listen.", hi: "मैं सुनने के लिए हूँ।", mr: "मी ऐकण्यासाठी आहे." },

    mood11: { en: "Your emotions matter.", hi: "आपकी भावनाएँ मायने रखती हैं।", mr: "तुमच्या भावना महत्त्वाच्या आहेत." },
    mood12: { en: "You’re not alone here.", hi: "आप यहाँ अकेले नहीं हैं।", mr: "तुम्ही येथे एकटे नाही." },
    mood13: { en: "One breath at a time.", hi: "एक साँस पर ध्यान दें।", mr: "एका श्वासावर लक्ष द्या." },
    mood14: { en: "You deserve care.", hi: "आप देखभाल के हकदार हैं।", mr: "तुम्ही काळजीस पात्र आहात." },
    mood15: { en: "It’s okay to rest.", hi: "आराम करना ठीक है।", mr: "विश्रांती घेणे ठीक आहे." },
    mood16: { en: "You are valued.", hi: "आप मूल्यवान हैं।", mr: "तुम्ही मौल्यवान आहात." },
    mood17: { en: "Take it slowly.", hi: "धीरे लें।", mr: "हळूहळू घ्या." },
    mood18: { en: "You matter.", hi: "आप मायने रखते हैं।", mr: "तुम्ही महत्त्वाचे आहात." },
    mood19: { en: "You’re safe here.", hi: "आप यहाँ सुरक्षित हैं।", mr: "तुम्ही येथे सुरक्षित आहात." },
    mood20: { en: "Your effort counts.", hi: "आपका प्रयास मायने रखता है।", mr: "तुमचा प्रयत्न महत्त्वाचा आहे." },

    mood21: { en: "It’s okay to feel this.", hi: "ऐसा महसूस करना ठीक है।", mr: "असे वाटणे ठीक आहे." },
    mood22: { en: "You’re doing okay.", hi: "आप ठीक कर रहे हैं।", mr: "तुम्ही ठीक करत आहात." },
    mood23: { en: "Stay with the moment.", hi: "इस पल में रहें।", mr: "या क्षणात राहा." },
    mood24: { en: "You can try again.", hi: "आप फिर कोशिश कर सकते हैं।", mr: "पुन्हा प्रयत्न करू शकता." },
    mood25: { en: "Gentle steps help.", hi: "नरम कदम मदद करते हैं।", mr: "सौम्य पावले मदत करतात." },
    mood26: { en: "You are supported.", hi: "आपको समर्थन है।", mr: "तुम्हाला आधार आहे." },
    mood27: { en: "You are not a burden.", hi: "आप बोझ नहीं हैं।", mr: "तुम्ही ओझे नाही." },
    mood28: { en: "Your story matters.", hi: "आपकी कहानी मायने रखती है।", mr: "तुमची कथा महत्त्वाची आहे." },
    mood29: { en: "It’s okay to share.", hi: "साझा करना ठीक है।", mr: "सांगणे ठीक आहे." },
    mood30: { en: "You deserve peace.", hi: "आप शांति के हकदार हैं।", mr: "तुम्ही शांततेस पात्र आहात." },

    mood31: { en: "Calm is possible.", hi: "शांति संभव है।", mr: "शांतता शक्य आहे." },
    mood32: { en: "You are learning.", hi: "आप सीख रहे हैं।", mr: "तुम्ही शिकत आहात." },
    mood33: { en: "Growth takes time.", hi: "विकास समय लेता है।", mr: "वाढीस वेळ लागतो." },
    mood34: { en: "You can pause.", hi: "आप रुक सकते हैं।", mr: "थांबू शकता." },
    mood35: { en: "You are trying.", hi: "आप कोशिश कर रहे हैं।", mr: "तुम्ही प्रयत्न करत आहात." },
    mood36: { en: "That’s okay.", hi: "यह ठीक है।", mr: "ते ठीक आहे." },
    mood37: { en: "You’re human.", hi: "आप इंसान हैं।", mr: "तुम्ही माणूस आहात." },
    mood38: { en: "You’re growing.", hi: "आप बढ़ रहे हैं।", mr: "तुम्ही वाढत आहात." },
    mood39: { en: "You are worthy.", hi: "आप योग्य हैं।", mr: "तुम्ही योग्य आहात." },
    mood40: { en: "Keep breathing.", hi: "साँस लेते रहें।", mr: "श्वास घेत राहा." },

    mood41: { en: "Take care.", hi: "ख्याल रखें।", mr: "काळजी घ्या." },
    mood42: { en: "You are seen.", hi: "आपको देखा जा रहा है।", mr: "तुम्हाला पाहिले जाते." },
    mood43: { en: "You are heard.", hi: "आपकी बात सुनी जाती है।", mr: "तुमचे ऐकले जाते." },
    mood44: { en: "You are safe.", hi: "आप सुरक्षित हैं।", mr: "तुम्ही सुरक्षित आहात." },
    mood45: { en: "One step helps.", hi: "एक कदम मदद करता है।", mr: "एक पाऊल मदत करते." },
    mood46: { en: "Be gentle.", hi: "नरम रहें।", mr: "सौम्य राहा." },
    mood47: { en: "Stay present.", hi: "मौजूद रहें।", mr: "उपस्थित रहा." },
    mood48: { en: "You are okay.", hi: "आप ठीक हैं।", mr: "तुम्ही ठीक आहात." },
    mood49: { en: "You can cope.", hi: "आप संभाल सकते हैं।", mr: "तुम्ही सांभाळू शकता." },
    mood50: { en: "Keep going.", hi: "जारी रखें।", mr: "चालू ठेवा." },

    mood51: { en: "You’re supported here.", hi: "यहाँ आपको समर्थन है।", mr: "येथे तुम्हाला आधार आहे." },
    mood52: { en: "Take a break.", hi: "एक ब्रेक लें।", mr: "थोडा ब्रेक घ्या." },
    mood53: { en: "You deserve rest.", hi: "आप आराम के हकदार हैं।", mr: "तुम्ही विश्रांतीस पात्र आहात." },
    mood54: { en: "You are important.", hi: "आप महत्वपूर्ण हैं।", mr: "तुम्ही महत्त्वाचे आहात." },
    mood55: { en: "You belong.", hi: "आप यहाँ के हैं।", mr: "तुम्ही येथे आहात." },
    mood56: { en: "You can share.", hi: "आप साझा कर सकते हैं।", mr: "सांगू शकता." },
    mood57: { en: "It will pass.", hi: "यह गुजर जाएगा।", mr: "हे जाईल." },
    mood58: { en: "You’re doing enough.", hi: "आप काफी कर रहे हैं।", mr: "तुम्ही पुरेसे करत आहात." },
    mood59: { en: "Stay kind.", hi: "दयालु रहें।", mr: "दयाळू रहा." },
    mood60: { en: "You can breathe.", hi: "आप साँस ले सकते हैं।", mr: "श्वास घेऊ शकता." },

    mood61: { en: "You can slow down.", hi: "धीरे हो सकते हैं।", mr: "हळू करू शकता." },
    mood62: { en: "You are learning daily.", hi: "आप रोज सीख रहे हैं।", mr: "दररोज शिकत आहात." },
    mood63: { en: "You are cared for.", hi: "आपकी परवाह है।", mr: "तुमची काळजी घेतली जाते." },
    mood64: { en: "Stay steady.", hi: "स्थिर रहें।", mr: "स्थिर रहा." },
    mood65: { en: "Peace can grow.", hi: "शांति बढ़ सकती है।", mr: "शांतता वाढू शकते." },
    mood66: { en: "You’re okay here.", hi: "आप यहाँ ठीक हैं।", mr: "येथे ठीक आहात." },
    mood67: { en: "Be patient.", hi: "धैर्य रखें।", mr: "धीर धरा." },
    mood68: { en: "You can pause now.", hi: "अब रुक सकते हैं।", mr: "आता थांबू शकता." },
    mood69: { en: "You are supported always.", hi: "आपको हमेशा समर्थन है।", mr: "नेहमी आधार आहे." },
    mood70: { en: "You are not alone today.", hi: "आज आप अकेले नहीं हैं।", mr: "आज तुम्ही एकटे नाही." },

    mood71: { en: "Your pace is okay.", hi: "आपकी गति ठीक है।", mr: "तुमची गती ठीक आहे." },
    mood72: { en: "You are growing daily.", hi: "आप रोज बढ़ रहे हैं।", mr: "दररोज वाढत आहात." },
    mood73: { en: "Keep calm.", hi: "शांत रहें।", mr: "शांत रहा." },
    mood74: { en: "You are safe now.", hi: "आप अभी सुरक्षित हैं।", mr: "आत्ता सुरक्षित आहात." },
    mood75: { en: "You deserve support.", hi: "आप समर्थन के हकदार हैं।", mr: "तुम्ही आधारास पात्र आहात." },
    mood76: { en: "You are valued here.", hi: "आप यहाँ मूल्यवान हैं।", mr: "येथे मौल्यवान आहात." },
    mood77: { en: "You can rest now.", hi: "अब आराम कर सकते हैं।", mr: "आता विश्रांती घेऊ शकता." },
    mood78: { en: "You are trying your best.", hi: "आप अपना सर्वश्रेष्ठ कर रहे हैं।", mr: "तुमचे सर्वोत्तम करत आहात." },
    mood79: { en: "That is enough.", hi: "वह काफी है।", mr: "ते पुरेसे आहे." },
    mood80: { en: "Stay gentle.", hi: "नरम रहें।", mr: "सौम्य रहा." },

    mood81: { en: "You are cared about.", hi: "आपकी परवाह की जाती है।", mr: "तुमची काळजी घेतली जाते." },
    mood82: { en: "You can talk.", hi: "आप बात कर सकते हैं।", mr: "बोलू शकता." },
    mood83: { en: "You are welcome.", hi: "आपका स्वागत है।", mr: "तुमचे स्वागत आहे." },
    mood84: { en: "You matter here.", hi: "आप यहाँ मायने रखते हैं।", mr: "येथे महत्त्वाचे आहात." },
    mood85: { en: "You can breathe slowly.", hi: "धीरे साँस लें।", mr: "हळू श्वास घ्या." },
    mood86: { en: "You’re supported.", hi: "आपको समर्थन है।", mr: "तुम्हाला आधार आहे." },
    mood87: { en: "You can relax.", hi: "आराम कर सकते हैं।", mr: "आराम करू शकता." },
    mood88: { en: "You are learning slowly.", hi: "आप धीरे सीख रहे हैं।", mr: "हळूहळू शिकत आहात." },
    mood89: { en: "You’re okay today.", hi: "आज आप ठीक हैं।", mr: "आज ठीक आहात." },
    mood90: { en: "Take your time.", hi: "समय लें।", mr: "वेळ घ्या." },

    mood91: { en: "You are strong.", hi: "आप मजबूत हैं।", mr: "तुम्ही मजबूत आहात." },
    mood92: { en: "You can continue.", hi: "आप जारी रख सकते हैं।", mr: "पुढे चालू ठेवू शकता." },
    mood93: { en: "You are brave.", hi: "आप बहादुर हैं।", mr: "तुम्ही धाडसी आहात." },
    mood94: { en: "You are enough today.", hi: "आज आप पर्याप्त हैं।", mr: "आज पुरेसे आहात." },
    mood95: { en: "Stay hopeful.", hi: "उम्मीद रखें।", mr: "आशावादी रहा." },
    mood96: { en: "You can pause anytime.", hi: "कभी भी रुक सकते हैं।", mr: "कधीही थांबू शकता." },
    mood97: { en: "You are learning to cope.", hi: "आप संभालना सीख रहे हैं।", mr: "सांभाळायला शिकत आहात." },
    mood98: { en: "You are supported today.", hi: "आज आपको समर्थन है।", mr: "आज आधार आहे." },
    mood99: { en: "You can be gentle.", hi: "नरम रह सकते हैं।", mr: "सौम्य राहू शकता." },
    mood100: { en: "I’m here with you.", hi: "मैं आपके साथ हूँ।", mr: "मी तुमच्यासोबत आहे." }
};

export const DEFAULT_OFFLINE_RESPONSES: { [lang: string]: string } = {
    en: "I’m here with you. Take a slow breath.",
    hi: "मैं आपके साथ हूँ। धीरे-धीरे सांस लें।",
    mr: "मी तुमच्यासोबत आहे. हळूहळू श्वास घ्या."
};
