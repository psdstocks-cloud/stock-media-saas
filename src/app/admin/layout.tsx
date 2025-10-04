import ConditionalAdminWrapper from './ConditionalAdminWrapper'

export default function AdminLayoutWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ConditionalAdminWrapper>
      {children}
    </ConditionalAdminWrapper>
  )
}
