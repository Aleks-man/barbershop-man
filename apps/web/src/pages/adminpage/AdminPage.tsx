import {
  type CSSProperties,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { getAvailability } from "../../api/availability";
import {
  createAdminBarber,
  createAdminTimeOff,
  deleteAdminBarber,
  deleteAdminTimeOff,
  getAdminAppointments,
  getAdminBarbers,
  getAdminTimeOff,
  hideAdminBarber,
  loginAdmin,
  rescheduleAdminAppointment,
  restoreAdminBarber,
  uploadAdminBarberPhoto,
  updateAdminAppointmentStatus,
  type AdminAppointment,
  type AdminBarber,
  type AdminSessionRole,
  type AdminTimeOff,
} from "../../api/admin";
import type { BookingSelectOption } from "../../components/BookingSelect";
import { AdminAvailabilityView } from "./components/AdminAvailabilityView";
import { AdminBarbersView } from "./components/AdminBarbersView";
import { AdminHeader } from "./components/AdminHeader";
import { AdminClientsView } from "./components/AdminClientsView";
import { AdminLoginView } from "./components/AdminLoginView";
import { AdminRescheduleModal } from "./components/AdminRescheduleModal";
import { AdminScheduleView } from "./components/AdminScheduleView";
import { useCurrentTime } from "../../hooks/useCurrentTime";
import { useAdminDerivedData } from "./hooks/useAdminDerivedData";
import { useAdminNotifications } from "./hooks/useAdminNotifications";
import { useLoginBarbers } from "./hooks/useLoginBarbers";
import {
  adminViews,
  defaultBarberPassword,
  periods,
  sessionStorageKey,
  tabs,
  timeOptions,
  tokenStorageKey,
} from "./constants";
import {
  getPhoneHref,
  getStatusLabel,
  getStatusTone,
} from "./helpers";
import { readStoredSession } from "./storage";
import type { AdminSession, AdminTab, AdminView, AppointmentPeriod } from "./types";
import adminBg from "../../assets/admin-bg.webp";

const adminPageStyle = {
  "--admin-bg": `url(${adminBg})`,
} as CSSProperties;

export function AdminPage() {
  const currentTime = useCurrentTime();
  const [appointments, setAppointments] = useState<AdminAppointment[]>([]);
  const [barbers, setBarbers] = useState<AdminBarber[]>([]);
  const [timeOffs, setTimeOffs] = useState<AdminTimeOff[]>([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [session, setSession] = useState<AdminSession | null>(() =>
    readStoredSession(),
  );
  const [isCheckingSession, setIsCheckingSession] = useState(Boolean(session));
  const [isLoading, setIsLoading] = useState(false);
  const [loginRole, setLoginRole] = useState<AdminSessionRole>("admin");
  const [newBarberDescription, setNewBarberDescription] = useState("");
  const [newBarberExperience, setNewBarberExperience] = useState("");
  const [newBarberName, setNewBarberName] = useState("");
  const [newBarberPassword, setNewBarberPassword] = useState(
    defaultBarberPassword,
  );
  const [newBarberPhotoUrl, setNewBarberPhotoUrl] = useState("");
  const [newBarberRole, setNewBarberRole] = useState("");
  const [password, setPassword] = useState("");
  const [adminView, setAdminView] = useState<AdminView>("schedule");
  const [appointmentDate, setAppointmentDate] = useState("");
  const [appointmentPeriod, setAppointmentPeriod] =
    useState<AppointmentPeriod>("all");
  const [clientSearch, setClientSearch] = useState("");
  const [selectedBarberId, setSelectedBarberId] = useState("");
  const [selectedTab, setSelectedTab] = useState<AdminTab>("upcoming");
  const [rescheduleAppointmentId, setRescheduleAppointmentId] = useState("");
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleTime, setRescheduleTime] = useState("");
  const [rescheduleTimeOptions, setRescheduleTimeOptions] = useState<
    BookingSelectOption[]
  >([]);
  const [timeOffBarberId, setTimeOffBarberId] = useState("");
  const [timeOffEndDate, setTimeOffEndDate] = useState("");
  const [timeOffEndTime, setTimeOffEndTime] = useState("");
  const [timeOffReason, setTimeOffReason] = useState("");
  const [timeOffStartDate, setTimeOffStartDate] = useState("");
  const [timeOffStartTime, setTimeOffStartTime] = useState("");
  const [updatingAppointmentId, setUpdatingAppointmentId] = useState("");
  const token = session?.token ?? "";
  const isAdminSession = session?.role === "admin";
  const {
    isLoadingLoginBarbers,
    loadLoginBarbers,
    loginBarberId,
    loginBarberOptions,
    loginBarbersMessage,
    setLoginBarberId,
  } = useLoginBarbers(Boolean(session));

  const handleAppointmentCreated = useCallback((appointment: AdminAppointment) => {
    setAppointments((currentAppointments) => {
      if (
        currentAppointments.some(
          (currentAppointment) => currentAppointment.id === appointment.id,
        )
      ) {
        return currentAppointments;
      }

      return [...currentAppointments, appointment].sort(
        (firstAppointment, secondAppointment) =>
          new Date(firstAppointment.startsAt).getTime() -
          new Date(secondAppointment.startsAt).getTime(),
      );
    });
  }, []);

  const {
    isLoadingNotifications,
    isNotificationsOpen,
    loadUnreadNotifications,
    notificationMode,
    notifications,
    notificationsRef,
    resetNotifications,
    showAllNotifications,
    showUnreadNotifications,
    toggleNotifications,
    unreadNotifications,
  } = useAdminNotifications({
    session,
    onAppointmentCreated: handleAppointmentCreated,
  });

  const rescheduleAppointment = appointments.find(
    (appointment) => appointment.id === rescheduleAppointmentId,
  );


  useEffect(() => {
    if (!session) {
      return;
    }

    Promise.all([
      getAdminBarbers(session.token),
      getAdminAppointments(session.token),
      getAdminTimeOff(session.token),
    ])
      .then(([nextBarbers, nextAppointments, nextTimeOffs]) => {
        setBarbers(nextBarbers);
        setAppointments(nextAppointments);
        setTimeOffs(nextTimeOffs);
        setSelectedBarberId((currentBarberId) =>
          session.role === "barber"
            ? session.barberId || nextBarbers[0]?.id || ""
            : currentBarberId,
        );
        setTimeOffBarberId((currentBarberId) =>
          session.role === "barber"
            ? session.barberId || nextBarbers[0]?.id || ""
            : currentBarberId ||
              nextBarbers.find((barber) => barber.isActive !== false)?.id ||
              "",
        );
        loadUnreadNotifications();
        setErrorMessage("");
      })
      .catch(() => {
        sessionStorage.removeItem(tokenStorageKey);
        sessionStorage.removeItem(sessionStorageKey);
        setSession(null);
        setAppointments([]);
        setBarbers([]);
        setTimeOffs([]);
        setErrorMessage("Сессия истекла. Войдите снова.");
      })
      .finally(() => {
        setIsCheckingSession(false);
      });
  }, [loadUnreadNotifications, session]);

  const {
    activeBarberOptions,
    activeBarbers,
    canViewAllBarbers,
    filteredAppointments,
    filteredClients,
    filteredTimeOffs,
    hiddenBarbers,
    isTimeOffRangeValid,
    selectedBarber,
    tabCounts,
    timeOffBarber,
  } = useAdminDerivedData({
    appointmentDate,
    appointmentPeriod,
    appointments,
    barbers,
    clientSearch,
    isAdminSession,
    selectedBarberId,
    selectedTab,
    timeOffBarberId,
    timeOffEndDate,
    timeOffEndTime,
    timeOffs,
    timeOffStartDate,
    timeOffStartTime,
  });
  const visibleAdminViews = useMemo(
    () =>
      adminViews.filter((view) => isAdminSession || view.value !== "barbers"),
    [isAdminSession],
  );

  const handleLogin = async () => {
    if (!password.trim() || (loginRole === "barber" && !loginBarberId)) {
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await loginAdmin({
        barberId: loginRole === "barber" ? loginBarberId : undefined,
        password,
        role: loginRole,
      });
      const nextSession: AdminSession = {
        barberId: response.barberId,
        name: response.name,
        role: response.role,
        token: response.token,
      };

      sessionStorage.removeItem(tokenStorageKey);
      sessionStorage.setItem(sessionStorageKey, JSON.stringify(nextSession));
      setSession(nextSession);
      setIsCheckingSession(true);
      setPassword("");
    } catch {
      setErrorMessage("Неверный пароль.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem(tokenStorageKey);
    sessionStorage.removeItem(sessionStorageKey);
    setSession(null);
    setAppointments([]);
    setBarbers([]);
    setTimeOffs([]);
    resetNotifications();
    setAdminView("schedule");
    setAppointmentDate("");
    setAppointmentPeriod("all");
    setClientSearch("");
    setSelectedBarberId("");
    setTimeOffBarberId("");
    setTimeOffEndDate("");
    setTimeOffEndTime("");
    setTimeOffReason("");
    setTimeOffStartDate("");
    setTimeOffStartTime("");
  };

  const handleCreateBarber = async () => {
    if (!isAdminSession || !newBarberName.trim()) {
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
      const uploadedPhoto = newBarberPhotoUrl.startsWith("data:image/")
        ? await uploadAdminBarberPhoto({
            dataUrl: newBarberPhotoUrl,
            token,
          })
        : null;
      const response = await createAdminBarber({
        description: newBarberDescription,
        experience: newBarberExperience,
        name: newBarberName,
        password: newBarberPassword || defaultBarberPassword,
        photoUrl: uploadedPhoto?.photoUrl ?? newBarberPhotoUrl,
        role: newBarberRole,
        token,
      });

      setBarbers((currentBarbers) => [...currentBarbers, response.barber]);
      setSelectedBarberId(
        (currentBarberId) => currentBarberId || response.barber.id,
      );
      setNewBarberDescription("");
      setNewBarberExperience("");
      setNewBarberName("");
      setNewBarberPassword(defaultBarberPassword);
      setNewBarberPhotoUrl("");
      setNewBarberRole("");
    } catch {
      setErrorMessage("Не удалось добавить мастера.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBarberPhotoChange = (file: File | undefined) => {
    if (!file) {
      setNewBarberPhotoUrl("");
      return;
    }

    const reader = new FileReader();

    reader.addEventListener("load", () => {
      if (typeof reader.result === "string") {
        setNewBarberPhotoUrl(reader.result);
      }
    });
    reader.readAsDataURL(file);
  };

  const handleHideBarber = async (barberId: string) => {
    if (!isAdminSession) {
      return;
    }

    const barber = barbers.find(
      (currentBarber) => currentBarber.id === barberId,
    );
    const shouldHide = window.confirm(
      `Скрыть мастера ${barber?.name ?? ""}? Он пропадет с сайта, но останется в архиве.`,
    );

    if (!shouldHide) {
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
      await hideAdminBarber({
        barberId,
        token,
      });

      setBarbers((currentBarbers) => {
        if (selectedBarberId === barberId) {
          setSelectedBarberId("");
        }

        return currentBarbers.map((barber) =>
          barber.id === barberId ? { ...barber, isActive: false } : barber,
        );
      });
    } catch {
      setErrorMessage(
        "Не удалось скрыть мастера. Проверьте, что у него нет будущих записей.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestoreBarber = async (barberId: string) => {
    if (!isAdminSession) {
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await restoreAdminBarber({
        barberId,
        token,
      });

      setBarbers((currentBarbers) =>
        currentBarbers.map((barber) =>
          barber.id === barberId ? response.barber : barber,
        ),
      );
    } catch {
      setErrorMessage("Не удалось восстановить мастера.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteBarber = async (barberId: string) => {
    if (!isAdminSession) {
      return;
    }

    const barber = barbers.find(
      (currentBarber) => currentBarber.id === barberId,
    );
    const shouldDelete = window.confirm(
      `Удалить мастера ${barber?.name ?? ""} из базы навсегда? Это действие нельзя отменить.`,
    );

    if (!shouldDelete) {
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
      await deleteAdminBarber({
        barberId,
        token,
      });

      setBarbers((currentBarbers) =>
        currentBarbers.filter((currentBarber) => currentBarber.id !== barberId),
      );
      setTimeOffs((currentTimeOffs) =>
        currentTimeOffs.filter((timeOff) => timeOff.barber.id !== barberId),
      );
    } catch {
      setErrorMessage(
        "Не удалось удалить мастера. Удаление доступно только если у него нет записей.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTimeOff = async () => {
    if (!timeOffBarberId || !isTimeOffRangeValid || !timeOffReason.trim()) {
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await createAdminTimeOff({
        barberId: timeOffBarberId,
        endDate: timeOffEndDate,
        endTime: timeOffEndTime,
        reason: timeOffReason,
        startDate: timeOffStartDate,
        startTime: timeOffStartTime,
        token,
      });

      setTimeOffs((currentTimeOffs) =>
        [...currentTimeOffs, response.timeOff].sort(
          (firstTimeOff, secondTimeOff) =>
            new Date(firstTimeOff.startsAt).getTime() -
            new Date(secondTimeOff.startsAt).getTime(),
        ),
      );
      setTimeOffEndDate("");
      setTimeOffEndTime("");
      setTimeOffReason("");
      setTimeOffStartDate("");
      setTimeOffStartTime("");
    } catch {
      setErrorMessage(
        "Не удалось закрыть период. Проверьте время и активные записи мастера.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTimeOff = async (timeOffId: string) => {
    const shouldDelete = window.confirm(
      "Отменить этот закрытый период? После этого время снова станет доступно для записи.",
    );

    if (!shouldDelete) {
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
      await deleteAdminTimeOff({
        timeOffId,
        token,
      });

      setTimeOffs((currentTimeOffs) =>
        currentTimeOffs.filter((timeOff) => timeOff.id !== timeOffId),
      );
    } catch {
      setErrorMessage("Не удалось отменить закрытый период.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelAppointment = async (appointmentId: string) => {
    setUpdatingAppointmentId(appointmentId);
    setErrorMessage("");

    try {
      await updateAdminAppointmentStatus({
        appointmentId,
        status: "CANCELLED",
        token,
      });

      setAppointments((currentAppointments) =>
        currentAppointments.map((appointment) =>
          appointment.id === appointmentId
            ? { ...appointment, status: "CANCELLED" }
            : appointment,
        ),
      );
    } catch {
      setErrorMessage("Не удалось отменить запись.");
    } finally {
      setUpdatingAppointmentId("");
    }
  };

  useEffect(() => {
    if (!rescheduleAppointment || !rescheduleDate) {
      return;
    }

    let isMounted = true;

    getAvailability({
      barberId: rescheduleAppointment.barber.id,
      date: rescheduleDate,
      serviceId: rescheduleAppointment.service.id,
    })
      .then((slots) => {
        if (!isMounted) {
          return;
        }

        setRescheduleTimeOptions(slots);
      })
      .catch(() => {
        setRescheduleTimeOptions([]);
      });

    return () => {
      isMounted = false;
    };
  }, [rescheduleAppointment, rescheduleDate]);

  const openRescheduleForm = (appointment: AdminAppointment) => {
    setRescheduleAppointmentId(appointment.id);
    setRescheduleDate("");
    setRescheduleTime("");
    setRescheduleTimeOptions([]);
    setErrorMessage("");
  };

  const closeRescheduleForm = () => {
    setRescheduleAppointmentId("");
    setRescheduleDate("");
    setRescheduleTime("");
    setRescheduleTimeOptions([]);
  };

  const handleRescheduleAppointment = async () => {
    if (!rescheduleAppointment || !rescheduleDate || !rescheduleTime) {
      return;
    }

    setUpdatingAppointmentId(rescheduleAppointment.id);
    setErrorMessage("");

    try {
      const response = await rescheduleAdminAppointment({
        appointmentId: rescheduleAppointment.id,
        date: rescheduleDate,
        time: rescheduleTime,
        token,
      });

      setAppointments((currentAppointments) =>
        currentAppointments.map((appointment) =>
          appointment.id === rescheduleAppointment.id
            ? {
                ...appointment,
                endsAt: response.appointment.endsAt,
                startsAt: response.appointment.startsAt,
              }
            : appointment,
        ),
      );
      closeRescheduleForm();
    } catch {
      setErrorMessage("Не удалось перенести запись. Выберите другое время.");
    } finally {
      setUpdatingAppointmentId("");
    }
  };

  const renderAppointmentActions = (appointment: AdminAppointment) => {
    if (selectedTab !== "upcoming") {
      return null;
    }

    return (
      <div className="admin-actions">
        <button
          type="button"
          disabled={updatingAppointmentId === appointment.id}
          onClick={() => openRescheduleForm(appointment)}
        >
          Перенести
        </button>
        <button
          type="button"
          disabled={updatingAppointmentId === appointment.id}
          onClick={() => void handleCancelAppointment(appointment.id)}
        >
          Отменить
        </button>
      </div>
    );
  };

  if (!session) {
    return (
      <main className="admin-page" style={adminPageStyle}>
        <div className="page-text-logo admin-text-logo" aria-hidden="true">
          <img src="/gentlemansroom_text_logo_transparent.png" alt="" />
        </div>
        <AdminLoginView
          errorMessage={errorMessage}
          isLoading={isLoading}
          isLoadingLoginBarbers={isLoadingLoginBarbers}
          loginBarberId={loginBarberId}
          loginBarberOptions={loginBarberOptions}
          loginBarbersMessage={loginBarbersMessage}
          loginRole={loginRole}
          password={password}
          onErrorReset={() => setErrorMessage("")}
          onLoadLoginBarbers={loadLoginBarbers}
          onLogin={() => void handleLogin()}
          onLoginBarberChange={setLoginBarberId}
          onLoginRoleChange={setLoginRole}
          onPasswordChange={setPassword}
        />
      </main>
    );
  }

  return (
    <main className="admin-page" style={adminPageStyle}>
      <div className="page-text-logo admin-text-logo" aria-hidden="true">
        <img src="/gentlemansroom_text_logo_transparent.png" alt="" />
      </div>
      <section className="admin-shell">
        <AdminHeader
          currentTime={currentTime}
          isAdminSession={isAdminSession}
          isLoadingNotifications={isLoadingNotifications}
          isNotificationsOpen={isNotificationsOpen}
          notificationMode={notificationMode}
          notifications={notifications}
          notificationsRef={notificationsRef}
          unreadNotifications={unreadNotifications}
          onLogout={() => {
            if (window.confirm("Выйти из админки?")) {
              handleLogout();
            }
          }}
          onShowAllNotifications={showAllNotifications}
          onShowUnreadNotifications={showUnreadNotifications}
          onToggleNotifications={toggleNotifications}
        />

        <nav className="admin-view-tabs" aria-label="Разделы админки">
          {visibleAdminViews.map((view) => (
            <button
              type="button"
              aria-pressed={adminView === view.value}
              key={view.value}
              onClick={() => setAdminView(view.value)}
            >
              {view.label}
            </button>
          ))}
        </nav>

        {isCheckingSession && (
          <p className="admin-muted">Загружаем расписание...</p>
        )}
        {errorMessage && <p className="admin-alert">{errorMessage}</p>}

        {!isCheckingSession &&
          activeBarbers.length > 0 &&
          adminView === "schedule" && (
            <AdminScheduleView
              activeBarbers={activeBarbers}
              appointmentDate={appointmentDate}
              appointmentPeriod={appointmentPeriod}
              canViewAllBarbers={canViewAllBarbers}
              filteredAppointments={filteredAppointments}
              getPhoneHref={getPhoneHref}
              getStatusLabel={getStatusLabel}
              getStatusTone={getStatusTone}
              isAdminSession={isAdminSession}
              isLoading={isLoading}
              periods={periods}
              renderAppointmentActions={renderAppointmentActions}
              selectedBarber={selectedBarber}
              selectedBarberId={selectedBarberId}
              selectedTab={selectedTab}
              tabCounts={tabCounts}
              tabs={tabs}
              onAppointmentDateChange={setAppointmentDate}
              onAppointmentPeriodChange={setAppointmentPeriod}
              onHideBarber={(barberId) => void handleHideBarber(barberId)}
              onSelectedBarberChange={setSelectedBarberId}
              onSelectedTabChange={setSelectedTab}
            />
          )}

        {!isCheckingSession &&
          activeBarbers.length > 0 &&
          adminView === "availability" && (
            <AdminAvailabilityView
              activeBarberOptions={activeBarberOptions}
              filteredTimeOffs={filteredTimeOffs}
              isAdminSession={isAdminSession}
              isLoading={isLoading}
              isTimeOffRangeValid={isTimeOffRangeValid}
              sessionName={session.name}
              timeOffBarber={timeOffBarber}
              timeOffBarberId={timeOffBarberId}
              timeOffEndDate={timeOffEndDate}
              timeOffEndTime={timeOffEndTime}
              timeOffReason={timeOffReason}
              timeOffStartDate={timeOffStartDate}
              timeOffStartTime={timeOffStartTime}
              timeOptions={timeOptions}
              onCreateTimeOff={() => void handleCreateTimeOff()}
              onDeleteTimeOff={(timeOffId) => void handleDeleteTimeOff(timeOffId)}
              onErrorReset={() => setErrorMessage("")}
              onTimeOffBarberChange={setTimeOffBarberId}
              onTimeOffEndDateChange={setTimeOffEndDate}
              onTimeOffEndTimeChange={setTimeOffEndTime}
              onTimeOffReasonChange={setTimeOffReason}
              onTimeOffStartDateChange={(nextDate) => {
                setTimeOffStartDate(nextDate);
                setTimeOffEndDate((currentDate) => currentDate || nextDate);
              }}
              onTimeOffStartTimeChange={setTimeOffStartTime}
            />
          )}

        {!isCheckingSession && adminView === "clients" && (
          <AdminClientsView
            clientSearch={clientSearch}
            clients={filteredClients}
            getPhoneHref={getPhoneHref}
            isAdminSession={isAdminSession}
            onClientSearchChange={setClientSearch}
          />
        )}

        {!isCheckingSession && isAdminSession && adminView === "barbers" && (
          <AdminBarbersView
            activeBarbers={activeBarbers}
            hiddenBarbers={hiddenBarbers}
            isLoading={isLoading}
            newBarberDescription={newBarberDescription}
            newBarberExperience={newBarberExperience}
            newBarberName={newBarberName}
            newBarberPassword={newBarberPassword}
            newBarberPhotoUrl={newBarberPhotoUrl}
            newBarberRole={newBarberRole}
            selectedBarberId={selectedBarberId}
            onBarberPhotoChange={(file) => void handleBarberPhotoChange(file)}
            onCreateBarber={() => void handleCreateBarber()}
            onDeleteBarber={(barberId) => void handleDeleteBarber(barberId)}
            onNewBarberDescriptionChange={setNewBarberDescription}
            onNewBarberExperienceChange={setNewBarberExperience}
            onNewBarberNameChange={setNewBarberName}
            onNewBarberPasswordChange={setNewBarberPassword}
            onNewBarberRoleChange={setNewBarberRole}
            onRestoreBarber={(barberId) => void handleRestoreBarber(barberId)}
            onSelectBarberSchedule={(barberId) => {
              setSelectedBarberId(barberId);
              setAdminView("schedule");
              setSelectedTab("upcoming");
            }}
          />
        )}

        {!isCheckingSession &&
          activeBarbers.length === 0 &&
          adminView !== "barbers" && (
            <p className="admin-muted">Мастера пока не добавлены.</p>
          )}
      </section>
      {rescheduleAppointment && (
        <AdminRescheduleModal
          appointment={rescheduleAppointment}
          isUpdating={updatingAppointmentId === rescheduleAppointment.id}
          rescheduleDate={rescheduleDate}
          rescheduleTime={rescheduleTime}
          rescheduleTimeOptions={rescheduleTimeOptions}
          onClose={closeRescheduleForm}
          onReschedule={() => void handleRescheduleAppointment()}
          onRescheduleDateChange={(nextDate) => {
            setRescheduleDate(nextDate);
            setRescheduleTime("");
            setRescheduleTimeOptions([]);
          }}
          onRescheduleTimeChange={setRescheduleTime}
        />
      )}
    </main>
  );
}
