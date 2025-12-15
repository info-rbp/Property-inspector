import { Request, Response, NextFunction } from 'express';
export declare const getTenant: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const updateTenant: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const inviteUser: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getUsers: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const updateUserRole: (req: Request, res: Response, next: NextFunction) => Promise<void>;
