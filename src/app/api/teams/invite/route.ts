import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { sendTeamInviteEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const { teamId, email } = await request.json();

    if (!teamId || !email) {
      return new NextResponse('Team ID and email are required', { status: 400 });
    }

    // Verify user is team owner or admin
    const membership = await prisma.teamMembership.findFirst({
      where: {
        teamId,
        userId: session.user.id,
        role: { in: ['ADMIN', 'OWNER'] }
      },
      include: {
        team: true
      }
    });

    if (!membership) {
      return new NextResponse('Unauthorized to invite members', { status: 403 });
    }

    // Check if user is already a member
    const existingMember = await prisma.teamMembership.findFirst({
      where: {
        teamId,
        user: { email: email.toLowerCase() }
      }
    });

    if (existingMember) {
      return new NextResponse('User is already a member of this team', { status: 400 });
    }

    // Check if user exists in the system
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (user) {
      // User exists, add them directly
      await prisma.teamMembership.create({
        data: {
          teamId,
          userId: user.id,
          role: 'MEMBER'
        }
      });

      return NextResponse.json({ 
        message: 'User added to team successfully',
        userExists: true 
      });
    } else {
      // User doesn't exist, send invitation email
      await sendTeamInviteEmail(
        { email },
        { 
          teamName: membership.team.name,
          inviterName: session.user.name || 'Team Admin'
        }
      );

      return NextResponse.json({ 
        message: 'Invitation sent successfully',
        userExists: false 
      });
    }
  } catch (error) {
    console.error('Error inviting team member:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const { teamId, userId } = await request.json();

    if (!teamId || !userId) {
      return new NextResponse('Team ID and user ID are required', { status: 400 });
    }

    // Verify user is team owner or admin
    const membership = await prisma.teamMembership.findFirst({
      where: {
        teamId,
        userId: session.user.id,
        role: { in: ['ADMIN', 'OWNER'] }
      }
    });

    if (!membership) {
      return new NextResponse('Unauthorized to remove members', { status: 403 });
    }

    // Cannot remove team owner
    const team = await prisma.team.findUnique({
      where: { id: teamId }
    });

    if (team?.ownerId === userId) {
      return new NextResponse('Cannot remove team owner', { status: 400 });
    }

    // Remove member
    await prisma.teamMembership.deleteMany({
      where: {
        teamId,
        userId
      }
    });

    return NextResponse.json({ message: 'Member removed successfully' });
  } catch (error) {
    console.error('Error removing team member:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
