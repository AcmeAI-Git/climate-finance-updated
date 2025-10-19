import React from 'react';
import { Download, Share2, Mail, Printer } from 'lucide-react';
import Button from './Button';

const ActionHeader = ({
  title,
  subtitle,
  actions = [],
  breadcrumbs = [],
  className = ''
}) => {
  const defaultActions = [
    {
      key: 'export',
      label: 'Download',
      icon: <Download size={16} />,
      variant: 'outline'
    },
    {
      key: 'share',
      label: 'Share',
      icon: <Share2 size={16} />,
      variant: 'outline'
    }
  ];

  const allActions = actions.length > 0 ? actions : defaultActions;

  return (
    <div className={`mb-6 ${className}`}>
      {/* Breadcrumbs */}
      {breadcrumbs.length > 0 && (
        <nav className="mb-4">
          <ol className="flex items-center space-x-2 text-sm text-gray-500">
            {breadcrumbs.map((crumb, index) => (
              <li key={index} className="flex items-center">
                {index > 0 && <span className="mx-2">/</span>}
                {crumb.href ? (
                  <a href={crumb.href} className="hover:text-purple-600">
                    {crumb.label}
                  </a>
                ) : (
                  <span className={index === breadcrumbs.length - 1 ? 'text-gray-900 font-medium' : ''}>
                    {crumb.label}
                  </span>
                )}
              </li>
            ))}
          </ol>
        </nav>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
          {subtitle && <p className="text-gray-600 text-lg">{subtitle}</p>}
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3">
          {allActions.map((action) => (
            <Button
              key={action.key}
              variant={action.variant || 'outline'}
              leftIcon={action.icon}
              onClick={action.onClick}
              disabled={action.disabled}
              className={action.className}
            >
              {action.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ActionHeader;