import { Request, Response } from 'express';
import { hash } from 'bcrypt'
import z from 'zod';
import { prisma } from '@/database/prisma';
import { AppError } from '@/utils/AppError';

class UsersController {
  async create(req: Request, res: Response) {
    const bodySchema = z.object({
      name: z.string().trim().min(1),
      email: z.email(),
      password: z.string().min(6),
    });

    const { name, email, password } = bodySchema.parse(req.body);

    const userWithSameEmail = await prisma.user.findFirst({
      where: {
        email,
      },
    });

    if (userWithSameEmail) {
      throw new AppError('User with same email already exists');
    }

    const hashedPassword = await hash(password, 8);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    const { password: _, ...userWithoutPassword } = user;

    return res.status(201).json(userWithoutPassword);
  }
}

export { UsersController };