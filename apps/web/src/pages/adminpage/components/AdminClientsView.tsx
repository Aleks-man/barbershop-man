import { formatAdminDateTime } from '../../../utils/dateTime'
import type { AdminClient } from '../types'

type AdminClientsViewProps = {
  clientSearch: string
  clients: AdminClient[]
  isAdminSession: boolean
  getPhoneHref: (phone: string) => string
  onClientSearchChange: (value: string) => void
}

export function AdminClientsView({
  clientSearch,
  clients,
  getPhoneHref,
  isAdminSession,
  onClientSearchChange,
}: AdminClientsViewProps) {
  return (
    <section className="admin-clients-page">
      <header className="admin-section-header">
        <div>
          <span className="admin-eyebrow">Клиенты</span>
          <h2>{isAdminSession ? 'Список клиентов' : 'Мои клиенты'}</h2>
        </div>
        <strong>{clients.length}</strong>
      </header>

      <label className="admin-client-search">
        Поиск
        <input
          type="search"
          placeholder="Имя или телефон"
          value={clientSearch}
          onChange={(event) => onClientSearchChange(event.target.value)}
        />
      </label>

      {clients.length === 0 ? (
        <p className="admin-muted">Клиенты не найдены.</p>
      ) : (
        <>
          <div className="admin-table-wrap admin-clients-table-wrap">
            <table className="admin-table admin-clients-table">
              <thead>
                <tr>
                  <th>Клиент</th>
                  <th>Телефон</th>
                  <th>Визиты</th>
                  <th>Последний визит</th>
                  {isAdminSession && <th>Мастера</th>}
                </tr>
              </thead>
              <tbody>
                {clients.map((client) => (
                  <tr key={client.phone}>
                    <td>{client.name}</td>
                    <td>
                      <a className="admin-phone-link" href={getPhoneHref(client.phone)}>
                        {client.phone}
                      </a>
                    </td>
                    <td>{client.visits}</td>
                    <td>{formatAdminDateTime(client.lastVisit)}</td>
                    {isAdminSession && (
                      <td>{Array.from(client.barberNames).join(', ')}</td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="admin-client-list">
            {clients.map((client) => (
              <article className="admin-client-card" key={client.phone}>
                <div>
                  <strong>{client.name}</strong>
                  <a className="admin-phone-link" href={getPhoneHref(client.phone)}>
                    {client.phone}
                  </a>
                </div>
                <dl>
                  <div>
                    <dt>Визиты</dt>
                    <dd>{client.visits}</dd>
                  </div>
                  <div>
                    <dt>Последний визит</dt>
                    <dd>{formatAdminDateTime(client.lastVisit)}</dd>
                  </div>
                  {isAdminSession && (
                    <div>
                      <dt>Мастера</dt>
                      <dd>{Array.from(client.barberNames).join(', ')}</dd>
                    </div>
                  )}
                </dl>
              </article>
            ))}
          </div>
        </>
      )}
    </section>
  )
}
