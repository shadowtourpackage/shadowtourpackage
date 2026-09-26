export const nav = [
  'Home',
  'Destinations',
  'Our Fleet',
  'Gallery',
  'About',
  'Contact',
];

export const sectionFor = (name) => {

  const sections = {
    Home: 'home',
    Destinations: 'destinations',
    'Our Fleet': 'fleet',
    Gallery: 'gallery',
    About: 'about',
    Contact: 'contact',
  };

  return sections[name];
};