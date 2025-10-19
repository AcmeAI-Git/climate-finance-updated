import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Plus } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { getClimateFinanceTransliteration } from "../../utils/transliteration";
import LanguageSwitcher from "./LanguageSwitcher";

const Navbar = () => {
    const location = useLocation();
    const path = location.pathname;
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { isAuthenticated } = useAuth();
    const { language } = useLanguage();

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const getAddProjectPath = () => {
        if (isAuthenticated) {
            // For admins, go to admin project form
            return "/admin/projects/new";
        } else {
            // For viewers, go to public submission form
            return "/projects/new?mode=public";
        }
    };

    const navLinks = [
        { to: "/", label: "Dashboard", isActive: path === "/" },
        {
            to: "/projects",
            label: "Projects",
            isActive: path === "/projects" || path.startsWith("/projects/"),
        },
        {
            to: "/funding-sources",
            label: "Funding Sources",
            isActive:
                path === "/funding-sources" ||
                path.startsWith("/funding-sources/"),
        },
        {
            to: isAuthenticated ? "/admin/dashboard" : "/admin/login",
            label: "Admin",
            isActive: path.startsWith("/admin"),
        },
        { to: "/about", label: "About", isActive: path === "/about" },
    ];

    return (
        <header className="shadow-sm border-b border-gray-100 sticky top-0 z-50 backdrop-blur-sm bg-white/95">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <div className="flex-shrink-0">
                        <Link
                            to="/"
                            className="flex items-center group"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            <h1 className="text-xl font-bold text-purple-700 group-hover:text-purple-600 transition-colors duration-200">
                                <span className="notranslate" translate="no">
                                    {getClimateFinanceTransliteration(language)}
                                </span>
                            </h1>
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <nav className="hidden lg:flex items-center space-x-6 lg:space-x-8">
                        {navLinks.map((link, index) =>
                            link.isDisabled ? (
                                <span
                                    key={index}
                                    className="text-gray-400 cursor-not-allowed text-sm font-medium"
                                    title="Coming Soon"
                                >
                                    {link.label}
                                </span>
                            ) : (
                                <Link
                                    key={index}
                                    to={link.to}
                                    className={`text-sm font-medium transition-colors duration-200 px-3 py-2 rounded-lg ${
                                        link.isActive
                                            ? "text-purple-700"
                                            : "text-gray-600 hover:text-purple-600"
                                    }`}
                                >
                                    {link.label}
                                </Link>
                            )
                        )}

                        {/* Add Project Button */}
                        <Link
                            to={getAddProjectPath()}
                            state={{ from: path }}
                            className="inline-flex items-center px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors duration-200"
                        >
                            <Plus size={16} className="mr-2" />
                            Add Project
                        </Link>

                        <LanguageSwitcher />
                    </nav>

                    {/* Mobile Menu Button */}
                    <button
                        className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        onClick={toggleMobileMenu}
                        aria-label="Toggle navigation menu"
                        aria-expanded={isMobileMenuOpen}
                    >
                        {isMobileMenuOpen ? (
                            <X size={24} className="text-gray-600" />
                        ) : (
                            <Menu size={24} className="text-gray-600" />
                        )}
                    </button>
                </div>
            </div>

            {/* Mobile Navigation - Improved */}
            <div
                className={`lg:hidden transition-all duration-300 ease-in-out ${
                    isMobileMenuOpen
                        ? "max-h-96 opacity-100"
                        : "max-h-0 opacity-0"
                } overflow-hidden bg-white border-t border-gray-100 shadow-lg`}
            >
                <nav className="px-4 py-4 space-y-1">
                    {navLinks.map((link, index) =>
                        link.isDisabled ? (
                            <div
                                key={index}
                                className="px-4 py-3 text-gray-400 cursor-not-allowed text-sm font-medium"
                                title="Coming Soon"
                            >
                                {link.label}
                            </div>
                        ) : (
                            <Link
                                key={index}
                                to={link.to}
                                className={`block px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
                                    link.isActive
                                        ? "text-purple-700"
                                        : "text-gray-600 hover:text-purple-600"
                                }`}
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                {link.label}
                            </Link>
                        )
                    )}

                    {/* Mobile Add Project Button */}
                    <Link
                        to={getAddProjectPath()}
                        state={{ from: path }}
                        className="block px-4 py-3 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors duration-200"
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        <div className="flex items-center">
                            <Plus size={16} className="mr-2" />
                            Add Project
                        </div>
                    </Link>
                </nav>
                <div className="px-4 pb-4">
                    <LanguageSwitcher />
                </div>
            </div>
        </header>
    );
};

export default Navbar;
