import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import Button from "../components/ui/Button";
import Loading from "../components/ui/Loading";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import {
    ArrowLeft,
    Lock,
    Mail,
    Building,
    UserCog,
    Info,
} from "lucide-react";

const AdminLogin = () => {
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
        setError(""); // Clear error when user types
    };

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        // Login validation
        if (!formData.email || !formData.password) {
            setError("Please fill in all fields");
            setIsLoading(false);
            return;
        }

        // Validate email format
        if (!validateEmail(formData.email)) {
            setError("Please enter a valid email address");
            setIsLoading(false);
            return;
        }

        try {
            const result = await login(formData.email, formData.password);

            if (result.success) {
                navigate("/admin/dashboard");
            } else {
                setError(result.error);
            }
        } catch {
            setError("An unexpected error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                {/* Back Button */}
                <div>
                    <Link
                        to="/"
                        className="flex items-center text-primary-600 hover:text-primary-700 transition-colors duration-200 text-sm font-medium"
                    >
                        <ArrowLeft size={18} className="mr-2" />
                        <span>Back to Main Site</span>
                    </Link>
                </div>

                {/* Header */}
                <div className="text-center">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">
                        Admin Portal
                    </h2>
                    <p className="text-gray-600 text-sm">
                        Sign in to your administrator account
                    </p>
                </div>

                {/* Info Message */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start">
                        <Info
                            size={20}
                            className="text-blue-600 mt-0.5 mr-3 flex-shrink-0"
                        />
                        <div className="text-sm text-blue-800">
                            <p className="font-medium mb-1">
                                Need Admin Access?
                            </p>
                            <p>
                                Accounts are created by system administrators.
                                Self-registration is not available.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Login Form */}
                <Card padding="p-6" className="shadow-lg">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-4">
                            {/* Email Field */}
                            <Input
                                label="Email"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="Enter your email address"
                                leftIcon={
                                    <Mail size={20} className="text-gray-400" />
                                }
                                required
                                disabled={isLoading}
                            />

                            {/* Password Field */}
                            <Input
                                label="Password"
                                name="password"
                                type="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Enter your password"
                                leftIcon={
                                    <Lock size={20} className="text-gray-400" />
                                }
                                required
                                disabled={isLoading}
                            />
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                <p className="text-red-800 text-sm">{error}</p>
                            </div>
                        )}

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            variant="primary"
                            className="w-full"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <div className="flex items-center justify-center">
                                    <Loading size="sm" className="mr-2" />
                                    Signing In...
                                </div>
                            ) : (
                                "Sign In"
                            )}
                        </Button>
                    </form>
                </Card>
            </div>
        </div>
    );
};

export default AdminLogin;
