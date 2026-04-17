module.exports = {
  projects: [
    {
      displayName: "node",
      testEnvironment: "node",
      testMatch: ["<rootDir>/src/lib/**/*.test.ts", "<rootDir>/src/adapters/**/*.test.ts"],
      transform: {
        "^.+\\.(ts|tsx|js|jsx)$": ["ts-jest", { tsconfig: { jsx: "react", esModuleInterop: true } }],
      },
      moduleNameMapper: {
        "^@/(.*)$": "<rootDir>/src/$1",
      },
    },
    {
      displayName: "expo",
      preset: "jest-expo",
      transformIgnorePatterns: [
        "node_modules/(?!((jest-)?react-native|@react-native|expo(nent)?|expo-modules-core|expo-.*|@expo(nent)?/.*|@react-navigation/.*|@tanstack/.*|nativewind|react-native-css)/)",
      ],
      moduleNameMapper: {
        "^@/(.*)$": "<rootDir>/src/$1",
      },
      testMatch: [
        "<rootDir>/src/components/**/*.test.(ts|tsx)",
        "<rootDir>/src/app/**/*.test.(ts|tsx)",
        "<rootDir>/src/hooks/**/*.test.(ts|tsx)",
      ],
    },
  ],
};
