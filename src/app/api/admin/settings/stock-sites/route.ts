import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') {
    return new NextResponse('Unauthorized', { status: 401 });
  }
  
  try {
    const sites = await prisma.stockSite.findMany({
        orderBy: { displayName: 'asc' }
    });
    return NextResponse.json(sites);
  } catch (error) {
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function PATCH(request: Request) {
    const session = await auth();
    if (!session?.user || session.user.role !== 'ADMIN') {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    try {
        const body: { id: string, isActive?: boolean, cost?: number }[] = await request.json();

        // Use a transaction to update all sites at once
        await prisma.$transaction(
            body.map(site => 
                prisma.stockSite.update({
                    where: { id: site.id },
                    data: {
                        isActive: site.isActive,
                        cost: site.cost
                    }
                })
            )
        );

        return NextResponse.json({ message: 'Stock sites updated successfully.' });
    } catch (error) {
        console.error("[STOCK_SITES_PATCH]", error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
