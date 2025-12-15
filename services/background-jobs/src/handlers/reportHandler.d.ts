import { JobDocument } from '../types';
export declare const reportHandler: (job: JobDocument, updateProgress: (pct: number, msg: string) => Promise<void>) => Promise<any>;
