export const nav = ['Home', 'Destinations', 'Our Fleet', 'Gallery', 'About', 'Contact'];

export const sectionFor = (label) => ({
  Home: 'home',
  Destinations: 'destinations',
  'Our Fleet': 'fleet',
  Gallery: 'gallery',
  Contact: 'contact'
}[label] || 'about');