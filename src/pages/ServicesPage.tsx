import { PageIntro } from '../components/PageIntro'
import servicesBg from '../assets/services-bg-v2.webp'

const serviceGroups = [
  {
    title: 'Стрижки',
    description: 'Форма, техника и аккуратная посадка под ваш стиль.',
    items: [
      {
        title: 'Классическая стрижка',
        duration: '55 мин',
        details: 'Индивидуальная форма, чистые линии и укладка после стрижки.',
        price: 'от 1 500 ₽',
      },
      {
        title: 'Стрижка + оформление бороды',
        duration: '95 мин',
        details: 'Полный уход за волосами и бородой в один визит.',
        price: 'от 2 300 ₽',
      },
    ],
  },
  {
    title: 'Оформление бороды',
    description: 'Контур, длина и форма без лишней резкости.',
    items: [
      {
        title: 'Оформление бороды',
        duration: '40 мин',
        details: 'Подбираем форму, выравниваем объем и аккуратно оформляем линии.',
        price: 'от 900 ₽',
      },
      {
        title: 'Окантовка бороды',
        duration: '25 мин',
        details: 'Четкий контур щек, шеи и усов для свежего вида.',
        price: 'от 600 ₽',
      },
    ],
  },
  {
    title: 'Камуфляж седины',
    description: 'Мягкое тонирование без эффекта окрашенных волос.',
    items: [
      {
        title: 'Камуфляж головы',
        duration: '35 мин',
        details: 'Деликатно приглушаем седину и сохраняем естественный оттенок.',
        price: 'от 1 500 ₽',
      },
      {
        title: 'Камуфляж бороды',
        duration: '30 мин',
        details: 'Выравниваем цвет бороды, сохраняя натуральную глубину тона.',
        price: 'от 1 200 ₽',
      },
      {
        title: 'Мужское окрашивание',
        duration: '70 мин',
        details: 'Подбор оттенка, окрашивание и уход после процедуры.',
        price: 'от 2 500 ₽',
      },
    ],
  },
  {
    title: 'Дополнительно',
    description: 'Быстрые услуги, которые завершают образ.',
    items: [
      {
        title: 'Детская стрижка',
        duration: '45 мин',
        details: 'Аккуратная стрижка для юных гостей в спокойном темпе.',
        price: 'от 1 000 ₽',
      },
      {
        title: 'Окантовка головы',
        duration: '20 мин',
        details: 'Обновляем линию роста волос между основными стрижками.',
        price: 'от 500 ₽',
      },
      {
        title: 'Мытьё головы и укладка',
        duration: '20 мин',
        details: 'Очищение, уход и финальная укладка под форму стрижки.',
        price: 'от 500 ₽',
      },
    ],
  },
]

export function ServicesPage() {
  return (
    <main
      className="page-shell page-shell--visual services-page"
      style={{ backgroundImage: `url(${servicesBg})` }}
    >
      <PageIntro
        eyebrow="Услуги"
        title="Мужской уход без лишних слов."
        text="Стрижка, борода, камуфляж седины и уход в одном месте. Работаем внимательно к деталям и помогаем подобрать стиль, который подойдет именно вам."
      />
      <div className="service-groups">
        {serviceGroups.map((group) => (
          <section className="service-group" key={group.title}>
            <div className="service-group-heading">
              <p className="eyebrow">{group.title}</p>
              <span>{group.description}</span>
            </div>
            <div className="service-list">
              {group.items.map((service) => (
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
          </section>
        ))}
      </div>
    </main>
  )
}
