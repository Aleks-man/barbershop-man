type PageIntroProps = {
  eyebrow: string
  title: string
  text: string
}

export function PageIntro({ eyebrow, title, text }: PageIntroProps) {
  return (
    <div className="page-intro">
      <p className="eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      <span>{text}</span>
    </div>
  )
}
