import { PageIntro } from '../components/PageIntro'
import servicesBg from '../assets/services-bg-v2-sharp.webp'

const serviceGroups = [
  {
    title: "Стрижки",
    description: "Точная форма, современные техники и индивидуальный подход.",
    items: [
      {
        title: "Классическая стрижка",
        duration: "55 мин",
        details: "Индивидуальная форма, чистые линии и укладка после стрижки.",
        price: "2 000 ₽",
      },
      {
        title: "Стрижка + оформление бороды",
        duration: "95 мин",
        details: "Полный уход за волосами и бородой в один визит.",
        price: "3 000 ₽",
      },
    ],
  },
  {
    title: "Оформление бороды",
    description: "Идеальная форма, чистый контур и точная работа.",
    items: [
      {
        title: "Оформление бороды",
        duration: "40 мин",
        details:
          "Подбираем форму, выравниваем объем и аккуратно оформляем линии.",
        price: "1 200 ₽",
      },
      {
        title: "Окантовка бороды",
        duration: "25 мин",
        details: "Четкий контур щек, шеи и усов для свежего вида.",
        price: "800 ₽",
      },
    ],
  },
  {
    title: "Камуфляж седины",
    description: "Естественное тонирование без эффекта окрашенных волос.",
    items: [
      {
        title: "Камуфляж головы",
        duration: "35 мин",
        details:
          "Деликатно приглушаем седину и сохраняем естественный оттенок.",
        price: "1 800 ₽",
      },
      {
        title: "Камуфляж бороды",
        duration: "30 мин",
        details: "Выравниваем цвет бороды, сохраняя натуральную глубину тона.",
        price: "1 500 ₽",
      },
      {
        title: "Мужское окрашивание",
        duration: "70 мин",
        details: "Подбор оттенка, окрашивание и уход после процедуры.",
        price: "3 000 ₽",
      },
    ],
  },
  {
    title: "Дополнительно",
    description: "Дополнительный уход и внимание к деталям.",
    items: [
      {
        title: "Детская стрижка",
        duration: "45 мин",
        details: "Аккуратная стрижка для юных гостей в спокойном темпе.",
        price: "1 200 ₽",
      },
      {
        title: "Окантовка головы",
        duration: "20 мин",
        details: "Обновляем линию роста волос между основными стрижками.",
        price: "700 ₽",
      },
      {
        title: "Мытьё головы и укладка",
        duration: "20 мин",
        details: "Очищение, уход и финальная укладка под форму стрижки.",
        price: "700 ₽",
      },
    ],
  },
];

export function ServicesPage() {
  return (
    <main
      className="page-shell page-shell--visual services-page"
      style={{ backgroundImage: `url(${servicesBg})` }}
    >
      <PageIntro
        eyebrow="Услуги"
        title="Мужской уход без лишних слов."
        text="Стрижки, оформление бороды, камуфляж седины и уход за волосами. Мы уделяем внимание каждой детали и помогаем подобрать образ, который подчеркнет ваш стиль."
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
  );
}
