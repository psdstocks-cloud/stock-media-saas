import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function seedRBAC() {
  console.log('🌱 Seeding RBAC data...')

  try {
    // Create permissions
    const permissions = [
      { key: 'users.view', description: 'View users' },
      { key: 'users.edit', description: 'Edit users' },
      { key: 'users.delete', description: 'Delete users' },
      { key: 'users.impersonate', description: 'Impersonate users' },
      { key: 'orders.view', description: 'View orders' },
      { key: 'orders.manage', description: 'Manage orders' },
      { key: 'orders.refund', description: 'Refund orders' },
      { key: 'points.view', description: 'View points' },
      { key: 'points.adjust', description: 'Adjust user points' },
      { key: 'billing.view', description: 'View billing' },
      { key: 'billing.manage', description: 'Manage billing' },
      { key: 'settings.read', description: 'Read settings' },
      { key: 'settings.write', description: 'Write settings' },
      { key: 'flags.view', description: 'View feature flags' },
      { key: 'flags.manage', description: 'Manage feature flags' },
      { key: 'rbac.manage', description: 'Manage roles and permissions' },
      { key: 'rbac.view', description: 'View roles and permissions' },
      { key: 'approvals.manage', description: 'Manage approvals' },
      { key: 'approvals.view', description: 'View approvals' },
      { key: 'audit.view', description: 'View audit logs' },
    ]

    console.log('📝 Creating permissions...')
    for (const perm of permissions) {
      await prisma.permission.upsert({
        where: { key: perm.key },
        update: {},
        create: perm
      })
    }

    // Create roles
    console.log('👥 Creating roles...')
    const superAdminRole = await prisma.role.upsert({
      where: { name: 'SUPER_ADMIN' },
      update: {},
      create: {
        name: 'SUPER_ADMIN',
        description: 'Super administrator with all permissions'
      }
    })

    const adminRole = await prisma.role.upsert({
      where: { name: 'ADMIN' },
      update: {},
      create: {
        name: 'ADMIN',
        description: 'Administrator with most permissions'
      }
    })

    const supportRole = await prisma.role.upsert({
      where: { name: 'SUPPORT' },
      update: {},
      create: {
        name: 'SUPPORT',
        description: 'Support staff with limited permissions'
      }
    })

    const userRole = await prisma.role.upsert({
      where: { name: 'USER' },
      update: {},
      create: {
        name: 'USER',
        description: 'Regular user'
      }
    })

    // Assign all permissions to SUPER_ADMIN
    console.log('🔐 Assigning permissions to SUPER_ADMIN...')
    const allPermissions = await prisma.permission.findMany()
    
    for (const permission of allPermissions) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: superAdminRole.id,
            permissionId: permission.id
          }
        },
        update: {},
        create: {
          roleId: superAdminRole.id,
          permissionId: permission.id
        }
      })
    }

    // Assign basic permissions to ADMIN (exclude sensitive ones)
    console.log('🔐 Assigning permissions to ADMIN...')
    const adminPermissions = allPermissions.filter(p => 
      !p.key.includes('rbac') && 
      !p.key.includes('audit') &&
      !p.key.includes('impersonate')
    )

    for (const permission of adminPermissions) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: adminRole.id,
            permissionId: permission.id
          }
        },
        update: {},
        create: {
          roleId: adminRole.id,
          permissionId: permission.id
        }
      })
    }

    // Assign limited permissions to SUPPORT
    console.log('🔐 Assigning permissions to SUPPORT...')
    const supportPermissions = allPermissions.filter(p => 
      p.key.includes('users.view') ||
      p.key.includes('orders.view') ||
      p.key.includes('approvals.view')
    )

    for (const permission of supportPermissions) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: supportRole.id,
            permissionId: permission.id
          }
        },
        update: {},
        create: {
          roleId: supportRole.id,
          permissionId: permission.id
        }
      })
    }

    console.log('✅ RBAC data seeded successfully!')
    console.log(`📊 Created ${permissions.length} permissions`)
    console.log('👥 Created 4 roles: SUPER_ADMIN, ADMIN, SUPPORT, USER')
    console.log('🔐 Assigned permissions to roles')

  } catch (error) {
    console.error('❌ Failed to seed RBAC data:', error)
    throw error
  }
}

seedRBAC()
  .then(() => {
    console.log('🎉 Seeding completed successfully!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Seeding failed:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
