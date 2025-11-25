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
                console.log('Google Translate initialized');
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
            script.onerror = () => console.log('Google Translate script failed to load');
            document.body.appendChild(script);
        }
    }, []);

    const toggleLanguage = () => {
        const newLang = language === "en" ? "bn" : "en";

        console.log('=== Language Toggle Debug ===');
        console.log('Current language:', language);
        console.log('Switching to:', newLang);

        // Update React state first
        updateLanguage(newLang);

        // Set the googtrans cookie BEFORE attempting translation
        if (newLang === "en") {
            // Clear googtrans cookie to return to English
            document.cookie = `googtrans=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Lax`;
            document.cookie = `googtrans=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC`;
            console.log('Cleared googtrans cookie');
        } else {
            // Set googtrans cookie for Bangla
            const expireDate = new Date();
            expireDate.setTime(expireDate.getTime() + (365 * 24 * 60 * 60 * 1000));
            const expireDateString = expireDate.toUTCString();
            
            document.cookie = `googtrans=/en/bn; path=/; expires=${expireDateString}; SameSite=Lax`;
            document.cookie = `googtrans=/en/bn; path=/; expires=${expireDateString}`;
            console.log('Set googtrans cookie to /en/bn');
        }

        console.log('Current cookies:', document.cookie);

        // Try to use Google Translate's API to force translation
        if (window.google && window.google.translate && window.google.translate.TranslateService) {
            try {
                console.log('Attempting to use TranslateService...');
                
                // Get the language code from the select element
                const selectElement = document.querySelector('select.goog-te-combo');
                if (selectElement) {
                    console.log('Found language selector');
                    selectElement.value = newLang;
                    selectElement.dispatchEvent(new Event('change'));
                    console.log('Dispatched change event on selector');
                    return;
                } else {
                    console.log('Language selector not found');
                }
            } catch (err) {
                console.log('TranslateService error:', err);
            }
        }

        // Fallback: Full page reload with cache busting
        console.log('Using fallback: page reload with cache busting');
        
        const reloadUrl = new URL(window.location);
        // Remove old params
        reloadUrl.searchParams.delete('_t');
        reloadUrl.searchParams.delete('_lang');
        // Add new params
        reloadUrl.searchParams.set('_t', Date.now());
        reloadUrl.searchParams.set('_lang', newLang);

        console.log('Reload URL:', reloadUrl.toString());

        setTimeout(() => {
            console.log('Executing page reload...');
            window.location.href = reloadUrl.toString();
        }, 200);
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
