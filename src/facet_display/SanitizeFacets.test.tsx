import { Facets } from "./types"
import { sanitizeFacets } from "./SanitizeFacets"
import { LEVELS, DEPARTMENTS } from "../constants"

describe("sanitizeFacets", () => {
  const FACET_OPTIONS: Facets = {
    topic:         ["Academic Writing", "Accounting", "Aerodynamics"],
    resource_type: ["course", "program"],
    department:    Object.keys(DEPARTMENTS),
    level:         Object.keys(LEVELS)
  }

  test("it should remove unknown values", async () => {
    const activeFacets: Facets = {
      topic:      ["Academic Writing", "Bread"],
      department: ["1", "Pasta"],
      level:      ["graduate", "cake"]
    }

    const expected: Facets = {
      topic:      ["Academic Writing"],
      department: ["1"],
      level:      ["graduate"]
    }
    sanitizeFacets(activeFacets, FACET_OPTIONS)

    expect(activeFacets).toEqual(expected)
  })

  test("it should convert level and department names to codes", async () => {
    const activeFacets: Facets = {
      topic:      [],
      department: ["Literature"],
      level:      ["Non-Credit"]
    }

    const expected: Facets = {
      topic:      [],
      department: ["21L"],
      level:      ["noncredit"]
    }
    sanitizeFacets(activeFacets, FACET_OPTIONS)

    expect(activeFacets).toEqual(expected)
  })
})
