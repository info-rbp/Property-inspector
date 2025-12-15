import { Inspection, Room, Component, Issue, MediaReference, Job, UploadInitiationResponse, ChatMessage, BootstrapResponse } from '../types';
declare class GatewayService {
    bootstrap(): Promise<BootstrapResponse>;
    getInspections(): Promise<Inspection[]>;
    getInspection(id: string): Promise<Inspection>;
    getInspectionRooms(id: string): Promise<Room[]>;
    getRoomComponents(roomId: string): Promise<Component[]>;
    getComponentIssues(componentId: string): Promise<Issue[]>;
    getComponentMedia(componentId: string): Promise<MediaReference[]>;
    initiateUpload(componentId: string, file: File): Promise<UploadInitiationResponse>;
    completeUpload(componentId: string, mediaId: string): Promise<MediaReference>;
    updateComponentCondition(componentId: string, condition: Component['condition']): Promise<Component>;
    updateComponentComment(componentId: string, comment: string): Promise<Component>;
    createHumanIssue(componentId: string, issue: Partial<Issue>): Promise<Issue>;
    /**
     * Resolve an AI issue (Accept/Reject/Override)
     * If Accepted/Overridden: Creates a new HUMAN issue and links it.
     * If Rejected: Marks AI issue as rejected.
     */
    resolveAiIssue(aiIssueId: string, action: 'accept' | 'reject', overrideData?: Partial<Issue>): Promise<void>;
    startAnalysis(inspectionId: string): Promise<Job>;
    startDeepAnalysis(inspectionId: string): Promise<Job>;
    generateAudioSummary(inspectionId: string, text: string): Promise<Job>;
    generateReport(inspectionId: string): Promise<Job>;
    getJobStatus(inspectionId: string): Promise<Job | null>;
    /**
     * Locks the inspection permanently.
     */
    finalizeInspection(inspectionId: string): Promise<Inspection>;
    sendChatMessage(message: string, history: ChatMessage[]): Promise<ChatMessage>;
}
export declare const gatewayService: GatewayService;
export {};
