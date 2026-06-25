import type { AdminBarber } from '../../../api/admin'
import { AdminActiveBarbers } from './AdminActiveBarbers'
import { AdminBarberForm } from './AdminBarberForm'
import { AdminHiddenBarbers } from './AdminHiddenBarbers'

type AdminBarbersViewProps = {
  activeBarbers: AdminBarber[]
  hiddenBarbers: AdminBarber[]
  isLoading: boolean
  newBarberDescription: string
  newBarberExperience: string
  newBarberName: string
  newBarberPassword: string
  newBarberPhone: string
  newBarberPhotoUrl: string
  newBarberRole: string
  selectedBarberId: string
  onBarberPhotoChange: (file?: File) => void
  onCreateBarber: () => void
  onDeleteBarber: (barberId: string) => void
  onNewBarberDescriptionChange: (value: string) => void
  onNewBarberExperienceChange: (value: string) => void
  onNewBarberNameChange: (value: string) => void
  onNewBarberPasswordChange: (value: string) => void
  onNewBarberPhoneChange: (value: string) => void
  onNewBarberRoleChange: (value: string) => void
  onRestoreBarber: (barberId: string) => void
  onSelectBarberSchedule: (barberId: string) => void
}

export function AdminBarbersView({
  activeBarbers,
  hiddenBarbers,
  isLoading,
  newBarberDescription,
  newBarberExperience,
  newBarberName,
  newBarberPassword,
  newBarberPhone,
  newBarberPhotoUrl,
  newBarberRole,
  onBarberPhotoChange,
  onCreateBarber,
  onDeleteBarber,
  onNewBarberDescriptionChange,
  onNewBarberExperienceChange,
  onNewBarberNameChange,
  onNewBarberPasswordChange,
  onNewBarberPhoneChange,
  onNewBarberRoleChange,
  onRestoreBarber,
  onSelectBarberSchedule,
  selectedBarberId,
}: AdminBarbersViewProps) {
  return (
    <section className="admin-manager-page">
      <AdminBarberForm
        isLoading={isLoading}
        newBarberDescription={newBarberDescription}
        newBarberExperience={newBarberExperience}
        newBarberName={newBarberName}
        newBarberPassword={newBarberPassword}
        newBarberPhone={newBarberPhone}
        newBarberPhotoUrl={newBarberPhotoUrl}
        newBarberRole={newBarberRole}
        onBarberPhotoChange={onBarberPhotoChange}
        onCreateBarber={onCreateBarber}
        onNewBarberDescriptionChange={onNewBarberDescriptionChange}
        onNewBarberExperienceChange={onNewBarberExperienceChange}
        onNewBarberNameChange={onNewBarberNameChange}
        onNewBarberPasswordChange={onNewBarberPasswordChange}
        onNewBarberPhoneChange={onNewBarberPhoneChange}
        onNewBarberRoleChange={onNewBarberRoleChange}
      />
      <AdminActiveBarbers
        activeBarbers={activeBarbers}
        selectedBarberId={selectedBarberId}
        onSelectBarberSchedule={onSelectBarberSchedule}
      />
      <AdminHiddenBarbers
        hiddenBarbers={hiddenBarbers}
        isLoading={isLoading}
        onDeleteBarber={onDeleteBarber}
        onRestoreBarber={onRestoreBarber}
      />
    </section>
  )
}
