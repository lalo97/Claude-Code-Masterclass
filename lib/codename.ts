const adjectives = [
  "Silent",
  "Crimson",
  "Shadow",
  "Iron",
  "Swift",
  "Frozen",
  "Hollow",
  "Scarlet",
  "Blazing",
  "Phantom",
  "Twisted",
  "Cunning",
  "Venomous",
  "Obsidian",
  "Rogue",
  "Gilded",
  "Savage",
  "Wicked",
  "Neon",
  "Ghost",
];

const descriptors = [
  "Storm",
  "Blade",
  "Claw",
  "Tide",
  "Void",
  "Fang",
  "Drift",
  "Forge",
  "Peak",
  "Veil",
  "Coil",
  "Rift",
  "Smoke",
  "Crest",
  "Ember",
  "Gale",
  "Spark",
  "Frost",
  "Shroud",
  "Dusk",
];

const nouns = [
  "Fox",
  "Wolf",
  "Hawk",
  "Viper",
  "Bear",
  "Raven",
  "Lynx",
  "Cobra",
  "Puma",
  "Falcon",
  "Jaguar",
  "Otter",
  "Crane",
  "Badger",
  "Mink",
  "Heron",
  "Bison",
  "Drake",
  "Hyena",
  "Wren",
];

function pick(arr: string[]): string {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function generateCodename(): string {
  return pick(adjectives) + pick(descriptors) + pick(nouns);
}
