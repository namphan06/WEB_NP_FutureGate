import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase.js';

export const authMiddleware = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({
                success: false,
                message: 'No authorization header'
            });
        }

        const token = authHeader.replace('Bearer ', '');

        const { data: { user }, error } = await supabase.auth.getUser(token);

        if (error || !user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid or expired token'
            });
        }

        // Attach user to request
        (req as any).user = user;

        next();
    } catch (error: any) {
        return res.status(401).json({
            success: false,
            message: error.message
        });
    }
};
