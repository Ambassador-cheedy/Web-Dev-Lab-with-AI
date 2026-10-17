export const primaryNav = [
  { href: '/collections', label: 'Collections' },
  { href: '/made-to-measure', label: 'Made to Measure' },
  { href: '/fit-studio', label: 'Fit Studio' },
  { href: '/atelier', label: 'Atelier' },
] as const;

export const footerNav = [
  {
    title: 'Shop',
    links: [
      { href: '/collections', label: 'All pieces' },
      { href: '/collections/dresses', label: 'Dresses' },
      { href: '/collections/suits', label: 'Suits' },
      { href: '/collections/occasion', label: 'Occasion' },
      { href: '/lookbook', label: 'Lookbook' },
    ],
  },
  {
    title: 'Client Services',
    links: [
      { href: '/fit-studio', label: 'Fit Studio' },
      { href: '/size-guide', label: 'Size guide' },
      { href: '/how-to-measure', label: 'How to measure' },
      { href: '/delivery-returns', label: 'Delivery & returns' },
      { href: '/faq', label: 'FAQ' },
      { href: '/contact', label: 'Contact' },
    ],
  },
  {
    title: 'The House',
    links: [
      { href: '/atelier', label: 'Atelier' },
      { href: '/made-to-measure', label: 'Made to measure' },
      { href: '/account', label: 'Account' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { href: '/privacy', label: 'Privacy' },
      { href: '/terms', label: 'Terms' },
      { href: '/cookies', label: 'Cookies' },
    ],
  },
] as const;
