import NextAuth from "next-auth";

declare module "next-auth" {
  /**
   * Kullanıcı tipini genişlet
   */
  interface User {
    id: string;
    role: string;
  }

  /**
   * Session tipini genişlet
   */
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

declare module "next-auth/jwt" {
  /**
   * JWT tipini genişlet
   */
  interface JWT {
    id: string;
    role: string;
  }
} 