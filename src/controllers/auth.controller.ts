
import type { Request, Response } from 'express';
import { z } from 'zod';
import { registerUser, verifyPassword } from '../services/auth.service';

const registerSchema = z.object({
  name: z.string().trim().min(2),
  email: z.string().trim().email(),
  password: z.string().min(8),
});

export async function register(req: Request, res: Response) {
  const validation = registerSchema.safeParse(req.body);

  if (!validation.success) {
    res.status(400).json({
      success: false,
      message: 'Dados inválidos',
      errors: validation.error.issues,
    });
    return;
  }

  try {
    const user = await registerUser(validation.data);

    res.status(201).json({
      success: true,
      message: 'Usuário cadastrado com sucesso',
      data: user,
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'E-mail já cadastrado') {
      res.status(409).json({
        success: false,
        message: error.message,
      });
      return;
    }

    if (
      error instanceof Error &&
      'code' in error &&
      error.code === 11000
    ) {
      res.status(409).json({
        success: false,
        message: 'E-mail já cadastrado',
      });
      return;
    }

    console.error('Erro ao cadastrar usuário:', error);

    res.status(500).json({
      success: false,
      message: 'Erro ao cadastrar usuário',
    });
  }
}

export async function login(req: Request, res: Response) {
  const schema = z.object({
    email: z.string().trim().email(),
    password: z.string().min(1),
  });

  const validation = schema.safeParse(req.body);

  if (!validation.success) {
    res.status(400).json({
      success: false,
      message: 'E-mail ou senha inválidos',
    });
    return;
  }

  try {
    const valid = await verifyPassword(
      validation.data.email,
      validation.data.password,
    );

    if (!valid) {
      res.status(401).json({
        success: false,
        message: 'E-mail ou senha inválidos',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Senha verificada com sucesso',
    });
  } catch (error) {
    console.error('Erro ao verificar senha:', error);

    res.status(500).json({
      success: false,
      message: 'Erro ao verificar credenciais',
    });
  }
}
