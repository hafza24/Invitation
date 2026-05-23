export const siteConfig = {
  wedding: {
    bride: "Bushra",
    groom: "Musa",
    tagline: "A Celebration of Love",
    date: "2026-08-14T18:00:00",
    dateLabel: "August 14, 2026",
    story:
      "Two hearts. One story. Written long before they ever met — and being celebrated together at last.",
  },
  family: {
    brideFather: "[Bride's Father]",
    brideMother: "[Bride's Mother]",
    groomFather: "[Groom's Father]",
    groomMother: "[Groom's Mother]",
    blessing:
      "With the blessings of our families, we invite you to share in the joy of our union.",
  },
  events: [
    {
      id: "mehndi",
      name: "Mehndi",
      date: "August 12, 2026",
      day: "Wednesday",
      time: "7:00 PM onwards",
      venue: "[Venue Name]",
      address: "[Venue Address, City]",
      mapsUrl: "https://maps.google.com",
      description:
        "An evening of henna, music, and color. Marigolds, dhol, and dance to begin our story.",
      theme: "Marigold, mehndi green, & sunshine yellow",
      activities: ["Henna Ceremony", "Dholki", "Family Dance"],
    },
    {
      id: "barat",
      name: "Barat",
      date: "August 14, 2026",
      day: "Friday",
      time: "6:00 PM onwards",
      venue: "[Venue Name]",
      address: "[Venue Address, City]",
      mapsUrl: "https://maps.google.com",
      description:
        "A royal night of vows, of two families becoming one, under chandeliers and gold.",
      theme: "Crimson, black, & royal gold",
      activities: ["Nikah", "Joota Chupai", "Doodh Pilai", "Bhangra Entry"],
    },
    {
      id: "walima",
      name: "Walima",
      date: "August 16, 2026",
      day: "Sunday",
      time: "7:00 PM onwards",
      venue: "[Venue Name]",
      address: "[Venue Address, City]",
      mapsUrl: "https://maps.google.com",
      description:
        "A reception of quiet elegance — ivory, candlelight, and the first dinner as one.",
      theme: "Ivory, silver, & champagne",
      activities: ["Reception", "Dinner", "Couple's First Dance"],
    },
  ],
  contacts: [
    { label: "Bride's Side", name: "[Name]", phone: "+92 300 0000000", whatsapp: "+92 300 0000000" },
    { label: "Groom's Side", name: "[Name]", phone: "+92 300 0000000", whatsapp: "+92 300 0000000" },
  ],
} as const;

export type SiteConfig = typeof siteConfig;
