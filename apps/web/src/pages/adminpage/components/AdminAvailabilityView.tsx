import type { BookingSelectOption } from '../../../components/BookingSelect'
import type { AdminBarber, AdminTimeOff } from '../../../api/admin'
import { AdminAvailabilityForm } from './AdminAvailabilityForm'
import { AdminTimeOffList } from './AdminTimeOffList'

type AdminAvailabilityViewProps = {
  activeBarberOptions: BookingSelectOption[]
  filteredTimeOffs: AdminTimeOff[]
  isAdminSession: boolean
  isLoading: boolean
  isTimeOffRangeValid: boolean
  sessionName?: string
  timeOffBarber?: AdminBarber
  timeOffBarberId: string
  timeOffEndDate: string
  timeOffEndTime: string
  timeOffReason: string
  timeOffStartDate: string
  timeOffStartTime: string
  timeOptions: BookingSelectOption[]
  onCreateTimeOff: () => void
  onDeleteTimeOff: (timeOffId: string) => void
  onErrorReset: () => void
  onTimeOffBarberChange: (barberId: string) => void
  onTimeOffEndDateChange: (date: string) => void
  onTimeOffEndTimeChange: (time: string) => void
  onTimeOffReasonChange: (reason: string) => void
  onTimeOffStartDateChange: (date: string) => void
  onTimeOffStartTimeChange: (time: string) => void
}

export function AdminAvailabilityView({
  activeBarberOptions,
  filteredTimeOffs,
  isAdminSession,
  isLoading,
  isTimeOffRangeValid,
  onCreateTimeOff,
  onDeleteTimeOff,
  onErrorReset,
  onTimeOffBarberChange,
  onTimeOffEndDateChange,
  onTimeOffEndTimeChange,
  onTimeOffReasonChange,
  onTimeOffStartDateChange,
  onTimeOffStartTimeChange,
  sessionName,
  timeOffBarber,
  timeOffBarberId,
  timeOffEndDate,
  timeOffEndTime,
  timeOffReason,
  timeOffStartDate,
  timeOffStartTime,
  timeOptions,
}: AdminAvailabilityViewProps) {
  return (
    <section className="admin-manager-page">
      <AdminAvailabilityForm
        activeBarberOptions={activeBarberOptions}
        isAdminSession={isAdminSession}
        isLoading={isLoading}
        isTimeOffRangeValid={isTimeOffRangeValid}
        sessionName={sessionName}
        timeOffBarber={timeOffBarber}
        timeOffBarberId={timeOffBarberId}
        timeOffEndDate={timeOffEndDate}
        timeOffEndTime={timeOffEndTime}
        timeOffReason={timeOffReason}
        timeOffStartDate={timeOffStartDate}
        timeOffStartTime={timeOffStartTime}
        timeOptions={timeOptions}
        onCreateTimeOff={onCreateTimeOff}
        onErrorReset={onErrorReset}
        onTimeOffBarberChange={onTimeOffBarberChange}
        onTimeOffEndDateChange={onTimeOffEndDateChange}
        onTimeOffEndTimeChange={onTimeOffEndTimeChange}
        onTimeOffReasonChange={onTimeOffReasonChange}
        onTimeOffStartDateChange={onTimeOffStartDateChange}
        onTimeOffStartTimeChange={onTimeOffStartTimeChange}
      />
      <AdminTimeOffList
        filteredTimeOffs={filteredTimeOffs}
        isAdminSession={isAdminSession}
        isLoading={isLoading}
        timeOffBarber={timeOffBarber}
        onDeleteTimeOff={onDeleteTimeOff}
      />
    </section>
  )
}
