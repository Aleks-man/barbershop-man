const socials = [
  {
    name: 'Instagram',
    icon: '/social/instagram.svg',
  },
  {
    name: 'Telegram',
    icon: '/social/telegram.svg',
  },
  {
    name: 'WhatsApp',
    icon: '/social/whatsapp.svg',
  },
]

export function SocialLinks() {
  return (
    <div className="contacts-socials">
      <dt>Мессенджеры и соцсети</dt>
      <div className="contacts-socials-links">
        {socials.map((social) => (
          <a href="#" aria-label={social.name} key={social.name}>
            <img src={social.icon} alt="" aria-hidden="true" />
          </a>
        ))}
      </div>
    </div>
  )
}
