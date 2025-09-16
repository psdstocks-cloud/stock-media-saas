import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

export interface AdminUser {
  id: string;
  email: string;
  name: string | null;
  role: string;
}

export function getAdminUserFromToken(request: NextRequest): AdminUser | null {
  try {
    const token = request.cookies.get('admin-token')?.value;
    
    if (!token) {
      return null;
    }

    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET!) as any;
    
    return {
      id: decoded.id,
      email: decoded.email,
      name: decoded.name,
      role: decoded.role
    };
  } catch (error) {
    console.error('Admin token verification failed:', error);
    return null;
  }
}

export function isAdminUser(user: AdminUser | null): boolean {
  return user !== null && (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN');
}
