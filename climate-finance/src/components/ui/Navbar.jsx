import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Plus, Leaf } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import {
    getClimateFinanceTransliteration,
    getRepositoryTransliteration,
} from "../../utils/transliteration";
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
            return "/admin/projects/new";
        } else {
            return "/projects/new?mode=public";
        }
    };

    const getAddRepositoryPath = () => {
        if (isAuthenticated) {
            return "/admin/repository/new";
        } else {
            return "/repository/new?mode=public";
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
            to: "/repository",
            label: "Repositories",
            isActive: path === "/repository" || path.startsWith("/repository/"),
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
        <header className="sticky top-0 z-50 backdrop-blur-md bg-gradient-to-r from-white via-white to-violet-50/30 border-b border-violet-100/40 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-18 py-2">
                    {/* Logo with Icon */}
                    <div className="flex-shrink-0">
                        <button
                            onClick={() => (window.location.href = "/")}
                            className="flex items-start group flex-col hover:opacity-90 transition-all duration-300 focus:outline-none cursor-pointer"
                        >
                            <div className="flex items-center gap-2.5 mb-1">
                                <h1 className="text-lg font-bold bg-gradient-to-r from-violet-700 via-violet-600 to-violet-600 bg-clip-text text-transparent group-hover:opacity-80 transition-opacity duration-200">
                                    <span
                                        className="notranslate"
                                        translate="no"
                                    >
                                        Green Accountability Monitor
                                    </span>
                                </h1>
                            </div>
                            <p className="text-xs text-gray-500 font-medium tracking-wide">
                                Climate-resilient WASH finance tracker
                            </p>
                        </button>
                    </div>

                    {/* Desktop Navigation */}
                    <nav className="hidden lg:flex items-center space-x-0.5">
                        {navLinks.map((link, index) =>
                            link.isDisabled ? (
                                <span
                                    key={index}
                                    className="text-gray-300 cursor-not-allowed text-xs font-medium px-2 py-2"
                                    title="Coming Soon"
                                >
                                    {link.label}
                                </span>
                            ) : (
                                <Link
                                    key={index}
                                    to={link.to}
                                    className={`text-xs font-semibold transition-all duration-300 px-2 py-2.5 rounded-lg relative group ${
                                        link.isActive
                                            ? "text-violet-700 bg-violet-50/60"
                                            : "text-gray-600 hover:text-violet-700 hover:bg-violet-50/40"
                                    }`}
                                >
                                    {link.label}
                                    {link.isActive && (
                                        <span className="absolute bottom-0 left-4 right-4 h-1 bg-gradient-to-r from-violet-500 to-violet-600 rounded-full"></span>
                                    )}
                                </Link>
                            )
                        )}
                    </nav>

                    {/* Action Buttons and Switcher */}
                    <div className="hidden lg:flex items-center gap-3">
                        <Link
                            to={getAddProjectPath()}
                            state={{ from: path }}
                            className="inline-flex items-center px-2 py-2.5 bg-gradient-to-r from-violet-600 to-violet-600 text-white text-xs font-semibold rounded-lg hover:shadow-lg hover:shadow-violet-200 hover:from-violet-700 hover:to-violet-700 transition-all duration-300 group"
                        >
                            <Plus
                                size={16}
                                className="mr-2 group-hover:rotate-90 transition-transform duration-300"
                            />
                            Project
                        </Link>

                        <Link
                            to={getAddRepositoryPath()}
                            state={{ from: path }}
                            className="inline-flex items-center px-2 py-2.5 bg-gradient-to-r from-violet-600 to-violet-600 text-white text-xs font-semibold rounded-lg hover:shadow-lg hover:shadow-violet-200 hover:from-violet-700 hover:to-violet-700 transition-all duration-300 group"
                        >
                            <Plus
                                size={16}
                                className="mr-2 group-hover:rotate-90 transition-transform duration-300"
                            />
                            {getRepositoryTransliteration(language)}
                        </Link>

                        <div className="h-6 w-px bg-gray-200"></div>
                        <LanguageSwitcher />
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="lg:hidden p-2.5 rounded-lg hover:bg-violet-100/60 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2"
                        onClick={toggleMobileMenu}
                        aria-label="Toggle navigation menu"
                        aria-expanded={isMobileMenuOpen}
                    >
                        {isMobileMenuOpen ? (
                            <X size={24} className="text-violet-700" />
                        ) : (
                            <Menu size={24} className="text-violet-700" />
                        )}
                    </button>
                </div>
            </div>

            {/* Mobile Navigation */}
            <div
                className={`lg:hidden transition-all duration-300 ease-in-out ${
                    isMobileMenuOpen
                        ? "max-h-[32rem] opacity-100"
                        : "max-h-0 opacity-0"
                } overflow-hidden bg-gradient-to-b from-white to-violet-50/50 border-t border-violet-100/40`}
            >
                <nav className="px-4 py-4 space-y-2">
                    {navLinks.map((link, index) =>
                        link.isDisabled ? (
                            <div
                                key={index}
                                className="px-4 py-3 text-gray-300 cursor-not-allowed text-sm font-medium"
                                title="Coming Soon"
                            >
                                {link.label}
                            </div>
                        ) : (
                            <Link
                                key={index}
                                to={link.to}
                                className={`block px-4 py-3 text-sm font-semibold rounded-lg transition-all duration-300 ${
                                    link.isActive
                                        ? "text-violet-700 bg-violet-100/60 border-l-4 border-violet-600"
                                        : "text-gray-600 hover:text-violet-700 hover:bg-violet-50/60"
                                }`}
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                {link.label}
                            </Link>
                        )
                    )}

                    <div className="my-3 h-px bg-violet-100/40"></div>

                    {/* Mobile Action Buttons */}
                    <Link
                        to={getAddProjectPath()}
                        state={{ from: path }}
                        className="block px-4 py-3 text-sm font-semibold text-white bg-gradient-to-r from-violet-600 to-violet-600 rounded-lg hover:from-violet-700 hover:to-violet-700 transition-all duration-300 mb-2"
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        <div className="flex items-center">
                            <Plus size={16} className="mr-2" />
                            Add Project
                        </div>
                    </Link>

                    <Link
                        to={getAddRepositoryPath()}
                        state={{ from: path }}
                        className="block px-4 py-3 text-sm font-semibold text-white bg-gradient-to-r from-violet-600 to-violet-600 rounded-lg hover:from-violet-700 hover:to-violet-700 transition-all duration-300"
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        <div className="flex items-center">
                            <Plus size={16} className="mr-2" />
                            Add Repository
                        </div>
                    </Link>
                </nav>

                <div className="px-2 pb-4 border-t border-violet-100/40 pt-3">
                    <LanguageSwitcher />
                </div>
            </div>
        </header>
    );
};

export default Navbar;
