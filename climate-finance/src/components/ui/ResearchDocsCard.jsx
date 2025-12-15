import { ArrowRight, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext";
import {
    getRepositoryCardDescriptionTransliteration,
} from "../../utils/transliteration";

export default function ResearchDocsCard() {
    const navigate = useNavigate();
    const { language } = useLanguage();

    return (
        <div className="p-6 my-4 bg-linear-to-r from-purple-50 to-purple-100 rounded-2xl border border-purple-200 animate-fade-in-up">
            <div className="flex gap-4">

                {/* Content Section */}
                <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-800 mb-1">
                        Download Research Documents
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                        Access comprehensive research reports, case studies,
                        field notes, and technical documentation from climate
                        finance projects across Bangladesh. All documents are
                        reviewed and categorized for easy discovery.
                    </p>

                    {/* Info Box */}
                    <div className="bg-white bg-opacity-60 rounded-lg p-3 mb-4 border border-purple-200">
                        <p className="text-xs text-purple-700 font-medium notranslate" translate="no">
                            {getRepositoryCardDescriptionTransliteration(
                                language
                            )}
                        </p>
                    </div>

                    {/* CTA Button */}
                    <button
                        onClick={() => navigate("/repository")}
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                        Browse Documents
                        <ArrowRight size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
}
