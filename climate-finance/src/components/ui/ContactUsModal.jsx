import React, { useState } from "react";
import { Send } from "lucide-react";
import Modal from "./Modal";
import Button from "./Button";
import FormField from "./FormField";
import { feedbackApi } from "../../services/api";

const ContactUsModal = ({ isOpen, onClose }) => {
    const [formData, setFormData] = useState({
        description: "",
        email: "",
        name: "",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.description) {
            alert("Please fill in the description field");
            return;
        }

        setIsSubmitting(true);

        try {
            const submissionData = {
                issue_type: "contact",
                issue_title: "Contact Us Inquiry",
                description: formData.description,
                user_name: formData.name || null,
                email: formData.email || null,
            };

            await feedbackApi.submitFeedback(submissionData);

            alert("Thank you for contacting us! We'll get back to you soon.");
            handleClose();
        } catch (error) {
            console.error("Error submitting contact form:", error);
            alert("Failed to submit your message. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        setFormData({
            description: "",
            email: "",
            name: "",
        });
        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            size="md"
            title="Contact Us"
            showCloseButton={!isSubmitting}
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <FormField
                    label="Description"
                    name="description"
                    type="textarea"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Please let us know how we can help you"
                    rows={4}
                    required
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                        label="Your Name"
                        name="name"
                        type="text"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Optional"
                    />

                    <FormField
                        label="Email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Optional"
                    />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleClose}
                        disabled={isSubmitting}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        variant="primary"
                        leftIcon={<Send size={16} />}
                        loading={isSubmitting}
                        disabled={isSubmitting}
                    >
                        Send Message
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default ContactUsModal;

