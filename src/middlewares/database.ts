import type { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { connectToDatabase } from '../config/database';

let connectionPromise: Promise<void> | null = null;

export async function database(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (mongoose.connection.readyState === 1) {
      next();
      return;
    }

    if (!connectionPromise) {
      connectionPromise = connectToDatabase().catch((error: unknown) => {
        connectionPromise = null;
        throw error;
      });
    }

    await connectionPromise;
    next();
  } catch (error) {
    console.error('Erro ao conectar ao MongoDB:', error);

    res.status(503).json({
      success: false,
      code: 503,
      message: 'Banco de dados indisponível',
    });
  }
}