import { img } from './images';

/** Editorial content. Placeholder copy, marked for replacement by the Obioma team. */

export const lookbook = [
  { id: 'look-1', title: 'Harmattan, first light', image: img.womanEditorial, products: ['adaeze-column-dress', 'zuri-cropped-jacket'], caption: 'The Adaeze in obsidian under the Zuri jacket.' },
  { id: 'look-2', title: 'Midday, Lagos', image: img.manSuit, products: ['obi-two-piece-suit', 'emeka-oxford-shirt'], caption: 'The Obi suit in midnight, with the Emeka oxford.' },
  { id: 'look-3', title: 'The long table', image: img.womanField, products: ['ada-occasion-kaftan'], caption: 'The Ada kaftan in emerald, hand-embroidered at the neck.' },
  { id: 'look-4', title: 'Ceremony', image: img.manPortrait, products: ['ugo-agbada-ceremonial-set'], caption: 'The Ugo agbada in ivory damask.' },
  { id: 'look-5', title: 'Dusk', image: img.dressRed, products: ['amara-pleated-midi-skirt', 'ebube-silk-blouse'], caption: 'Sunray pleats and silk, for evening.' },
  { id: 'look-6', title: 'Cold morning', image: img.manStreet, products: ['kene-wool-overcoat', 'uche-linen-trousers'], caption: 'The Kene overcoat over easy linen.' },
  { id: 'look-7', title: 'Second skin', image: img.womanPortrait, products: ['ifeoma-rib-knit-dress'], caption: 'The Ifeoma rib knit in camel.' },
];

export const testimonials = [
  { quote: 'The Fit Studio told me I was a size up at the hip. It was right. The dress fits as if it was made for me.', name: 'Chiamaka', place: 'London' },
  { quote: 'I have never owned a suit that sat this well on my shoulders. Made to measure, without the fuss.', name: 'Tobenna', place: 'Manchester' },
  { quote: 'Quiet, beautiful clothes. And for once, a website that understands a real body.', name: 'Ifeyinwa', place: 'Lagos' },
  { quote: 'My agbada for my brother’s wedding was perfect from the first fitting. People are still asking.', name: 'Kelechi', place: 'Birmingham' },
];

export const faqs = [
  {
    group: 'The Fit Studio',
    items: [
      { q: 'How accurate is the Fit Studio?', a: 'It compares your measurements with the finished measurements of every size, zone by zone, using the ease each piece was designed with. The more optional measurements you add, the more precise it becomes. The avatar is a stylised illustration rather than a photograph of you.' },
      { q: 'Where are my measurements stored?', a: 'On your device, in your browser, unless you choose to save them to your account. You can delete them at any time from the Fit Studio or your account.' },
      { q: 'What if no size fits me well?', a: 'The Fit Studio will tell you, and suggest made to measure. Your profile is attached to the request so we can start straight away.' },
    ],
  },
  {
    group: 'Made to measure',
    items: [
      { q: 'How long does made to measure take?', a: 'Typically four to six weeks from your confirmed measurements, and eight weeks for ceremonial pieces with hand embroidery. Tell us your date and we will tell you honestly if we can meet it.' },
      { q: 'Do I need a fitting?', a: 'Not always. Many clients order from their Fit Studio profile alone. For tailoring and occasion wear we recommend a virtual or in-person consultation.' },
      { q: 'Can I return a made-to-measure piece?', a: 'Because it is made for you alone it cannot be returned, but we will alter it, free of charge, until it is right.' },
    ],
  },
  {
    group: 'Orders & delivery',
    items: [
      { q: 'How much is delivery?', a: 'UK delivery is complimentary and tracked, arriving in 2–4 working days. International delivery is calculated at checkout.' },
      { q: 'What is your returns policy?', a: 'Return unworn pieces with their tags within 30 days for a full refund. Returns within the UK are free.' },
      { q: 'How should I care for my pieces?', a: 'Every product page lists fabric and care. In short: dry clean tailoring sparingly, steam rather than iron, and store on a shaped hanger.' },
    ],
  },
];
