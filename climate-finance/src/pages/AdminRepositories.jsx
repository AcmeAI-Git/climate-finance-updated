import React, { useState, useEffect, useMemo } from "react";
import AdminListPage from "../features/admin/AdminListPage";
import { RepositoryApi } from "../services/api";
import { getChartTranslation } from "../utils/chartTranslations";
import { formatCategoryToTitleCase } from "../utils/transliteration";

const AdminRepositories = () => {
    const [repositoriesList, setRepositoriesList] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch repositories data for dynamic filters
    useEffect(() => {
        const fetchRepositories = async () => {
            try {
                setIsLoading(true);
                const response = await RepositoryApi.getAll();
                if (response?.status && Array.isArray(response.data)) {
                    setRepositoriesList(response.data);
                } else {
                    setRepositoriesList([]);
                }
            } catch (error) {
                console.error(
                    "Error fetching repositories for filters:",
                    error
                );
                setRepositoriesList([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchRepositories();
    }, []);

    const columns = [
        {
            key: "repo_id",
            header: "Repository ID",
            searchKey: "repo_id",
        },
        {
            key: "heading",
            header: "Heading",
            searchKey: "heading",
        },
        {
            key: "sub_heading",
            header: "Sub Heading",
            searchKey: "sub_heading",
        },
        {
            key: "agency_name",
            header: "Agency Name",
            searchKey: "agency_name",
        },
        {
            key: "categories",
            header: "Categories",
            searchKey: "categories",
        },
        {
            key: "created_at",
            header: "Submitted At",
            type: "date",
        },
    ];

    // Generate dynamic filters from actual repository data
    const filters = useMemo(() => {
        if (!repositoriesList || repositoriesList.length === 0) {
            return [];
        }

        // Create unique option arrays using the actual fields available
        const agencies = Array.from(
            new Set(repositoriesList.map((r) => r.agency_name).filter(Boolean))
        ).sort();

        const categories = Array.from(
            new Set(
                repositoriesList.flatMap((r) => r.categories).filter(Boolean)
            )
        ).sort();

        return [
            {
                key: "agency_name",
                defaultValue: "All",
                options: [
                    { value: "All", label: "All Agencies" },
                    ...agencies.map((agency) => ({
                        value: agency,
                        label: agency,
                    })),
                ],
            },
            {
                key: "categories",
                defaultValue: "All",
                options: [
                    { value: "All", label: "All Categories" },
                    ...categories.map((category) => ({
                        value: category,
                        label: formatCategoryToTitleCase(category),
                    })),
                ],
            },
        ];
    }, [repositoriesList]);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                    <p className="mt-2 text-gray-600">
                        Loading repository data...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div>
            <AdminListPage
                title="Repository Management"
                subtitle="Add, edit, and manage climate repositories"
                apiService={RepositoryApi}
                entityName="repository"
                columns={columns}
                searchPlaceholder="Search repositories..."
                filters={filters}
            />
        </div>
    );
};

export default AdminRepositories;
