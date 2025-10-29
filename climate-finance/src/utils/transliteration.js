// Transliteration utilities for converting English terms to Bengali transliterations

export const getClimateFinanceTransliteration = (language) => {
    if (language === "bn") {
        return "ক্লাইমেট ফাইন্যান্স";
    }
    return "Climate Finance";
};

export const getClimateFinanceTrackerTransliteration = (language) => {
    if (language === "bn") {
        return "সবুজ জবাবদিহিতা মনিটর";
    }
    return "Green Accountability Monitor";
};

export const getAdaptationTransliteration = (language) => {
    if (language === "bn") {
        return "অ্যাডাপটেশন";
    }
    return "Adaptation";
};

export const getMitigationTransliteration = (language) => {
    if (language === "bn") {
        return "মিটিগেশন";
    }
    return "Mitigation";
};
