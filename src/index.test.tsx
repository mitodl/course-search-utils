import * as React from "react"
import { mount } from "enzyme"
import { act } from "react-dom/test-utils"
import { createMemoryHistory } from "history"

const memoryHistory = createMemoryHistory()
jest.mock("history", () => ({
  // @ts-ignore
  ...jest.requireActual("history"),
  createBrowserHistory: () => memoryHistory
}))

import {
  LR_TYPE_ALL,
  LR_TYPE_PODCAST,
  LR_TYPE_VIDEO,
  LR_TYPE_COURSE,
  LR_TYPE_RESOURCEFILE,
  INITIAL_FACET_STATE
} from "./constants"

import { useCourseSearch } from "./index"
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
  const { runSearch, clearSearch, facets, loaded, searchPageSize } = props

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
    updateSort
  } = useCourseSearch(runSearch, clearSearch, facets, loaded, searchPageSize)

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

const render = (props = {}) => {
  const runSearch = jest.fn()
  const clearSearch = jest.fn()
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
      {...props}
    />
  )

  return {
    wrapper,
    runSearch,
    clearSearch,
    facets,
    loaded,
    searchPageSize
  }
}

describe("useCourseSearch", () => {
  // @ts-ignore
  let memoryStack, memoryUnlisten
  beforeEach(() => {
    // @ts-ignore
    window.location = "http://localhost:3000/search"
    memoryStack = []
    memoryUnlisten = memoryHistory.listen(location => {
      memoryStack.push(location)
    })
  })

  afterEach(() => {
    // @ts-ignore
    memoryUnlisten()
  })

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
      }
    ])
  })

  it("should let you run a search, which should echo to URL bar", async () => {
    const text = "My New Search Text"
    const { wrapper, runSearch } = render()
    wrapper.find("input").simulate("change", { target: { value: text } })
    wrapper.find(".submit").simulate("click")
    checkSearchCall(runSearch, [
      "My New Search Text", // empty search text
      {
        ...INITIAL_FACET_STATE,
        type: LR_TYPE_ALL
      },
      0,
      null
    ])
    wrapper.update()
    await wait(1)
    expect(memoryHistory.location.search).toEqual(
      `?${serializeSearchParams({ text, activeFacets: INITIAL_FACET_STATE })}`
    )
  })

  it("should let you set filters, clear them", async () => {
    const { wrapper, runSearch } = render()
    act(() => {
      // @ts-ignore
      wrapper.find(".onUpdateFacets").prop("onClick")({
        target: {
          // @ts-ignore
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

    expect(memoryHistory.location.search).toEqual(
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
      null
    ])
  })

  it("should let you accept a suggestion", async () => {
    const { wrapper, runSearch } = render()
    act(() => {
      // @ts-ignore
      wrapper.find(".accept-suggestion").prop("onClick")("my suggestion")
    })
    checkSearchCall(runSearch, [
      "my suggestion",
      {
        ...INITIAL_FACET_STATE,
        type: LR_TYPE_ALL
      },
      0,
      null
    ])
  })

  it("should let you toggle a facet", async () => {
    const { wrapper, runSearch } = render()
    act(() => {
      // @ts-ignore
      wrapper.find(".toggleFacet").prop("onClick")("topic", "mathematics", true)
    })
    checkSearchCall(runSearch, [
      "",
      {
        ...INITIAL_FACET_STATE,
        type:  LR_TYPE_ALL,
        topic: ["mathematics"]
      },
      0,
      null
    ])
  })

  it("should let you toggle multiple facets", async () => {
    const { wrapper, runSearch } = render()
    act(() => {
      // @ts-ignore
      wrapper.find(".toggleFacets").prop("onClick")([
        ["topic", "mathematics", true],
        ["type", LR_TYPE_COURSE, false],
        ["type", LR_TYPE_RESOURCEFILE, true]
      ])
    })
    checkSearchCall(runSearch, [
      "",
      {
        ...INITIAL_FACET_STATE,
        type:  [LR_TYPE_RESOURCEFILE],
        topic: ["mathematics"]
      },
      0,
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
      null
    ])
  })

  it("should have a function for getting facet options", async () => {
    const { wrapper } = render()
    const facetOptions = wrapper.find(".facet-options").prop("onClick")
    // @ts-ignore
    expect(facetOptions("type")).toEqual({
      buckets: [
        { key: LR_TYPE_VIDEO, doc_count: 8156 },
        { key: LR_TYPE_COURSE, doc_count: 2508 },
        { key: LR_TYPE_PODCAST, doc_count: 1180 }
      ]
    })
    // @ts-ignore
    expect(facetOptions("topics").buckets.length).toEqual(137)
  })

  it("should merge an empty active facet into the ones from the search backend", async () => {
    const { wrapper } = render()
    act(() => {
      // @ts-ignore
      wrapper.find(".onUpdateFacets").prop("onClick")({
        target: {
          // @ts-ignore
          name:    "type",
          value:   "Obstacle Course",
          checked: true
        }
      })
    })
    wrapper.update()
    const facetOptions = wrapper.find(".facet-options").prop("onClick")
    // @ts-ignore
    expect(facetOptions("type")).toEqual({
      buckets: [
        { key: LR_TYPE_VIDEO, doc_count: 8156 },
        { key: LR_TYPE_COURSE, doc_count: 2508 },
        { key: LR_TYPE_PODCAST, doc_count: 1180 },
        { key: "Obstacle Course", doc_count: 0 }
      ]
    })
  })

  it("should update the state when the back button is pressed", async () => {
    const text = "My New Search Text"
    const { wrapper } = render()
    await act(async () => {
      await wrapper
        .find("input")
        .simulate("change", { target: { value: text } })
      await wrapper.find(".submit").simulate("click")
    })
    await wait(1)

    expect(wrapper.find("input").prop("value")).toBe(text)
    act(() => {
      memoryHistory.back()
    })
    await wait(1)
    wrapper.update()
    expect(wrapper.find("input").prop("value")).toBe("")
  })

  it("should initialize with search parameters from window.location", async () => {
    // @ts-ignore
    window.location =
      "http://localhost:3000/search/?q=sometext&t=Science&s=sortfield"
    const { wrapper } = render()
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
    // @ts-ignore
    window.location = "http://localhost:3000/search/?q="
    render()
    await wait(1)
    // @ts-ignore
    expect(memoryStack).toStrictEqual([])
  })

  it("should update the URL when search is rerun and parameters are different", async () => {
    // @ts-ignore
    const { wrapper } = render()
    await wait(1)
    // @ts-ignore
    wrapper
      .find("input")
      .simulate("change", { target: { value: "search text goes here" } })
    wrapper.find(".submit").simulate("click")
    await wait(1)

    // @ts-ignore
    expect(memoryStack.length).toBe(1)
    // @ts-ignore
    expect(memoryStack[0].action).toBe("PUSH")
    // @ts-ignore
    expect(memoryStack[0].location.search).toBe(
      "?q=search%20text%20goes%20here"
    )
  })
})
