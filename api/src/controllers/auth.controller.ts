import type { Request, Response } from 'express';
import { registerUser, startLogin } from '../services/auth.service';
import {
  TwoFactorError,
  resendTwoFactorCode,
  verifyTwoFactorCode,
} from '../services/twoFactor.service';
import { CHALLENGE_EXPIRES_IN_SECONDS } from '../config/jwt';
import {
  registerSchema,
  loginSchema,
  verifyTwoFactorSchema,
} from '../schemas/auth.schema';

function getBearerToken(req: Request): string | null {
  const header = req.headers.authorization;

  if (!header?.startsWith('Bearer ')) return null;

  return header.slice(7) || null;
}

function handleError(res: Response, error: unknown) {
  if (error instanceof TwoFactorError) {
    if (error.retryAfter) {
      res.setHeader('Retry-After', String(error.retryAfter));
    }

    res.status(error.status).json({
      success: false,
      code: error.status,
      message: error.message,
      ...(error.retryAfter ? { data: { retryAfter: error.retryAfter } } : {}),
    });
    return;
  }

  console.error(
    '[auth] erro inesperado:',
    error instanceof Error ? error.name : 'desconhecido',
  );

  res.status(500).json({
    success: false,
    code: 500,
    message: 'Erro interno',
  });
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
    const result = await startLogin(
      validation.data.email,
      validation.data.password,
    );

    if (!result) {
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
      message: 'Código de verificação enviado para o e-mail cadastrado',
      data: {
        twoFactorRequired: true,
        challengeToken: result.challengeToken,
        expiresIn: CHALLENGE_EXPIRES_IN_SECONDS,
      },
    });
  } catch (error) {
    handleError(res, error);
  }
}

export async function verifyTwoFactor(req: Request, res: Response) {
  const challengeToken = getBearerToken(req);

  if (!challengeToken) {
    res.status(401).json({
      success: false,
      code: 401,
      message: 'Token não informado',
    });
    return;
  }

  const validation = verifyTwoFactorSchema.safeParse(req.body);

  if (!validation.success) {
    res.status(400).json({
      success: false,
      code: 400,
      message: 'Código inválido',
    });
    return;
  }

  try {
    const token = await verifyTwoFactorCode(
      challengeToken,
      validation.data.code,
    );

    res.status(200).json({
      success: true,
      code: 200,
      message: 'Login realizado com sucesso',
      data: { token },
    });
  } catch (error) {
    handleError(res, error);
  }
}

export async function resendTwoFactor(req: Request, res: Response) {
  const challengeToken = getBearerToken(req);

  if (!challengeToken) {
    res.status(401).json({
      success: false,
      code: 401,
      message: 'Token não informado',
    });
    return;
  }

  try {
    const data = await resendTwoFactorCode(challengeToken);

    res.status(200).json({
      success: true,
      code: 200,
      message: 'Novo código enviado para o e-mail cadastrado',
      data,
    });
  } catch (error) {
    handleError(res, error);
  }
}

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
