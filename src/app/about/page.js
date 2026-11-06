import Image from 'next/image';
import Link from 'next/link';

export const metadata = {
  title: 'Our story',
  description: 'Why Eco Coal makes charcoal briquettes from organic waste, and how every bag is made in Kampala.',
};

const STEPS = [
  { title: 'Collect', text: 'We gather farm residues and other organic waste, and sort out anything that should not burn.' },
  { title: 'Dry', text: 'The material is dried in the sun until it is ready to turn into char.' },
  { title: 'Carbonize', text: 'It is carbonized safely outdoors, then left to cool completely.' },
  { title: 'Press', text: 'The char is crushed, mixed with a natural cassava-starch binder and pressed into briquettes.' },
  { title: 'Dry & pack', text: 'Finished briquettes dry fully, are checked by hand, and packed for delivery.' },
];

const VALUES = [
  {
    title: 'Cleaner energy, made simple',
    text: 'Switching to greener fuel should not mean a new stove or a new routine. Eco Coal lights and cooks in the charcoal stove you already own.',
  },
  {
    title: 'Honest about our fuel',
    text: 'We compare our briquettes with ordinary charcoal on the same stove, and we only tell you what those comparisons show. No big promises we cannot back up.',
  },
  {
    title: 'Fair prices for every kitchen',
    text: 'From a single kilo to a 25 kg sack, our prices are kept simple so households and small food businesses can make the switch.',
  },
];

export default function AboutPage() {
  return (
    <>
      <section className="page-head">
        <div className="wrap page-head__inner">
          <p className="eyebrow">Our story</p>
          <h1 className="display display--medium">
            Good fuel shouldn’t <em>cost us our trees.</em>
          </h1>
        </div>
      </section>

      <section className="section section--flush">
        <div className="wrap story">
          <div className="story__media">
            <Image
              src="/images/detail.jpg"
              alt="Close-up of three Eco Coal briquettes"
              fill
              sizes="(max-width: 900px) 100vw, 50vw"
              className="story__img"
            />
          </div>
          <div className="story__text">
            <p className="story__lead">
              Eco Coal began with a simple question: why does the fuel that cooks Kampala’s meals still come from cutting
              down trees, when the city produces so much organic waste every day?
            </p>
            <p>
              Peelings, husks, crop leftovers and other organic material pile up in markets, homes and farms. Much of it
              ends up in drains and dumps. We turn suitable waste like this into charcoal briquettes that are used the
              same way as the charcoal families already buy.
            </p>
            <p>
              Our goal is to make eco-friendly energy an easy, everyday choice: the same stove, the same meals, a better
              source of fuel.
            </p>
          </div>
        </div>
      </section>

      <section className="section section--tint">
        <div className="wrap">
          <header className="section-head section-head--center">
            <p className="eyebrow">How it’s made</p>
            <h2 className="heading">From waste to your stove.</h2>
          </header>
          <ol className="process">
            {STEPS.map((step, index) => (
              <li key={step.title} className="process__step">
                <span className="process__no">{index + 1}</span>
                <h3 className="process__title">{step.title}</h3>
                <p>{step.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <header className="section-head">
            <div>
              <p className="eyebrow">What we stand for</p>
              <h2 className="heading">Greener energy that fits real life.</h2>
            </div>
          </header>
          <div className="values">
            {VALUES.map((value) => (
              <div key={value.title} className="values__item">
                <h3 className="values__title">{value.title}</h3>
                <p>{value.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="closing">
        <div className="wrap closing__inner">
          <h2 className="display display--small">
            Make the switch <em>one bag at a time.</em>
          </h2>
          <Link href="/products/trial-pack" className="btn btn--amber">
            Try the Trial Pack
          </Link>
        </div>
      </section>
    </>
  );
}
