import React, { useState, useEffect } from "react";
import {
    Search,
    Download,
    ChevronDown,
    User,
    Calendar,
    Paperclip,
    Loader,
    FileText,
} from "lucide-react";
import { RepositoryApi, downloadDocumentApi } from "../../services/api";

export default function ResearchRepository() {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All Categories");
    const [documents, setDocuments] = useState([]);
    const [categories, setCategories] = useState(["All Categories"]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch documents on component mount
    useEffect(() => {
        const fetchDocuments = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await RepositoryApi.getAll();

                if (response.status && response.data) {
                    // Transform API data to match component structure
                    const transformedDocs = response.data.map((doc) => ({
                        id: doc.repo_id,
                        title: doc.heading,
                        description: doc.sub_heading,
                        category: doc.categories,
                        organization: doc.agency_name,
                        date: new Date(doc.created_at).toLocaleDateString(
                            "en-US",
                            {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                            }
                        ),
                        size: `${doc.document_size} MB`,
                        documentLink: doc.document_link,
                        color: "bg-purple-100",
                    }));

                    setDocuments(transformedDocs);

                    // Extract unique categories
                    const uniqueCategories = [
                        "All Categories",
                        ...new Set(transformedDocs.map((doc) => doc.category)),
                    ];
                    setCategories(uniqueCategories);
                } else {
                    setError("Invalid response format from server");
                }
            } catch (err) {
                setError(err.message || "Failed to load documents");
                console.error("Error fetching documents:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchDocuments();
    }, []);

    const filteredDocuments = documents.filter((doc) => {
        const matchesSearch =
            doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            doc.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            doc.organization.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory =
            selectedCategory === "All Categories" ||
            doc.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const handleDownload = (docLink, docTitle) => {
        if (docLink) {
            downloadDocumentApi.previewDocument(docLink);
        }
    };

    return (
        <div className="w-full bg-white rounded-xl overflow-hidden">
            {/* Header */}
            <div className="p-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Research & Documentation Repository
                </h1>
                <p className="text-gray-600">
                    Download climate finance research and documentation from
                    organizations across Bangladesh
                </p>
            </div>

            {/* Filters */}
            <div className="p-6 border-b border-gray-200">
                <div className="flex flex-col gap-4">
                    {/* Search */}
                    <div className="relative">
                        <Search
                            className="absolute left-3 top-3 text-gray-400"
                            size={20}
                        />
                        <input
                            type="text"
                            placeholder="Search by title, organization, or keywords..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                        />
                    </div>

                    {/* Category Filter */}
                    <div className="relative w-full sm:w-48">
                        <select
                            value={selectedCategory}
                            onChange={(e) =>
                                setSelectedCategory(e.target.value)
                            }
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm appearance-none cursor-pointer bg-white"
                        >
                            {categories.map((cat) => (
                                <option key={cat} value={cat}>
                                    {cat}
                                </option>
                            ))}
                        </select>
                        <ChevronDown
                            className="absolute right-3 top-2.5 text-gray-400 pointer-events-none"
                            size={18}
                        />
                    </div>
                </div>
            </div>

            {/* Loading State */}
            {loading && (
                <div className="flex items-center justify-center py-12">
                    <Loader
                        className="animate-spin text-purple-600 mr-2"
                        size={24}
                    />
                    <p className="text-gray-600">Loading documents...</p>
                </div>
            )}

            {/* Error State */}
            {error && (
                <div className="px-6 py-4 bg-red-50 border border-red-200 rounded-lg m-6">
                    <p className="text-red-700 font-semibold">Error</p>
                    <p className="text-red-600 text-sm">{error}</p>
                </div>
            )}

            {/* Results count */}
            {!loading && (
                <div className="px-6 py-4 text-sm text-gray-600">
                    Showing {filteredDocuments.length} of {documents.length}{" "}
                    documents
                </div>
            )}

            {/* Documents List */}
            {!loading && !error && (
                <div className="px-6 pb-6 space-y-4">
                    {filteredDocuments.length > 0 ? (
                        filteredDocuments.map((doc) => (
                            <div
                                key={doc.id}
                                className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                            >
                                <div className="p-6">
                                    <div className="flex gap-4">
                                        {/* Icon */}
                                        <div
                                            className={`${doc.color} w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0`}
                                        >
                                            <FileText />
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="inline-block">
                                                <span className="text-xs font-semibold text-purple-600 bg-purple-50 px-2 py-1 rounded mb-2 inline-block">
                                                    {doc.category}
                                                </span>
                                            </div>
                                            <h3 className="text-lg font-bold text-gray-900 mb-1">
                                                {doc.title}
                                            </h3>
                                            <p className="text-gray-600 text-sm mb-3">
                                                {doc.description}
                                            </p>

                                            {/* Meta info */}
                                            <div className="flex flex-wrap gap-8 text-xs text-gray-500">
                                                <span className="flex gap-x-2">
                                                    <User
                                                        size={16}
                                                        className="mr-2"
                                                    />
                                                    {doc.organization}
                                                </span>
                                                <span className="flex gap-x-2">
                                                    <Calendar
                                                        size={16}
                                                        className="mr-2"
                                                    />
                                                    {doc.date}
                                                </span>
                                                <span className="flex gap-x-2">
                                                    <Paperclip
                                                        size={16}
                                                        className="mr-2"
                                                    />
                                                    {doc.size}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Download button */}
                                    <div className="mt-4">
                                        <button
                                            onClick={() =>
                                                handleDownload(
                                                    doc.documentLink,
                                                    doc.title
                                                )
                                            }
                                            className="w-full bg-violet-900 hover:bg-violet-800 text-white font-semibold py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors"
                                        >
                                            <Download size={18} />
                                            DOWNLOAD NOW
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-12">
                            <p className="text-gray-500">
                                No documents found matching your criteria.
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
