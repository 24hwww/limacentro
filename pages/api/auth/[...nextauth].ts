import NextAuth, { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { randomBytes } from 'crypto';
import { db } from '@/services/db';

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
  ],
  pages: {
    signIn: '/',
  },
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async signIn({ user }) {
      if (!user.email) return false;

      const safeName = user.name || user.email.split('@')[0] || 'Usuario';
      const oauthPasswordPlaceholder = `oauth:${randomBytes(24).toString('hex')}`;

      await db.user.upsert({
        where: { email: user.email },
        update: {
          name: safeName,
          avatarUrl: user.image || undefined,
        },
        create: {
          email: user.email,
          name: safeName,
          avatarUrl: user.image || undefined,
          passwordHash: oauthPasswordPlaceholder,
        },
      });

      return true;
    },
    async jwt({ token }) {
      if (!token.email) return token;

      const dbUser = await db.user.findUnique({
        where: { email: token.email },
        select: { id: true },
      });

      if (dbUser) {
        (token as any).appUserId = String(dbUser.id);
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user && (token as any).appUserId) {
        session.user.id = (token as any).appUserId;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);
