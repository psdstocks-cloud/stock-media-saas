import { Metadata } from 'next'
import PermissionsCoverageClient from './PermissionsCoverageClient'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Permissions Coverage • Admin',
  description: 'View required permissions per admin screen and your access',
}

export default function PermissionsCoveragePage() {
  return <PermissionsCoverageClient />
}
