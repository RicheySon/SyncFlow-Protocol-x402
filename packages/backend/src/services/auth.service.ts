import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';
import { env } from '../config/env';
import { z } from 'zod';

const signupSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
    name: z.string().optional(),
});

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string(),
});

export class AuthService {
    static async signup(data: z.infer<typeof signupSchema>) {
        const { email, password, name } = signupSchema.parse(data);

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            throw new Error('User already exists');
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
            },
        });

        const token = jwt.sign({ userId: user.id, role: user.role }, env.JWT_SECRET, {
            expiresIn: '7d',
        });

        return { user: { id: user.id, email: user.email, name: user.name, role: user.role }, token };
    }

    static async login(data: z.infer<typeof loginSchema>) {
        const { email, password } = loginSchema.parse(data);

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            throw new Error('Invalid email or password');
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new Error('Invalid email or password');
        }

        const token = jwt.sign({ userId: user.id, role: user.role }, env.JWT_SECRET, {
            expiresIn: '7d',
        });

        return { user: { id: user.id, email: user.email, name: user.name, role: user.role }, token };
    }
}
