export const MOCK_PROPERTIES = [
  {
    id: 101,
    name: "Yankari Safari & Luxury Suites",
    slug: "yankari-safari-luxury-suites-bauchi",
    property_type: "resort",
    category: "Safari & Nature",
    city: "Bauchi",
    state: "Bauchi",
    neighborhood: "Yankari Reserve Area",
    address: "Plot 14 Safari Way, Off Central Expressway, Bauchi",
    description: "Nestled near the historic natural springs and reserve, Yankari Luxury Suites offers world-class hospitality, 24/7 solar backup power, verified security guards, and premium African dining.",
    verification_status: "verified", // Tier 3: FindDestination Verified
    verification_tier: "tier_3_certified",
    is_published: true,
    starting_price_kobo: 4500000,
    starting_price_formatted: "₦45,000",
    rating: 4.92,
    review_count: 64,
    images: [
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80"
    ],
    amenities: ["24/7 Power", "Constant Water", "Air Conditioning", "WiFi", "Armed Security", "Free Breakfast", "Swimming Pool"],
    host: {
      name: "Alhaji Ibrahim Bello",
      role: "Verified Super Host",
      joined: "2024",
      response_rate: "99%"
    },
    rooms: [
      { id: 1011, name: "Executive Royal Suite", price_kobo: 4500000, price_formatted: "₦45,000", max_occupancy: 2, bed_type: "King Double" },
      { id: 1012, name: "Presidential Safari Villa", price_kobo: 8500000, price_formatted: "₦85,000", max_occupancy: 4, bed_type: "2 King Beds" }
    ]
  },
  {
    id: 102,
    name: "Barnawa Crest Serviced Apartments",
    slug: "barnawa-crest-serviced-apartments-kaduna",
    property_type: "serviced_apartment",
    category: "Serviced Apartments",
    city: "Kaduna",
    state: "Kaduna",
    neighborhood: "Barnawa GRA",
    address: "22 Commercial Avenue, Barnawa GRA, Kaduna",
    description: "Modern 2-bedroom executive apartment ideal for corporate personnel and NGO teams visiting Kaduna. Features high-speed fiber internet, inverter backup, private kitchen, and CCTV security.",
    verification_status: "location_verified", // Tier 2: Location Verified
    verification_tier: "tier_2_location",
    is_published: true,
    starting_price_kobo: 3800000,
    starting_price_formatted: "₦38,000",
    rating: 4.85,
    review_count: 38,
    images: [
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80"
    ],
    amenities: ["24/7 Power", "Constant Water", "Air Conditioning", "WiFi", "CCTV Security", "Kitchenette", "Free Parking"],
    host: {
      name: "Hajia Fatima Usman",
      role: "Verified Host",
      joined: "2025",
      response_rate: "96%"
    },
    rooms: [
      { id: 1021, name: "2-Bedroom Executive Flat", price_kobo: 3800000, price_formatted: "₦38,000", max_occupancy: 4, bed_type: "2 Queen Beds" }
    ]
  },
  {
    id: 103,
    name: "Nassarawa Imperial Grand Hotel",
    slug: "nassarawa-imperial-grand-hotel-kano",
    property_type: "hotel",
    category: "Luxury Hotels",
    city: "Kano",
    state: "Kano",
    neighborhood: "Nassarawa GRA",
    address: "8 Bompai Road, Nassarawa GRA, Kano",
    description: "Kano's premier commercial hotel offering luxury suites, conference facilities, round-the-clock security, traditional Hausa-Fulani culinary dining, and express room service.",
    verification_status: "verified", // Tier 3: FindDestination Verified
    verification_tier: "tier_3_certified",
    is_published: true,
    starting_price_kobo: 5200000,
    starting_price_formatted: "₦52,000",
    rating: 4.95,
    review_count: 112,
    images: [
      "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1200&q=80"
    ],
    amenities: ["24/7 Power", "Constant Water", "Air Conditioning", "WiFi", "Armed Security", "Gym", "Restaurant", "Conference Rooms"],
    host: {
      name: "FindDestination Managed Partner",
      role: "Enterprise Hotel Manager",
      joined: "2023",
      response_rate: "100%"
    },
    rooms: [
      { id: 1031, name: "Deluxe King Room", price_kobo: 5200000, price_formatted: "₦52,000", max_occupancy: 2, bed_type: "King Bed" },
      { id: 1032, name: "Imperial Presidential Suite", price_kobo: 12000000, price_formatted: "₦120,000", max_occupancy: 2, bed_type: "Super King" }
    ]
  },
  {
    id: 104,
    name: "Rayfield Climate Resort & Villas",
    slug: "rayfield-climate-resort-villas-jos",
    property_type: "resort",
    category: "Resorts & Nature",
    city: "Jos",
    state: "Plateau",
    neighborhood: "Rayfield GRA",
    address: "Plot 5 Rayfield Lake Side, Jos",
    description: "Experience the cool temperature and breathtaking lake vistas of Rayfield, Jos. Ideal for family retreats, honeymooners, and executive weekend getaways.",
    verification_status: "verified", // Tier 3: FindDestination Verified
    verification_tier: "tier_3_certified",
    is_published: true,
    starting_price_kobo: 4200000,
    starting_price_formatted: "₦42,000",
    rating: 4.88,
    review_count: 53,
    images: [
      "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?auto=format&fit=crop&w=1200&q=80"
    ],
    amenities: ["24/7 Power", "Constant Water", "Air Conditioning", "WiFi", "Lake View", "Fire Pit", "Barbecue Grill"],
    host: {
      name: "Dr. Pam Gyang",
      role: "Verified Host",
      joined: "2024",
      response_rate: "98%"
    },
    rooms: [
      { id: 1041, name: "Lakeside Chalet", price_kobo: 4200000, price_formatted: "₦42,000", max_occupancy: 2, bed_type: "Queen Bed" }
    ]
  },
  {
    id: 105,
    name: "Jimeta Heights Executive Lodge",
    slug: "jimeta-heights-executive-lodge-yola",
    property_type: "lodge",
    category: "Guest Houses",
    city: "Yola",
    state: "Adamawa",
    neighborhood: "Jimeta Central",
    address: "12 Galadima Way, Jimeta, Yola",
    description: "Quiet and secure lodge situated in the heart of Jimeta. Features spacious air-conditioned rooms, solar power backup, daily housekeeping, and airport pickup services.",
    verification_status: "documents_verified", // Tier 1: Docs Verified
    verification_tier: "tier_1_docs",
    is_published: true,
    starting_price_kobo: 2800000,
    starting_price_formatted: "₦28,000",
    rating: 4.76,
    review_count: 22,
    images: [
      "https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1200&q=80"
    ],
    amenities: ["24/7 Power", "Constant Water", "Air Conditioning", "WiFi", "Security Guard", "Airport Shuttle"],
    host: {
      name: "Mallam Aminu Yola",
      role: "Verified Host",
      joined: "2025",
      response_rate: "94%"
    },
    rooms: [
      { id: 1051, name: "Standard Executive Room", price_kobo: 2800000, price_formatted: "₦28,000", max_occupancy: 2, bed_type: "Double Bed" }
    ]
  },
  {
    id: 106,
    name: "Tumfure Boutique Hotel & Suites",
    slug: "tumfure-boutique-hotel-suites-gombe",
    property_type: "boutique",
    category: "Boutique Stays",
    city: "Gombe",
    state: "Gombe",
    neighborhood: "Tumfure Quarters",
    address: "45 Bauchi-Gombe Highway, Tumfure, Gombe",
    description: "Contemporary boutique hotel offering personalized hospitality, pristine cleanliness, solar-powered water heating, and modern room amenities for business travelers.",
    verification_status: "verified", // Tier 3: FindDestination Verified
    verification_tier: "tier_3_certified",
    is_published: true,
    starting_price_kobo: 3200000,
    starting_price_formatted: "₦32,000",
    rating: 4.89,
    review_count: 41,
    images: [
      "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80"
    ],
    amenities: ["24/7 Power", "Constant Water", "Air Conditioning", "WiFi", "Free Breakfast", "Work Desk"],
    host: {
      name: "Engr. Usman Gombe",
      role: "Verified Host",
      joined: "2024",
      response_rate: "97%"
    },
    rooms: [
      { id: 1061, name: "Boutique Deluxe Room", price_kobo: 3200000, price_formatted: "₦32,000", max_occupancy: 2, bed_type: "Queen Bed" }
    ]
  }
];

export const MOCK_CATEGORIES = [
  { id: 'all', name: 'All Stays', icon: 'Building2' },
  { id: 'verified', name: 'FindDestination Verified', icon: 'ShieldCheck' },
  { id: 'hotel', name: 'Hotels', icon: 'Hotel' },
  { id: 'serviced_apartment', name: 'Serviced Apartments', icon: 'Home' },
  { id: 'lodge', name: 'Guest Houses & Lodges', icon: 'Key' },
  { id: 'resort', name: 'Resorts & Nature', icon: 'Trees' },
  { id: 'boutique', name: 'Boutique Stays', icon: 'Sparkles' },
];
