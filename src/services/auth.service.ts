
import bcrypt from 'bcryptjs';
import { UserModel } from '../models/user.model';

type RegisterUser = {
  name: string;
  email: string;
  password: string;
};

export async function registerUser(data: RegisterUser) {
  const email = data.email.trim().toLowerCase();

  const existingUser = await UserModel.findOne({ email });

  if (existingUser) {
    throw new Error('E-mail já cadastrado');
  }

  const hashedPassword = await bcrypt.hash(data.password, 12);

  const user = await UserModel.create({
    name: data.name.trim(),
    email,
    password: hashedPassword,
  });

  return {
    id: user.id,
    name: user.name,
    email: user.email,
  };
}

export async function verifyPassword(email: string, password: string) {
  const user = await UserModel.findOne({
    email: email.trim().toLowerCase(),
  }).select('+password');

  if (!user) {
    return false;
  }

  return bcrypt.compare(password, user.password);
}
