import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { pendingRepositoryApi, RepositoryApi } from "../services/api";
import Button from "../components/ui/Button";
import Loading from "../components/ui/Loading";
import Card from "../components/ui/Card";
import PageLayout from "../components/layouts/PageLayout";
import { ArrowLeft, CheckCircle, Upload, FileText, X } from "lucide-react";
import { useToast } from "../components/ui/Toast";

const RepositoryFormPage = ({ mode = "add" }) => {
    const { isAuthenticated } = useAuth();
    const { toast } = useToast();
    const navigate = useNavigate();
    const location = useLocation();

    const [formData, setFormData] = useState({
        category: "",
        heading: "",
        sub_heading: "",
        agency_name: "",
        programme_code: "",
        document_size: 0,
        submitter_email: "",
    });

    const [selectedFile, setSelectedFile] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [success, setSuccess] = useState(false);

    const actualMode =
        !isAuthenticated || mode === "public" ? "public" : "admin";

    // File validation
    const validateFile = (file) => {
        const fileSizeMB = file.size / (1024 * 1024);
        setFormData((prev) => ({
            ...prev,
            document_size: fileSizeMB.toFixed(2),
        }));
        if (!file) return "Please upload a document";
        if (file.type !== "application/pdf") {
            return "Only PDF files are allowed";
        }
        if (fileSizeMB > 10) {
            return "File size must be less than 10MB";
        }
        return null;
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) {
            setSelectedFile(null);
            setErrors((prev) => ({ ...prev, file: "" }));
            return;
        }

        const error = validateFile(file);
        if (error) {
            setErrors((prev) => ({ ...prev, file: error }));
            setSelectedFile(null);
            e.target.value = "";
        } else {
            setSelectedFile(file);
            setErrors((prev) => ({ ...prev, file: "" }));
        }
    };

    const handleRemoveFile = () => {
        setSelectedFile(null);
        setErrors((prev) => ({ ...prev, file: "" }));
        document.getElementById("repo-document").value = "";
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: "" }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.heading.trim()) newErrors.heading = "Heading is required";
        if (!formData.category.trim())
            newErrors.category = "Category is required";
        if (actualMode === "public" && !formData.submitter_email.trim())
            newErrors.submitter_email = "Email is required";
        if (
            actualMode === "public" &&
            formData.submitter_email &&
            !/\S+@\S+\.\S+/.test(formData.submitter_email)
        )
            newErrors.submitter_email = "Invalid email address";

        if (!selectedFile) {
            newErrors.file = "Please upload a PDF document";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setIsLoading(true);
        const formDataToSend = new FormData();

        formDataToSend.append("categories", formData.category);
        formDataToSend.append("heading", formData.heading);
        formDataToSend.append("sub_heading", formData.sub_heading);
        formDataToSend.append("agency_name", formData.agency_name);
        formDataToSend.append("programme_code", formData.programme_code);
        if (actualMode === "public") {
            formDataToSend.append("submitter_email", formData.submitter_email);
        }
        formDataToSend.append("document_size", formData.document_size);
        formDataToSend.append("supporting_document", selectedFile);

        try {
            let response;
            if (actualMode === "public") {
                response = await pendingRepositoryApi.submitRepository(
                    formDataToSend
                );

                if (response.status) {
                    setSuccess(true);
                    toast.success(
                        "Repository submitted for review.",
                        "Success!"
                    );
                } else {
                    throw new Error(response.message || "Submission failed");
                }
            } else {
                response = await RepositoryApi.submitRepository(formDataToSend);

                if (response.status) {
                    setSuccess(true);
                    toast.success("Repository added successfully.", "Success!");
                } else {
                    throw new Error(response.message || "Submission failed");
                }
            }
        } catch (err) {
            toast.error(
                err.message || "Failed to submit repository",
                "Submission Error"
            );
        } finally {
            setIsLoading(false);
        }
    };

    // Success Screen
    if (success) {
        return (
            <PageLayout bgColor="bg-gray-50">
                <div className="max-w-2xl mx-auto py-12">
                    <Card padding="p-10">
                        <div className="text-center">
                            <CheckCircle
                                size={80}
                                className="mx-auto text-green-600 mb-6"
                            />
                            <h1 className="text-3xl font-bold text-gray-900 mb-4">
                                Repository Submitted!
                            </h1>
                            <p className="text-lg text-gray-600 mb-8">
                                Thank you! Your repository "
                                <strong>{formData.heading}</strong>" has been
                                submitted.
                                <br />
                                {actualMode === "public" && (
                                    <>
                                        You’ll receive an email at{" "}
                                        <strong>
                                            {formData.submitter_email}
                                        </strong>{" "}
                                        once approved.
                                    </>
                                )}
                            </p>
                            <Button
                                onClick={() => navigate("/")}
                                leftIcon={<ArrowLeft size={18} />}
                                variant="primary"
                                size="lg"
                            >
                                Back to Home
                            </Button>
                        </div>
                    </Card>
                </div>
            </PageLayout>
        );
    }

    return (
        <PageLayout bgColor="bg-gray-50">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <Button
                        variant="ghost"
                        onClick={() => navigate(-1)}
                        leftIcon={<ArrowLeft size={16} />}
                        className="mb-4"
                    >
                        Back
                    </Button>
                    <h1 className="text-3xl font-bold text-gray-900">
                        Submit New Repository
                    </h1>
                    <p className="text-gray-600 mt-2">
                        Share your climate repository with the community. All
                        submissions are reviewed before publishing.
                    </p>
                </div>

                {/* Info Banner */}
                {actualMode === "public" && (
                    <Card
                        padding="p-5"
                        className="mb-6 bg-blue-50 border-blue-200"
                    >
                        <p className="text-sm text-blue-800">
                            <strong>Note:</strong> Your submission will be
                            reviewed by admins. You'll be notified via email.
                        </p>
                    </Card>
                )}

                <Card padding="p-8">
                    <form onSubmit={handleSubmit} className="space-y-7">
                        {/* Category */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Category <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleInputChange}
                                className={`mt-1 block w-full px-3 py-2 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${
                                    errors.status
                                        ? "border-red-300"
                                        : "border-gray-300"
                                }`}
                                required
                            >
                                <option value="">Select Category</option>
                                <option value="CASE STUDY">CASE STUDY</option>
                                <option value="IMPACT REPORT">
                                    IMPACT REPORT
                                </option>
                                <option value="FIELD NOTES">FIELD NOTES</option>
                            </select>
                            {errors.category && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.category}
                                </p>
                            )}
                        </div>
                        {/* Heading */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Heading <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="heading"
                                value={formData.heading}
                                onChange={handleInputChange}
                                placeholder="National Adaptation Plan 2025"
                                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 ${
                                    errors.heading
                                        ? "border-red-300"
                                        : "border-gray-300"
                                }`}
                            />
                            {errors.heading && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.heading}
                                </p>
                            )}
                        </div>

                        {/* Sub Heading */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Sub-heading{" "}
                                <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="sub_heading"
                                value={formData.sub_heading}
                                onChange={handleInputChange}
                                placeholder="Climate Resilience Strategy for Coastal Regions"
                                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 ${
                                    errors.sub_heading
                                        ? "border-red-300"
                                        : "border-gray-300"
                                }`}
                            />
                            {errors.sub_heading && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.sub_heading}
                                </p>
                            )}
                        </div>

                        {/* Agency Name */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Agency Name / Funding Source{" "}
                                <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="agency_name"
                                value={formData.agency_name}
                                onChange={handleInputChange}
                                placeholder="Ministry of Environment"
                                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 ${
                                    errors.agency_name
                                        ? "border-red-300"
                                        : "border-gray-300"
                                }`}
                            />
                            {errors.agency_name && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.agency_name}
                                </p>
                            )}
                        </div>

                        {/* Programme Code */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Programme Code{" "}
                                <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="programme_code"
                                value={formData.programme_code}
                                onChange={handleInputChange}
                                placeholder="AK32134D"
                                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 ${
                                    errors.programme_code
                                        ? "border-red-300"
                                        : "border-gray-300"
                                }`}
                            />
                            {errors.programme_code && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.programme_code}
                                </p>
                            )}
                        </div>

                        {/* Email (Public Only) */}
                        {actualMode === "public" && (
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Your Email{" "}
                                    <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="email"
                                    name="submitter_email"
                                    value={formData.submitter_email}
                                    onChange={handleInputChange}
                                    placeholder="you@example.com"
                                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 ${
                                        errors.submitter_email
                                            ? "border-red-300"
                                            : "border-gray-300"
                                    }`}
                                />
                                {errors.submitter_email && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.submitter_email}
                                    </p>
                                )}
                                <p className="mt-1 text-xs text-gray-500">
                                    We'll notify you when your repository is
                                    approved.
                                </p>
                            </div>
                        )}

                        {/* Document Upload */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Upload Document (PDF){" "}
                                <span className="text-red-500">*</span>
                            </label>
                            <p className="text-sm text-gray-500 mb-3">
                                Max 10MB • PDF only
                            </p>

                            {!selectedFile ? (
                                <label
                                    htmlFor="repo-document"
                                    className="block cursor-pointer border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-purple-400 transition-colors"
                                >
                                    <Upload
                                        size={40}
                                        className="mx-auto text-gray-400 mb-3"
                                    />
                                    <p className="text-sm text-gray-600">
                                        Click to upload or drag and drop
                                    </p>
                                    <input
                                        id="repo-document"
                                        type="file"
                                        accept=".pdf"
                                        onChange={handleFileChange}
                                        className="hidden"
                                    />
                                </label>
                            ) : (
                                <div className="border border-purple-200 bg-purple-50 rounded-xl p-5">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <FileText
                                                size={36}
                                                className="text-purple-600"
                                            />
                                            <div>
                                                <p className="font-medium text-gray-900">
                                                    {selectedFile.name}
                                                </p>
                                                <p className="text-sm text-gray-600">
                                                    {(
                                                        selectedFile.size /
                                                        1024 /
                                                        1024
                                                    ).toFixed(2)}{" "}
                                                    MB
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={handleRemoveFile}
                                            className="p-2 hover:bg-red-100 rounded-full text-red-600"
                                        >
                                            <X size={20} />
                                        </button>
                                    </div>
                                </div>
                            )}

                            {errors.file && (
                                <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                                    <X size={16} /> {errors.file}
                                </p>
                            )}
                        </div>

                        {/* Submit */}
                        <div className="flex justify-end space-x-4 pt-6 border-t">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => navigate(-1)}
                                disabled={isLoading}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                variant="primary"
                                disabled={isLoading}
                                className="bg-purple-600 hover:bg-purple-700"
                            >
                                {isLoading ? (
                                    <>Submitting...</>
                                ) : (
                                    <>Submit Repository</>
                                )}
                            </Button>
                        </div>
                    </form>
                </Card>
            </div>
        </PageLayout>
    );
};

export default RepositoryFormPage;
