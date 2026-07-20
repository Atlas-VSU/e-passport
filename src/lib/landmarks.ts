import { Landmark } from '../types';

export const landmarks: Landmark[] = [
  {
    id: 'admin',
    name: 'Admin Bldg',
    description: 'A grand, classical university administration building with large white columns and a wide staircase. The building is bathed in warm afternoon sunlight, projecting institutional prestige.',
    icon: 'account_balance',
    order: 1,
    label: 'Landmark 01',
    photoUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuALRqH_iz6suVkZh_4kLEj12w1HIwtGdR4rqeK7YtIeNn2rAoMY71BOZ_eoHmq44Uza3Avs4n5KVFb6bLQe1JrOez2okt_CAsvPLvPuG4CZCWFyB7mfczG6Ph4ZRvHlIc1fozSjEW6spUs-s03deqn700maBX4jnVMqRI1X7OJWGM0exU3Pt1X6nAIyHBpBkewZFtvYX_8Jo-pVzYStDipyjTZLbol9GYw0bKSZnLlcVBlkkOmDq8NcHQ',
    zoneType: 'building',
    zoneRadius: 80,
    mapX: 50,
    mapY: 8.33
  },
  {
    id: 'ecopark',
    name: 'VSU Eco Park',
    description: 'A lush green sanctuary showing off rich tropical biodiversity, winding forest trails, and educational conservation spaces. Perfect for deep reflections on ecology and sustainable development.',
    icon: 'nature_people',
    order: 2,
    label: 'Landmark 02',
    photoUrl: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&q=80&w=800',
    zoneType: 'green',
    zoneRadius: 100,
    mapX: 20,
    mapY: 25.0
  },
  {
    id: 'library',
    name: 'VSU Library',
    description: 'A modern, multi-story university library building featuring large glass windows reflecting the surrounding nature. It serves as a center for quiet academic study and active learning.',
    icon: 'local_library',
    order: 3,
    label: 'Landmark 03',
    photoUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuClKg0vwjkMUDFvxZM7PIX0vwEF__E1Trin9sE6A3gDNOiEqzEWMJfVnZXbPL0GVHtY8DxHM9U1kjJ1w7w12fergJgIE1VR2-I1e0F8kNbJWbXJ4PkWzncJn6_70zNO8nDbMsjmFd1-wXIG6lz8u8a8VsUi07YA_RhsR46wKYs0URRH14OOp8bfoh1WRT3LMGfXuRtKo8_Ix0OQV5QTIGnKFQKXNbmkOD5jWX5BjF0Nsa2AWLmyY5TLBA',
    zoneType: 'building',
    zoneRadius: 75,
    mapX: 68,
    mapY: 41.67
  },
  {
    id: 'obelisk',
    name: 'VSU Obelisk',
    description: 'Standing as a proud symbol of the university, the Obelisk marks the entrance to the lower campus. It represents the enduring pursuit of agricultural and environmental excellence.',
    icon: 'verified',
    order: 4,
    label: 'Landmark 04',
    photoUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBUUE176PUkK38p_48LmLrBFIVlYaZFy-sp27X9ukLm5bVgD7SGEVpP-EFuleNwEJixskXB4nweieleyst_Qty92cqeJ1z9gE3pGGS2l7Q_9oPvYJd5tXDuln9jso5rwVul1_YMhknzvvygsJQd9BuY0EnqRfi4jGB8xy3Uyslzd4lZAzlZhcBjvJRmFEDcceTXPmZfFZBJJurdXZCQ8TAP6z9SOfMzfbji__Wn1gKG9XEL935z_d-ucA',
    zoneType: 'open',
    zoneRadius: 70,
    mapX: 30,
    mapY: 58.33
  },
  {
    id: 'oval',
    name: 'VSU Oval',
    description: 'The historic sports athletic field where student-athletes train and compete. Ringed by trees, it represents the energetic spirit and dynamic campus community of VSU.',
    icon: 'stadium',
    order: 5,
    label: 'Landmark 05',
    photoUrl: 'https://images.unsplash.com/photo-1587280501635-68a0e82cd5ff?auto=format&fit=crop&q=80&w=800',
    zoneType: 'sports',
    zoneRadius: 90,
    mapX: 65,
    mapY: 75.0
  },
  {
    id: 'beach',
    name: 'VSU Beach',
    description: 'A gorgeous coastline overlooking the Camotes Sea, known for its relaxing sea breezes and dramatic sunset views. It is a favorite spot for student relaxation and recreational events.',
    icon: 'beach_access',
    order: 6,
    label: 'Landmark 06',
    photoUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=800',
    zoneType: 'water',
    zoneRadius: 95,
    mapX: 48,
    mapY: 91.67
  }
];
