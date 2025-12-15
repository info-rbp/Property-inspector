interface UsageRecordRequest {
    tenantId: string;
    usageType: string;
    quantity: number;
    sourceService: string;
    sourceEntityId: string;
}
export declare const recordUsage: (data: UsageRecordRequest) => Promise<{
    event: any;
    aggregate: any;
} | {
    status: string;
}>;
export declare const getUsageSummary: (tenantId: string) => Promise<{
    subscription: {
        id: any;
        planName: any;
        status: any;
        periodStart: any;
        periodEnd: any;
    };
    usage: {
        usageType: string;
        limit: number;
        usage: any;
        remaining: number;
        projectedUsage: number;
        isExceeded: boolean;
        daysUntilExceeded: number | null;
    }[];
} | null>;
export {};
