import "server-only";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { emailOTP, twoFactor } from "better-auth/plugins";
import { db } from "./db";
import { sendEmail } from "./email";
import { codeEmail } from "./email-templates";

/** Référence de virement unique, ex. FI-48210. */
export async function newReference() {
  for (let i = 0; i < 10; i++) {
    const ref = `FI-${Math.floor(10000 + Math.random() * 90000)}`;
    const taken = await db.user.findUnique({ where: { reference: ref }, select: { id: true } });
    if (!taken) return ref;
  }
  return `FI-${Date.now().toString().slice(-7)}`;
}

export const auth = betterAuth({
  appName: "FlashInv",
  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,
  database: prismaAdapter(db, { provider: "postgresql" }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    minPasswordLength: 8,
    revokeSessionsOnPasswordReset: true,
  },
  emailVerification: {
    autoSignInAfterVerification: true,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 14,
    updateAge: 60 * 60 * 24,
    cookieCache: { enabled: true, maxAge: 60 * 5 },
  },
  user: {
    additionalFields: {
      firstName: { type: "string", required: true, input: true },
      lastName: { type: "string", required: true, input: true },
      phone: { type: "string", required: false, input: true },
      role: { type: "string", required: false, input: false, defaultValue: "CLIENT" },
      reference: { type: "string", required: false, input: false },
      kycStatus: { type: "string", required: false, input: false, defaultValue: "NONE" },
      profile: { type: "string", required: false, input: false },
      suspendedAt: { type: "date", required: false, input: false },
    },
  },
  databaseHooks: {
    user: {
      create: {
        // Tout nouveau compte est client. Les rôles se gèrent dans l'admin (premier admin : pnpm admin:promote).
        before: async (user) => ({
          data: { ...user, twoFactorEnabled: true, role: "CLIENT", reference: await newReference() },
        }),
      },
    },
    session: {
      create: {
        before: async (session) => {
          const user = await db.user.findUnique({ where: { id: session.userId }, select: { suspendedAt: true } });
          if (user?.suspendedAt) return false;
          return { data: session };
        },
      },
    },
  },
  rateLimit: {
    enabled: true,
    window: 60,
    max: 60,
    customRules: {
      "/sign-in/email": { window: 60, max: 8 },
      "/two-factor/send-otp": { window: 60, max: 4 },
      "/two-factor/verify-otp": { window: 60, max: 10 },
      "/email-otp/send-verification-otp": { window: 60, max: 4 },
      "/email-otp/request-password-reset": { window: 60, max: 4 },
    },
  },
  plugins: [
    emailOTP({
      otpLength: 6,
      expiresIn: 600,
      allowedAttempts: 5,
      overrideDefaultEmailVerification: true,
      sendVerificationOnSignUp: true,
      async sendVerificationOTP({ email, otp, type }) {
        const purpose = type === "forget-password" ? "forget-password" : type === "sign-in" ? "sign-in" : type === "change-email" ? "change-email" : "email-verification";
        const mail = codeEmail(purpose, otp, 10);
        await sendEmail({ to: email, ...mail });
      },
    }),
    twoFactor({
      issuer: "FlashInv",
      skipVerificationOnEnable: true,
      otpOptions: {
        period: 10,
        digits: 6,
        allowedAttempts: 5,
        storeOTP: "hashed",
        async sendOTP({ user, otp }) {
          const mail = codeEmail("sign-in", otp, 10);
          await sendEmail({ to: user.email, ...mail });
        },
      },
    }),
    nextCookies(),
  ],
});

export type AuthSession = typeof auth.$Infer.Session;
