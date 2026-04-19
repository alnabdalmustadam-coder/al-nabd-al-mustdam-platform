import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
  ],
  pages: {
    signIn: '/auth/login',
  },
  callbacks: {
    async redirect({ url, baseUrl }) {
      // Ensure the URL is properly encoded to avoid ByteString errors with Arabic characters
      try {
        const decodedUrl = decodeURIComponent(url);
        if (decodedUrl.startsWith("/")) return `${baseUrl}${url}`;
        const urlObj = new URL(url);
        if (urlObj.origin === baseUrl) return url;
      } catch (e) {
        if (url.startsWith("/")) return `${baseUrl}${url}`;
      }
      return baseUrl;
    }
  }
});
