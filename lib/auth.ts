import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import FacebookProvider from 'next-auth/providers/facebook';
import dbConnect from './mongoose';
import User from '@/models/User';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Şifre", type: "password" },
        remember: { label: "Remember Me", type: "checkbox" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email ve şifre gerekli');
        }

        await dbConnect();
        
        const user = await User.findOne({ email: credentials.email });

        if (!user) {
          throw new Error('Kullanıcı bulunamadı');
        }

        const isValid = await user.comparePassword(credentials.password);

        if (!isValid) {
          throw new Error('Geçersiz şifre');
        }

        return {
          id: user._id.toString(),
          email: user.email || '',
          name: user.name || '',
          role: user.role || 'user'
        };
      }
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID!,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET!
    })
  ],
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    error: '/auth/error',
    verifyRequest: '/auth/verify-request',
    newUser: '/auth/new-user'
  },
  callbacks: {
    async jwt({ token, user, account, trigger, session }) {
      // İlk giriş
      if (account && user) {
        token.id = user.id;
        token.role = user.role;
        return {
          ...token,
          accessToken: account.access_token,
          userId: user.id,
          user
        };
      }
      
      // Oturum güncellenmesi
      if (trigger === "update" && session) {
        return { ...token, ...session.user };
      }
      
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return {
        ...session,
        user: {
          ...session.user,
          id: token.userId
        }
      };
    }
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 gün
  },
  jwt: {
    // "Beni hatırla" için token ayarları
    maxAge: 30 * 24 * 60 * 60, // 30 gün (varsayılan)
  },
  secret: process.env.NEXTAUTH_SECRET
};

// Tip tanımlamaları
declare module "next-auth" {
  interface User {
    id: string;
    role: string;
  }
  
  interface Session {
    user: {
      id: string;
      role: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    }
  }
} 