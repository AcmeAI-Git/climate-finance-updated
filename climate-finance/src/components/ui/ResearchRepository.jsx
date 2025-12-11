import React, { useState, useEffect, useMemo } from "react";
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
import Pagination from "./Pagination";
import { formatCategoryToTitleCase } from "../../utils/transliteration";

export default function ResearchRepository() {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All Categories");
    const [selectedOrganization, setSelectedOrganization] = useState("All Organizations");
    const [selectedYear, setSelectedYear] = useState("All Years");
    const [documents, setDocuments] = useState([]);
    const [categories, setCategories] = useState(["All Categories"]);
    const [organizations, setOrganizations] = useState(["All Organizations"]);
    const [years, setYears] = useState(["All Years"]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(6);

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
                        year: new Date(doc.created_at).getFullYear(),
                        size: `${doc.document_size} MB`,
                        documentLink: doc.document_link,
                        color: "bg-purple-100",
                    }));

                    setDocuments(transformedDocs);

                    // Extract unique categories (keep original for filtering, but format for display)
                    const uniqueCategories = [
                        "All Categories",
                        ...new Set(transformedDocs.map((doc) => doc.category)),
                    ];
                    setCategories(uniqueCategories);

                    // Extract unique organizations
                    const uniqueOrganizations = [
                        "All Organizations",
                        ...new Set(transformedDocs.map((doc) => doc.organization).filter(Boolean)),
                    ];
                    setOrganizations(uniqueOrganizations);

                    // Extract unique years
                    const uniqueYears = [
                        "All Years",
                        ...new Set(transformedDocs.map((doc) => doc.year).sort((a, b) => b - a)),
                    ];
                    setYears(uniqueYears);
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

    const filteredDocuments = useMemo(() => {
        return documents.filter((doc) => {
            const matchesSearch =
                doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                doc.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                doc.organization.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory =
                selectedCategory === "All Categories" ||
                doc.category === selectedCategory;
            const matchesOrganization =
                selectedOrganization === "All Organizations" ||
                doc.organization === selectedOrganization;
            const matchesYear =
                selectedYear === "All Years" ||
                doc.year === selectedYear;
            return matchesSearch && matchesCategory && matchesOrganization && matchesYear;
        });
    }, [documents, searchTerm, selectedCategory, selectedOrganization, selectedYear]);

    // Reset to first page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, selectedCategory, selectedOrganization, selectedYear]);

    // Pagination calculations
    const totalPages = Math.ceil(filteredDocuments.length / itemsPerPage);
    const paginatedDocuments = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return filteredDocuments.slice(startIndex, endIndex);
    }, [filteredDocuments, currentPage, itemsPerPage]);

    const handleDownload = (docLink) => {
        if (docLink) {
            downloadDocumentApi.previewDocument(docLink);
        }
    };

    return (
        <div className="w-full rounded-xl overflow-hidden bg-gray-50">
            {/* Header */}
            <div className="">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Research & Documentation Repository
                </h1>
                <p className="text-gray-600">
                    Download climate finance research and documentation from
                    organizations across Bangladesh
                </p>
            </div>

            {/* Filters */}
            <div className="p-6 border-b border-gray-200 bg-white">
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

                    {/* Filter Dropdowns */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Category Filter */}
                        <div className="relative">
                            <select
                                value={selectedCategory}
                                onChange={(e) =>
                                    setSelectedCategory(e.target.value)
                                }
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm appearance-none cursor-pointer bg-white"
                            >
                                {categories.map((cat) => (
                                    <option key={cat} value={cat}>
                                        {cat === "All Categories" ? cat : formatCategoryToTitleCase(cat)}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown
                                className="absolute right-3 top-2.5 text-gray-400 pointer-events-none"
                                size={18}
                            />
                        </div>

                        {/* Organization Filter */}
                        <div className="relative">
                            <select
                                value={selectedOrganization}
                                onChange={(e) =>
                                    setSelectedOrganization(e.target.value)
                                }
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm appearance-none cursor-pointer bg-white"
                            >
                                {organizations.map((org) => (
                                    <option key={org} value={org}>
                                        {org}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown
                                className="absolute right-3 top-2.5 text-gray-400 pointer-events-none"
                                size={18}
                            />
                        </div>

                        {/* Year Filter */}
                        <div className="relative">
                            <select
                                value={selectedYear}
                                onChange={(e) =>
                                    setSelectedYear(e.target.value === "All Years" ? "All Years" : parseInt(e.target.value))
                                }
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm appearance-none cursor-pointer bg-white"
                            >
                                {years.map((year) => (
                                    <option key={year} value={year}>
                                        {year}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown
                                className="absolute right-3 top-2.5 text-gray-400 pointer-events-none"
                                size={18}
                            />
                        </div>

                        {/* Clear Filters Button */}
                        <button
                            onClick={() => {
                                setSearchTerm("");
                                setSelectedCategory("All Categories");
                                setSelectedOrganization("All Organizations");
                                setSelectedYear("All Years");
                            }}
                            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors"
                        >
                            Clear Filters
                        </button>
                    </div>
                </div>
            </div>

            {/* Loading State */}
            {loading && (
                <div className="flex items-center justify-center py-12 bg-white">
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
                <div className="px-6 py-4 text-sm text-gray-600 bg-white">
                    Showing {filteredDocuments.length} of {documents.length}{" "}
                    documents
                </div>
            )}

            {/* Documents List */}
            {!loading && !error && (
                <div className="px-6 pb-6 space-y-4 bg-white">
                    {paginatedDocuments.length > 0 ? (
                        paginatedDocuments.map((doc) => (
                            <div
                                key={doc.id}
                                className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                            >
                                <div className="p-6">
                                    <div className="flex gap-4">
                                        {/* Icon */}
                                        <div
                                            className={`${doc.color} w-12 h-12 rounded-lg flex items-center justify-center shrink-0`}
                                        >
                                            <FileText />
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="inline-block">
                                                <span className="text-xs font-semibold text-purple-600 bg-purple-50 px-2 py-1 rounded mb-2 inline-block">
                                                    {formatCategoryToTitleCase(doc.category)}
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
                                            className="w-full bg-violet-900 hover:bg-violet-800 text-white font-semibold py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer"
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

                    {/* Pagination */}
                    {filteredDocuments.length > 0 && (
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                            itemsPerPage={itemsPerPage}
                            totalItems={filteredDocuments.length}
                            onItemsPerPageChange={setItemsPerPage}
                            itemsPerPageOptions={[6, 12, 24]}
                            className="mt-6 border-t border-gray-100 pt-4"
                        />
                    )}
                </div>
            )}
        </div>
    );
}
