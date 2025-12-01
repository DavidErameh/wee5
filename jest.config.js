module.exports = {
	preset: "ts-jest",
	testEnvironment: "jsdom",
	moduleNameMapper: {
		"^@/(.*)$": "<rootDir>/$1",
	},
	transform: {
		"^.+.(ts|tsx)$": ["ts-jest", { tsconfig: "tsconfig.json" }],
	},
	transformIgnorePatterns: [
		"node_modules/(?!(jose|uncrypto|@upstash/redis|next)/)",
	],
};
