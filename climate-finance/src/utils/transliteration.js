// Transliteration utilities for converting English terms to Bengali transliterations

export const getClimateFinanceTransliteration = (language) => {
    if (language === "bn") {
        return "ক্লাইমেট ফাইন্যান্স";
    }
    return "Climate Finance";
};

export const getClimateFinanceTrackerTransliteration = (language) => {
    if (language === "bn") {
        return "গ্রিন একাউন্টিবিলিটি মনিটর";
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

export const getYourMailTransliteration = (language) => {
    if (language === "bn") {
        return "আপনার ইমেইল";
    }
    return "Your Email";
};

export const getRepoDescriptionTransliteration = (language) => {
    if (language === "bn") {
        return "আপনার জলবায়ু রিপোজিটরি কমিউনিটিতে শেয়ার করুন।";
    }
    return "Share your climate repository with the community.";
};

export const getRepositoryTransliteration = (language) => {
    if (language === "bn") {
        return "রিপোজিটোরি";
    }
    return "Repository";
};

export const getDeshboardDescriptionTransliteration = (language) => {
    if (language === "bn") {
        return "বাংলাদেশে জলবায়ু অর্থায়নের প্রবাহ ট্র্যাক, বিশ্লেষণ ও চিত্রায়িত করুন।";
    }
    return "Track, analyze and visualize climate finance flows in Bangladesh.";
};

export const getRepositoryCardDescriptionTransliteration = (language) => {
    if (language === "bn") {
        return "কোথায় পাবেন: সমস্ত উপলব্ধ গবেষণা ডকুমেন্টেশন ব্রাউজ এবং ডাউনলোড করতে ব্রাউজ ডকুমেন্টস বাটনে ক্লিক করুন অথবা ডকুমেন্টস রিপোজিটরি পৃষ্ঠায় নেভিগেট করুন।";
    }
    return "Where to find: Click the Browse Documents button or navigate to the Documents Repository page to browse and download all available research documentation.";
};

export const getInsightsTransliteration = (language) => {
    if (language === "bn") {
        return "বিস্তারিত প্রতিবেদন এবং এ্যানালাইসিস করুন";
    }
    return "Access detailed reports and analytics";
};

export const getRepositoryTitleTransliteration = (language) => {
    if (language === "bn") {
        return "বাংলাদেশের জলবায়ু অর্থায়ন প্রকল্পগুলির বিস্তৃত গবেষণা প্রতিবেদন, কেস স্টাডি, ফিল্ড নোট এবং প্রযুক্তিগত ডকুমেন্টেশন অ্যাক্সেস করুন। সহজে আবিষ্কারের জন্য সমস্ত ডকুমেন্ট পর্যালোচনা এবং শ্রেণীবদ্ধ করা হয়েছে।";
    }
    return "Access comprehensive research reports, case studies, field notes, and technical documentation from climate finance projects across Bangladesh. All documents are reviewed and categorized for easy discovery.";
};

export const getRepositoryCategoryCASESTUDYTransliteration = (language) => {
    if (language === "bn") {
        return "কেস স্টাডি";
    }
    return "Case Study";
};

export const getRepositoryCategoryIMPACTTransliteration = (language) => {
    if (language === "bn") {
        return "ইম্প্যাক্ট রিপোর্ট";
    }
    return "Impact Report";
};

// Format category to title case (e.g., "CASE STUDY" -> "Case Study")
export const formatCategoryToTitleCase = (category) => {
    if (!category) return category;
    
    // Handle common category names
    const categoryMap = {
        "CASE STUDY": "Case Study",
        "IMPACT REPORT": "Impact Report",
        "FIELD NOTES": "Field Notes",
        "case study": "Case Study",
        "impact report": "Impact Report",
        "field notes": "Field Notes",
    };
    
    // Check if it's a known category
    if (categoryMap[category]) {
        return categoryMap[category];
    }
    
    // Otherwise, convert to title case
    return category
        .toLowerCase()
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
};