export const nav = [
  'Home',
  'Destinations',
  'Our Fleet',
  'Gallery',
  'Reviews',
  'About',
  'Contact',
];

export const sectionFor = (name) => {

  const sections = {
    Home: 'home',
    Destinations: 'destinations',
    'Our Fleet': 'fleet',
    Gallery: 'gallery',
    Reviews: 'reviews',
    About: 'about',
    Contact: 'contact',
  };

  return sections[name];
};