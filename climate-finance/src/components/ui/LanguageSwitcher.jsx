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

        // CRITICAL FIX: Remove ALL Google Translate DOM elements
        // This prevents the stuck loading spinner issue
        const elementsToRemove = [
            document.querySelector('.skiptranslate'),
            document.querySelector('.goog-te-banner-frame'),
            document.querySelector('.goog-te-spinner-pos'),
            document.querySelector('.VIpgJd-ZVi9od-aZ2wEe-wOHMyf'), // Loading spinner
            document.getElementById('google_translate_element'),
            document.getElementById('google-translate-script'),
            ...document.querySelectorAll('iframe[src*="translate.google"]'),
            ...document.querySelectorAll('iframe[src*="translate.googleapis"]'),
        ];

        elementsToRemove.forEach(el => {
            if (el) {
                console.log('Removing element:', el.className || el.id);
                el.remove();
            }
        });

        // Remove Google Translate global objects
        if (window.google && window.google.translate) {
            delete window.google.translate;
            console.log('Removed window.google.translate');
        }
        delete window.googleTranslateElementInit;

        // Update React state
        updateLanguage(newLang);

        // Clear ALL Google Translate cookies
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

        // Set the new googtrans cookie for target language
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

        // Force hard reload with multiple fallbacks
        setTimeout(() => {
            console.log('Forcing hard reload...');
            
            // Use window.location.replace with no-cache headers
            const url = new URL(window.location);
            url.searchParams.set('_reload', Date.now());
            
            // Force clear browser cache with meta tag injection
            const meta = document.createElement('meta');
            meta.httpEquiv = 'Cache-Control';
            meta.content = 'no-cache, no-store, must-revalidate';
            document.head.appendChild(meta);
            
            window.location.replace(url.toString());
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

        /* Hide the stuck loading spinner */
        .VIpgJd-ZVi9od-aZ2wEe-wOHMyf,
        .goog-te-spinner-pos,
        .VIpgJd-ZVi9od-aZ2wEe-OiiCO {
          display: none !important;
          visibility: hidden !important;
        }
      `}</style>
        </div>
    );
};

export default LanguageSwitcher;
