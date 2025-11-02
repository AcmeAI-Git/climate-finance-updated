import { ArrowRight, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ResearchDocsCard() {
    const navigate = useNavigate();

    return (
        <div className="p-6 my-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-2xl border border-purple-200 animate-fade-in-up">
            <div className="flex gap-4">
                {/* Icon Section */}
                <div className="flex-shrink-0">
                    <div className="flex items-center justify-center w-12 h-12 bg-purple-600 rounded-xl">
                        <Download size={24} className="text-white" />
                    </div>
                </div>

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
                        <p className="text-xs text-purple-700 font-medium">
                            Where to find: Click the{" "}
                            <span className="font-semibold">
                                Browse Documents
                            </span>{" "}
                            button or navigate to the Documents Repository page
                            to browse and download all available research
                            documentation.
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
