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

        // Clear ALL translation-related cookies aggressively
        const cookieNames = ['googtrans', 'google_translate_element', '_GOOGLE_TRANSLATE_ELEMENT_', 'OGPC'];
        
        cookieNames.forEach(name => {
            document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
            document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
            document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=None; Secure`;
        });

        // If switching to Bangla, set the googtrans cookie
        if (newLang === "bn") {
            const expireDate = new Date();
            expireDate.setTime(expireDate.getTime() + (365 * 24 * 60 * 60 * 1000));
            const expireDateString = expireDate.toUTCString();
            
            document.cookie = `googtrans=/en/bn; path=/; expires=${expireDateString}; SameSite=Lax`;
            document.cookie = `googtrans=/en/bn; path=/; expires=${expireDateString}`;
        }

        // Update React state
        updateLanguage(newLang);

        // Aggressive cache busting - multiple approaches to force reload without cache
        const timestamp = Date.now();
        const randomId = Math.random().toString(36).substring(7);
        
        // Clear service worker cache if exists
        if ('caches' in window) {
            caches.keys().then(cacheNames => {
                cacheNames.forEach(cacheName => {
                    caches.delete(cacheName);
                });
            });
        }

        // Build URL with multiple cache-busting parameters
        const currentUrl = new URL(window.location);
        currentUrl.searchParams.set('_t', timestamp);
        currentUrl.searchParams.set('_lang', newLang);
        currentUrl.searchParams.set('_id', randomId);

        // Force hard reload with cache bypass
        setTimeout(() => {
            // Use replace to avoid back button issues
            window.location.replace(currentUrl.toString());
        }, 150);
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
