import bcrypt from 'bcryptjs';
import {
  createUser,
  findUserByEmail,
  findUserByEmailWithPassword,
} from '../repositories/user.repository';

type RegisterUserData = {
  name: string;
  email: string;
  password: string;
};

export class EmailAlreadyRegisteredError extends Error {
  constructor() {
    super('E-mail já cadastrado');
    this.name = 'EmailAlreadyRegisteredError';
  }
}

function isDuplicateKeyError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    error.code === 11000
  );
}

export async function registerUser(data: RegisterUserData) {
  const name = data.name.trim();
  const email = data.email.trim().toLowerCase();

  const existingUser = await findUserByEmail(email);

  if (existingUser) {
    throw new EmailAlreadyRegisteredError();
  }

  const password = await bcrypt.hash(data.password, 12);

  try {
    const user = await createUser({
      name,
      email,
      password,
    });

    return {
      id: user.id,
      name: user.name,
      email: user.email,
    };
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      throw new EmailAlreadyRegisteredError();
    }

    throw error;
  }
}


export async function loginUser(
  email: string,
  password: string,
): Promise<boolean> {
  const user = await findUserByEmailWithPassword(
    email.trim().toLowerCase(),
  );

  if (!user) {
    return false;
  }

  return bcrypt.compare(password, user.password);
}
