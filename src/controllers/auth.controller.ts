
import type { Request, Response } from 'express';
import { z } from 'zod';
import {
  registerUser,
  loginUser,
} from '../services/auth.service';

const registerSchema = z.object({
  name: z.string().trim().min(2),
  email: z.string().trim().email(),
  password: z.string().min(8),
});

const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
});

export async function register(req: Request, res: Response) {
  const validation = registerSchema.safeParse(req.body);

  if (!validation.success) {
    res.status(400).json({
      success: false,
      code: 400,
      message: 'Dados inválidos',
    });
    return;
  }

  try {
    const user = await registerUser(validation.data);

    res.status(201).json({
      success: true,
      code: 201,
      message: 'Usuário cadastrado com sucesso',
      data: user,
    });
  } catch {
    res.status(500).json({
      success: false,
      code: 500,
      message: 'Erro interno',
    });
  }
}

export async function login(req: Request, res: Response) {
  const validation = loginSchema.safeParse(req.body);

  if (!validation.success) {
    res.status(400).json({
      success: false,
      code: 400,
      message: 'E-mail ou senha inválidos',
    });
    return;
  }

  try {
    const valid = await loginUser(
      validation.data.email,
      validation.data.password,
    );

    if (!valid) {
      res.status(403).json({
        success: false,
        code: 403,
        message: 'E-mail ou senha inválidos',
      });
      return;
    }

    const token = await loginUser(
      validation.data.email,
      validation.data.password,
    );

    if (!token) {
      res.status(401).json({
        success: false,
        code: 401,
        message: 'E-mail ou senha inválidos',
      });
      return;
    }

    res.status(200).json({
      success: true,
      code: 200,
      message: 'Login realizado com sucesso',
      data: { token },
    });
  } catch {
    res.status(500).json({
      success: false,
      code: 500,
      message: 'Erro interno',
    });
  }
}
