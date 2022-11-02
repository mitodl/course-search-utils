import * as React from "react"
import { mount } from "enzyme"
import { act } from "react-dom/test-utils"
import { MemoryHistoryOptions, createMemoryHistory } from "history"

import {
  LearningResourceType,
  INITIAL_FACET_STATE,
  LR_TYPE_ALL
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
  const {
    runSearch,
    clearSearch,
    facets,
    loaded,
    searchPageSize,
    history,
    getPageSizeFromUIParam
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
    history,
    getPageSizeFromUIParam
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
  const getPageSizeFromUIParam = null

  const wrapper = mount(
    <TestComponent
      runSearch={runSearch}
      clearSearch={clearSearch}
      facets={facets}
      loaded={loaded}
      searchPageSize={searchPageSize}
      history={history}
      getPageSizeFromUIParam = {getPageSizeFromUIParam}
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
        ["type", LearningResourceType.Course, false],
        ["type", LearningResourceType.ResourceFile, true]
      ])
    })
    checkSearchCall(runSearch, [
      "",
      {
        ...INITIAL_FACET_STATE,
        type:  [LearningResourceType.ResourceFile],
        topic: ["mathematics"]
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

  it("should correctly iterate from when getPageSizeFromUIParam is set", async () => {
    const pageSizeFunc = (ui) => {
      return 50
    }

    const { wrapper, runSearch } = render({searchPageSize: null, getPageSizeFromUIParam: pageSizeFunc})

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


