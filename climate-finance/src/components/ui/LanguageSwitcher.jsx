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

        // NUCLEAR OPTION: Clear ALL Google Translate related storage
        // Clear all cookies
        const cookies = document.cookie.split(";");
        for (let cookie of cookies) {
            const eqPos = cookie.indexOf("=");
            const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
            if (name.includes('goog') || name.includes('translate')) {
                document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC`;
                document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Lax`;
            }
        }
        console.log('Cleared all Google Translate cookies');

        // Set the new googtrans cookie
        if (newLang === "bn") {
            const expireDate = new Date();
            expireDate.setTime(expireDate.getTime() + (365 * 24 * 60 * 60 * 1000));
            const expireDateString = expireDate.toUTCString();
            
            document.cookie = `googtrans=/en/bn; path=/; expires=${expireDateString}; SameSite=Lax`;
            console.log('Set googtrans cookie to /en/bn');
        } else {
            console.log('Not setting googtrans (returning to English)');
        }

        console.log('Final cookies:', document.cookie);

        // Force a HARD reload that bypasses all caches
        // This is the most aggressive reload possible in JavaScript
        setTimeout(() => {
            console.log('Forcing hard reload...');
            
            // Method 1: Use location.reload(true) - deprecated but still works
            try {
                window.location.reload(true);
            } catch {
                console.log('Method 1 failed, trying method 2');
                
                // Method 2: Use replace with cache-busting
                const url = new URL(window.location);
                url.searchParams.set('nocache', Date.now());
                window.location.replace(url.toString());
            }
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
