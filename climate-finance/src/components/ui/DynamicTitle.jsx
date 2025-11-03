import React, { useEffect } from "react";
import { useLanguage } from "../../context/LanguageContext";
import { getClimateFinanceTrackerTransliteration } from "../../utils/transliteration";

const DynamicTitle = () => {
    const { language } = useLanguage();

    useEffect(() => {
        const title = getClimateFinanceTrackerTransliteration(language);

        document.title = title;

        const titleEl = document.querySelector("title");
        if (titleEl) {
            titleEl.classList.add("notranslate");
            titleEl.setAttribute("translate", "no");
        }

        const observer = new MutationObserver(() => {
            if (document.title !== title) {
                document.title = title;
            }
            const t = document.querySelector("title");
            if (t && !t.classList.contains("notranslate")) {
                t.classList.add("notranslate");
                t.setAttribute("translate", "no");
            }
        });

        observer.observe(document.head, {
            childList: true,
            subtree: true,
            characterData: true,
        });

        return () => observer.disconnect();
    }, [language]);

    return null;
};

export default DynamicTitle;
