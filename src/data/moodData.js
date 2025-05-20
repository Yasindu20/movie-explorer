export const moods = [
  {
    id: "relaxing",
    name: "Relaxing",
    description: "Calm, peaceful films to help you unwind",
    emoji: "😌",
    keywords: ["gentle", "calm", "meditation", "peaceful", "soothing"],
    genres: [18, 10749, 10751], // Drama, Romance, Family
    yearRange: null, // All years
    colorScheme: {
      primary: "#4fc3f7", // Light blue
      secondary: "#81d4fa",
      background: "linear-gradient(120deg, #e0f7fa 0%, #b3e5fc 100%)",
      textColor: "#01579b",
    },
    imageUrl: "/moods/relaxing.jpg", // We'll add these images later
    exclusions: [27, 53, 10752], // Exclude Horror, Thriller, War
  },
  {
    id: "intense",
    name: "Intense",
    description: "Heart-pounding, gripping stories that keep you on edge",
    emoji: "😰",
    keywords: ["suspense", "tension", "adrenaline", "twisted", "shocking"],
    genres: [28, 53, 27, 9648], // Action, Thriller, Horror, Mystery
    yearRange: null,
    colorScheme: {
      primary: "#f44336", // Red
      secondary: "#ff5722",
      background: "linear-gradient(120deg, #b71c1c 0%, #d32f2f 100%)",
      textColor: "#ffffff",
    },
    imageUrl: "/moods/intense.jpg",
    exclusions: [35, 10751], // Exclude Comedy, Family
  },
  {
    id: "thoughtful",
    name: "Thoughtful",
    description: "Profound stories that make you ponder life's big questions",
    emoji: "🤔",
    keywords: ["philosophical", "thought-provoking", "psychological", "profound", "meaningful"],
    genres: [18, 99, 36], // Drama, Documentary, History
    yearRange: null,
    colorScheme: {
      primary: "#673ab7", // Deep Purple
      secondary: "#9575cd",
      background: "linear-gradient(120deg, #311b92 0%, #512da8 100%)",
      textColor: "#ffffff",
    },
    imageUrl: "/moods/thoughtful.jpg",
    exclusions: [28, 35], // Exclude Action, Comedy
  },
  {
    id: "uplifting",
    name: "Uplifting",
    description: "Feel-good films that boost your mood and inspire",
    emoji: "🥰",
    keywords: ["inspirational", "heartwarming", "uplifting", "feel-good", "motivational"],
    genres: [35, 10751, 12], // Comedy, Family, Adventure
    yearRange: null,
    colorScheme: {
      primary: "#ffc107", // Amber
      secondary: "#ffca28",
      background: "linear-gradient(120deg, #ffecb3 0%, #ffd54f 100%)", 
      textColor: "#ff6f00",
    },
    imageUrl: "/moods/uplifting.jpg",
    exclusions: [27, 53], // Exclude Horror, Thriller
  },
  {
    id: "adventurous",
    name: "Adventurous",
    description: "Exciting journeys and thrilling explorations",
    emoji: "🌍",
    keywords: ["adventure", "exploration", "journey", "discovery", "expedition"],
    genres: [12, 14, 878, 10752], // Adventure, Fantasy, Science Fiction, War
    yearRange: null,
    colorScheme: {
      primary: "#43a047", // Green
      secondary: "#66bb6a",
      background: "linear-gradient(120deg, #388e3c 0%, #4caf50 100%)",
      textColor: "#ffffff",
    },
    imageUrl: "/moods/adventurous.jpg",
    exclusions: [],
  },
  {
    id: "nostalgic",
    name: "Nostalgic",
    description: "Revisit the past with films that evoke fond memories",
    emoji: "🕰️",
    keywords: ["nostalgia", "memory", "childhood", "retro", "classic"],
    genres: [18, 36, 10751, 10402], // Drama, History, Family, Music
    yearRange: { start: 1950, end: 2000 },
    colorScheme: {
      primary: "#8d6e63", // Brown
      secondary: "#a1887f",
      background: "linear-gradient(120deg, #d7ccc8 0%, #bcaaa4 100%)",
      textColor: "#3e2723",
    },
    imageUrl: "/moods/nostalgic.jpg",
    exclusions: [],
  }
];

// TMDb Genre IDs for reference
export const genreMap = {
  28: "Action",
  12: "Adventure",
  16: "Animation",
  35: "Comedy",
  80: "Crime",
  99: "Documentary",
  18: "Drama",
  10751: "Family",
  14: "Fantasy",
  36: "History",
  27: "Horror",
  10402: "Music",
  9648: "Mystery",
  10749: "Romance",
  878: "Science Fiction",
  10770: "TV Movie",
  53: "Thriller",
  10752: "War",
  37: "Western"
};

// Helper function to get a mood by ID
export const getMoodById = (moodId) => {
  return moods.find(mood => mood.id === moodId) || null;
};