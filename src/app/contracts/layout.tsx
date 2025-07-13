import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';

interface ContractsLayoutProps {
  children: React.ReactNode;
}

const ContractsLayout: React.FC<ContractsLayoutProps> = ({ children }) => {
  return (
    <DashboardLayout>
      {children}
    </DashboardLayout>
  );
};

export default ContractsLayout; 