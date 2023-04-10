import * as React from "react"
import { mount } from "enzyme"
import { act } from "react-dom/test-utils"
import { renderHook } from "@testing-library/react-hooks/dom"
import { MemoryHistoryOptions, createMemoryHistory, InitialEntry } from "history"

import {
  LearningResourceType,
  INITIAL_FACET_STATE,
  LR_TYPE_ALL
} from "./constants"

import { useCourseSearch, useSearchInputs, useSyncUrlAndSearch } from "./index"
import { facetMap, wait } from "./test_util"
import { serializeSort, serializeSearchParams } from "./url_utils"

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
  const {
    runSearch,
    clearSearch,
    facets,
    loaded,
    searchPageSize,
    history
  } = props

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
    updateUI
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
      <select
        className="sort"
        onChange={updateSort}
        value={serializeSort(sort)}
      >
        <option value="coursenum">Course number</option>
        <option value="">Relevance</option>
      </select>
      <button onClick={() => updateUI("list")} className="ui"></button>
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
      {
        ...INITIAL_FACET_STATE,
        type: LR_TYPE_ALL
      },
      0,
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
      {
        ...INITIAL_FACET_STATE,
        type: LR_TYPE_ALL
      },
      0,
      {
        field:  "coursenum",
        option: "asc"
      },
      null
    ])
  })

  it("should let you update the ui param", async () => {
    const { wrapper, runSearch } = render()
    wrapper.find(".ui").simulate("click")
    checkSearchCall(runSearch, [
      "", // empty search text
      {
        ...INITIAL_FACET_STATE,
        type: LR_TYPE_ALL
      },
      0,
      null,
      "list"
    ])
  })

  it("should let you run a search, which should echo to URL bar", async () => {
    const text = "My New Search Text"
    const { wrapper, runSearch, history } = render()
    wrapper.find("input").simulate("change", { target: { value: text } })
    wrapper.find(".submit").simulate("click")
    checkSearchCall(runSearch, [
      "My New Search Text", // empty search text
      {
        ...INITIAL_FACET_STATE,
        type: LR_TYPE_ALL
      },
      0,
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
          name:    "topics",
          value:   "Mathematics",
          checked: true
        }
      })
    })
    wrapper.update()
    expect(wrapper.find("FacetTestComponent").prop("activeFacets")).toEqual({
      ...INITIAL_FACET_STATE,
      topics: ["Mathematics"]
    })
    await wait(1)

    expect(history.location.search).toEqual(
      `?${serializeSearchParams({
        text:         "",
        activeFacets: {
          ...INITIAL_FACET_STATE,
          topics: ["Mathematics"]
        }
      })}`
    )

    checkSearchCall(runSearch, [
      "",
      {
        ...INITIAL_FACET_STATE,
        type:   LR_TYPE_ALL,
        topics: ["Mathematics"]
      },
      0,
      null,
      null
    ])
    wrapper.find(".clearAllFilters").simulate("click")
    checkSearchCall(runSearch, [
      "",
      {
        ...INITIAL_FACET_STATE,
        type: LR_TYPE_ALL
      },
      0,
      null,
      null
    ])
  })

  it("should let you accept a suggestion", async () => {
    const { wrapper, runSearch } = render()
    act(() => {
      // @ts-expect-error
      wrapper.find(".accept-suggestion").prop("onClick")("my suggestion")
    })
    checkSearchCall(runSearch, [
      "my suggestion",
      {
        ...INITIAL_FACET_STATE,
        type: LR_TYPE_ALL
      },
      0,
      null,
      null
    ])
  })

  it("should let you toggle a facet", async () => {
    const { wrapper, runSearch } = render()
    act(() => {
      // @ts-expect-error
      wrapper.find(".toggleFacet").prop("onClick")("topics", "mathematics", true)
    })
    checkSearchCall(runSearch, [
      "",
      {
        ...INITIAL_FACET_STATE,
        type:   LR_TYPE_ALL,
        topics: ["mathematics"]
      },
      0,
      null,
      null
    ])
  })

  it("should let you toggle multiple facets", async () => {
    const { wrapper, runSearch } = render()
    act(() => {
      // @ts-expect-error
      wrapper.find(".toggleFacets").prop("onClick")([
        ["topics", "mathematics", true],
        ["type", LearningResourceType.Course, false],
        ["type", LearningResourceType.ResourceFile, true]
      ])
    })
    checkSearchCall(runSearch, [
      "",
      {
        ...INITIAL_FACET_STATE,
        type:   [LearningResourceType.ResourceFile],
        topics: ["mathematics"]
      },
      0,
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
      {
        ...INITIAL_FACET_STATE,
        type: LR_TYPE_ALL
      },
      10, // from value has been incremented
      null,
      null
    ])
  })

  it("should have a function for getting facet options", async () => {
    const { wrapper } = render()
    const facetOptions = wrapper.find(".facet-options").prop("onClick")
    // @ts-expect-error
    expect(facetOptions("type")).toEqual({
      buckets: [
        { key: LearningResourceType.Video, doc_count: 8156 },
        { key: LearningResourceType.Course, doc_count: 2508 },
        { key: LearningResourceType.Podcast, doc_count: 1180 }
      ]
    })
    // @ts-expect-error
    expect(facetOptions("topics").buckets.length).toEqual(137)
  })

  it("should merge an empty active facet into the ones from the search backend", async () => {
    const { wrapper } = render()
    act(() => {
      // @ts-expect-error
      wrapper.find(".onUpdateFacets").prop("onClick")({
        target: {
          // @ts-expect-error
          name:    "type",
          value:   "Obstacle Course",
          checked: true
        }
      })
    })
    wrapper.update()
    const facetOptions = wrapper.find(".facet-options").prop("onClick")
    // @ts-expect-error
    expect(facetOptions("type")).toEqual({
      buckets: [
        { key: LearningResourceType.Video, doc_count: 8156 },
        { key: LearningResourceType.Course, doc_count: 2508 },
        { key: LearningResourceType.Podcast, doc_count: 1180 },
        { key: "Obstacle Course", doc_count: 0 }
      ]
    })
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
      audience:            [],
      certification:       [],
      type:                [],
      offered_by:          [],
      topics:              ["Science"],
      department_name:     [],
      level:               [],
      course_feature_tags: [],
      resource_type:       []
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
    checkSearchCall(runSearch, [
      "",
      {
        ...INITIAL_FACET_STATE,
        type: LR_TYPE_ALL
      },
      50,
      null,
      null
    ])
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
    checkSearchCall(runSearch, [
      "",
      {
        ...INITIAL_FACET_STATE,
        type: LR_TYPE_ALL
      },
      50,
      null,
      null
    ])
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
        ui:           null
      }
    },
    {
      descrip: "initial: text, facets, ui",
      initial: {
        text:         "cat",
        activeFacets: { topics: ["math", "bio"] },
        ui:           "list"
      },
      expected: {
        text:         "cat",
        activeFacets: { ...INITIAL_FACET_STATE, topics: ["math", "bio"] },
        ui:           "list",
        sort:         null
      }
    },
    {
      descrip:  "initial: sort",
      initial:  { sort: { field: "coursenum", option: "asc" } },
      expected: {
        text:         "",
        activeFacets: INITIAL_FACET_STATE,
        sort:         { field: "coursenum", option: "asc" },
        ui:           null
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
        activeFacets: { topics: ["math", "bio"] },
        ui:           null,
        sort:         null
      })
    })
    expect(result.current.searchParams).toEqual({
      text:         "cat",
      activeFacets: { topics: ["math", "bio"] },
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
      ui:           null
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

  test("clearAllFilters clears text and searchParams", () => {
    const initialEntries = [
      `?${serializeSearchParams({
        text:         "cat",
        activeFacets: { topics: ["math", "bio"] },
        ui:           "list",
        sort:         { field: "coursenum", option: "asc" }
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
      ui:           null
    })
    expect(result.current.text).toEqual("")
  })

  test("toggleFacet adds/removes a facet", () => {
    const initialEntries = [
      `?${serializeSearchParams({
        text:         "cat",
        activeFacets: { topics: ["math", "bio"] }
      })}`
    ]
    const history = createMemoryHistory({ initialEntries })
    const { result } = renderHook(() => useSearchInputs(history))
    act(() => {
      result.current.toggleFacet("topics", "math", false)
    })
    expect(result.current.searchParams.activeFacets.topics).toEqual(["bio"])
    act(() => {
      result.current.toggleFacet("topics", "math", true)
    })
    expect(result.current.searchParams.activeFacets.topics).toEqual([
      "bio",
      "math"
    ])
  })

  test("toggleFacets adds/removes multiple facets", () => {
    const initialEntries = [
      `?${serializeSearchParams({
        text:         "cat",
        activeFacets: {
          topics:          ["math", "bio"],
          level:           ["beginner"],
          department_name: ["physics", "biology"]
        }
      })}`
    ]
    const history = createMemoryHistory({ initialEntries })
    const { result } = renderHook(() => useSearchInputs(history))
    act(() => {
      result.current.toggleFacets([
        ["topics", "chem", true],
        ["level", "beginner", false],
        ["department_name", "chemistry", true]
      ])
    })
    expect(result.current.searchParams.activeFacets.topics).toEqual([
      "math",
      "bio",
      "chem"
    ])
    expect(result.current.searchParams.activeFacets.level).toEqual([])
    expect(result.current.searchParams.activeFacets.department_name).toEqual([
      "physics",
      "biology",
      "chemistry"
    ])
  })

  test("onUpdateFacet adds/removes a facet", () => {
    const initialEntries = [
      `?${serializeSearchParams({
        text:         "cat",
        activeFacets: { topics: ["math", "bio"] }
      })}`
    ]
    const history = createMemoryHistory({ initialEntries })
    const { result } = renderHook(() => useSearchInputs(history))
    act(() => {
      result.current.onUpdateFacet({ target: { name: "topics", value: "math", checked: false }})
    })
    expect(result.current.searchParams.activeFacets.topics).toEqual(["bio"])
    act(() => {
      result.current.onUpdateFacet({ target: { name: "topics", value: "math", checked: true }})
    })
    expect(result.current.searchParams.activeFacets.topics).toEqual([
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
      result.current.toggleFacet("topics", "math", true)
    })
    expect(result.current.searchParams.text).toEqual("algebra")
  })

  test("toggleFacets sets texts -> searchParams.text", () => {
    const history = createMemoryHistory()
    const { result } = renderHook(() => useSearchInputs(history))

    act(() => result.current.setText("algebra"))

    expect(result.current.searchParams.text).toEqual("")
    act(() => {
      result.current.toggleFacets([["topics", "math", true]])
    })
    expect(result.current.searchParams.text).toEqual("algebra")
  })

  test("onUpdateFacet sets texts -> searchParams.text", () => {
    const history = createMemoryHistory()
    const { result } = renderHook(() => useSearchInputs(history))

    act(() => result.current.setText("algebra"))

    expect(result.current.searchParams.text).toEqual("")
    act(() => {
      result.current.onUpdateFacet({ target: { name: "topics", value: "math", checked: true }})
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
    expect(result.current.searchParams.sort).toEqual({ field: "title", option: "desc" })
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
    const [{ result }, history] = setupHook()

    expect(history.index).toBe(0)
    act(() => {
      result.current.setText("algebra")
      result.current.toggleFacet("topics", "math", true) // syncs text
    })

    act(() => {
      result.current.setText("linear algebra")
    })

    expect(result.current.searchParams.text).toBe("algebra")
    expect(result.current.text).toBe("linear algebra") // not submitted yet


    expect(history.location.search).toBe("?q=algebra&t=math")
    expect(history.index).toBe(1)
  })

  it("syncs url to searchParams", async () => {
    const [{ result }, history] = setupHook([
      `?${serializeSearchParams({ text: "algebra", activeFacets: { topics: ["math"] } })}`
    ])

    act(() => {
      result.current.clearAllFilters()
    })

    expect(result.current.searchParams.text).toBe("")
    expect(history.location.search).toBe("")

    act(() => history.go(-1))

    expect(history.location.search).toBe("?q=algebra&t=math")
    expect(result.current.searchParams.text).toBe("algebra")
    expect(result.current.searchParams.activeFacets.topics).toEqual(["math"])
  })
})
