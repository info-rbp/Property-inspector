import { JobDocument } from '../types';
export declare const analysisHandler: (job: JobDocument, updateProgress: (pct: number, msg: string) => Promise<any>) => Promise<any>;
