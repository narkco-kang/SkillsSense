/**
 * SkillsSense 測試配置
 */

export const testConfig = {
  // 測試環境
  testEnvironment: "node",
  
  // 測試模式
  testMatch: [
    "**/__tests__/**/*.test.ts",
    "**/*.test.ts",
  ],
  
  // 收集覆蓋率
  collectCoverageFrom: [
    "src/lib/**/*.ts",
    "!src/**/*.d.ts",
  ],
  
  // 覆蓋率門檻
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};

export default testConfig;
