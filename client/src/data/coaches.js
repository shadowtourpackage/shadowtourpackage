import { Armchair, BadgeCheck, Luggage, Snowflake, Usb, Volume2 } from 'lucide-react';

export const coaches = [
  { id: 'twinkle', name: 'Crysta', type: 'Premium coach', seats: '7 seats', image: '/images/fleet/crysta.png', hero: '/images/fleet/crysta-hero.png', description: 'A perfect blend of style, comfort and performance. crysta is designed to give you a smooth and enjoyable journey, whether it’s a short trip or a long-distance tour.' },
  { id: 'toxic', name: 'Traveler', type: 'Premium tourist coach', seats: '14-17 seats', image: '/images/fleet/traveler.png', hero: '/images/fleet/traveler-hero.png', description: 'Bold looks, inviting interiors and dependable performance for memorable group journeys.' },
  { id: 'online', name: 'Urbania', type: 'Luxury  tourist coach', seats: '9-17 seats', image: '/images/fleet/urbania.png', hero: '/images/fleet/urbania-hero.png', description: 'A comfortable, reliable coach built for relaxed weekends and longer adventures.' },
  { id: 'kshayaan', name: 'Glider', type: 'Luxury tourist coach', seats: '45 seats AC only', image: '/images/fleet/glider.png', hero: '/images/fleet/glider-hero.png', description: 'Thoughtfully maintained for safe, comfortable journeys with your favourite people.' },
  { id: 'Aitp', name: 'AITP', type: 'Luxury tourist coach', seats: '45 seats', image: '/images/fleet/astra.png', hero: '/images/fleet/astra-hero.png', description: 'A welcoming coach with the space and features groups need to travel well together.' },
  { id: 'dreamworld', name: 'BUS', type: 'Premium Tourist coach', seats: '49 seats', image: '/images/fleet/astra.png', hero: '/images/fleet/astra-hero.png', description: 'A welcoming coach with the space and features groups need to travel well together.' },
];

export const amenities = [
  [Armchair, 'Recliner', 'Push back seats'], 
  [Snowflake, 'AC', 'Fully air conditioned'],
  [Usb, 'Charging ports', 'USB & Type-C'], 
  [Volume2, 'Entertainment', 'Bass sound system'],
  [Luggage, 'Spacious luggage', 'Ample storage'], 
  [BadgeCheck, 'Well maintained', 'Regular safety checks'],
];