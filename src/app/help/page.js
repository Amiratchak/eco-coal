import Link from 'next/link';
import { SITE, whatsappLink, whatsappDisplay } from '@/lib/site';

export const metadata = {
  title: 'Delivery & FAQ',
  description: 'Where Eco Coal delivers, how to pay, and answers about lighting, storing and using charcoal briquettes.',
};

const FAQ = [
  {
    q: 'What are Eco Coal briquettes made from?',
    a: 'Carbonized farm residues and other organic waste, bound together with a natural cassava-starch binder and pressed into briquettes.',
  },
  {
    q: 'Can I use them in my normal charcoal stove?',
    a: 'Yes. Eco Coal is used in the same kind of charcoal stove (sigiri) you already have. There is nothing new to buy.',
  },
  {
    q: 'How do I light them?',
    a: 'Light them the way you light charcoal: put a little paper or kindling under a few briquettes, let them catch, then add more once they are glowing. Give them a few minutes to light fully before you start cooking.',
  },
  {
    q: 'Is it safe to use them indoors?',
    a: 'Like all charcoal, briquettes give off carbon monoxide when they burn. Always cook in a well-ventilated space and never burn them in a closed room.',
  },
  {
    q: 'How should I store them?',
    a: 'Keep the bag closed, off the floor and in a dry place. Damp briquettes are harder to light.',
  },
  {
    q: 'How much will my household need?',
    a: 'It depends on how often and how much you cook. The 5 kg Trial Pack is the easiest way to find out before you buy a bigger amount.',
  },
  {
    q: 'Do you deliver outside these areas?',
    a: 'Choose “Other area in Kampala” at checkout and tell us where you are. We will confirm on WhatsApp whether we can reach you.',
  },
  {
    q: 'Can my restaurant order every week?',
    a: 'Yes. Order Business Sacks at checkout, or message us on WhatsApp to arrange regular deliveries, including orders above 100 kg.',
  },
];

export default function HelpPage() {
  return (
    <>
      <section className="page-head">
        <div className="wrap page-head__inner">
          <p className="eyebrow">Delivery &amp; FAQ</p>
          <h1 className="display display--medium">
            Everything you need <em>to know.</em>
          </h1>
        </div>
      </section>

      <section className="section section--flush">
        <div className="wrap help">
          <div className="help__facts">
            <div className="help__fact">
              <h2 className="help__label">Where we deliver</h2>
              <ul className="help__areas">
                {SITE.deliveryAreas.map((area) => (
                  <li key={area}>{area}</li>
                ))}
              </ul>
              <p>Other parts of Kampala on request.</p>
            </div>
            <div className="help__fact">
              <h2 className="help__label">How delivery works</h2>
              <p>
                After you check out, we send you a WhatsApp message to agree a delivery time. {SITE.hours}
              </p>
            </div>
            <div className="help__fact">
              <h2 className="help__label">How to pay</h2>
              <p>{SITE.payment}</p>
            </div>
            <div className="help__fact help__fact--contact">
              <h2 className="help__label">Still have a question?</h2>
              <p>Message us on WhatsApp at {whatsappDisplay()}.</p>
              <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className="btn btn--whatsapp">
                Chat on WhatsApp
              </a>
            </div>
          </div>

          <div className="faq">
            <h2 className="heading heading--small">Common questions</h2>
            {FAQ.map((item) => (
              <details key={item.q} className="faq__item">
                <summary>{item.q}</summary>
                <p>{item.a}</p>
              </details>
            ))}
            <p className="faq__more">
              Ready to order? <Link href="/shop">Go to the shop</Link>.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
