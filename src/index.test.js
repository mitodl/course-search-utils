import React from "react"
import { mount } from "enzyme"
import { act } from "react-dom/test-utils"

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
import { serializeSearchParams } from "./url_utils"

function FacetTestComponent(props) {
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

function TestComponent(props) {
  const {
    runSearch,
    clearSearch,
    updateURLBar,
    facets,
    loaded,
    searchPageSize
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
    onSubmit
  } = useCourseSearch(
    runSearch,
    clearSearch,
    updateURLBar,
    facets,
    loaded,
    searchPageSize
  )

  return (
    <div className="test-component">
      <div className="clear-text" onClick={clearText} />
      <div className="load-more" onClick={loadMore} />
      <div className="accept-suggestion" onClick={acceptSuggestion} />
      <input onChange={updateText} value={text || ""} />
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
  const updateURLBar = jest.fn()
  const facets = facetMap
  const loaded = true
  const searchPageSize = 10

  const wrapper = mount(
    <TestComponent
      runSearch={runSearch}
      clearSearch={clearSearch}
      updateURLBar={updateURLBar}
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
    updateURLBar,
    facets,
    loaded,
    searchPageSize
  }
}

describe("useCourseSearch", () => {
  const checkSearchCall = (runSearch, expectation) => {
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
      0
    ])
  })

  it("should let you run a search, which should echo to URL bar", async () => {
    const text = "My New Search Text"
    const { wrapper, runSearch, updateURLBar } = render()
    wrapper.find("input").simulate("change", { target: { value: text } })
    wrapper.find(".submit").simulate("click")
    checkSearchCall(runSearch, [
      "My New Search Text", // empty search text
      {
        ...INITIAL_FACET_STATE,
        type: LR_TYPE_ALL
      },
      0
    ])
    wrapper.update()
    await wait(1)
    expect(
      updateURLBar.mock.calls[updateURLBar.mock.calls.length - 1]
    ).toEqual([
      serializeSearchParams({ text, activeFacets: INITIAL_FACET_STATE })
    ])
  })

  it("should let you set filters, clear them", async () => {
    const { wrapper, runSearch, updateURLBar } = render()
    act(() => {
      wrapper.find(".onUpdateFacets").prop("onClick")({
        target: {
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
    expect(updateURLBar.mock.calls[updateURLBar.mock.calls.length - 1]).toEqual(
      [
        serializeSearchParams({
          text:         "",
          activeFacets: {
            ...INITIAL_FACET_STATE,
            topics: ["Mathematics"]
          }
        })
      ]
    )

    checkSearchCall(runSearch, [
      undefined,
      {
        ...INITIAL_FACET_STATE,
        type:   LR_TYPE_ALL,
        topics: ["Mathematics"]
      },
      0
    ])
    wrapper.find(".clearAllFilters").simulate("click")
    checkSearchCall(runSearch, [
      undefined,
      {
        ...INITIAL_FACET_STATE,
        type: LR_TYPE_ALL
      },
      0
    ])
  })

  it("should let you accept a suggestion", async () => {
    const { wrapper, runSearch } = render()
    act(() => {
      wrapper.find(".accept-suggestion").prop("onClick")("my suggestion")
    })
    checkSearchCall(runSearch, [
      "my suggestion",
      {
        ...INITIAL_FACET_STATE,
        type: LR_TYPE_ALL
      },
      0
    ])
  })

  it("should let you toggle a facet", async () => {
    const { wrapper, runSearch } = render()
    act(() => {
      wrapper.find(".toggleFacet").prop("onClick")("topic", "mathematics", true)
    })
    checkSearchCall(runSearch, [
      undefined,
      {
        ...INITIAL_FACET_STATE,
        type:  LR_TYPE_ALL,
        topic: ["mathematics"]
      },
      0
    ])
  })

  it("should let you toggle multiple facets", async () => {
    const { wrapper, runSearch } = render()
    act(() => {
      wrapper.find(".toggleFacets").prop("onClick")([
        ["topic", "mathematics", true],
        ["type", LR_TYPE_COURSE, false],
        ["type", LR_TYPE_RESOURCEFILE, true]
      ])
    })
    checkSearchCall(runSearch, [
      undefined,
      {
        ...INITIAL_FACET_STATE,
        type:  [LR_TYPE_RESOURCEFILE],
        topic: ["mathematics"]
      },
      0
    ])
  })

  it("should load more", async () => {
    const { wrapper, runSearch } = render()
    act(() => {
      wrapper.find(".load-more").simulate("click")
    })
    checkSearchCall(runSearch, [
      undefined,
      {
        ...INITIAL_FACET_STATE,
        type: LR_TYPE_ALL
      },
      10 // from value has been incremented
    ])
  })

  it("should have a function for getting facet options", async () => {
    const { wrapper } = render()
    const facetOptions = wrapper.find(".facet-options").prop("onClick")
    expect(facetOptions("type")).toEqual({
      buckets: [
        { key: LR_TYPE_VIDEO, doc_count: 8156 },
        { key: LR_TYPE_COURSE, doc_count: 2508 },
        { key: LR_TYPE_PODCAST, doc_count: 1180 }
      ]
    })
    expect(facetOptions("topics").buckets.length).toEqual(137)
  })

  it("should merge an empty active facet into the ones from the search backend", async () => {
    const { wrapper } = render()
    act(() => {
      wrapper.find(".onUpdateFacets").prop("onClick")({
        target: {
          name:    "type",
          value:   "Obstacle Course",
          checked: true
        }
      })
    })
    wrapper.update()
    const facetOptions = wrapper.find(".facet-options").prop("onClick")
    expect(facetOptions("type")).toEqual({
      buckets: [
        { key: LR_TYPE_VIDEO, doc_count: 8156 },
        { key: LR_TYPE_COURSE, doc_count: 2508 },
        { key: LR_TYPE_PODCAST, doc_count: 1180 },
        { key: "Obstacle Course", doc_count: 0 }
      ]
    })
  })
})
