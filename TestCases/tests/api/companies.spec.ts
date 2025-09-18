import { test, expect } from "@playwright/test";

test.describe("Companies API", () => {
  // 1. GET /api/companies/count
  test.describe("GET /api/companies/count", () => {
    test("should return total number of companies with no filters", async ({ request }) => {
      const res = await request.get("/api/companies/count");
      expect(res.ok()).toBeTruthy();
      const body = await res.json();
      expect(body.total).toBe(19); // dataset has 19
    });

    test("should return smaller number when filtered by name", async ({ request }) => {
      const res = await request.get("/api/companies/count?name=Microsoft");
      const body = await res.json();
      expect(body.total).toBe(1);
    });

    test("should return 0 when filtering by non-existing company", async ({ request }) => {
      const res = await request.get("/api/companies/count?name=NonExistentCorp");
      const body = await res.json();
      expect(body.total).toBe(0);
    });
  });

  // 2. GET /api/companies/top-paid
  test.describe("GET /api/companies/top-paid", () => {
    test("should return max 5 by default", async ({ request }) => {
      const res = await request.get("/api/companies/top-paid");
      const companies = await res.json();
      expect(companies.length).toBeLessThanOrEqual(5);
    });

    test("should return list sorted by base salary descending", async ({ request }) => {
      const res = await request.get("/api/companies/top-paid");
      const companies = await res.json();
      const bases = companies.map((c: any) => c.salaryBand.base);
      expect(bases).toEqual([...bases].sort((a, b) => b - a));
    });

    test("should respect limit query param", async ({ request }) => {
      const res = await request.get("/api/companies/top-paid?limit=10");
      const companies = await res.json();
      expect(companies.length).toBeLessThanOrEqual(10);
    });
  });

  // 3. GET /api/companies/by-skill/:skill
  test.describe("GET /api/companies/by-skill/:skill", () => {
    test("should return companies that include the skill", async ({ request }) => {
      const res = await request.get("/api/companies/by-skill/DSA");
      const companies = await res.json();
      expect(companies.length).toBeGreaterThan(0);
      companies.forEach((c: any) => {
        expect(c.hiringCriteria.skills.map((s: string) => s.toLowerCase())).toContain("dsa");
      });
    });

    test("should work case-insensitively", async ({ request }) => {
      const res1 = await request.get("/api/companies/by-skill/DSA");
      const res2 = await request.get("/api/companies/by-skill/dsa");
      expect(await res1.json()).toEqual(await res2.json());
    });

    test("should return empty array for non-existing skill", async ({ request }) => {
      const res = await request.get("/api/companies/by-skill/QuantumAI");
      const companies = await res.json();
      expect(companies).toEqual([]);
    });
  });

  // 4. GET /api/companies/by-location/:location
  test.describe("GET /api/companies/by-location/:location", () => {
    test("should return companies matching location", async ({ request }) => {
      const res = await request.get("/api/companies/by-location/Hyderabad");
      const companies = await res.json();
      companies.forEach((c: any) => {
        expect(c.location.toLowerCase()).toBe("hyderabad");
      });
    });

    test("should work case-insensitively", async ({ request }) => {
      const res1 = await request.get("/api/companies/by-location/Hyderabad");
      const res2 = await request.get("/api/companies/by-location/hyderabad");
      expect(await res1.json()).toEqual(await res2.json());
    });

    test("should return empty array for non-existing location", async ({ request }) => {
      const res = await request.get("/api/companies/by-location/Mars");
      const companies = await res.json();
      expect(companies).toEqual([]);
    });
  });

  // 5. GET /api/companies/headcount-range
  test.describe("GET /api/companies/headcount-range", () => {
    test("should return companies with headcount >= min when only min is provided", async ({ request }) => {
      const res = await request.get("/api/companies/headcount-range?min=5000");
      const companies = await res.json();
      companies.forEach((c: any) => {
        expect(c.headcount).toBeGreaterThanOrEqual(5000);
      });
    });

    test("should return companies with headcount between min and max", async ({ request }) => {
      const res = await request.get("/api/companies/headcount-range?min=1000&max=3000");
      const companies = await res.json();
      companies.forEach((c: any) => {
        expect(c.headcount).toBeGreaterThanOrEqual(1000);
        expect(c.headcount).toBeLessThanOrEqual(3000);
      });
    });

    test("should handle invalid input gracefully", async ({ request }) => {
      const res = await request.get("/api/companies/headcount-range?min=abc");
      expect(res.status()).toBe(400); // if you implement error handling
    });
  });

  // 6. GET /api/companies/benefit/:benefit
  test.describe("GET /api/companies/benefit/:benefit", () => {
    test("should return companies that list the given benefit", async ({ request }) => {
      const res = await request.get("/api/companies/benefit/Health Insurance");
      const companies = await res.json();
      companies.forEach((c: any) => {
        const benefits = c.benefits.map((b: string) => b.toLowerCase());
        expect(benefits).toContain("health insurance".toLowerCase());
      });
    });

    test("should work with partial match", async ({ request }) => {
      const res = await request.get("/api/companies/benefit/Insurance");
      const companies = await res.json();
      companies.forEach((c: any) => {
        const joined = c.benefits.join(" ").toLowerCase();
        expect(joined).toContain("insurance".toLowerCase());
      });
    });

    test("should work case-insensitively", async ({ request }) => {
      const res1 = await request.get("/api/companies/benefit/insurance");
      const res2 = await request.get("/api/companies/benefit/INSURANCE");
      expect(await res1.json()).toEqual(await res2.json());
    });

    test("should return empty array if no company offers the benefit", async ({ request }) => {
      const res = await request.get("/api/companies/benefit/Flying Cars");
      const companies = await res.json();
      expect(companies).toEqual([]);
    });
  });
});
