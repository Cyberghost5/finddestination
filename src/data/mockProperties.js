const RAW_MOCK_PROPERTIES = [
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
    verification_status: "verified",
    verification_tier: "tier_3_certified",
    is_published: true,
    starting_price_kobo: 4500000,
    starting_price_formatted: "₦45,000",
    rating: 4.92,
    review_count: 64,
    images: [
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80"
    ],
    amenities: ["24/7 Power", "Constant Water", "Air Conditioning", "WiFi", "Armed Security", "Free Breakfast", "Swimming Pool"],
    host: { name: "Alhaji Ibrahim Bello", role: "Verified Super Host", joined: "2024", response_rate: "99%" },
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
    verification_status: "location_verified",
    verification_tier: "tier_2_location",
    is_published: true,
    starting_price_kobo: 3800000,
    starting_price_formatted: "₦38,000",
    rating: 4.85,
    review_count: 38,
    images: [
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80"
    ],
    amenities: ["24/7 Power", "Constant Water", "Air Conditioning", "WiFi", "CCTV Security", "Kitchenette", "Free Parking"],
    host: { name: "Hajia Fatima Usman", role: "Verified Host", joined: "2025", response_rate: "96%" },
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
    verification_status: "verified",
    verification_tier: "tier_3_certified",
    is_published: true,
    starting_price_kobo: 5200000,
    starting_price_formatted: "₦52,000",
    rating: 4.95,
    review_count: 112,
    images: [
      "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80"
    ],
    amenities: ["24/7 Power", "Constant Water", "Air Conditioning", "WiFi", "Armed Security", "Gym", "Restaurant", "Conference Rooms"],
    host: { name: "FindDestination Enterprise", role: "Enterprise Manager", joined: "2023", response_rate: "100%" },
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
    verification_status: "verified",
    verification_tier: "tier_3_certified",
    is_published: true,
    starting_price_kobo: 4200000,
    starting_price_formatted: "₦42,000",
    rating: 4.88,
    review_count: 53,
    images: [
      "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80"
    ],
    amenities: ["24/7 Power", "Constant Water", "Air Conditioning", "WiFi", "Lake View", "Fire Pit", "Barbecue Grill"],
    host: { name: "Dr. Pam Gyang", role: "Verified Host", joined: "2024", response_rate: "98%" },
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
    verification_status: "documents_verified",
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
    host: { name: "Mallam Aminu Yola", role: "Verified Host", joined: "2025", response_rate: "94%" },
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
    verification_status: "verified",
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
    host: { name: "Engr. Usman Gombe", role: "Verified Host", joined: "2024", response_rate: "97%" },
    rooms: [
      { id: 1061, name: "Boutique Deluxe Room", price_kobo: 3200000, price_formatted: "₦32,000", max_occupancy: 2, bed_type: "Queen Bed" }
    ]
  },
  {
    id: 107,
    name: "Sokoto Caliphate Heritage Hotel",
    slug: "sokoto-caliphate-heritage-hotel-sokoto",
    property_type: "hotel",
    category: "Luxury Hotels",
    city: "Sokoto",
    state: "Sokoto",
    neighborhood: "Sokoto GRA",
    address: "15 Sultan Abubakar Road, GRA, Sokoto",
    description: "Elegantly styled hotel reflecting Sokoto's royal Islamic heritage. Features solar-powered air conditioning, traditional northern dining, conference hall, and VIP airport pickup.",
    verification_status: "verified",
    verification_tier: "tier_3_certified",
    is_published: true,
    starting_price_kobo: 3600000,
    starting_price_formatted: "₦36,000",
    rating: 4.88,
    review_count: 45,
    images: [
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80"
    ],
    amenities: ["24/7 Power", "Constant Water", "Air Conditioning", "WiFi", "Armed Security", "Royal Dining"],
    host: { name: "Alhaji Ibrahim Bello", role: "Verified Host", joined: "2024", response_rate: "99%" },
    rooms: [
      { id: 1071, name: "Caliphate Royal Room", price_kobo: 3600000, price_formatted: "₦36,000", max_occupancy: 2, bed_type: "King Bed" }
    ]
  },
  {
    id: 108,
    name: "Katsina Gobarau Traditional Lodge",
    slug: "katsina-gobarau-traditional-lodge-katsina",
    property_type: "lodge",
    category: "Cultural & Heritage",
    city: "Katsina",
    state: "Katsina",
    neighborhood: "Gobarau Area",
    address: "8 Minaret Close, Near Gobarau Tower, Katsina",
    description: "Unique traditional clay architecture lodge with modern luxury interiors, solar power, cool inner courtyards, and direct proximity to Katsina Emir Palace.",
    verification_status: "verified",
    verification_tier: "tier_3_certified",
    is_published: true,
    starting_price_kobo: 3000000,
    starting_price_formatted: "₦30,000",
    rating: 4.82,
    review_count: 29,
    images: [
      "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80"
    ],
    amenities: ["24/7 Power", "Constant Water", "Air Conditioning", "WiFi", "Cultural Courtyard", "Free Breakfast"],
    host: { name: "Alhaji Ibrahim Bello", role: "Verified Host", joined: "2024", response_rate: "99%" },
    rooms: [
      { id: 1081, name: "Emirate Courtyard Suite", price_kobo: 3000000, price_formatted: "₦30,000", max_occupancy: 2, bed_type: "Double Bed" }
    ]
  },
  {
    id: 109,
    name: "Zaria Samaru University Serviced Suites",
    slug: "zaria-samaru-university-serviced-suites-kaduna",
    property_type: "serviced_apartment",
    category: "Serviced Apartments",
    city: "Zaria",
    state: "Kaduna",
    neighborhood: "Samaru",
    address: "4 ABU Main Gate Road, Samaru, Zaria",
    description: "Serviced 1-bedroom and studio suites tailored for visiting professors, researchers, and university guests. High-speed fiber internet and uninterrupted generator/solar backup.",
    verification_status: "location_verified",
    verification_tier: "tier_2_location",
    is_published: true,
    starting_price_kobo: 2500000,
    starting_price_formatted: "₦25,000",
    rating: 4.79,
    review_count: 31,
    images: [
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80"
    ],
    amenities: ["24/7 Power", "Constant Water", "Air Conditioning", "WiFi", "Study Desk", "Kitchenette"],
    host: { name: "Alhaji Ibrahim Bello", role: "Verified Host", joined: "2024", response_rate: "99%" },
    rooms: [
      { id: 1091, name: "Academic Executive Suite", price_kobo: 2500000, price_formatted: "₦25,000", max_occupancy: 2, bed_type: "Queen Bed" }
    ]
  },
  {
    id: 110,
    name: "Malali Executive Heights Apartments",
    slug: "malali-executive-heights-apartments-kaduna",
    property_type: "serviced_apartment",
    category: "Serviced Apartments",
    city: "Kaduna",
    state: "Kaduna",
    neighborhood: "Malali GRA",
    address: "18 Sultan Road, Malali GRA, Kaduna",
    description: "Ultra-luxurious 3-bedroom serviced apartment with private rooftop lounge, smart locks, solar power, and 24-hour armed private security.",
    verification_status: "verified",
    verification_tier: "tier_3_certified",
    is_published: true,
    starting_price_kobo: 6500000,
    starting_price_formatted: "₦65,000",
    rating: 4.96,
    review_count: 72,
    images: [
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80"
    ],
    amenities: ["24/7 Power", "Constant Water", "Air Conditioning", "WiFi", "Armed Security", "Rooftop Lounge"],
    host: { name: "Alhaji Ibrahim Bello", role: "Verified Host", joined: "2024", response_rate: "99%" },
    rooms: [
      { id: 1101, name: "3-Bedroom Penthouse Flat", price_kobo: 6500000, price_formatted: "₦65,000", max_occupancy: 6, bed_type: "3 King Beds" }
    ]
  },
  {
    id: 111,
    name: "Sabon Gari Commercial Hub Hotel",
    slug: "sabon-gari-commercial-hub-hotel-kano",
    property_type: "hotel",
    category: "Corporate & NGO Hubs",
    city: "Kano",
    state: "Kano",
    neighborhood: "Sabon Gari",
    address: "42 France Road, Sabon Gari, Kano",
    description: "Located in Kano's bustling commercial district. Features clean guest suites, secure basement parking, restaurant serving local and international dishes.",
    verification_status: "documents_verified",
    verification_tier: "tier_1_docs",
    is_published: true,
    starting_price_kobo: 2700000,
    starting_price_formatted: "₦27,000",
    rating: 4.68,
    review_count: 18,
    images: [
      "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80"
    ],
    amenities: ["24/7 Power", "Constant Water", "Air Conditioning", "WiFi", "Secure Parking", "Restaurant"],
    host: { name: "Alhaji Ibrahim Bello", role: "Verified Host", joined: "2024", response_rate: "99%" },
    rooms: [
      { id: 1111, name: "Standard Commercial Suite", price_kobo: 2700000, price_formatted: "₦27,000", max_occupancy: 2, bed_type: "Double Bed" }
    ]
  },
  {
    id: 112,
    name: "Dutse Royal Rock Hotel & Resort",
    slug: "dutse-royal-rock-hotel-resort-jigawa",
    property_type: "resort",
    category: "Resorts & Nature",
    city: "Dutse",
    state: "Jigawa",
    neighborhood: "Dutse GRA",
    address: "10 Government House Road, Dutse",
    description: "Scenic resort built against Dutse's famous rocky hills. Provides tranquil atmosphere, solar energy, swimming pool, and organic farm-to-table dining.",
    verification_status: "verified",
    verification_tier: "tier_3_certified",
    is_published: true,
    starting_price_kobo: 3900000,
    starting_price_formatted: "₦39,000",
    rating: 4.87,
    review_count: 36,
    images: [
      "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=1200&q=80"
    ],
    amenities: ["24/7 Power", "Constant Water", "Air Conditioning", "WiFi", "Swimming Pool", "Rock Vistas"],
    host: { name: "Alhaji Ibrahim Bello", role: "Verified Host", joined: "2024", response_rate: "99%" },
    rooms: [
      { id: 1121, name: "Rockview Executive Chalet", price_kobo: 3900000, price_formatted: "₦39,000", max_occupancy: 2, bed_type: "King Bed" }
    ]
  },
  {
    id: 113,
    name: "Birnin Kebbi Waterfront Suites",
    slug: "birnin-kebbi-waterfront-suites-kebbi",
    property_type: "hotel",
    category: "Luxury Hotels",
    city: "Birnin Kebbi",
    state: "Kebbi",
    neighborhood: "GRA Birnin Kebbi",
    address: "5 Emir Haruna Road, GRA, Birnin Kebbi",
    description: "Modern business hotel close to Argungu road. Fully air-conditioned with inverter backup, fitness center, solar water heaters, and complimentary airport shuttle.",
    verification_status: "location_verified",
    verification_tier: "tier_2_location",
    is_published: true,
    starting_price_kobo: 3100000,
    starting_price_formatted: "₦31,000",
    rating: 4.81,
    review_count: 24,
    images: [
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80"
    ],
    amenities: ["24/7 Power", "Constant Water", "Air Conditioning", "WiFi", "Gym", "Airport Shuttle"],
    host: { name: "Alhaji Ibrahim Bello", role: "Verified Host", joined: "2024", response_rate: "99%" },
    rooms: [
      { id: 1131, name: "Executive Riverview Room", price_kobo: 3100000, price_formatted: "₦31,000", max_occupancy: 2, bed_type: "King Bed" }
    ]
  },
  {
    id: 114,
    name: "Lafia Crescent Executive Lodge",
    slug: "lafia-crescent-executive-lodge-nasarawa",
    property_type: "lodge",
    category: "Guest Houses",
    city: "Lafia",
    state: "Nasarawa",
    neighborhood: "Lafia GRA",
    address: "14 Jos Road, GRA, Lafia",
    description: "Peaceful executive lodge ideal for government consultants and state visitors. Offers solar power backup, hot showers, and quiet garden atmosphere.",
    verification_status: "documents_verified",
    verification_tier: "tier_1_docs",
    is_published: true,
    starting_price_kobo: 2600000,
    starting_price_formatted: "₦26,000",
    rating: 4.74,
    review_count: 19,
    images: [
      "https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=1200&q=80"
    ],
    amenities: ["24/7 Power", "Constant Water", "Air Conditioning", "WiFi", "Garden Lawn", "Free Breakfast"],
    host: { name: "Alhaji Ibrahim Bello", role: "Verified Host", joined: "2024", response_rate: "99%" },
    rooms: [
      { id: 1141, name: "Garden Executive Room", price_kobo: 2600000, price_formatted: "₦26,000", max_occupancy: 2, bed_type: "Double Bed" }
    ]
  },
  {
    id: 115,
    name: "Minna Imperial Transit Hotel",
    slug: "minna-imperial-transit-hotel-niger",
    property_type: "hotel",
    category: "Luxury Hotels",
    city: "Minna",
    state: "Niger",
    neighborhood: "Minna GRA",
    address: "9 Shiroro Hotel Road, GRA, Minna",
    description: "Minna's reliable transit hotel with 24/7 power, Olympic swimming pool, international conference halls, and 24-hour room service.",
    verification_status: "verified",
    verification_tier: "tier_3_certified",
    is_published: true,
    starting_price_kobo: 3500000,
    starting_price_formatted: "₦35,000",
    rating: 4.86,
    review_count: 40,
    images: [
      "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80"
    ],
    amenities: ["24/7 Power", "Constant Water", "Air Conditioning", "WiFi", "Swimming Pool", "Conference Rooms"],
    host: { name: "Alhaji Ibrahim Bello", role: "Verified Host", joined: "2024", response_rate: "99%" },
    rooms: [
      { id: 1151, name: "Imperial Executive Room", price_kobo: 3500000, price_formatted: "₦35,000", max_occupancy: 2, bed_type: "King Bed" }
    ]
  },
  {
    id: 116,
    name: "Mambilla Highland Eco Resort",
    slug: "mambilla-highland-eco-resort-taraba",
    property_type: "resort",
    category: "Resorts & Nature",
    city: "Gembu",
    state: "Taraba",
    neighborhood: "Mambilla Plateau",
    address: "Tea Estate Road, Gembu, Mambilla Plateau",
    description: "Located high up on the Mambilla Plateau, offering cool spring climate, rolling green tea plantation views, fireplace chalets, and guided mountain hiking.",
    verification_status: "verified",
    verification_tier: "tier_3_certified",
    is_published: true,
    starting_price_kobo: 4800000,
    starting_price_formatted: "₦48,000",
    rating: 4.94,
    review_count: 58,
    images: [
      "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?auto=format&fit=crop&w=1200&q=80"
    ],
    amenities: ["24/7 Power", "Constant Water", "Fireplace", "WiFi", "Highland View", "Guided Tours"],
    host: { name: "Alhaji Ibrahim Bello", role: "Verified Host", joined: "2024", response_rate: "99%" },
    rooms: [
      { id: 1161, name: "Highland Tea Chalet", price_kobo: 4800000, price_formatted: "₦48,000", max_occupancy: 2, bed_type: "King Bed" }
    ]
  },
  {
    id: 117,
    name: "Jalingo Horizon Business Suites",
    slug: "jalingo-horizon-business-suites-taraba",
    property_type: "hotel",
    category: "Corporate & NGO Hubs",
    city: "Jalingo",
    state: "Taraba",
    neighborhood: "Jalingo GRA",
    address: "22 Hammaruwa Way, GRA, Jalingo",
    description: "Modern corporate hotel in Jalingo featuring solar backup electricity, high-speed WiFi, conference hall, and restaurant.",
    verification_status: "location_verified",
    verification_tier: "tier_2_location",
    is_published: true,
    starting_price_kobo: 2900000,
    starting_price_formatted: "₦29,000",
    rating: 4.78,
    review_count: 27,
    images: [
      "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=1200&q=80"
    ],
    amenities: ["24/7 Power", "Constant Water", "Air Conditioning", "WiFi", "Conference Rooms", "Restaurant"],
    host: { name: "Alhaji Ibrahim Bello", role: "Verified Host", joined: "2024", response_rate: "99%" },
    rooms: [
      { id: 1171, name: "Business Deluxe Room", price_kobo: 2900000, price_formatted: "₦29,000", max_occupancy: 2, bed_type: "Queen Bed" }
    ]
  },
  {
    id: 118,
    name: "Damaturu Heritage Guest House",
    slug: "damaturu-heritage-guest-house-yobe",
    property_type: "lodge",
    category: "Guest Houses",
    city: "Damaturu",
    state: "Yobe",
    neighborhood: "Damaturu Central",
    address: "7 Maiduguri Road, Damaturu",
    description: "Gated guest house with 24-hour security guards, solar power inverter system, clean rooms, and prompt service for NGO personnel.",
    verification_status: "documents_verified",
    verification_tier: "tier_1_docs",
    is_published: true,
    starting_price_kobo: 2400000,
    starting_price_formatted: "₦24,000",
    rating: 4.71,
    review_count: 15,
    images: [
      "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1200&q=80"
    ],
    amenities: ["24/7 Power", "Constant Water", "Air Conditioning", "WiFi", "Security Guard", "Free Breakfast"],
    host: { name: "Alhaji Ibrahim Bello", role: "Verified Host", joined: "2024", response_rate: "99%" },
    rooms: [
      { id: 1181, name: "Standard Guest Room", price_kobo: 2400000, price_formatted: "₦24,000", max_occupancy: 2, bed_type: "Double Bed" }
    ]
  },
  {
    id: 119,
    name: "Maiduguri Executive Sanctuary Lodge",
    slug: "maiduguri-executive-sanctuary-lodge-borno",
    property_type: "lodge",
    category: "Corporate & NGO Hubs",
    city: "Maiduguri",
    state: "Borno",
    neighborhood: "Maiduguri GRA",
    address: "3 Shehu Laminu Way, GRA, Maiduguri",
    description: "Fortified NGO-standard accommodation facility in Maiduguri GRA with solar energy grid, satellite internet, armed guards, and private dining.",
    verification_status: "verified",
    verification_tier: "tier_3_certified",
    is_published: true,
    starting_price_kobo: 4500000,
    starting_price_formatted: "₦45,000",
    rating: 4.91,
    review_count: 49,
    images: [
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80"
    ],
    amenities: ["24/7 Power", "Constant Water", "Air Conditioning", "Satellite WiFi", "Armed Security", "Dining Hall"],
    host: { name: "Alhaji Ibrahim Bello", role: "Verified Host", joined: "2024", response_rate: "99%" },
    rooms: [
      { id: 1191, name: "NGO Executive Suite", price_kobo: 4500000, price_formatted: "₦45,000", max_occupancy: 2, bed_type: "King Bed" }
    ]
  },
  {
    id: 120,
    name: "Suleja Gateway Business Apartments",
    slug: "suleja-gateway-business-apartments-niger",
    property_type: "serviced_apartment",
    category: "Serviced Apartments",
    city: "Suleja",
    state: "Niger",
    neighborhood: "Suleja Gateway Area",
    address: "11 Abuja-Kaduna Road, Suleja",
    description: "Conveniently situated on the border of FCT Abuja. 2-bedroom executive serviced apartment with smart TV, inverter power, and high-speed internet.",
    verification_status: "location_verified",
    verification_tier: "tier_2_location",
    is_published: true,
    starting_price_kobo: 3400000,
    starting_price_formatted: "₦34,000",
    rating: 4.83,
    review_count: 33,
    images: [
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80"
    ],
    amenities: ["24/7 Power", "Constant Water", "Air Conditioning", "WiFi", "CCTV Security", "Kitchenette"],
    host: { name: "Alhaji Ibrahim Bello", role: "Verified Host", joined: "2024", response_rate: "99%" },
    rooms: [
      { id: 1201, name: "2-Bedroom Gateway Suite", price_kobo: 3400000, price_formatted: "₦34,000", max_occupancy: 4, bed_type: "2 Queen Beds" }
    ]
  },
  {
    id: 121,
    name: "Ningi Rockside Eco Retreat",
    slug: "ningi-rockside-eco-retreat-bauchi",
    property_type: "resort",
    category: "Resorts & Nature",
    city: "Ningi",
    state: "Bauchi",
    neighborhood: "Ningi Hills Area",
    address: "Plot 3 Rockside Drive, Ningi",
    description: "Tranquil eco-lodge nestled near Ningi rock formations. Features solar powered chalets, traditional barbecue grill pits, and hiking trails.",
    verification_status: "verified",
    verification_tier: "tier_3_certified",
    is_published: true,
    starting_price_kobo: 3300000,
    starting_price_formatted: "₦33,000",
    rating: 4.84,
    review_count: 26,
    images: [
      "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=1200&q=80"
    ],
    amenities: ["24/7 Power", "Constant Water", "Air Conditioning", "WiFi", "Barbecue Grill", "Hiking Trails"],
    host: { name: "Alhaji Ibrahim Bello", role: "Verified Host", joined: "2024", response_rate: "99%" },
    rooms: [
      { id: 1211, name: "Eco Rock Chalet", price_kobo: 3300000, price_formatted: "₦33,000", max_occupancy: 2, bed_type: "Queen Bed" }
    ]
  },
  {
    id: 122,
    name: "Bukuru Hillside View Villa",
    slug: "bukuru-hillside-view-villa-plateau",
    property_type: "boutique",
    category: "Boutique Stays",
    city: "Bukuru",
    state: "Plateau",
    neighborhood: "Bukuru GRA",
    address: "6 Hillside Close, Bukuru, Jos South",
    description: "Charming 4-room boutique villa in Bukuru with crisp mountain air, fireplace lounge, outdoor patio, and organic breakfast.",
    verification_status: "verified",
    verification_tier: "tier_3_certified",
    is_published: true,
    starting_price_kobo: 3700000,
    starting_price_formatted: "₦37,000",
    rating: 4.89,
    review_count: 38,
    images: [
      "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=1200&q=80"
    ],
    amenities: ["24/7 Power", "Constant Water", "Fireplace", "WiFi", "Mountain View", "Outdoor Patio"],
    host: { name: "Alhaji Ibrahim Bello", role: "Verified Host", joined: "2024", response_rate: "99%" },
    rooms: [
      { id: 1221, name: "Hillside Boutique Suite", price_kobo: 3700000, price_formatted: "₦37,000", max_occupancy: 2, bed_type: "King Bed" }
    ]
  },
  {
    id: 123,
    name: "Karu Capital Border Suites",
    slug: "karu-capital-border-suites-nasarawa",
    property_type: "serviced_apartment",
    category: "Serviced Apartments",
    city: "Karu",
    state: "Nasarawa",
    neighborhood: "Karu Expressway Area",
    address: "15 Abuja-Nyanya Expressway, Karu",
    description: "Serviced luxury apartments right at the border of Abuja FCT. Perfect for business trips to Nyanya, Mararaba, and Central Abuja.",
    verification_status: "location_verified",
    verification_tier: "tier_2_location",
    is_published: true,
    starting_price_kobo: 2900000,
    starting_price_formatted: "₦29,000",
    rating: 4.77,
    review_count: 21,
    images: [
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80"
    ],
    amenities: ["24/7 Power", "Constant Water", "Air Conditioning", "WiFi", "Kitchenette", "CCTV Security"],
    host: { name: "Alhaji Ibrahim Bello", role: "Verified Host", joined: "2024", response_rate: "99%" },
    rooms: [
      { id: 1231, name: "1-Bedroom Border Suite", price_kobo: 2900000, price_formatted: "₦29,000", max_occupancy: 2, bed_type: "Queen Bed" }
    ]
  },
  {
    id: 124,
    name: "Katsina Kofar Kaura Executive Hotel",
    slug: "katsina-kofar-kaura-executive-hotel-katsina",
    property_type: "hotel",
    category: "Luxury Hotels",
    city: "Katsina",
    state: "Katsina",
    neighborhood: "Kofar Kaura Area",
    address: "25 Dutsin-Ma Road, Kofar Kaura, Katsina",
    description: "Modern multi-story hotel offering plush guest suites, banquet hall, solar water heating, and 24-hour security.",
    verification_status: "location_verified",
    verification_tier: "tier_2_location",
    is_published: true,
    starting_price_kobo: 3100000,
    starting_price_formatted: "₦31,000",
    rating: 4.80,
    review_count: 28,
    images: [
      "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80"
    ],
    amenities: ["24/7 Power", "Constant Water", "Air Conditioning", "WiFi", "Banquet Hall", "Restaurant"],
    host: { name: "Alhaji Ibrahim Bello", role: "Verified Host", joined: "2024", response_rate: "99%" },
    rooms: [
      { id: 1241, name: "Kaura Executive Room", price_kobo: 3100000, price_formatted: "₦31,000", max_occupancy: 2, bed_type: "King Bed" }
    ]
  },
  {
    id: 125,
    name: "Yola Riverfront Safari Resort",
    slug: "yola-riverfront-safari-resort-adamawa",
    property_type: "resort",
    category: "Safari & Nature",
    city: "Yola",
    state: "Adamawa",
    neighborhood: "Benue River Bank",
    address: "Plot 8 Riverfront Drive, Yola Town",
    description: "Stunning eco-resort overlooking the Benue River. Features boat rides, fresh fish dining, air-conditioned riverfront bungalows, and solar energy.",
    verification_status: "verified",
    verification_tier: "tier_3_certified",
    is_published: true,
    starting_price_kobo: 4100000,
    starting_price_formatted: "₦41,000",
    rating: 4.90,
    review_count: 43,
    images: [
      "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=1200&q=80"
    ],
    amenities: ["24/7 Power", "Constant Water", "Air Conditioning", "WiFi", "River View", "Boat Rides", "Seafood Grill"],
    host: { name: "Alhaji Ibrahim Bello", role: "Verified Host", joined: "2024", response_rate: "99%" },
    rooms: [
      { id: 1251, name: "Riverfront Eco Bungalow", price_kobo: 4100000, price_formatted: "₦41,000", max_occupancy: 2, bed_type: "King Bed" }
    ]
  },
  {
    id: 126,
    name: "Sharada Industrial Business Suites",
    slug: "sharada-industrial-business-suites-kano",
    property_type: "serviced_apartment",
    category: "Corporate & NGO Hubs",
    city: "Kano",
    state: "Kano",
    neighborhood: "Sharada Industrial Estate",
    address: "30 Sharada Phase 2, Kano",
    description: "Serviced corporate apartments for industrial executives and technical experts visiting Kano Sharada industrial zone.",
    verification_status: "documents_verified",
    verification_tier: "tier_1_docs",
    is_published: true,
    starting_price_kobo: 3000000,
    starting_price_formatted: "₦30,000",
    rating: 4.75,
    review_count: 20,
    images: [
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80"
    ],
    amenities: ["24/7 Power", "Constant Water", "Air Conditioning", "WiFi", "Work Desk", "Secure Parking"],
    host: { name: "Alhaji Ibrahim Bello", role: "Verified Host", joined: "2024", response_rate: "99%" },
    rooms: [
      { id: 1261, name: "Industrial Executive Flat", price_kobo: 3000000, price_formatted: "₦30,000", max_occupancy: 2, bed_type: "Queen Bed" }
    ]
  }
];

export const MOCK_PROPERTIES = RAW_MOCK_PROPERTIES.map(p => ({
  ...p,
  host_id: p.host_id || 3,
  host: {
    ...p.host,
    id: p.host?.id || 3,
    business_name: p.host?.business_name || 'Arewa Luxury Suites & Apartments Ltd'
  }
}));

export const MOCK_CATEGORIES = [
  { id: 'all', name: 'All Stays', icon: 'Building2' },
  { id: 'verified', name: 'FindDestination Verified', icon: 'ShieldCheck' },
  { id: 'hotel', name: 'Hotels', icon: 'Hotel' },
  { id: 'serviced_apartment', name: 'Serviced Apartments', icon: 'Home' },
  { id: 'lodge', name: 'Guest Houses & Lodges', icon: 'Key' },
  { id: 'resort', name: 'Resorts & Nature', icon: 'Trees' },
  { id: 'boutique', name: 'Boutique Stays', icon: 'Sparkles' },
];
