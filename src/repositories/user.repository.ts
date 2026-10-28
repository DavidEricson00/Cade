
import { UserModel } from '../models/user.model';

type CreateUserData = {
  name: string;
  email: string;
  password: string;
};

export async function findUserByEmail(email: string) {
  return UserModel.findOne({ email }).exec();
}

export async function findUserByEmailWithPassword(email: string) {
  return UserModel.findOne({ email })
    .select('+password')
    .exec();
}

export async function createUser(data: CreateUserData) {
  return UserModel.create(data);
}
