// import jwt from "jsonwebtoken";
// import { NextRequest } from "next/server";

// const JWT_SECRET = process.env.JWT_SECRET!;

// export interface JWTPayload {
//   name: string;
//   userId: string;
//   email: string;
// }

// export const generateToken = (payload: object) => {
//   if (!process.env.JWT_SECRET) {
//     throw new Error("JWT_SECRET not set");
//   }
//   return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" });
// };
// export function verifyToken(token: string): JWTPayload | null {
//   try {
//     return jwt.verify(token, JWT_SECRET) as JWTPayload;
//   } catch (error) {
//     return null;
//   }
// }

// export function getTokenFromRequest(request: NextRequest): string | null {
//   const authHeader = request.headers.get("authorization");
//   if (authHeader && authHeader.startsWith("Bearer ")) {
//     return authHeader.substring(7);
//   }
//   return null;
// }
// lib/auth.ts
import jwt from "jsonwebtoken";
import { NextRequest } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-here";

export interface TokenPayload {
  userId: string;
  email: string;
  name?: string;
}

export function generateToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
    return decoded;
  } catch (error) {
    console.error("Token verification failed:", error);
    return null;
  }
}

export function getTokenFromRequest(request: NextRequest): string | null {
  // Try to get token from cookie first
  const cookieToken = request.cookies.get("token")?.value;
  if (cookieToken) {
    return cookieToken;
  }

  // Try to get token from Authorization header as fallback
  const authHeader = request.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.substring(7);
  }

  return null;
}
