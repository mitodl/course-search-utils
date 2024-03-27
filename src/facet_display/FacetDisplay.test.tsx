import React from "react"
import { shallow } from "enzyme"

import {
  default as FacetDisplay,
  AvailableFacets,
  getDepartmentName,
  getLevelName
} from "./FacetDisplay"
import { FacetManifest, Facets } from "./types"

describe("FacetDisplay component", () => {
  const facetMap: FacetManifest = [
    {
      name:               "topic",
      title:              "Topics",
      useFilterableFacet: false,
      expandedOnLoad:     false
    },
    {
      name:               "resource_type",
      title:              "Types",
      useFilterableFacet: false,
      expandedOnLoad:     false
    },
    {
      name:               "department",
      title:              "Departments",
      useFilterableFacet: false,
      expandedOnLoad:     true,
      labelFunction:      getDepartmentName
    },
    {
      name:               "level",
      title:              "Level",
      useFilterableFacet: false,
      expandedOnLoad:     true,
      labelFunction:      getLevelName
    }
  ]

  function setup() {
    const activeFacets = {}
    const facetOptions = jest.fn()
    const clearAllFilters = jest.fn()
    const onFacetChange = jest.fn()

    const render = (props = {}) =>
      shallow(
        <FacetDisplay
          facetMap={facetMap}
          facetOptions={facetOptions}
          activeFacets={activeFacets}
          clearAllFilters={clearAllFilters}
          onFacetChange={onFacetChange}
          {...props}
        />
      )
    return { render, clearAllFilters }
  }

  test("renders a FacetDisplay with expected FilterableFacets", async () => {
    const { render } = setup()
    const wrapper = render()
    const facets = wrapper.find(AvailableFacets).dive().children()
    expect(facets).toHaveLength(4)
    facets.map((facet, key) => {
      expect(facet.prop("name")).toBe(facetMap[key].name)
      expect(facet.prop("title")).toBe(facetMap[key].title)
      expect(facet.prop("expandedOnLoad")).toBe(facetMap[key].expandedOnLoad)
    })
  })

  test("shows filters which are active", () => {
    const activeFacets: Facets = {
      topic:         ["Academic Writing", "Accounting", "Aerodynamics"],
      resource_type: [],
      department:    ["1", "2"]
    }

    const { render, clearAllFilters } = setup()
    const wrapper = render({
      activeFacets
    })
    expect(
      wrapper
        .find(".active-search-filters")
        .find("SearchFilter")
        .map(el => el.prop("value"))
    ).toEqual(["Academic Writing", "Accounting", "Aerodynamics", "1", "2"])
    wrapper.find(".clear-all-filters-button").simulate("click")
    expect(clearAllFilters).toHaveBeenCalled()
  })

  test("it accepts a label function to convert codes to names", () => {
    const activeFacets: Facets = {
      topic:         [],
      resource_type: [],
      department:    ["1"],
      level:         ["graduate"]
    }

    const { render, clearAllFilters } = setup()
    const wrapper = render({
      activeFacets
    })
    expect(
      wrapper
        .find(".active-search-filters")
        .find("SearchFilter")
        .map(el =>
          el.render().find(".active-search-filter-label").first().html()
        )
    ).toEqual(["Civil and Environmental Engineering", "Graduate"])
    wrapper.find(".clear-all-filters-button").simulate("click")
    expect(clearAllFilters).toHaveBeenCalled()
  })
})
