import React from 'react';
import { DollarSign } from 'lucide-react';
import AdminListPage from '../features/admin/AdminListPage';
import { fundingSourceApi } from '../services/api';

const AdminFundingSources = () => {
  const columns = [
    {
      key: 'name',
      header: 'Name',
      searchKey: 'name'
    },
    {
      key: 'type',
      header: 'Category',
      searchKey: 'type'
    },
    {
      key: 'grant_amount',
      header: 'Total Grants',
      type: 'currency'
    },
    {
      key: 'loan_amount',
      header: 'Total Loans',
      type: 'currency'
    },
    {
      key: 'counterpart_funding',
      header: 'Co-Financing',
      type: 'currency'
    }
  ];

  return (
    <AdminListPage
      title="Funding Sources Management"
      subtitle="Manage funding sources by category (UNFCCC, Multilateral/Bilateral, Domestic)"
      apiService={fundingSourceApi}
      entityName="funding-source"
      columns={columns}
      searchPlaceholder="Search funding sources..."
      filters={[]}
    />
  );
};

export default AdminFundingSources;