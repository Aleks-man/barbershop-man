import { PageIntro } from '../components/PageIntro'
import servicesBg from '../assets/services-bg-v2.png'
import { services } from '../data/site'

export function ServicesPage() {
  return (
    <main
      className="page-shell page-shell--visual"
      style={{ backgroundImage: `url(${servicesBg})` }}
    >
      <PageIntro
        eyebrow="Услуги"
        title="Мужской уход без лишних слов."
        text="Стрижка, борода, фейд и уход в одном месте. Работаем внимательно к деталям и помогаем подобрать стиль, который подойдет именно вам."
      />
      <div className="service-list">
        {services.map((service) => (
          <article className="service-row" key={service.title}>
            <div>
              <p>{service.duration}</p>
              <h2>{service.title}</h2>
              <span>{service.details}</span>
            </div>
            <strong>{service.price}</strong>
          </article>
        ))}
      </div>
    </main>
  );
}
