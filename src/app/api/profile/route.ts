import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { getUserFromRequest } from '@/lib/jwt-auth';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

// GET user profile with subscription and points
export async function GET(request: NextRequest) {
  // Try JWT authentication first (for dashboard)
  const jwtUser = getUserFromRequest(request)
  let userId = jwtUser?.id
  
  // Fallback to NextAuth session if no JWT user
  if (!userId) {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }
    userId = session.user.id
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        emailVerified: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
        subscriptions: {
          where: { status: 'ACTIVE' },
          include: { plan: true },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        pointsBalance: true,
      },
    });

    if (!user) {
      return new NextResponse('User not found', { status: 404 });
    }
    
    // Flatten the subscription for easier frontend use
    const profile = {
        ...user,
        activeSubscription: user.subscriptions[0] || null,
        onboardingCompleted: false, // Default value until migration is run
        onboardingCompletedAt: null,
    }
    delete (profile as any).subscriptions;

    return NextResponse.json({ user: profile });
  } catch (error) {
    console.error('[PROFILE_GET]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// PATCH to update user name or password
export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const body = await req.json();
    const { name, email, currentPassword, newPassword } = body;

    const dataToUpdate: { name?: string; email?: string; password?: string } = {};

    if (name) {
      dataToUpdate.name = name;
    }

    if (email) {
      dataToUpdate.email = email;
    }

    if (newPassword) {
      if (newPassword.length < 6) {
        return NextResponse.json({ message: 'Password must be at least 6 characters long.' }, { status: 400 });
      }
      
      // If changing password, verify current password
      if (currentPassword) {
        const user = await prisma.user.findUnique({
          where: { id: session.user.id },
          select: { password: true }
        });
        
        if (!user?.password || !await bcrypt.compare(currentPassword, user.password)) {
          return NextResponse.json({ message: 'Current password is incorrect.' }, { status: 400 });
        }
      }
      
      dataToUpdate.password = await bcrypt.hash(newPassword, 10);
    }
    
    if (Object.keys(dataToUpdate).length === 0) {
        return NextResponse.json({ message: 'No fields to update.' }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: dataToUpdate,
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        emailVerified: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    return NextResponse.json({ user: updatedUser, message: "Profile updated successfully!" });
  } catch (error) {
    console.error('[PROFILE_PATCH]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { password } = await request.json()

    if (!password) {
      return NextResponse.json({ error: 'Password required for account deletion' }, { status: 400 })
    }

    // Verify password
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { password: true }
    })

    if (!user?.password || !await bcrypt.compare(password, user.password)) {
      return NextResponse.json({ error: 'Incorrect password' }, { status: 400 })
    }

    // Delete user and all related data (cascade)
    await prisma.user.delete({
      where: { id: session.user.id }
    })

    return NextResponse.json({ 
      message: 'Account deleted successfully' 
    })
  } catch (error) {
    console.error('Error deleting account:', error)
    return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 })
  }
}
