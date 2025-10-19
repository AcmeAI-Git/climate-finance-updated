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
      key: 'dev_partner',
      header: 'Development Partner',
      searchKey: 'dev_partner'
    },
    {
      key: 'grant_amount',
      header: 'Grant Amount',
      type: 'currency'
    },
    {
      key: 'loan_amount',
      header: 'Loan Amount',
      type: 'currency'
    },
    {
      key: 'counterpart_funding',
      header: 'Counterpart Funding',
      type: 'currency'
    }
  ];

  return (
    <AdminListPage
      title="Funding Sources Management"
      subtitle="Manage funding sources and development partners"
      apiService={fundingSourceApi}
      entityName="funding-source"
      columns={columns}
      searchPlaceholder="Search funding sources..."
      filters={[]}
    />
  );
};

export default AdminFundingSources;