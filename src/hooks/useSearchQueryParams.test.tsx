/* eslint-disable prefer-template */
import React from "react"
import { renderHook, act } from "@testing-library/react-hooks/dom"
import useSearchQueryParams from "./useSearchQueryParams"
import type {
  UseSearchQueryParamsProps,
  UseSearchQueryParamsResult
} from "./useSearchQueryParams"
import type { Endpoint, SearchParams } from "./configs"

const setup = ({
  initial = "",
  props
}: {
  props?: Omit<UseSearchQueryParamsProps, "searchParams" | "setSearchParams">
  initial: string | URLSearchParams
}) => {
  const searchParamsRef: React.MutableRefObject<URLSearchParams> = {
    current: new URLSearchParams(initial)
  }
  const useTestHook = () => {
    /**
     * Usually these would be passed to `useSearchQueryParams` via a routing
     * library, e.g., React Router's `useSearchParams` hook.
     */
    const [searchParams, setSearchParams] = React.useState(
      searchParamsRef.current
    )
    searchParamsRef.current = searchParams
    return useSearchQueryParams({ searchParams, setSearchParams, ...props })
  }
  const result = renderHook(useTestHook)
  return {
    ...result,
    searchParams: searchParamsRef
  }
}

const assertParamsExtracted = (
  initial: string | URLSearchParams,
  expected: UseSearchQueryParamsResult["params"],
  props?: Omit<UseSearchQueryParamsProps, "searchParams" | "setSearchParams">
) => {
  const { result, searchParams } = setup({ initial, props })
  expect(result.current.params).toEqual(expected)
  // Search params not modified
  expect(searchParams.current).toEqual(new URLSearchParams(initial))
}

test("Extracts expected facets from the given URLSearchParams for endpoint=resources", () => {
  // resource type
  assertParamsExtracted("?r=course&r=podcast", {
    queryText:    "",
    activeFacets: { resource_type: ["course", "podcast"] },
    endpoint:     "resources"
  })
  // department
  assertParamsExtracted("?r=course&d=6&d=8", {
    queryText:    "",
    activeFacets: {
      resource_type: ["course"],
      department:    ["6", "8"]
    },
    endpoint: "resources"
  })
  // level
  assertParamsExtracted("?l=noncredit&r=program&l=high_school", {
    queryText:    "",
    activeFacets: {
      resource_type: ["program"],
      level:         ["noncredit", "high_school"]
    },
    endpoint: "resources"
  })

  // platform
  assertParamsExtracted("?l=noncredit&p=ocw&p=mitxonline", {
    queryText:    "",
    activeFacets: {
      platform: ["ocw", "mitxonline"],
      level:    ["noncredit"]
    },
    endpoint: "resources"
  })
  // offered by
  assertParamsExtracted("?l=graduate&o=bootcamps&o=xpro", {
    queryText:    "",
    activeFacets: {
      offered_by: ["bootcamps", "xpro"],
      level:      ["graduate"]
    },
    endpoint: "resources"
  })
  // topics
  assertParamsExtracted("?l=graduate&t=python&t=javascript", {
    queryText:    "",
    activeFacets: {
      topic: ["python", "javascript"],
      level: ["graduate"]
    },
    endpoint: "resources"
  })
})

test("Extracts boolean facet values correctly", () => {
  assertParamsExtracted("?l=graduate&c=true", {
    queryText:    "",
    activeFacets: {
      level:         ["graduate"],
      certification: true
    },
    endpoint: "resources"
  })

  assertParamsExtracted("?l=graduate&pr=true", {
    queryText:    "",
    activeFacets: {
      level:        ["graduate"],
      professional: true
    },
    endpoint: "resources"
  })
})

test("Ignores invalid facet values", () => {
  const initial = new URLSearchParams([
    ...Object.entries({
      r:  "course",
      d:  "6",
      l:  "noncredit",
      p:  "ocw",
      o:  "ocw",
      t:  "python",
      c:  "true",
      pr: "true"
    }),
    ...Object.entries({
      r:    "bogus",
      d:    "bogus",
      l:    "bogus",
      p:    "bogus",
      o:    "bogus",
      t:    "all-topics-allowed",
      c:    "bogus",
      pr:   "bogus",
      cats: "bogus-key-and-value",
      dogs: "bogus-key-and-value"
    })
  ])
  assertParamsExtracted(initial, {
    queryText:    "",
    activeFacets: {
      resource_type: ["course"],
      department:    ["6"],
      level:         ["noncredit"],
      platform:      ["ocw"],
      offered_by:    ["ocw"],
      topic:         ["python", "all-topics-allowed"],
      certification: true,
      professional:  true
    },
    endpoint: "resources"
  })
})

test.each([
  {
    initial:          "?d=6&cf=whatever&e=resources",
    expectedFacets:   { course_feature: ["whatever"], department: ["6"] },
    expectedEndpoint: "resources"
  },
  {
    initial:          "?r=course&d=6&cf=whatever&e=content_files",
    expectedFacets:   { content_feature_type: ["whatever"] },
    expectedEndpoint: "content_files"
  }
])(
  "Ignores / keeps facets based on endpoint",
  ({ initial, expectedFacets, expectedEndpoint }) => {
    assertParamsExtracted(initial, {
      queryText:    "",
      activeFacets: expectedFacets as SearchParams["activeFacets"],
      endpoint:     expectedEndpoint as Endpoint
    })
  }
)

test("Ignores / keeps sort values based on endpoint", () => {
  assertParamsExtracted("?d=6&s=mitcoursenumber", {
    endpoint:     "resources",
    activeFacets: { department: ["6"] },
    sort:         "mitcoursenumber",
    queryText:    ""
  })

  assertParamsExtracted("?r=course&e=resources&s=-resource_readable_id", {
    endpoint:     "resources",
    activeFacets: { resource_type: ["course"] },
    // sort: "-resource_readable_id", // not valid for resources
    queryText:    ""
  })

  assertParamsExtracted(
    "?s=-resource_readable_id&d=6&cf=whatever&e=content_files",
    {
      endpoint:     "content_files",
      activeFacets: { content_feature_type: ["whatever"] },
      sort:         "-resource_readable_id",
      queryText:    ""
    }
  )

  assertParamsExtracted("?p=ocw&s=mitcoursenumber&e=content_files", {
    activeFacets: { platform: ["ocw"] },
    endpoint:     "content_files",
    // sort: "mitcoursenumber", // invalid for content_files
    queryText:    ""
  })
})

test("Query text is extracted correctly", () => {
  assertParamsExtracted("?q=python", {
    queryText:    "python",
    activeFacets: {},
    endpoint:     "resources"
  })

  assertParamsExtracted("?q=python&q=javascript", {
    queryText:    "python",
    activeFacets: {},
    endpoint:     "resources"
  })

  assertParamsExtracted("?q=python&q=javascript&e=content_files", {
    queryText:    "python",
    activeFacets: {},
    endpoint:     "content_files"
  })
})

test("Setting current text does not affect query parameters at all", () => {
  const initial = "?r=course&d=6&q=python"
  const { result, searchParams } = setup({ initial })
  expect(result.current.params).toEqual({
    queryText:    "python",
    activeFacets: {
      resource_type: ["course"],
      department:    ["6"]
    },
    endpoint: "resources"
  })

  const params0 = result.current.params

  act(() => {
    result.current.setCurrentText("javascript")
  })

  // current text has been updated
  expect(result.current.currentText).toBe("javascript")
  // params still equal
  expect(result.current.params).toEqual({
    queryText:    "python",
    activeFacets: {
      resource_type: ["course"],
      department:    ["6"]
    },
    endpoint: "resources"
  })
  // and equal by reerence
  expect(result.current.params).toBe(params0)
  // URLSearchParams not modified
  expect(searchParams.current).toEqual(new URLSearchParams(initial))
})

test("Setting queryText updates current text and search params", async () => {
  const initial = "?r=course&d=6&q=python"
  const { result, searchParams } = setup({ initial })

  act(() => {
    result.current.setCurrentTextAndQuery("javascript")
  })

  expect(result.current.currentText).toBe("javascript")
  expect(searchParams.current).toEqual(
    new URLSearchParams("?d=6&q=javascript&r=course")
  )
})

test("Setting sort updates search params", () => {
  const initial = "?r=course&d=6&q=python"
  const { result, searchParams } = setup({ initial })

  act(() => {
    result.current.setSort("mitcoursenumber")
  })
  expect(searchParams.current).toEqual(
    new URLSearchParams("?d=6&q=python&r=course&s=mitcoursenumber")
  )
})

test.each([
  {
    initial:  "?r=course&d=6",
    expected: new URLSearchParams("?d=6&r=course&r=program")
  },
  {
    initial:  "?d=6",
    expected: new URLSearchParams("?d=6&r=program")
  },
  {
    initial:  "?d=6&r=program",
    expected: new URLSearchParams("?d=6&r=program")
  }
])("Turning a facet on with setFacetActive", ({ initial, expected }) => {
  const { result, searchParams } = setup({ initial })
  act(() => {
    result.current.setFacetActive("resource_type", "program", true)
  })
  expect(searchParams.current).toEqual(expected)
})

test.each([
  {
    initial:  "?r=course&r=program&d=6",
    expected: new URLSearchParams("?d=6&r=course")
  },
  {
    initial:  "?d=6",
    expected: new URLSearchParams("?d=6")
  },
  {
    initial:  "?d=6&r=program",
    expected: new URLSearchParams("?d=6")
  }
])("Turning a facet off with setFacetActive", ({ initial, expected }) => {
  const { result, searchParams } = setup({ initial })
  act(() => {
    result.current.setFacetActive("resource_type", "program", false)
  })
  console.log(searchParams.current.toString())
  expect(searchParams.current).toEqual(expected)
})

test.each([
  {
    initial:  "?r=course",
    expected: new URLSearchParams("?c=true&r=course")
  },
  {
    initial:  "?r=course&c=true",
    expected: new URLSearchParams("?c=true&r=course")
  }
])(
  "Turning a boolean facet on with setFacetActive",
  ({ initial, expected }) => {
    const { result, searchParams } = setup({ initial })
    act(() => {
      result.current.setFacetActive("certification", "irrelevant", true)
    })
    expect(searchParams.current).toEqual(expected)
  }
)

test.each([
  {
    initial:  "?r=course",
    expected: new URLSearchParams("?r=course")
  },
  {
    initial:  "?r=course&c=true",
    expected: new URLSearchParams("?r=course")
  }
])(
  "Turning a boolean facet off with setFacetActive",
  ({ initial, expected }) => {
    const { result, searchParams } = setup({ initial })
    act(() => {
      result.current.setFacetActive("certification", "irrelevant", false)
    })
    expect(searchParams.current).toEqual(expected)
  }
)

test.each([
  {
    initial:  "?d=6",
    expected: "?d=6&e=content_files",
    endpoint: "content_files",
    props:    undefined
  },
  {
    initial:  "?d=6",
    expected: "?d=6",
    endpoint: "invalid",
    props:    undefined
  },
  {
    initial:  "?d=6&e=content_files",
    expected: "?d=6",
    endpoint: "resources",
    props:    undefined
  },
  {
    initial:  "?d=6&e=resources",
    expected: "?d=6",
    endpoint: "content_files",
    props:    { defaultEndpoint: "content_files" }
  },
  {
    initial:  "?d=6&e=content_Files",
    expected: "?d=6",
    endpoint: "resources",
    props:    { defaultEndpoint: "resources" }
  }
] as const)(
  "Changing endpoint updates search params",
  ({ initial, expected, endpoint, props }) => {
    const { result, searchParams } = setup({ initial, props })
    act(() => {
      result.current.setEndpoint(endpoint)
    })
    expect(searchParams.current).toEqual(new URLSearchParams(expected))
  }
)

test("clearFacets clears all facets", () => {
  const { result, searchParams } = setup({
    initial: "?r=course&d=6&q=python&x=irrelevant"
  })
  act(() => {
    result.current.clearFacets()
  })
  expect(searchParams.current).toEqual(
    new URLSearchParams("?q=python&x=irrelevant")
  )
})
