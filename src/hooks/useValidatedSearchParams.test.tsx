/* eslint-disable prefer-template */
import React from "react"
import { renderHook, act } from "@testing-library/react-hooks/dom"
import { useResourceSearchParams } from "./useValidatedSearchParams"
import type {
  UseResourceSearchParamsProps,
  UseResourceSearchParamsResult
} from "./useValidatedSearchParams"

describe("useResourceSearchParams", () => {
  const setup = ({
    initial = "",
    props
  }: {
    props?: Omit<
      UseResourceSearchParamsProps,
      "searchParams" | "setSearchParams"
    >
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
      return useResourceSearchParams({
        searchParams,
        setSearchParams,
        ...props
      })
    }
    const result = renderHook(useTestHook)
    return {
      ...result,
      searchParams: searchParamsRef
    }
  }

  const assertParamsExtracted = (
    initial: string | URLSearchParams,
    expected: UseResourceSearchParamsResult["params"],
    props?: Omit<
      UseResourceSearchParamsProps,
      "searchParams" | "setSearchParams"
    >
  ) => {
    const { result, searchParams } = setup({ initial, props })
    expect(result.current.params).toEqual(expected)
    // Search params not modified
    expect(searchParams.current).toEqual(new URLSearchParams(initial))
  }

  test("Extracts expected params from the given URLSearchParams", () => {
    // resource type
    assertParamsExtracted("?resource_type=course&resource_type=podcast", {
      resource_type: ["course", "podcast"]
    })
    // department
    assertParamsExtracted("?resource_type=course&department=6&department=8", {
      resource_type: ["course"],
      department:    ["6", "8"]
    })
    // level
    assertParamsExtracted(
      "?level=noncredit&resource_type=program&level=high_school",
      {
        resource_type: ["program"],
        level:         ["noncredit", "high_school"]
      }
    )
    // platform
    assertParamsExtracted("?level=noncredit&platform=ocw&platform=mitxonline", {
      platform: ["ocw", "mitxonline"],
      level:    ["noncredit"]
    })
    // offered by and q
    assertParamsExtracted(
      "?level=graduate&offered_by=bootcamps&offered_by=xpro&q=meow",
      {
        q:          "meow",
        offered_by: ["bootcamps", "xpro"],
        level:      ["graduate"]
      }
    )
    // topics and sortby
    assertParamsExtracted(
      "?level=graduate&topic=python&topic=javascript&sortby=mitcoursenumber",
      {
        topic:  ["python", "javascript"],
        sortby: "mitcoursenumber",
        level:  ["graduate"]
      }
    )
  })

  test("Extracts boolean facet values correctly", () => {
    assertParamsExtracted("?level=graduate&certification=true", {
      level:         ["graduate"],
      certification: true
    })

    assertParamsExtracted("?level=graduate&professional=true", {
      level:        ["graduate"],
      professional: true
    })
  })

  test("Ignores invalid facet values", () => {
    const initial = new URLSearchParams([
      ...Object.entries({
        resource_type: "course",
        department:    "6",
        level:         "noncredit",
        platform:      "ocw",
        offered_by:    "ocw",
        topic:         "python",
        certification: "true",
        professional:  "true"
      }),
      ...Object.entries({
        resource_type: "bogus",
        department:    "bogus",
        level:         "bogus",
        platform:      "bogus",
        offered_by:    "bogus",
        topic:         "all-topics-allowed",
        certification: "bogus",
        proessional:   "bogus",
        sortby:        "bogus",
        cats:          "bogus-key-and-value",
        dogs:          "bogus-key-and-value"
      })
    ])
    assertParamsExtracted(initial, {
      resource_type: ["course"],
      department:    ["6"],
      level:         ["noncredit"],
      platform:      ["ocw"],
      offered_by:    ["ocw"],
      topic:         ["python", "all-topics-allowed"],
      certification: true,
      professional:  true
    })
  })

  test("Setting current text does not affect query parameters at all", () => {
    const initial = "?resource_type=course&department=6&q=python"
    const { result, searchParams } = setup({ initial })
    expect(result.current.params).toEqual({
      q:             "python",
      resource_type: ["course"],
      department:    ["6"]
    })

    const params0 = result.current.params

    act(() => {
      result.current.setCurrentText("javascript")
    })

    // current text has been updated
    expect(result.current.currentText).toBe("javascript")
    // params still equal
    expect(result.current.params).toEqual({
      q:             "python",
      resource_type: ["course"],
      department:    ["6"]
    })
    // and equal by reerence
    expect(result.current.params).toBe(params0)
    // URLSearchParams not modified
    expect(searchParams.current).toEqual(new URLSearchParams(initial))
  })

  test("Setting queryText updates current text and search params", async () => {
    const initial = "?resource_type=course&department=6&q=python"
    const { result, searchParams } = setup({ initial })

    act(() => {
      result.current.setCurrentTextAndQuery("javascript")
    })

    expect(result.current.currentText).toBe("javascript")
    expect(searchParams.current).toEqual(
      new URLSearchParams("?department=6&q=javascript&resource_type=course")
    )
  })

  test.each([
    {
      initial:  "?resource_type=course&department=6",
      expected: new URLSearchParams(
        "?department=6&resource_type=course&resource_type=program"
      )
    },
    {
      initial:  "?department=6",
      expected: new URLSearchParams("?department=6&resource_type=program")
    },
    {
      initial:  "?department=6&resource_type=program",
      expected: new URLSearchParams("?department=6&resource_type=program")
    }
  ])(
    "Turning a param value on with toggleParamValue",
    ({ initial, expected }) => {
      const { result, searchParams } = setup({ initial })
      act(() => {
        result.current.toggleParamValue("resource_type", "program", true)
      })
      expect(searchParams.current).toEqual(expected)
    }
  )

  test.each([
    {
      initial:  "?resource_type=course&resource_type=program&department=6",
      expected: new URLSearchParams("?department=6&resource_type=course")
    },
    {
      initial:  "?department=6",
      expected: new URLSearchParams("?department=6")
    },
    {
      initial:  "?department=6&resource_type=program",
      expected: new URLSearchParams("?department=6")
    }
  ])("Turning a param off with toggleParamValue", ({ initial, expected }) => {
    const { result, searchParams } = setup({ initial })
    act(() => {
      result.current.toggleParamValue("resource_type", "program", false)
    })
    expect(searchParams.current).toEqual(expected)
  })

  test.each([
    {
      initial:  "?department=6&certification=false",
      expected: new URLSearchParams("?department=6&certification=true"),
      newValue: "true"
    },
    {
      initial:  "?department=6&certification=true",
      expected: new URLSearchParams("?department=6"),
      newValue: ""
    },
    {
      initial:  "?department=6",
      expected: new URLSearchParams("?department=6&certification=true"),
      newValue: "true"
    }
  ])(
    "setSearchParams sets boolean params",
    ({ initial, expected, newValue }) => {
      const { result, searchParams } = setup({ initial })
      act(() => {
        result.current.setParamValue("certification", newValue)
      })
      expect(searchParams.current).toEqual(expected)
    }
  )

  test.each([
    {
      initial:  "?resource_type=course&resource_type=program&department=6",
      expected: new URLSearchParams("?department=6&resource_type=program"),
      newValue: "program"
    },
    {
      initial:  "?department=6",
      expected: new URLSearchParams("?department=6&resource_type=program"),
      newValue: "program"
    },
    {
      initial:  "?resource_type=course&resource_type=program&department=6",
      expected: new URLSearchParams(
        "?department=6&resource_type=podcast&resource_type=program"
      ),
      newValue: ["podcast", "program"]
    },
    {
      initial:  "?department=6",
      expected: new URLSearchParams(
        "?department=6&resource_type=podcast&resource_type=program"
      ),
      newValue: ["podcast", "program"]
    }
  ])(
    "setSearchParams sets string params",
    ({ initial, expected, newValue }) => {
      const { result, searchParams } = setup({ initial })
      act(() => {
        result.current.setParamValue("resource_type", newValue)
      })
      expect(searchParams.current).toEqual(expected)
    }
  )

  test.each([
    {
      initial:  "?resource_type=course",
      value:    "true",
      expected: new URLSearchParams("?certification=true&resource_type=course")
    },
    {
      initial:  "?resource_type=course",
      value:    "false",
      expected: new URLSearchParams("?certification=false&resource_type=course")
    },
    {
      initial:  "?resource_type=course&certification=true",
      value:    "true",
      expected: new URLSearchParams("?certification=true&resource_type=course")
    }
  ])(
    "Turning a boolean param on with toggleParamValue",
    ({ initial, expected, value }) => {
      const { result, searchParams } = setup({ initial })
      act(() => {
        result.current.toggleParamValue("certification", value, true)
      })
      searchParams.current.sort()
      expect(searchParams.current).toEqual(expected)
    }
  )

  test.each([
    {
      initial:  "?resource_type=course",
      value:    "true",
      expected: new URLSearchParams("?resource_type=course")
    },
    {
      initial:  "?resource_type=course&certification=true",
      value:    "true",
      expected: new URLSearchParams("?resource_type=course")
    }
  ])(
    "Turning a boolean param off with toggleParamValue",
    ({ initial, expected, value }) => {
      const { result, searchParams } = setup({ initial })
      act(() => {
        result.current.toggleParamValue("certification", value, false)
      })
      searchParams.current.sort()
      expect(searchParams.current).toEqual(expected)
    }
  )

  test.each([
    {
      initial:
        "?resource_type=course&department=6&department=8&q=python&x=irrelevant",
      facets:   ["department"],
      expected: new URLSearchParams(
        "?q=python&resource_type=course&x=irrelevant"
      )
    },
    {
      initial:
        "?resource_type=course&department=6&department=8&q=python&x=irrelevant",
      facets:   ["department", "resource_type"],
      expected: new URLSearchParams("?q=python&x=irrelevant")
    }
  ])("clearFacets clears all facets", ({ initial, facets, expected }) => {
    const props = { facets } as Omit<
      UseResourceSearchParamsProps,
      "searchParams" | "setSearchParams"
    >
    const { result, searchParams } = setup({ initial, props })
    act(() => {
      result.current.clearAllFacets()
    })
    searchParams.current.sort()
    expect(searchParams.current).toEqual(expected)
  })

  test("clearParam clears specified parameter", () => {
    const { result, searchParams } = setup({
      initial: "?resource_type=course&department=6&q=python&x=irrelevant"
    })
    act(() => {
      result.current.clearParam("resource_type")
    })
    expect(searchParams.current).toEqual(
      new URLSearchParams("?department=6&q=python&x=irrelevant")
    )
  })

  test("patchParams updates search params", () => {
    const { result, searchParams } = setup({
      initial:
        "?resource_type=course&department=6&q=python&x=irrelevant&topic=javascript"
    })
    act(() => {
      result.current.patchParams({
        resource_type: ["program"],
        department:    ["8", "18"],
        topic:         []
      })
    })
    searchParams.current.sort()
    expect(searchParams.current).toEqual(
      new URLSearchParams([
        ["department", "8"],
        ["department", "18"],
        ["q", "python"],
        ["resource_type", "program"],
        ["x", "irrelevant"]
      ])
    )
  })

  test("onFacetChange is called when a facet value is changed", () => {
    const onFacetsChange = jest.fn()
    const { result } = setup({
      initial: "?resource_type=course&department=6&topic=quantum",
      props:   { onFacetsChange, facets: ["department", "topic"] }
    })
    expect(onFacetsChange).toHaveBeenCalledTimes(0)
    act(() => {
      result.current.toggleParamValue("department", "6", false)
    })
    expect(onFacetsChange).toHaveBeenCalledTimes(1)
    act(() => {
      result.current.patchParams({ department: ["8"] })
    })
    expect(onFacetsChange).toHaveBeenCalledTimes(2)
    act(() => {
      result.current.clearParam("topic")
    })
    expect(onFacetsChange).toHaveBeenCalledTimes(3)

    // resource_type is not a facet in this case, so:
    act(() => {
      result.current.toggleParamValue("resource_type", "program", true)
    })
    act(() => {
      result.current.clearParam("resource_type")
    })
    act(() => {
      result.current.patchParams({ resource_type: ["podcast"] })
    })
    expect(onFacetsChange).toHaveBeenCalledTimes(3)
  })
})
