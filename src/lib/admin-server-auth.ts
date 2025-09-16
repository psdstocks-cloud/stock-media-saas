import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { AdminUser } from './admin-auth-helper';

export async function getAdminUser(): Promise<AdminUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('admin-token')?.value;
    
    if (!token) {
      return null;
    }

    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET!) as any;
    
    const adminUser: AdminUser = {
      id: decoded.id,
      email: decoded.email,
      name: decoded.name,
      role: decoded.role
    };

    // Verify it's an admin user
    if (adminUser.role !== 'ADMIN' && adminUser.role !== 'SUPER_ADMIN') {
      return null;
    }

    return adminUser;
  } catch (error) {
    console.error('Admin token verification failed:', error);
    return null;
  }
}
