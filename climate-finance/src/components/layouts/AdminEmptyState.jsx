import React from 'react';
import { Search } from 'lucide-react';

const AdminEmptyState = ({
  icon = <Search size={32} className="text-gray-400" />,
  title = "No items found",
  description = "No items match your search criteria.",
  actionButton = null
}) => {
  return (
    <div className="text-center py-12">
      <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
        {icon}
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 mb-4">{description}</p>
      {actionButton}
    </div>
  );
};

export default AdminEmptyState;