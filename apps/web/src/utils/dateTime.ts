export type DatePeriod = "all" | "today" | "tomorrow" | "custom";

const adminDateTimeFormatter = new Intl.DateTimeFormat("ru-RU", {
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  month: "2-digit",
  year: "numeric",
});

const adminHeaderDateFormatter = new Intl.DateTimeFormat("ru-RU", {
  day: "numeric",
  month: "long",
  weekday: "long",
  year: "numeric",
});

const adminHeaderTimeFormatter = new Intl.DateTimeFormat("ru-RU", {
  hour: "2-digit",
  minute: "2-digit",
});

const getDayStart = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

const addDays = (date: Date, days: number) => {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);

  return nextDate;
};

const isSameDay = (date: Date, targetDate: Date) =>
  date.getFullYear() === targetDate.getFullYear() &&
  date.getMonth() === targetDate.getMonth() &&
  date.getDate() === targetDate.getDate();

export const formatDateValue = (value: Date | string) => {
  const date = typeof value === "string" ? new Date(value) : value;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

export const createTimeOptions = ({
  endHour,
  startHour,
  stepMinutes = 30,
}: {
  endHour: number;
  startHour: number;
  stepMinutes?: number;
}) => {
  const startMinutes = startHour * 60;
  const endMinutes = endHour * 60;
  const options: Array<{ label: string; value: string }> = [];

  for (let totalMinutes = startMinutes; totalMinutes <= endMinutes; totalMinutes += stepMinutes) {
    const hours = String(Math.floor(totalMinutes / 60)).padStart(2, "0");
    const minutes = String(totalMinutes % 60).padStart(2, "0");
    const value = `${hours}:${minutes}`;

    options.push({
      label: value,
      value,
    });
  }

  return options;
};

export const formatAdminDateTime = (value: Date | string) =>
  adminDateTimeFormatter.format(typeof value === "string" ? new Date(value) : value);

export const formatAdminHeaderDateTime = (date: Date) =>
  `${adminHeaderDateFormatter.format(date).replace(" г.", "")} ${adminHeaderTimeFormatter.format(date)}`;

export const matchesDatePeriod = (
  value: Date | string,
  period: DatePeriod,
  customDate: string,
) => {
  if (period === "all") {
    return true;
  }

  const date = typeof value === "string" ? new Date(value) : value;
  const today = getDayStart(new Date());
  const targetDate =
    period === "custom" && customDate
      ? getDayStart(new Date(`${customDate}T00:00:00`))
      : period === "today"
        ? today
        : addDays(today, 1);

  return isSameDay(date, targetDate);
};
