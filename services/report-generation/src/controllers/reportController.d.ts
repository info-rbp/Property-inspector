import { Request, Response } from 'express';
export declare class ReportController {
    generate(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    finalize(req: Request, res: Response): Promise<void>;
    getMetadata(req: Request, res: Response): Promise<void>;
    download(req: Request, res: Response): Promise<void>;
    list(req: Request, res: Response): Promise<void>;
}
export declare const reportController: ReportController;
