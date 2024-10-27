const nextJest = require("next/jest");

const createJestConfig = nextJest({
	dir: "./",
});

/** @type {import('jest').Config} */
const config = {
	collectCoverage: true,
	coverageDirectory: "coverage",
	coverageProvider: "v8",
	setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
	testEnvironment: "jest-environment-jsdom",
	moduleNameMapper: {
		"^@/(.*)$": "<rootDir>/src/$1", // Adjust according to your folder structure
	},
};

module.exports = createJestConfig(config);
