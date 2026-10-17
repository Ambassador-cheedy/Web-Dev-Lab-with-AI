/**
 * Placeholder editorial photography from Unsplash.
 * Replace with Obioma's own photography before launch (see public/images/README.md).
 */
const u = (id: string) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&q=80`;

export const img = {
  heroWoman: u('1531123897727-8f129e1688ce'),
  heroAlt: u('1509631179647-0177331693ae'),
  womanCoat: u('1515886657613-9f3515b0c78f'),
  womanStudio: u('1539109136881-3be0616acf4b'),
  womanDress: u('1496747611176-843222e1e57c'),
  womanStreet: u('1485968579580-b6d095142e6e'),
  womanField: u('1469334031218-e382a71b716b'),
  womanPortrait: u('1529139574466-a303027c1d8b'),
  dressRed: u('1566174053879-31528523f8ae'),
  dressFloat: u('1595777457583-95e059d581b8'),
  womanMinimal: u('1581044777550-4cfa60707c03'),
  womanEditorial: u('1589156280159-27698a70f29e'),
  womanSoft: u('1524504388940-b1c1722653e1'),
  manSuit: u('1507679799987-c73779587ccf'),
  manSuitDetail: u('1593030761757-71fae45fa0e7'),
  manStreet: u('1617137968427-85924c800a22'),
  manTailored: u('1594938298603-c8148c4dae35'),
  manCasual: u('1552374196-1ab2a1c593e8'),
  manPortrait: u('1488161628813-04466f872be2'),
  fabric: u('1558769132-cb1aea458c5e'),
  workshop: u('1556905055-8f358a7a47b2'),
  tailor: u('1605518216938-7c31b7b14ad0'),
  rack: u('1490481651871-ab68de25d43d'),
  boutique: u('1445205170230-053b83016050'),
} as const;
