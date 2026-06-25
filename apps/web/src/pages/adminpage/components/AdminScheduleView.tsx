import type { ReactNode } from 'react'
import type { AdminAppointment, AdminBarber } from '../../../api/admin'
import { BookingDatePicker } from '../../../components/BookingDatePicker'
import { formatAdminDateTime } from '../../../utils/dateTime'

type AdminTab = 'upcoming' | 'completed' | 'cancelled'
type AppointmentPeriod = 'all' | 'today' | 'tomorrow' | 'custom'

type Tab = {
  label: string
  value: AdminTab
}

type Period = {
  label: string
  value: AppointmentPeriod
}

type AdminScheduleViewProps = {
  activeBarbers: AdminBarber[]
  appointmentDate: string
  appointmentPeriod: AppointmentPeriod
  canViewAllBarbers: boolean
  filteredAppointments: AdminAppointment[]
  isAdminSession: boolean
  isLoading: boolean
  periods: Period[]
  selectedBarber?: AdminBarber
  selectedBarberId: string
  selectedTab: AdminTab
  tabCounts: Record<AdminTab, number>
  tabs: Tab[]
  getPhoneHref: (phone: string) => string
  getStatusLabel: (appointment: AdminAppointment) => string
  getStatusTone: (appointment: AdminAppointment) => string
  renderAppointmentActions: (appointment: AdminAppointment) => ReactNode
  onAppointmentDateChange: (date: string) => void
  onAppointmentPeriodChange: (period: AppointmentPeriod) => void
  onHideBarber: (barberId: string) => void
  onSelectedBarberChange: (barberId: string) => void
  onSelectedTabChange: (tab: AdminTab) => void
}

export function AdminScheduleView({
  activeBarbers,
  appointmentDate,
  appointmentPeriod,
  canViewAllBarbers,
  filteredAppointments,
  getPhoneHref,
  getStatusLabel,
  getStatusTone,
  isAdminSession,
  isLoading,
  onAppointmentDateChange,
  onAppointmentPeriodChange,
  onHideBarber,
  onSelectedBarberChange,
  onSelectedTabChange,
  periods,
  renderAppointmentActions,
  selectedBarber,
  selectedBarberId,
  selectedTab,
  tabCounts,
  tabs,
}: AdminScheduleViewProps) {
  return (
    <>
      {isAdminSession && (
        <nav className="admin-barbers" aria-label="Мастера">
          <button
            type="button"
            aria-pressed={!selectedBarberId}
            onClick={() => {
              onSelectedBarberChange('')
              onSelectedTabChange('upcoming')
            }}
          >
            <span>Все мастера</span>
            <small>Общее расписание</small>
          </button>
          {activeBarbers.map((barber) => (
            <button
              type="button"
              aria-pressed={barber.id === selectedBarberId}
              key={barber.id}
              onClick={() => {
                onSelectedBarberChange(barber.id)
                onSelectedTabChange('upcoming')
              }}
            >
              <span>{barber.name}</span>
              {barber.role && <small>{barber.role}</small>}
            </button>
          ))}
        </nav>
      )}

      <section className="admin-schedule">
        <header className="admin-schedule-header">
          <div>
            <span className="admin-eyebrow">
              {canViewAllBarbers ? 'Обзор' : 'Мастер'}
            </span>
            <h2>{canViewAllBarbers ? 'Все мастера' : selectedBarber?.name}</h2>
          </div>
          {isAdminSession && selectedBarber && !canViewAllBarbers && (
            <button
              type="button"
              className="admin-danger-button"
              disabled={isLoading}
              onClick={() => onHideBarber(selectedBarber.id)}
            >
              Скрыть мастера
            </button>
          )}
        </header>

        <div className="admin-schedule-tools">
          <div className="admin-filter-group">
            <span>Период</span>
            <div className="admin-segmented" aria-label="Период записей">
              {periods.map((period) => (
                <button
                  type="button"
                  aria-pressed={appointmentPeriod === period.value}
                  key={period.value}
                  onClick={() => {
                    onAppointmentDateChange('')
                    onAppointmentPeriodChange(period.value)
                  }}
                >
                  {period.label}
                </button>
              ))}
            </div>
            <div className="admin-period-date">
              <BookingDatePicker
                allowPastDates
                label="Дата"
                placeholder="Выбрать дату"
                value={appointmentDate}
                onChange={(nextDate) => {
                  onAppointmentDateChange(nextDate)
                  onAppointmentPeriodChange('custom')
                }}
              />
            </div>
          </div>
        </div>

        <div className="admin-stats" role="tablist" aria-label="Статус записей">
          {tabs.map((tab) => (
            <button
              type="button"
              aria-selected={selectedTab === tab.value}
              key={tab.value}
              role="tab"
              onClick={() => onSelectedTabChange(tab.value)}
            >
              <span>{tab.label}</span>
              <strong>{tabCounts[tab.value]}</strong>
            </button>
          ))}
        </div>

        {filteredAppointments.length === 0 && (
          <p className="admin-muted">Записей в этой вкладке пока нет.</p>
        )}

        {filteredAppointments.length > 0 && (
          <>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Время</th>
                    {canViewAllBarbers && <th>Мастер</th>}
                    <th>Клиент</th>
                    <th>Телефон</th>
                    <th>Услуга</th>
                    <th>Статус</th>
                    <th>Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAppointments.map((appointment) => (
                    <tr key={appointment.id}>
                      <td>{formatAdminDateTime(appointment.startsAt)}</td>
                      {canViewAllBarbers && <td>{appointment.barber.name}</td>}
                      <td>{appointment.customerName}</td>
                      <td>
                        <a
                          className="admin-phone-link"
                          href={getPhoneHref(appointment.customerPhone)}
                        >
                          {appointment.customerPhone}
                        </a>
                      </td>
                      <td>{appointment.service.title}</td>
                      <td>
                        <span
                          className={`admin-status admin-status--${getStatusTone(appointment)}`}
                        >
                          {getStatusLabel(appointment)}
                        </span>
                      </td>
                      <td>{renderAppointmentActions(appointment)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="admin-appointment-list">
              {filteredAppointments.map((appointment) => (
                <article className="admin-appointment-card" key={appointment.id}>
                  <header>
                    <strong>{formatAdminDateTime(appointment.startsAt)}</strong>
                    <span
                      className={`admin-status admin-status--${getStatusTone(appointment)}`}
                    >
                      {getStatusLabel(appointment)}
                    </span>
                  </header>
                  <dl>
                    {canViewAllBarbers && (
                      <div>
                        <dt>Мастер</dt>
                        <dd>{appointment.barber.name}</dd>
                      </div>
                    )}
                    <div>
                      <dt>Клиент</dt>
                      <dd>{appointment.customerName}</dd>
                    </div>
                    <div>
                      <dt>Телефон</dt>
                      <dd>
                        <a
                          className="admin-phone-link"
                          href={getPhoneHref(appointment.customerPhone)}
                        >
                          {appointment.customerPhone}
                        </a>
                      </dd>
                    </div>
                    <div>
                      <dt>Услуга</dt>
                      <dd>{appointment.service.title}</dd>
                    </div>
                  </dl>
                  {renderAppointmentActions(appointment)}
                </article>
              ))}
            </div>
          </>
        )}
      </section>
    </>
  )
}
