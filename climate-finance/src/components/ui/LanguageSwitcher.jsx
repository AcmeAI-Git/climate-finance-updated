"use client"; // Add this if using Next.js App Router

import React, { useEffect } from "react";
import Button from "./Button";
import { useLanguage } from "../../context/LanguageContext";

const LanguageSwitcher = () => {
    const { language, updateLanguage } = useLanguage();

    useEffect(() => {
        // Language is now managed by LanguageContext
        // This effect only handles Google Translate setup

        // Check if Google Translate is already loaded
        if (window.google && window.google.translate) {
            return;
        }

        // Define the global init function BEFORE loading the script
        window.googleTranslateElementInit = () => {
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

        // Store preference in localStorage
        localStorage.setItem('preferredLanguage', newLang);

        // For Vercel: Clear the googtrans cookie
        if (newLang === "en") {
            // Clear translation cookie
            document.cookie = `googtrans=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC`;
            document.cookie = `googtrans=; path=/; domain=${window.location.hostname}; expires=Thu, 01 Jan 1970 00:00:00 UTC`;
        } else {
            // Set translation cookie for Bangla
            const expireDate = new Date();
            expireDate.setTime(expireDate.getTime() + (365 * 24 * 60 * 60 * 1000));
            const expireDateString = expireDate.toUTCString();
            
            document.cookie = `googtrans=/en/bn; path=/; expires=${expireDateString}`;
        }

        // Update React state first
        updateLanguage(newLang);

        // For Vercel, use a full hard refresh with no-cache headers
        // Add multiple cache-busting strategies
        const noCacheUrl = new URL(window.location);
        noCacheUrl.searchParams.set('_t', Date.now());
        noCacheUrl.searchParams.set('_lang_switch', 'true');

        // Use a small delay to ensure cookies are set
        setTimeout(() => {
            // Force a complete page reload bypassing cache
            fetch(noCacheUrl.toString(), { 
                method: 'GET',
                headers: {
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                    'Pragma': 'no-cache',
                    'Expires': '0'
                }
            }).then(() => {
                // Reload after fetch to ensure Vercel serves fresh content
                window.location.href = noCacheUrl.toString();
            }).catch(() => {
                // Fallback if fetch fails
                window.location.href = noCacheUrl.toString();
            });
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
