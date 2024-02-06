import * as React from "react"
import { mount } from "enzyme"
import { act } from "react-dom/test-utils"
import { renderHook } from "@testing-library/react-hooks/dom"
import {
  MemoryHistoryOptions,
  createMemoryHistory,
  InitialEntry
} from "history"

import { LearningResourceType, INITIAL_FACET_STATE } from "./constants"

import { useCourseSearch, useSearchInputs, useSyncUrlAndSearch } from "./index"
import { facetMap, wait } from "./test_util"
import { serializeSearchParams } from "./url_utils"

function FacetTestComponent(props: any) {
  const {
    toggleFacet,
    onUpdateFacets,
    clearAllFilters,
    facetOptions,
    toggleFacets
  } = props

  return (
    <div className="facets-test">
      <div className="toggleFacet" onClick={toggleFacet} />
      <div className="toggleFacets" onClick={toggleFacets} />
      <div className="onUpdateFacets" onClick={onUpdateFacets} />
      <div className="clearAllFilters" onClick={clearAllFilters} />
      <div className="facet-options" onClick={facetOptions} />
    </div>
  )
}

function TestComponent(props: any) {
  const { runSearch, clearSearch, facets, loaded, searchPageSize, history } =
    props

  const {
    facetOptions,
    clearAllFilters,
    toggleFacet,
    toggleFacets,
    onUpdateFacets,
    updateText,
    clearText,
    acceptSuggestion,
    loadMore,
    text,
    activeFacets,
    onSubmit,
    sort,
    updateSort,
    updateUI,
    updateEndpoint
  } = useCourseSearch(
    runSearch,
    clearSearch,
    facets,
    loaded,
    searchPageSize,
    history
  )

  return (
    <div className="test-component">
      <div className="clear-text" onClick={clearText} />
      <div className="load-more" onClick={loadMore} />
      <div
        className="accept-suggestion"
        onClick={(text: any) => acceptSuggestion(text)}
      />
      <input onChange={updateText} value={text || ""} />
      <select className="sort" onChange={updateSort} value={sort || ""}>
        <option value="coursenum">Course number</option>
        <option value="">Relevance</option>
      </select>
      <button onClick={() => updateUI("list")} className="ui"></button>
      <button
        onClick={() => updateEndpoint("content_file")}
        className="endpoint"
      ></button>
      <div className="submit" onClick={onSubmit} />
      <FacetTestComponent
        clearAllFilters={clearAllFilters}
        activeFacets={activeFacets}
        toggleFacet={toggleFacet}
        toggleFacets={toggleFacets}
        onUpdateFacets={onUpdateFacets}
        facetOptions={facetOptions}
      />
    </div>
  )
}

const goBack = (history4or5: { back?: () => void; goBack?: () => void }) => {
  if (history4or5.back) {
    return history4or5.back()
  }
  if (history4or5.goBack) {
    return history4or5.goBack()
  }
  throw new Error("Could not find back method.")
}

const render = (props = {}, opts: MemoryHistoryOptions = {}) => {
  const runSearch = jest.fn()
  const clearSearch = jest.fn()
  const history = createMemoryHistory({
    initialEntries: ["/search"],
    ...opts
  })
  const facets = facetMap
  const loaded = true
  const searchPageSize = 10

  const wrapper = mount(
    <TestComponent
      runSearch={runSearch}
      clearSearch={clearSearch}
      facets={facets}
      loaded={loaded}
      searchPageSize={searchPageSize}
      history={history}
      {...props}
    />
  )

  return {
    wrapper,
    runSearch,
    clearSearch,
    facets,
    loaded,
    searchPageSize,
    history
  }
}

describe("useCourseSearch", () => {
  const checkSearchCall = (runSearch: jest.Mock, expectation: any[]) => {
    expect(runSearch.mock.calls[runSearch.mock.calls.length - 1]).toEqual(
      expectation
    )
  }

  it("should mount", () => {
    const { wrapper } = render()
    expect(wrapper.find(".test-component")).toBeTruthy()
  })

  it("should let you update text and clear it", async () => {
    const { wrapper, runSearch } = render()
    wrapper
      .find("input")
      .simulate("change", { target: { value: "My New Search Text" } })
    wrapper.update()
    expect(wrapper.find("input").prop("value")).toBe("My New Search Text")
    wrapper.find(".clear-text").simulate("click")
    wrapper.update()
    expect(wrapper.find("input").prop("value")).toBe("")
    checkSearchCall(runSearch, [
      "", // empty search text
      INITIAL_FACET_STATE,
      0,
      null,
      null,
      null
    ])
  })

  it("should let you update the sort", async () => {
    const { wrapper, runSearch } = render()
    wrapper.find(".sort").simulate("change", { target: { value: "coursenum" } })
    wrapper.update()
    expect(wrapper.find("select").prop("value")).toBe("coursenum")
    checkSearchCall(runSearch, [
      "", // empty search text
      INITIAL_FACET_STATE,
      0,
      "coursenum",
      null,
      null
    ])
  })

  it("should let you update the ui param", async () => {
    const { wrapper, runSearch } = render()
    wrapper.find(".ui").simulate("click")
    checkSearchCall(runSearch, [
      "", // empty search text
      INITIAL_FACET_STATE,
      0,
      null,
      "list",
      null
    ])
  })

  it("should let you update the endpoint param", async () => {
    const { wrapper, runSearch } = render()
    wrapper.find(".endpoint").simulate("click")
    checkSearchCall(runSearch, [
      "", // empty search text
      INITIAL_FACET_STATE,
      0,
      null,
      null,
      "content_file"
    ])
  })

  it("should let you run a search, which should echo to URL bar", async () => {
    const text = "My New Search Text"
    const { wrapper, runSearch, history } = render()
    wrapper.find("input").simulate("change", { target: { value: text } })
    wrapper.find(".submit").simulate("click")
    checkSearchCall(runSearch, [
      "My New Search Text", // empty search text
      INITIAL_FACET_STATE,
      0,
      null,
      null,
      null
    ])
    wrapper.update()
    await wait(1)
    expect(history.location.search).toEqual(
      `?${serializeSearchParams({ text, activeFacets: INITIAL_FACET_STATE })}`
    )
  })

  it("should let you set filters, clear them", async () => {
    const { wrapper, runSearch, history } = render()
    act(() => {
      wrapper.find(".onUpdateFacets").prop("onClick")?.({
        target: {
          // @ts-expect-error
          name:    "topic",
          value:   "Mathematics",
          checked: true
        }
      })
    })
    wrapper.update()
    expect(wrapper.find("FacetTestComponent").prop("activeFacets")).toEqual({
      ...INITIAL_FACET_STATE,
      topic: ["Mathematics"]
    })
    await wait(1)

    expect(history.location.search).toEqual(
      `?${serializeSearchParams({
        text:         "",
        activeFacets: {
          ...INITIAL_FACET_STATE,
          topic: ["Mathematics"]
        }
      })}`
    )

    checkSearchCall(runSearch, [
      "",
      {
        ...INITIAL_FACET_STATE,
        topic: ["Mathematics"]
      },
      0,
      null,
      null,
      null
    ])
    wrapper.find(".clearAllFilters").simulate("click")
    checkSearchCall(runSearch, ["", INITIAL_FACET_STATE, 0, null, null, null])
  })

  it("should let you accept a suggestion", async () => {
    const { wrapper, runSearch } = render()
    act(() => {
      // @ts-expect-error
      wrapper.find(".accept-suggestion").prop("onClick")("my suggestion")
    })
    checkSearchCall(runSearch, [
      "my suggestion",
      INITIAL_FACET_STATE,
      0,
      null,
      null,
      null
    ])
  })

  it("should let you toggle a facet", async () => {
    const { wrapper, runSearch } = render()
    act(() => {
      // @ts-expect-error
      wrapper.find(".toggleFacet").prop("onClick")("topic", "mathematics", true)
    })
    checkSearchCall(runSearch, [
      "",
      {
        ...INITIAL_FACET_STATE,
        topic: ["mathematics"]
      },
      0,
      null,
      null,
      null
    ])
  })

  it("should let you toggle multiple facets", async () => {
    const { wrapper, runSearch } = render()
    act(() => {
      // @ts-expect-error
      wrapper.find(".toggleFacets").prop("onClick")([
        ["topic", "mathematics", true],
        ["resource_type", LearningResourceType.Course, false],
        ["resource_type", LearningResourceType.Program, true]
      ])
    })
    checkSearchCall(runSearch, [
      "",
      {
        ...INITIAL_FACET_STATE,
        resource_type: [LearningResourceType.Program],
        topic:         ["mathematics"]
      },
      0,
      null,
      null,
      null
    ])
  })

  it("should load more", async () => {
    const { wrapper, runSearch } = render()
    act(() => {
      wrapper.find(".load-more").simulate("click")
    })
    checkSearchCall(runSearch, [
      "",
      INITIAL_FACET_STATE,
      10, // from value has been incremented
      null,
      null,
      null
    ])
  })

  it("should have a function for getting facet options", async () => {
    const { wrapper } = render()
    const facetOptions = wrapper.find(".facet-options").prop("onClick")
    // @ts-expect-error
    expect(facetOptions("resource_type")).toEqual([
      { key: LearningResourceType.Video, doc_count: 8156 },
      { key: LearningResourceType.Course, doc_count: 2508 },
      { key: LearningResourceType.Podcast, doc_count: 1180 }
    ])
    // @ts-expect-error
    expect(facetOptions("topic").length).toEqual(137)
  })

  it("should update the state when the back button is pressed", async () => {
    const text = "My New Search Text"
    const { wrapper, history } = render()
    await act(async () => {
      await wrapper
        .find("input")
        .simulate("change", { target: { value: text } })
      await wrapper.find(".submit").simulate("click")
    })
    await wait(1)

    expect(wrapper.find("input").prop("value")).toBe(text)
    act(() => {
      goBack(history)
    })
    await wait(1)
    wrapper.update()
    expect(wrapper.find("input").prop("value")).toBe("")
  })

  it("should initialize with search parameters from window.location", async () => {
    const { wrapper } = render(
      {},
      {
        initialEntries: ["/search?q=sometext&t=Science&s=sortfield"]
      }
    )
    await wait(1)

    const facets = wrapper.find(FacetTestComponent).prop("activeFacets")
    expect(facets).toStrictEqual({
      platform:             [],
      offered_by:           [],
      topic:                ["Science"],
      department:           [],
      level:                [],
      course_feature:       [],
      resource_type:        [],
      content_feature_type: []
    })
    const text = wrapper.find("input").prop("value")
    expect(text).toBe("sometext")
    expect(wrapper.find(".sort").prop("value")).toBe("sortfield")
  })

  it("should sanitize window.location params so no extra paths are pushed onto stack", async () => {
    const { history } = render(
      {},
      {
        initialEntries: ["/search/?q="]
      }
    )
    await wait(1)
    expect(history.index).toBe(0)
  })

  it("should update the URL when search is rerun and parameters are different", async () => {
    const { wrapper, history } = render()
    await wait(1)
    wrapper
      .find("input")
      .simulate("change", { target: { value: "search text goes here" } })
    wrapper.find(".submit").simulate("click")
    await wait(1)

    expect(history.index).toBe(1)
    expect(history.location.search).toBe("?q=search%20text%20goes%20here")
  })

  it("should set the correct from value when searchPageSize is a number", async () => {
    const { wrapper, runSearch } = render({
      searchPageSize: 50
    })

    act(() => {
      wrapper.find(".load-more").simulate("click")
    })
    checkSearchCall(runSearch, ["", INITIAL_FACET_STATE, 50, null, null, null])
  })

  it("should set the correct from value when searchPageSize is a function", async () => {
    const pageSizeFunc = () => {
      return 50
    }

    const { wrapper, runSearch } = render({
      searchPageSize: pageSizeFunc
    })

    act(() => {
      wrapper.find(".load-more").simulate("click")
    })
    checkSearchCall(runSearch, ["", INITIAL_FACET_STATE, 50, null, null, null])
  })
})

describe("useSearchInputs", () => {
  it.each([
    {
      descrip:  "initial: empty",
      initial:  null,
      expected: {
        text:         "",
        activeFacets: INITIAL_FACET_STATE,
        sort:         null,
        ui:           null,
        endpoint:     null
      }
    },
    {
      descrip: "initial: text, facets, ui",
      initial: {
        text:         "cat",
        activeFacets: { topic: ["math", "bio"] },
        ui:           "list",
        endpoint:     null
      },
      expected: {
        text:         "cat",
        activeFacets: { ...INITIAL_FACET_STATE, topic: ["math", "bio"] },
        ui:           "list",
        sort:         null,
        endpoint:     null
      }
    },
    {
      descrip:  "initial: sort",
      initial:  { sort: "coursenum" },
      expected: {
        text:         "",
        activeFacets: INITIAL_FACET_STATE,
        sort:         "coursenum",
        ui:           null,
        endpoint:     null
      }
    }
  ])(
    "Reads initial searchParams and text from history ($desc)",
    ({ initial, expected }) => {
      const initialEntries = initial ?
        [`?${serializeSearchParams(initial)}`] :
        undefined
      const history = createMemoryHistory({ initialEntries })
      const { result } = renderHook(() => useSearchInputs(history))
      expect(result.current.searchParams).toEqual(expected)
      expect(result.current.text).toEqual(expected.text)

      /**
       * We want to ensure that the initial state is set from the URL, as
       * opposed to the initial state being empty and updated via a useEffect
       * hook. The latter approach could lead to extra runSearch calls in
       * useCourseSearch, or extra history entries with useSyncUrlAndSearch
       */
      expect(result.all.length).toBe(1)
    }
  )

  test("setSearchParams updates searchParams when given an object", () => {
    const history = createMemoryHistory()
    const { result } = renderHook(() => useSearchInputs(history))
    act(() => {
      result.current.setSearchParams({
        text:         "cat",
        activeFacets: { topic: ["math", "bio"] },
        ui:           null,
        sort:         null
      })
    })
    expect(result.current.searchParams).toEqual({
      text:         "cat",
      activeFacets: { topic: ["math", "bio"] },
      sort:         null,
      ui:           null
    })
  })

  test("setSearchParams updates searchParams when given an callback", () => {
    const history = createMemoryHistory()
    const { result } = renderHook(() => useSearchInputs(history))
    act(() => {
      result.current.setSearchParams(current => ({ ...current, text: "cat" }))
    })
    expect(result.current.searchParams).toEqual({
      text:         "cat",
      activeFacets: INITIAL_FACET_STATE,
      sort:         null,
      ui:           null,
      endpoint:     null
    })
  })

  test("setText updates text but NOT searchParams", () => {
    const history = createMemoryHistory()
    const { result } = renderHook(() => useSearchInputs(history))
    expect(result.current.text).toEqual("")
    const initialSearchParams = result.current.searchParams
    act(() => {
      result.current.setText("cat")
    })
    expect(result.current.searchParams).toEqual(initialSearchParams)
    expect(result.current.text).toEqual("cat")
  })

  test("clearAllFilters clears text and searchParams but not ui or endpoint", () => {
    const initialEntries = [
      `?${serializeSearchParams({
        text:         "cat",
        activeFacets: { topic: ["math", "bio"] },
        ui:           "list",
        sort:         "coursenum",
        endpoint:     "endpoint"
      })}`
    ]
    const history = createMemoryHistory({ initialEntries })
    const { result } = renderHook(() => useSearchInputs(history))
    const initialSearchParams = result.current.searchParams
    const initialText = result.current.text

    act(() => result.current.clearAllFilters())
    // data changed
    expect(result.current.searchParams).not.toEqual(initialSearchParams)
    expect(result.current.text).not.toEqual(initialText)

    // reset as expected
    expect(result.current.searchParams).toEqual({
      text:         "",
      activeFacets: INITIAL_FACET_STATE,
      sort:         null,
      ui:           "list",
      endpoint:     "endpoint"
    })
    expect(result.current.text).toEqual("")
  })

  test("toggleFacet adds/removes a facet", () => {
    const initialEntries = [
      `?${serializeSearchParams({
        text:         "cat",
        activeFacets: { topic: ["math", "bio"] }
      })}`
    ]
    const history = createMemoryHistory({ initialEntries })
    const { result } = renderHook(() => useSearchInputs(history))
    act(() => {
      result.current.toggleFacet("topic", "math", false)
    })
    expect(result.current.searchParams.activeFacets.topic).toEqual(["bio"])
    act(() => {
      result.current.toggleFacet("topic", "math", true)
    })
    expect(result.current.searchParams.activeFacets.topic).toEqual([
      "bio",
      "math"
    ])
  })

  test("toggleFacets adds/removes multiple facets", () => {
    const initialEntries = [
      `?${serializeSearchParams({
        text:         "cat",
        activeFacets: {
          topic:      ["math", "bio"],
          level:      ["beginner"],
          department: ["7", "8"]
        }
      })}`
    ]
    const history = createMemoryHistory({ initialEntries })
    const { result } = renderHook(() => useSearchInputs(history))
    act(() => {
      result.current.toggleFacets([
        ["topic", "chem", true],
        ["level", "beginner", false],
        ["department", "5", true]
      ])
    })
    expect(result.current.searchParams.activeFacets.topic).toEqual([
      "math",
      "bio",
      "chem"
    ])
    expect(result.current.searchParams.activeFacets.level).toEqual([])
    expect(result.current.searchParams.activeFacets.department).toEqual([
      "7",
      "8",
      "5"
    ])
  })

  test("onUpdateFacet adds/removes a facet", () => {
    const initialEntries = [
      `?${serializeSearchParams({
        text:         "cat",
        activeFacets: { topic: ["math", "bio"] }
      })}`
    ]
    const history = createMemoryHistory({ initialEntries })
    const { result } = renderHook(() => useSearchInputs(history))
    act(() => {
      result.current.onUpdateFacet({
        target: { name: "topic", value: "math", checked: false }
      })
    })
    expect(result.current.searchParams.activeFacets.topic).toEqual(["bio"])
    act(() => {
      result.current.onUpdateFacet({
        target: { name: "topic", value: "math", checked: true }
      })
    })
    expect(result.current.searchParams.activeFacets.topic).toEqual([
      "bio",
      "math"
    ])
  })

  test("toggleFacet sets texts -> searchParams.text", () => {
    const history = createMemoryHistory()
    const { result } = renderHook(() => useSearchInputs(history))

    act(() => result.current.setText("algebra"))

    expect(result.current.searchParams.text).toEqual("")
    act(() => {
      result.current.toggleFacet("topic", "math", true)
    })
    expect(result.current.searchParams.text).toEqual("algebra")
  })

  test("toggleFacets sets texts -> searchParams.text", () => {
    const history = createMemoryHistory()
    const { result } = renderHook(() => useSearchInputs(history))

    act(() => result.current.setText("algebra"))

    expect(result.current.searchParams.text).toEqual("")
    act(() => {
      result.current.toggleFacets([["topic", "math", true]])
    })
    expect(result.current.searchParams.text).toEqual("algebra")
  })

  test("onUpdateFacet sets texts -> searchParams.text", () => {
    const history = createMemoryHistory()
    const { result } = renderHook(() => useSearchInputs(history))

    act(() => result.current.setText("algebra"))

    expect(result.current.searchParams.text).toEqual("")
    act(() => {
      result.current.onUpdateFacet({
        target: { name: "topic", value: "math", checked: true }
      })
    })
    expect(result.current.searchParams.text).toEqual("algebra")
  })

  test("onUpdateText updates texts but not searchParams.text; submitText finalizes text", () => {
    const history = createMemoryHistory()
    const { result } = renderHook(() => useSearchInputs(history))

    act(() => result.current.setText("algebra"))
    expect(result.current.text).toBe("algebra")
    expect(result.current.searchParams.text).toBe("")

    act(() => result.current.submitText())
    expect(result.current.searchParams.text).toBe("algebra")
  })

  test("clearText clears text and searchParams.text", () => {
    const history = createMemoryHistory({
      initialEntries: [`?${serializeSearchParams({ text: "algebra" })}`]
    })
    const { result } = renderHook(() => useSearchInputs(history))

    expect(result.current.text).toBe("algebra")
    expect(result.current.searchParams.text).toBe("algebra")

    act(() => result.current.clearText())
    expect(result.current.text).toBe("")
    expect(result.current.searchParams.text).toBe("")
  })

  test("updateSort updates sort and sets text -> searchParams.text", () => {
    const history = createMemoryHistory()
    const { result } = renderHook(() => useSearchInputs(history))

    act(() => result.current.setText("algebra"))

    expect(result.current.searchParams.sort).toBe(null)
    expect(result.current.searchParams.text).toBe("")

    act(() => {
      result.current.updateSort({ target: { value: "-title" } })
    })
    expect(result.current.searchParams.sort).toEqual("-title")
    expect(result.current.searchParams.text).toBe("algebra")
  })

  test("updateUI updates ui and sets text -> searchParams.text", () => {
    const history = createMemoryHistory()
    const { result } = renderHook(() => useSearchInputs(history))

    act(() => result.current.setText("algebra"))

    expect(result.current.searchParams.sort).toBe(null)
    expect(result.current.searchParams.text).toBe("")

    act(() => {
      result.current.updateUI("list")
    })
    expect(result.current.searchParams.ui).toBe("list")
    expect(result.current.searchParams.text).toBe("algebra")
  })
})

describe("useSyncUrlAndSearch", () => {
  const setupHook = (initialEntries?: InitialEntry[]) => {
    const history = createMemoryHistory({ initialEntries })
    const all = renderHook(() => {
      const search = useSearchInputs(history)
      useSyncUrlAndSearch(history, search)
      return search
    })
    return [all, history] as const
  }

  it("syncs searchParams to url", async () => {
    const [{ result }, history] = setupHook(["/search"])

    expect(history.index).toBe(0)
    act(() => {
      result.current.setText("algebra")
      result.current.toggleFacet("topic", "math", true)
      result.current.submitText()
    })

    act(() => {
      result.current.setText("linear algebra")
    })

    expect(result.current.searchParams.text).toBe("algebra")
    expect(result.current.text).toBe("linear algebra") // not submitted yet

    expect(history.location).toEqual(
      expect.objectContaining({
        pathname: "/search",
        search:   "?q=algebra&t=math"
      })
    )
    expect(history.index).toBe(1)
  })

  it("syncs empty search parameters to URL correctly", () => {
    const [{ result }, history] = setupHook(["/search?q=algebra"])
    act(() => {
      result.current.clearText()
    })
    expect(history.location).toEqual(
      expect.objectContaining({
        pathname: "/search",
        search:   ""
      })
    )
  })

  it("syncs url to searchParams", async () => {
    const [{ result }, history] = setupHook([
      `?${serializeSearchParams({
        text:         "algebra",
        activeFacets: { topic: ["math"] }
      })}`
    ])

    act(() => {
      result.current.clearAllFilters()
    })

    expect(result.current.searchParams.text).toBe("")
    expect(history.location.search).toBe("")

    act(() => history.go(-1))

    expect(history.location.search).toBe("?q=algebra&t=math")
    expect(result.current.searchParams.text).toBe("algebra")
    expect(result.current.searchParams.activeFacets.topic).toEqual(["math"])
  })
})
