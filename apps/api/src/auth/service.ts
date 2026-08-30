import { prisma } from "@dian-study/infrastructure";
import { createSessionToken, hashPassword, hashSessionToken, verifyPassword } from "./crypto.js";

const SESSION_DAYS = 7;
export class AuthenticationError extends Error {}
export class EmailConflictError extends Error {}

function publicStudent(student: { id: string; name: string; email: string; role: string }) {
  return { id: student.id, name: student.name, email: student.email, role: student.role };
}

async function issueSession(student: { id: string; name: string; email: string; role: string }) {
  const token = createSessionToken();
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 86_400_000);
  await prisma.authSession.create({ data: { studentId: student.id, tokenHash: hashSessionToken(token), expiresAt } });
  return { token, expiresAt, student: publicStudent(student) };
}

export async function registerStudent(input: { name: string; email: string; password: string }) {
  const email = input.email.trim().toLowerCase();
  if (await prisma.student.findUnique({ where: { email } })) throw new EmailConflictError("El correo ya está registrado");
  const student = await prisma.student.create({
    data: { name: input.name.trim(), email, passwordHash: await hashPassword(input.password) },
  });
  return issueSession(student);
}

export async function loginStudent(input: { email: string; password: string }) {
  const student = await prisma.student.findUnique({ where: { email: input.email.trim().toLowerCase() } });
  if (!student || !(await verifyPassword(input.password, student.passwordHash))) {
    throw new AuthenticationError("Correo o contraseña incorrectos");
  }
  return issueSession(student);
}

export async function revokeSession(token: string | undefined) {
  if (token) await prisma.authSession.deleteMany({ where: { tokenHash: hashSessionToken(token) } });
}
