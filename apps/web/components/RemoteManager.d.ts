import React from 'react';
import type { RemoteInspectionRequest, Property } from '@/types';
interface RemoteManagerProps {
    requests: RemoteInspectionRequest[];
    properties: Property[];
    onCreateRequest: (req: RemoteInspectionRequest) => void;
}
declare const RemoteManager: React.FC<RemoteManagerProps>;
export default RemoteManager;
