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

    // Helper function to clear all Google Translate cookies for all possible paths and domains
    const clearGoogleTranslateCookies = () => {
        const hostname = window.location.hostname;
        const domainParts = hostname.split('.');
        
        // Build possible domain variations (e.g., .example.com, example.com, .sub.example.com)
        const domains = ['', hostname];
        if (domainParts.length >= 2) {
            domains.push('.' + hostname);
            domains.push('.' + domainParts.slice(-2).join('.'));
        }
        
        const paths = ['/', ''];
        const cookieNames = ['googtrans', 'googtrans_token'];
        
        // Clear cookies for all combinations
        for (const name of cookieNames) {
            for (const domain of domains) {
                for (const path of paths) {
                    const domainStr = domain ? `; domain=${domain}` : '';
                    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path || '/'}${domainStr}`;
                    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path || '/'}${domainStr}; SameSite=Lax`;
                    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path || '/'}${domainStr}; SameSite=None; Secure`;
                }
            }
        }
        
        // Also try to clear any other Google-related cookies
        const cookies = document.cookie.split(";");
        for (let cookie of cookies) {
            const eqPos = cookie.indexOf("=");
            const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
            if (name.includes('goog') || name.includes('translate')) {
                for (const domain of domains) {
                    for (const path of paths) {
                        const domainStr = domain ? `; domain=${domain}` : '';
                        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path || '/'}${domainStr}`;
                    }
                }
            }
        }
    };

    const toggleLanguage = () => {
        const newLang = language === "en" ? "bn" : "en";

        console.log('=== Language Toggle Debug ===');
        console.log('Current language:', language);
        console.log('Switching to:', newLang);
        console.log('Hostname:', window.location.hostname);

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
            ...document.querySelectorAll('[class*="goog-te"]'),
            ...document.querySelectorAll('[class*="VIpgJd"]'),
        ];

        elementsToRemove.forEach(el => {
            if (el) {
                console.log('Removing element:', el.className || el.id);
                el.remove();
            }
        });

        // Remove Google Translate global objects completely
        if (window.google) {
            delete window.google.translate;
            delete window.google.translate_tb;
        }
        delete window.googleTranslateElementInit;
        delete window._DumpException;

        // Clear ALL Google Translate cookies for all domains/paths
        clearGoogleTranslateCookies();
        console.log('Cleared all Google Translate cookies');

        // Update React state
        updateLanguage(newLang);

        // Set the new googtrans cookie for target language (only for Bangla)
        if (newLang === "bn") {
            const expireDate = new Date();
            expireDate.setTime(expireDate.getTime() + (365 * 24 * 60 * 60 * 1000));
            const expireDateString = expireDate.toUTCString();
            
            // Set cookie for both root and current domain
            document.cookie = `googtrans=/en/bn; path=/; expires=${expireDateString}; SameSite=Lax`;
            
            // Also set for the domain explicitly for custom domains
            const hostname = window.location.hostname;
            if (!hostname.includes('vercel.app') && !hostname.includes('localhost')) {
                document.cookie = `googtrans=/en/bn; path=/; domain=.${hostname}; expires=${expireDateString}; SameSite=Lax`;
            }
            
            console.log('Set googtrans cookie to /en/bn');
        } else {
            // For English, explicitly set to /en/en to force reset
            // Then clear it - this ensures Google Translate resets properly
            document.cookie = `googtrans=/en/en; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC`;
            console.log('Cleared googtrans for English');
        }

        console.log('Final cookies:', document.cookie);

        // Force hard reload with cache busting
        setTimeout(() => {
            console.log('Forcing hard reload...');
            
            // Clear the URL cache parameter and force reload
            const url = new URL(window.location.href);
            
            // Remove any existing reload params
            url.searchParams.delete('_reload');
            url.searchParams.delete('lr');
            
            // Add new cache buster
            url.searchParams.set('_t', Date.now().toString());
            
            // Use location.href instead of replace to ensure full reload
            window.location.href = url.toString();
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

            {/* Force-hide unwanted Google Translate UI elements and override its fonts */}
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

        /* CRITICAL: Override Google Translate's font injection */
        /* This prevents Noto Serif Bengali from being applied */
        .translated-ltr, .translated-rtl,
        .translated-ltr *, .translated-rtl *,
        font[face], font[face] * {
          font-family: inherit !important;
        }

        /* Ensure our Noto Sans Bengali is used for Bangla, not Google's Noto Serif */
        body.lang-bn, body.lang-bn *,
        .lang-bn, .lang-bn * {
          font-family: 'Noto Sans Bengali', sans-serif !important;
        }

        /* Reset any Google-injected font styles */
        [style*="Noto Serif"] {
          font-family: 'Noto Sans Bengali', sans-serif !important;
        }
      `}</style>
        </div>
    );
};

export default LanguageSwitcher;
