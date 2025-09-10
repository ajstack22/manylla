// Smart placeholder text for different categories and contexts

export const categoryPlaceholders = {
  goals: {
    title: "What skill are we working on?",
    description: "Describe the goal, timeline, and how we'll measure success",
    examples: [
      "Use 3-word sentences by June",
      "Independently dress for school",
      "Complete homework without prompts",
    ],
  },
  successes: {
    title: "What achievement are we celebrating?",
    description: "Describe what happened, when, and why it's significant",
    examples: [
      "First full day without meltdowns",
      "Read entire book independently",
      "Made a new friend at recess",
    ],
  },
  strengths: {
    title: "What is your child great at?",
    description: "Describe the strength and how it helps them",
    examples: [
      "Visual learning - remembers picture schedules",
      "Kind and empathetic with younger children",
      "Excellent memory for facts and dates",
    ],
  },
  challenges: {
    title: "What situation is difficult?",
    description: "Describe the trigger, response, and helpful strategies",
    examples: [
      "Loud noises → covers ears → offer noise-canceling headphones",
      "Transitions → anxiety → use 5-minute warnings",
      "Crowded spaces → overwhelm → find quiet area",
    ],
  },
  "medical-history": {
    title: "Diagnosis, treatment, or medical event",
    description: "Include date, provider, and key details",
    examples: [
      "Autism diagnosis - Dr. Smith, Children's Hospital",
      "Started occupational therapy 2x weekly",
      "Medication adjustment - increased to 10mg",
    ],
  },
  "tips-tricks": {
    title: "What strategy works well?",
    description: "Describe the situation and the helpful approach",
    examples: [
      "Use visual timer for transitions",
      "Offer choices to prevent power struggles",
      "Deep pressure helps with calming",
    ],
  },
  therapies: {
    title: "Type of therapy and provider",
    description: "Include schedule, goals, and progress notes",
    examples: [
      "Speech therapy with Ms. Johnson - Tuesdays 3pm",
      "OT for fine motor skills - 2x weekly",
      "ABA therapy - home-based program",
    ],
  },
  education: {
    title: "School-related information",
    description: "Include IEP goals, accommodations, or important notes",
    examples: [
      "IEP accommodation: extended time for tests",
      "Preferred seating near teacher",
      "Uses communication device in classroom",
    ],
  },
  behaviors: {
    title: "Behavior pattern or trigger",
    description: "Describe what happens before, during, and after",
    examples: [
      "Spinning when excited - self-regulation strategy",
      "Hits when frustrated - working on using words",
      "Elopes when overwhelmed - need secured exits",
    ],
  },
};

// Quick info specific placeholders
export const quickInfoPlaceholders = {
  communication: {
    title: "Communication",
    description: "How your child communicates and what support they need",
    examples: [
      "Uses 2-3 word phrases, understands more than can express",
      "Non-speaking, uses AAC device with picture symbols",
      "Speaks in full sentences but needs processing time",
    ],
  },
  sensory: {
    title: "Sensory Needs",
    description: "Sensitivities and sensory preferences",
    examples: [
      "Sensitive to loud noises, bright lights. Seeks deep pressure",
      "Avoids certain textures. Prefers smooth, soft materials",
      "Seeks movement - needs frequent breaks to jump or swing",
    ],
  },
  medical: {
    title: "Medical Information",
    description: "Current medications, allergies, and medical needs",
    examples: [
      "Allergies: peanuts (EpiPen in backpack)\nMedications: Ritalin 10mg morning",
      "No allergies. Takes melatonin 3mg at bedtime",
      "Seizure disorder - emergency medication if seizure > 5 min",
    ],
  },
  dietary: {
    title: "Dietary Needs",
    description: "Food restrictions, preferences, and feeding information",
    examples: [
      "Gluten-free diet. Prefers crunchy foods. No nuts",
      "Vegetarian. Will only eat foods that don't touch",
      "Texture sensitive - no mixed foods or sauces",
    ],
  },
  emergency: {
    title: "Emergency Contacts",
    description: "Primary contacts and important phone numbers",
    examples: [
      "Mom: (555) 555-0123\nDad: (555) 555-0124\nDr. Smith: (555) 555-0199",
      "Parent 1: (555) 123-4567\nSchool Nurse: (555) 234-5678",
      "Guardian: (555) 555-1111\nTherapist (crisis): (555) 555-2222",
    ],
  },
  behaviors: {
    title: "Behavioral Information",
    description: "Common behaviors and effective responses",
    examples: [
      "Flaps hands when happy - this is okay!\nBites when frustrated - redirect to chewy",
      "May elope - always supervise near exits\nCalms with deep pressure hugs",
      "Rocks when anxious - offer break space\nMay hit if overwhelmed - give space",
    ],
  },
  calming: {
    title: "Calming Strategies",
    description: "What helps during meltdowns or anxiety",
    examples: [
      "Quiet space, dim lights, weighted blanket, soft music",
      "Deep breaths, counting to 10, squeeze toy, walk outside",
      "Remove demands, offer water, no talking until calm",
    ],
  },
  routines: {
    title: "Important Routines",
    description: "Daily routines that should be maintained",
    examples: [
      "Morning: breakfast → Brush teeth → Get dressed (visual schedule on wall)",
      "Bedtime: bath at 7pm → Story → Lights out 8pm (no exceptions)",
      "After school: snack → 30min free time → Homework with timer",
    ],
  },
};

// Helper function to get placeholder for a category
export const getPlaceholder = (category, field) => {
  const config =
    categoryPlaceholders[category] || quickInfoPlaceholders[category];

  if (!config) {
    return field === "title" ? "Enter title..." : "Enter description...";
  }

  return config[field];
};

// Helper function to get random example
export const getRandomExample = (category) => {
  const config =
    categoryPlaceholders[category] || quickInfoPlaceholders[category];

  if (!config?.examples || config.examples.length === 0) {
    return undefined;
  }

  const randomIndex = Math.floor(Math.random() * config.examples.length);
  return config.examples[randomIndex];
};

// Helper function to format placeholder with example
export const getPlaceholderWithExample = (category, field) => {
  const placeholder = getPlaceholder(category, field);
  const example = getRandomExample(category);

  if (field === "title" && example) {
    return `${placeholder} (e.g., "${example}")`;
  }

  return placeholder;
};
