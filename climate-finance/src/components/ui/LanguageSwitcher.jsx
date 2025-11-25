"use client"; // Add this if using Next.js App Router

import React, { useEffect } from "react";
import Button from "./Button";
import { useLanguage } from "../../context/LanguageContext";

const LanguageSwitcher = () => {
    const { language, updateLanguage } = useLanguage();

    useEffect(() => {
        // Language is now managed by LanguageContext
        // This effect only handles Google Translate setup

        // Ensure the HTML lang attribute is always set to English
        document.documentElement.lang = 'en';

        // Check if Google Translate is already loaded
        if (window.google && window.google.translate) {
            return;
        }

        // Define the global init function BEFORE loading the script
        window.googleTranslateElementInit = () => {
            try {
                new window.google.translate.TranslateElement(
                    {
                        pageLanguage: "en",
                        includedLanguages: "bn,en",
                        layout: window.google.translate.TranslateElement
                            .InlineLayout.SIMPLE,
                        autoDisplay: false,
                    },
                    "google_translate_element"
                );
            } catch (err) {
                console.log('Google Translate init error:', err);
            }
        };

        // Load script dynamically with HTTPS for production
        if (!document.getElementById("google-translate-script")) {
            const script = document.createElement("script");
            script.id = "google-translate-script";
            script.src =
                "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
            script.async = true;
            document.body.appendChild(script);
        }
    }, []);

    const toggleLanguage = () => {
        const newLang = language === "en" ? "bn" : "en";

        console.log('=== Language Toggle Debug ===');
        console.log('Current language:', language);
        console.log('Switching to:', newLang);

        // Store preference in localStorage
        localStorage.setItem('preferredLanguage', newLang);
        console.log('localStorage preferredLanguage set to:', newLang);

        // Always reset lang attribute to English first (prevents transliteration)
        document.documentElement.lang = 'en';
        console.log('HTML lang attribute set to: en');

        // Clear the googtrans cookie completely first
        document.cookie = `googtrans=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC`;
        document.cookie = `googtrans=; path=/; domain=${window.location.hostname}; expires=Thu, 01 Jan 1970 00:00:00 UTC`;
        console.log('Cleared googtrans cookies');

        // If switching to Bangla, set the translation cookie
        if (newLang === "bn") {
            const expireDate = new Date();
            expireDate.setTime(expireDate.getTime() + (365 * 24 * 60 * 60 * 1000));
            const expireDateString = expireDate.toUTCString();
            
            // Use the proper format for Google Translate
            document.cookie = `googtrans=/en/bn; path=/; expires=${expireDateString}; SameSite=Lax`;
            document.cookie = `googtrans=/en/bn; path=/; expires=${expireDateString}`;
            console.log('Set googtrans cookie to: /en/bn');
        }

        console.log('All cookies after toggle:', document.cookie);

        // Update React state
        updateLanguage(newLang);

        // For Vercel: Force a complete page reload to get fresh translation
        const noCacheUrl = new URL(window.location);
        // Remove any existing cache-busting params
        noCacheUrl.searchParams.delete('_t');
        noCacheUrl.searchParams.delete('_lang_switch');
        // Add fresh cache-busting params
        noCacheUrl.searchParams.set('_t', Date.now());
        noCacheUrl.searchParams.set('_lang_switch', newLang);

        console.log('Reloading with URL:', noCacheUrl.toString());

        // Use a small delay to ensure cookies are set before reload
        setTimeout(() => {
            // Hard refresh - Ctrl+R behavior
            console.log('Executing window.location.href redirect');
            window.location.href = noCacheUrl.toString();
        }, 100);
    };

    return (
        <div
            className={`relative z-1000 min-w-[100px] flex items-center ${
                language === "bn" ? "noto-sans-bengali" : ""
            }`}
        >
            <button
                onClick={toggleLanguage}
                className="inline-flex items-center px-2 py-2.5 bg-linear-to-r from-violet-600 to-violet-600 text-white text-xs font-semibold rounded-lg hover:shadow-lg hover:shadow-violet-200 hover:from-violet-700 hover:to-violet-700 transition-all duration-300 group"
            >
                {language === "en" ? "⇆  English" : "⇆  বাংলা"}
            </button>

            {/* Hidden Google Translate element */}
            <div
                id="google_translate_element"
                style={{ display: "none" }}
            ></div>

            {/* Force-hide unwanted Google Translate UI elements */}
            <style>{`
        .goog-te-banner-frame {
          display: none !important;
          height: 0 !important;
          visibility: hidden !important;
        }

        body {
          top: 0px !important;
          position: static !important;
        }

        .skiptranslate {
          display: none !important;
        }

        .goog-te-gadget {
          font-size: 0 !important;
        }

        .goog-logo-link {
          display: none !important;
        }
      `}</style>
        </div>
    );
};

export default LanguageSwitcher;
