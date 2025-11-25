import React, { useState } from "react";
import { Mail, AlertTriangle, Linkedin, Facebook } from "lucide-react";
import Button from "./Button";
import ReportIssueModal from "./ReportIssueModal";

const Footer = () => {
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const currentYear = new Date().getFullYear();

    const socialLinks = [
        {
            icon: <Facebook size={16} />,
            href: "https://www.facebook.com/AcmeAILtd",
            label: "Twitter",
        },
        {
            icon: <Linkedin size={16} />,
            href: "https://www.linkedin.com/company/acme-ai/",
            label: "Linkedin",
        },
        {
            icon: <Mail size={16} />,
            href: "mailto:info@acmeai.tech",
            label: "Email",
        },
    ];

    const partners = [
        {
            src: "/wateraid.png",
            alt: "WaterAid",
            href: "https://www.wateraid.org/bd/",
            width: 90,
            height: 90,
        },
        {
            src: "/acme.svg",
            alt: "Acme AI",
            href: "https://www.acmeai.tech/",
            width: 45,
            height: 45,
        },
        {
            src: "/cprd.jpg",
            alt: "CPRD",
            href: "https://cprdbd.org/",
            width: 70,
            height: 70,
        },
        {
            src: "/wri.png",
            alt: "WRI",
            href: "https://www.wri.org/",
            width: 80,
            height: 80,
        },
    ];

    return (
        <>
            <footer className="bg-white border-t border-gray-200 mt-auto">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex flex-col md:flex-row md:justify-between items-center md:items-start gap-4">
                        <div className="flex flex-col gap-y-2">
                            {/* Copyright */}
                            <p className="text-sm text-gray-500 text-center md:text-left">
                                Copyright © WaterAid Bangladesh/{currentYear}.
                            </p>
                            <div className="text-sm text-gray-500 justify-center items-center md:justify-start flex flex-row gap-x-4">
                                {partners.map((partner) => (
                                    <a
                                        key={partner.alt}
                                        href={partner.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex-shrink-0"
                                    >
                                        <img
                                            src={partner.src}
                                            alt={partner.alt}
                                            width={partner.width}
                                            height={partner.height}
                                            className="object-contain"
                                        />
                                    </a>
                                ))}
                            </div>
                        </div>

                        {/* Social Links and Report Issue Button */}
                        <div className={"flex flex-col gap-y-2"}>
                            <div className="flex items-center justify-center md:justify-end gap-4">
                                {socialLinks.map((social) => (
                                    <a
                                        key={social.label}
                                        href={social.href}
                                        className="text-gray-400 hover:text-purple-600 transition-colors duration-200"
                                        aria-label={social.label}
                                    >
                                        {social.icon}
                                    </a>
                                ))}

                                {/* Report Issue Button positioned right of social links */}
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setIsReportModalOpen(true)}
                                    leftIcon={<AlertTriangle size={14} />}
                                    className="text-gray-500 hover:text-orange-600 hover:bg-orange-50 ml-2"
                                >
                                    Report Issue
                                </Button>
                            </div>
                            <div className="text-sm text-gray-500 justify-center items-center md:justify-start flex flex-row gap-x-4">
                                <p>Developed by</p>
                                <a
                                    key={partners[1].alt}
                                    href={partners[1].href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-shrink-0"
                                >
                                    <div
                                        className={
                                            "flex gap-x-2 justify-center items-center"
                                        }
                                    >
                                        <img
                                            src={partners[1].src}
                                            alt={partners[1].alt}
                                            width={partners[1].width}
                                            height={partners[1].height}
                                            className="object-contain"
                                        />
                                        <p className={"text-blue-500"}>
                                            www.acmeai.tech
                                        </p>
                                    </div>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>

            {/* Report Issue Modal */}
            <ReportIssueModal
                isOpen={isReportModalOpen}
                onClose={() => setIsReportModalOpen(false)}
            />
        </>
    );
};

export default Footer;
