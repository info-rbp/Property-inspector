import React from 'react';
import { RemoteInspectionRequest } from '@/types';
interface TenantInspectionProps {
    request: RemoteInspectionRequest;
    onSubmit: (updatedData: RemoteInspectionRequest) => void;
}
declare const TenantInspection: React.FC<TenantInspectionProps>;
export default TenantInspection;
