import type { ChangeEvent } from "react";
import { formatPhoneInput, phoneMask } from "../../../utils/phone";

type AdminBarberFormProps = {
  isLoading: boolean;
  newBarberDescription: string;
  newBarberExperience: string;
  newBarberName: string;
  newBarberPhone: string;
  newBarberPhotoUrl: string;
  newBarberRole: string;
  temporaryPassword: string;
  temporaryPasswordBarberName: string;
  onBarberPhotoChange: (file?: File) => void;
  onCreateBarber: () => void;
  onNewBarberDescriptionChange: (value: string) => void;
  onNewBarberExperienceChange: (value: string) => void;
  onNewBarberNameChange: (value: string) => void;
  onNewBarberPhoneChange: (value: string) => void;
  onNewBarberRoleChange: (value: string) => void;
  onTemporaryPasswordCopied: () => void;
};

export function AdminBarberForm({
  isLoading,
  newBarberDescription,
  newBarberExperience,
  newBarberName,
  newBarberPhone,
  newBarberPhotoUrl,
  newBarberRole,
  temporaryPassword,
  temporaryPasswordBarberName,
  onBarberPhotoChange,
  onCreateBarber,
  onNewBarberDescriptionChange,
  onNewBarberExperienceChange,
  onNewBarberNameChange,
  onNewBarberPhoneChange,
  onNewBarberRoleChange,
  onTemporaryPasswordCopied,
}: AdminBarberFormProps) {
  const handlePhotoChange = (event: ChangeEvent<HTMLInputElement>) => {
    onBarberPhotoChange(event.target.files?.[0]);
  };

  const copyTemporaryPassword = () => {
    void navigator.clipboard.writeText(temporaryPassword);
    onTemporaryPasswordCopied();
  };

  return (
    <section className="admin-manager">
      <header>
        <div>
          <span className="admin-eyebrow">Мастера</span>
          <h2>Добавить мастера</h2>
        </div>
      </header>
      <div className="admin-manager-form">
        <label>
          Имя
          <input
            type="text"
            value={newBarberName}
            onChange={(event) => onNewBarberNameChange(event.target.value)}
          />
        </label>
        <label>
          Специализация
          <input
            type="text"
            value={newBarberRole}
            onChange={(event) => onNewBarberRoleChange(event.target.value)}
          />
        </label>
        <label>
          Опыт
          <input
            type="text"
            placeholder="Например: 7 лет опыта"
            value={newBarberExperience}
            onChange={(event) =>
              onNewBarberExperienceChange(event.target.value)
            }
          />
        </label>
        <label>
          Телефон
          <input
            type="tel"
            inputMode="numeric"
            placeholder={phoneMask}
            value={newBarberPhone}
            onChange={(event) =>
              onNewBarberPhoneChange(
                formatPhoneInput(event.currentTarget.value),
              )
            }
          />
        </label>
        <label className="admin-manager-form-wide">
          Описание
          <textarea
            rows={1}
            value={newBarberDescription}
            onChange={(event) =>
              onNewBarberDescriptionChange(event.target.value)
            }
          />
        </label>
        <label className="admin-photo-upload">
          Фото
          <input type="file" accept="image/*" onChange={handlePhotoChange} />
          <span>{newBarberPhotoUrl ? "Заменить фото" : "Добавить фото"}</span>
        </label>
        {newBarberPhotoUrl && (
          <img
            className="admin-manager-photo-preview"
            src={newBarberPhotoUrl}
            alt=""
            aria-hidden="true"
          />
        )}
        <button
          type="button"
          disabled={isLoading || !newBarberName.trim()}
          onClick={onCreateBarber}
        >
          Добавить мастера
        </button>
      </div>
      {temporaryPassword && (
        <section className="admin-temporary-password">
          <span className="admin-eyebrow">Временный пароль</span>
          <h3>{temporaryPasswordBarberName}</h3>
          <code>{temporaryPassword}</code>
          <button type="button" onClick={copyTemporaryPassword}>
            Скопировать
          </button>
        </section>
      )}
    </section>
  );
}
