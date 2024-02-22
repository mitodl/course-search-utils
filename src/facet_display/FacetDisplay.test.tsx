import React from "react"
import { shallow } from "enzyme"

import {
  default as FacetDisplay,
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
    const onUpdateFacets = jest.fn()
    const clearAllFilters = jest.fn()
    const toggleFacet = jest.fn()

    const render = (props = {}) =>
      shallow(
        <FacetDisplay
          facetMap={facetMap}
          facetOptions={facetOptions}
          activeFacets={activeFacets}
          onUpdateFacets={onUpdateFacets}
          clearAllFilters={clearAllFilters}
          toggleFacet={toggleFacet}
          {...props}
        />
      )
    return { render, clearAllFilters }
  }

  test("renders a FacetDisplay with expected FilterableFacets", async () => {
    const { render } = setup()
    const wrapper = render()
    const facets = wrapper.children()
    expect(facets).toHaveLength(5)
    facets.slice(1, 5).map((facet, key) => {
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
