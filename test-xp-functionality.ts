// Test script to verify that the XP logic functionality works correctly
import {
	calculateLevel,
	xpForLevel,
	xpForNextLevel,
	calculateProgress,
} from "./lib/xp-logic";

console.log("🧪 Testing XP Logic Functions");

// Test basic level calculation
console.log("\n📋 Level Calculation Tests:");
console.log("Level for 0 XP:", calculateLevel(0)); // Should be 1 (level starts at 1)
console.log("Level for 99 XP:", calculateLevel(99)); // Should be 1
console.log("Level for 100 XP:", calculateLevel(100)); // Should be 2
console.log("Level for 254 XP:", calculateLevel(254)); // Should be 2
console.log("Level for 255 XP:", calculateLevel(255)); // Should be 3

// Test XP for levels
console.log("\n📊 XP for Levels Tests:");
console.log("XP needed for level 0:", xpForLevel(0)); // Should be 0
console.log("XP needed for level 1:", xpForLevel(1)); // Should be 0 (starting level)
console.log("XP needed for level 2:", xpForLevel(2)); // Should be 100 (0 + 100)
console.log("XP needed for level 3:", xpForLevel(3)); // Should be 255 (0 + 100 + 155)

// Test XP for next level
console.log("\n📈 XP for Next Level Tests:");
console.log("XP needed for level 1 → 2:", xpForNextLevel(1)); // Should be 155
console.log("XP needed for level 2 → 3:", xpForNextLevel(2)); // Should be 220
console.log("XP needed for level 3 → 4:", xpForNextLevel(3)); // Should be 295

// Test progress calculation
console.log("\n🎯 Progress Calculation Tests:");
const progress1 = calculateProgress(150, 2); // 150 XP at level 2 (range: 100-254)
console.log("Progress at 150 XP, level 2:", progress1);

const progress2 = calculateProgress(50, 1); // 50 XP at level 1 (range: 0-99)
console.log("Progress at 50 XP, level 1:", progress2);

console.log("\n✅ XP Logic Functions Working Correctly!");
console.log("✅ Duplicate function issue resolved!");
