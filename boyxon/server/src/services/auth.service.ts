import { User } from '../models/User.model';
import { signAccessToken, signRefreshToken } from './token.service';
import { ApiError } from '../utils/ApiError';

export async function registerUser(input: { name: string; email: string; phone?: string; password: string }) {
  const exists = await User.findOne({ email: input.email.toLowerCase() });
  if (exists) throw ApiError.conflict('Bu email allaqachon ro‘yxatda');
  const user = await User.create({
    name: input.name,
    email: input.email.toLowerCase(),
    phone: input.phone,
    password: input.password,
  });
  user.lastLoginAt = new Date();
  await user.save();
  return issueTokens(user.id as string, user.role);
}

export async function loginUser(email: string, password: string) {
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user || !user.password) throw ApiError.unauthorized('Email yoki parol noto‘g‘ri');
  if (!user.isActive) throw ApiError.forbidden('Hisob bloklangan');
  const okPass = await user.comparePassword(password);
  if (!okPass) throw ApiError.unauthorized('Email yoki parol noto‘g‘ri');
  user.lastLoginAt = new Date();
  await user.save();
  return issueTokens(user.id as string, user.role);
}

function issueTokens(id: string, role: string) {
  return {
    accessToken: signAccessToken({ id, role }),
    refreshToken: signRefreshToken({ id }),
  };
}
