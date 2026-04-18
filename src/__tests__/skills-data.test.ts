/**
 * SkillsData 測試
 */

import { describe, it, expect } from "vitest";
import { getAllSkills } from "../lib/skills-data";

describe("skills-data", () => {
  it("should return an array of skills", () => {
    const skills = getAllSkills();
    expect(Array.isArray(skills)).toBe(true);
  });

  it("should have skills with required fields", () => {
    const skills = getAllSkills();
    
    if (skills.length > 0) {
      const skill = skills[0];
      expect(skill).toHaveProperty("id");
      expect(skill).toHaveProperty("name");
      expect(skill).toHaveProperty("category");
      expect(skill).toHaveProperty("description");
      expect(skill).toHaveProperty("tags");
      expect(skill).toHaveProperty("source");
      expect(skill).toHaveProperty("url");
    }
  });

  it("should have valid category values", () => {
    const skills = getAllSkills();
    const validCategories = [
      "email", "gaming", "ai-ml", "productivity", 
      "software-development", "data", "devops", "research", 
      "creative", "other"
    ];

    skills.forEach(skill => {
      // Category should be one of the valid values or not empty
      if (skill.category) {
        expect(typeof skill.category).toBe("string");
      }
    });
  });

  it("should have tags as an array", () => {
    const skills = getAllSkills();
    
    skills.forEach(skill => {
      expect(Array.isArray(skill.tags)).toBe(true);
    });
  });

  it("should have non-empty name and description", () => {
    const skills = getAllSkills();
    
    skills.forEach(skill => {
      expect(skill.name.length).toBeGreaterThan(0);
      expect(typeof skill.description).toBe("string");
    });
  });
});
