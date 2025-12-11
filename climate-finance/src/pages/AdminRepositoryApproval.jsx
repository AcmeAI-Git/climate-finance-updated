import React, { useState, useEffect } from "react";
import { CheckCircle, XCircle, Clock, FolderTree, Eye } from "lucide-react";
import PageLayout from "../components/layouts/PageLayout";
import AdminPageHeader from "../components/layouts/AdminPageHeader";
import AdminEmptyState from "../components/layouts/AdminEmptyState";
import AdminListItem from "../components/layouts/AdminListItem";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import Loading from "../components/ui/Loading";
import { useToast } from "../components/ui/Toast";
import { useAuth } from "../context/AuthContext";
import { pendingRepositoryApi, downloadDocumentApi } from "../services/api";
import { formatDate } from "../utils/formatDate";
import { formatCurrency } from "../utils/formatters";
import { formatCategoryToTitleCase } from "../utils/transliteration";

const AdminRepositoryApproval = () => {
    const [pendingrepositorys, setPendingrepositorys] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [processingId, setProcessingId] = useState(null);
    const { toast } = useToast();
    const { logout } = useAuth();

    useEffect(() => {
        fetchPendingrepositorys();
    }, []);

    const fetchPendingrepositorys = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await pendingRepositoryApi.getAll();
            if (response.status) {
                setPendingrepositorys(response.data);
            } else {
                setError("Failed to fetch pending repositorys");
            }
        } catch (err) {
            setError("Error loading pending repositorys");
            console.error("Error fetching pending repositorys:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (repositoryId) => {
        try {
            setProcessingId(repositoryId);

            // Optimistically remove the repository immediately
            setPendingrepositorys((prev) =>
                prev.filter((p) => p.repo_id !== repositoryId)
            );

            // Make the backend API call to actually approve the repository
            const response = await pendingRepositoryApi.approve(repositoryId);
            if (response.status) {
                toast({
                    title: "Success",
                    message: "repository approved successfully",
                    type: "success",
                });
            } else {
                // If backend call fails, show error but repository is already removed from UI
                toast({
                    title: "Warning",
                    message:
                        "repository approved in UI but backend update failed. Please refresh to see current state.",
                    type: "warning",
                });
            }
        } catch (err) {
            // If backend call fails, show error but repository is already removed from UI
            toast({
                title: "Warning",
                message:
                    "repository approved in UI but backend update failed. Please refresh to see current state.",
                type: "warning",
            });
            console.error("Error approving repository:", err);
        } finally {
            setProcessingId(null);
        }
    };

    const handleReject = async (repositoryId) => {
        try {
            setProcessingId(repositoryId);

            // Optimistically remove the repository immediately
            setPendingrepositorys((prev) =>
                prev.filter((p) => p.repo_id !== repositoryId)
            );

            // Make the backend API call to actually reject the repository
            const response = await pendingRepositoryApi.reject(repositoryId);
            if (response.status) {
                toast({
                    title: "Success",
                    message: "repository rejected successfully",
                    type: "success",
                });
            } else {
                // If backend call fails, show error but repository is already removed from UI
                toast({
                    title: "Warning",
                    message:
                        "repository rejected in UI but backend update failed. Please refresh to see current state.",
                    type: "warning",
                });
            }
        } catch (err) {
            // If backend call fails, show error but repository is already removed from UI
            toast({
                title: "Warning",
                message:
                    "repository rejected in UI but backend update failed. Please refresh to see current state.",
                type: "warning",
            });
            console.error("Error rejecting repository:", err);
        } finally {
            setProcessingId(null);
        }
    };

    const handlePreviewDocument = (documentId) => {
        try {
            downloadDocumentApi.previewDocument(documentId);
        } catch (err) {
            toast({
                title: "Error",
                message: "Failed to preview document",
                type: "error",
            });
            console.error("Error previewing document:", err);
        }
    };

    const handleLogout = () => {
        logout();
    };

    if (loading) {
        return (
            <PageLayout bgColor="bg-gray-50">
                <div className="flex justify-center items-center min-h-64">
                    <Loading size="lg" />
                </div>
            </PageLayout>
        );
    }

    return (
        <PageLayout bgColor="bg-gray-50">
            <AdminPageHeader
                title="Repository Approval"
                subtitle="Review and approve pending repository submissions"
                onLogout={handleLogout}
            />

            {/* Controls Section - Matching other admin pages */}
            <div className="mb-6 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">
                        Pending Repository ({pendingrepositorys.length})
                    </h3>
                </div>
            </div>

            {error && (
                <Card padding="p-6" className="mb-6">
                    <div className="text-center text-red-600">
                        <p>{error}</p>
                        <Button
                            variant="outline"
                            onClick={fetchPendingrepositorys}
                            className="mt-2"
                        >
                            Try Again
                        </Button>
                    </div>
                </Card>
            )}

            {pendingrepositorys.length === 0 ? (
                <Card padding="p-8">
                    <AdminEmptyState
                        icon={<Clock size={48} className="text-gray-400" />}
                        title="No Pending Repository Submissions"
                        description="All repository submissions have been reviewed."
                    />
                </Card>
            ) : (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    {pendingrepositorys.map((repository, index) => {
                        const dataFields = [
                            {
                                label: "Heading",
                                value: repository.heading ?? "N/A",
                            },
                            {
                                label: "Sub Heading",
                                value: repository.sub_heading ?? "N/A",
                            },
                            {
                                label: "Agency Name",
                                value: repository.agency_name ?? "N/A",
                            },
                            {
                                label: "Categories",
                                value: repository.categories ? formatCategoryToTitleCase(repository.categories) : "N/A",
                            },
                            {
                                label: "Document",
                                value: (
                                    <Button
                                        onClick={() =>
                                            handlePreviewDocument(
                                                repository.document_link
                                            )
                                        }
                                        size="sm"
                                        variant="outline"
                                        leftIcon={<Eye size={14} />}
                                        className="text-blue-600 border-blue-300 hover:bg-blue-50 hover:border-blue-400 hover:text-blue-700 transition-all duration-200"
                                    >
                                        Preview
                                    </Button>
                                ),
                            },
                            {
                                label: "Submitted At",
                                value: formatDate(repository.created_at),
                            },
                        ];

                        const customActions = [
                            {
                                label:
                                    processingId === repository.repo_id
                                        ? "Approving..."
                                        : "Approve",
                                icon: <CheckCircle size={14} />,
                                onClick: () =>
                                    handleApprove(repository.repo_id),
                                disabled: processingId === repository.repo_id,
                                className:
                                    "text-purple-600 border-purple-300 hover:bg-purple-50 hover:border-purple-400 hover:text-purple-700 transition-all duration-200",
                            },
                            {
                                label:
                                    processingId === repository.repo_id
                                        ? "Rejecting..."
                                        : "Reject",
                                icon: <XCircle size={14} />,
                                onClick: () => handleReject(repository.repo_id),
                                disabled: processingId === repository.repo_id,
                                className:
                                    "text-red-600 border-red-300 hover:bg-red-50 hover:border-red-400 hover:text-red-700 transition-all duration-200",
                            },
                        ];

                        return (
                            <AdminListItem
                                key={repository.repo_id}
                                id={repository.repo_id}
                                icon={
                                    <FolderTree
                                        size={20}
                                        className="text-purple-600"
                                    />
                                }
                                title={repository.title}
                                subtitle={`By: ${repository.submitter_email}`}
                                badge={
                                    <div className="flex flex-wrap gap-1">
                                        {repository.status && (
                                            <Badge variant="warning" size="sm">
                                                {repository.status}
                                            </Badge>
                                        )}
                                    </div>
                                }
                                dataFields={dataFields}
                                customActions={customActions}
                                index={index}
                            />
                        );
                    })}
                </div>
            )}
        </PageLayout>
    );
};

export default AdminRepositoryApproval;
