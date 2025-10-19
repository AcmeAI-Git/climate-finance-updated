import React, { useState } from 'react';
import { AlertTriangle, Send } from 'lucide-react';
import Modal from './Modal';
import Button from './Button';
import FormField from './FormField';

const ReportIssueModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    issueType: '',
    title: '',
    description: '',
    email: '',
    name: '',
    priority: 'medium'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const issueTypes = [
    { value: '', label: 'Select issue type' },
    { value: 'bug', label: 'Bug Report' },
    { value: 'feature', label: 'Feature Request' },
    { value: 'data', label: 'Data Issue' },
    { value: 'performance', label: 'Performance Issue' },
    { value: 'accessibility', label: 'Accessibility Issue' },
    { value: 'other', label: 'Other' }
  ];

  const priorityLevels = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'critical', label: 'Critical' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.issueType || !formData.title || !formData.description) {
      alert('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      // Here you would typically send to your API
      // For now, we'll simulate the submission
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In real app, send to backend
      // Issue data: { ...formData, timestamp: new Date().toISOString(), userAgent: navigator.userAgent, url: window.location.href }

      alert('Issue reported successfully. Thank you for your feedback!');
      handleClose();
    } catch {
      alert('Failed to submit issue. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      issueType: '',
      title: '',
      description: '',
      email: '',
      name: '',
      priority: 'medium'
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="md"
      title="Report an Issue"
      showCloseButton={!isSubmitting}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Issue Type *"
            name="issueType"
            type="select"
            value={formData.issueType}
            onChange={handleChange}
            options={issueTypes}
            required
          />
          
          <FormField
            label="Priority"
            name="priority"
            type="select"
            value={formData.priority}
            onChange={handleChange}
            options={priorityLevels}
          />
        </div>

        <FormField
          label="Issue Title *"
          name="title"
          type="text"
          value={formData.title}
          onChange={handleChange}
          placeholder="Brief description of the issue"
          required
        />

        <FormField
          label="Description *"
          name="description"
          type="textarea"
          value={formData.description}
          onChange={handleChange}
          placeholder="Please provide detailed information about the issue, including steps to reproduce if applicable"
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
            placeholder="For follow-up (optional)"
          />
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <AlertTriangle size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Your report will include:</p>
              <ul className="text-xs space-y-0.5">
                <li>• Current page URL</li>
                <li>• Browser information</li>
                <li>• Timestamp</li>
              </ul>
            </div>
          </div>
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
            Submit Report
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ReportIssueModal;
