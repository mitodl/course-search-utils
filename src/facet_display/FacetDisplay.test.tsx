import React from "react"
import { render, screen, within } from "@testing-library/react"
import user from "@testing-library/user-event"
import invariant from "tiny-invariant"

import FacetDisplay, { getDepartmentName } from "./FacetDisplay"
import type { FacetDisplayProps } from "./FacetDisplay"
import { SingleFacetOptions, Facets, MultiFacetGroupOptions } from "./types"

const topicFacet: SingleFacetOptions = {
  name:           "topic",
  title:          "Topics",
  expandedOnLoad: true
}
const departmentFacet: SingleFacetOptions = {
  name:           "department",
  title:          "Departments",
  expandedOnLoad: true
}

const setupFacetDisplay = (
  props: Partial<FacetDisplayProps> &
    Pick<FacetDisplayProps, "facetMap" | "facetOptions">
) => {
  const activeFacets = {}
  const clearAllFilters = jest.fn()
  const onFacetChange = jest.fn()

  const view = render(
    <FacetDisplay
      activeFacets={activeFacets}
      clearAllFilters={clearAllFilters}
      onFacetChange={onFacetChange}
      {...props}
    />
  )
  const spies = {
    onFacetChange,
    clearAllFilters
  }
  const rerender = (newProps: Partial<FacetDisplayProps>) => {
    view.rerender(
      <FacetDisplay
        activeFacets={activeFacets}
        clearAllFilters={clearAllFilters}
        onFacetChange={onFacetChange}
        {...props}
        {...newProps}
      />
    )
  }
  return { view, spies, rerender }
}

describe.each([undefined, "static", "filterable"] as const)(
  "FacetDisplay component (type=%s)",
  type => {
    const defaultFacetMap = [
      { ...topicFacet, type },
      { ...departmentFacet, type }
    ]

    const defaultAggregations = {
      topic: [
        { key: "Cats", doc_count: 10 },
        { key: "Dogs", doc_count: 20 },
        { key: "Donkeys", doc_count: 30 }
      ],
      department: [
        { key: "1", doc_count: 100 },
        { key: "2", doc_count: 200 }
      ]
    }
    const setup = (props?: Partial<FacetDisplayProps>) =>
      setupFacetDisplay({
        facetMap:     defaultFacetMap,
        facetOptions: defaultAggregations,
        ...props
      })

    test("Renders facets with expected titles", async () => {
      setup()
      screen.getByRole("button", { name: defaultFacetMap[0].title })
      screen.getByRole("button", { name: defaultFacetMap[1].title })
    })

    test.each([{ expandedOnLoad: false }, { expandedOnLoad: true }])(
      "Initially expanded based on expandedOnLoad ($expandedOnLoad)",
      ({ expandedOnLoad }) => {
        const facetMap = [{ ...defaultFacetMap[0], expandedOnLoad }]
        setup({ facetMap })
        screen.getByRole("button", {
          name:     facetMap[0].title,
          expanded: expandedOnLoad
        })
        const checkboxes = screen.queryAllByRole("checkbox")
        expect(checkboxes).toHaveLength(expandedOnLoad ? 3 : 0)
      }
    )

    test("Clicking facet title toggles expanded state", async () => {
      setup({ facetMap: [defaultFacetMap[0]] })
      const button = screen.getByRole("button", {
        name: defaultFacetMap[0].title
      })
      const checkboxCount = () => screen.queryAllByRole("checkbox").length
      await user.click(button)
      expect(button.getAttribute("aria-expanded")).toBe("false")
      expect(checkboxCount()).toBe(0)
      await user.click(button)
      expect(button.getAttribute("aria-expanded")).toBe("true")
      expect(checkboxCount()).toBe(3)
    })

    test("Shows filters which are active", async () => {
      const activeFacets: Facets = {
        topic:      ["Cats", "Dogs"],
        department: ["1"]
      }
      const { spies } = setup({ activeFacets })
      const activeDisplay = document.querySelector(".active-search-filters")
      if (!(activeDisplay instanceof HTMLElement)) {
        throw new Error("Expected activeDisplay to exist")
      }
      within(activeDisplay).getByText("Cats")
      within(activeDisplay).getByText("Dogs")
      within(activeDisplay).getByText("1")

      await user.click(screen.getByRole("button", { name: "Clear All" }))
      expect(spies.clearAllFilters).toHaveBeenCalled()
      await user.click(
        screen.getAllByRole("button", { name: "clear filter" })[0]
      )
      expect(spies.onFacetChange).toHaveBeenCalledWith("topic", "Cats", false)
    })

    test("Clicking a facet checkbox calls onFacetChange", async () => {
      const { spies } = setup({
        facetMap: [
          {
            ...defaultFacetMap[0],
            expandedOnLoad: true
          }
        ]
      })
      await user.click(screen.getByRole("checkbox", { name: "Cats" }))
      expect(spies.onFacetChange).toHaveBeenCalledWith("topic", "Cats", true)
    })

    test("it accepts a label function to convert codes to names", () => {
      setup({
        facetMap: [
          {
            ...defaultFacetMap[1],
            labelFunction:  getDepartmentName,
            expandedOnLoad: true
          }
        ]
      })
      screen.getByRole("checkbox", {
        name: "Civil and Environmental Engineering"
      })
      screen.getByRole("checkbox", {
        name: "Mechanical Engineering"
      })
    })

    test("Automically includes a zero-count option for active facets with no matches", () => {
      const activeFacets: Facets = {
        topic: ["Cats"]
      }
      const { rerender } = setup({
        activeFacets,
        facetMap: [
          {
            ...defaultFacetMap[0],
            expandedOnLoad: true
          }
        ]
      })
      const checkboxCount = () => screen.getAllByRole("checkbox").length
      expect(checkboxCount()).toBe(3)
      screen.getByRole("checkbox", { name: "Cats" })
      screen.getByRole("checkbox", { name: "Dogs" })
      screen.getByRole("checkbox", { name: "Donkeys" })
      rerender({
        activeFacets: {
          topic: ["Cats", "Dragons"]
        }
      })
      expect(checkboxCount()).toBe(4)
      screen.getByRole("checkbox", { name: "Dragons" })
    })

    test("Displays filterable facet if type='filterable'", async () => {
      setup({ facetMap: [{ ...defaultFacetMap[0] }] })
      const textbox = screen.queryByRole("textbox", { name: "Search Topics" })
      expect(!!textbox).toBe(type === "filterable")
      if (type !== "filterable") return
      expect(screen.getAllByRole("checkbox")).toHaveLength(3)
      invariant(textbox, "Expected textbox to exist")
      await user.type(textbox, "D")
      const box0 = screen.queryByRole("checkbox", { name: "Cats" })
      const box1 = screen.queryByRole("checkbox", { name: "Dogs" })
      const box2 = screen.queryByRole("checkbox", { name: "Donkeys" })
      expect(!!box0).toBe(false)
      expect(!!box1).toBe(true)
      expect(!!box2).toBe(true)
    })
  }
)

describe("FacetDisplay with type='group' facet", () => {
  const multiFacetGroup: MultiFacetGroupOptions = {
    type:   "group",
    facets: [
      { value: true, name: "certification", label: "With Certificate" },
      { value: false, name: "free", label: "Free Stuff" } as const
    ]
  }
  const defaultFacetMap = [multiFacetGroup]

  const defaultAggregations = {
    certification: [
      { key: "false", doc_count: 10 },
      { key: "true", doc_count: 20 }
    ],
    free: [
      { key: "false", doc_count: 30 },
      { key: "true", doc_count: 40 }
    ]
  }

  const setup = (props?: Partial<FacetDisplayProps>) =>
    setupFacetDisplay({
      facetMap:     defaultFacetMap,
      facetOptions: defaultAggregations,
      ...props
    })

  test("Displays correct number of checkboxes with appropriate counts", () => {
    setup()
    const checkboxes = screen.getAllByRole("checkbox")
    const withCerts = screen.getByRole("checkbox", {
      name: "With Certificate"
    })
    const free = screen.getByRole("checkbox", { name: "Free Stuff" })
    expect(checkboxes).toEqual([withCerts, free])

    const labels = document.querySelectorAll(".facet-label")
    expect(labels[0].textContent).toBe("With Certificate20")
    expect(labels[1].textContent).toBe("Free Stuff30")
  })

  test("Clicking a checkbox calls onFacetChange", async () => {
    const { spies } = setup()
    await user.click(screen.getByRole("checkbox", { name: "With Certificate" }))
    expect(spies.onFacetChange).toHaveBeenCalledWith(
      "certification",
      "true",
      true
    )

    await user.click(screen.getByRole("checkbox", { name: "Free Stuff" }))
    expect(spies.onFacetChange).toHaveBeenCalledWith("free", "false", true)
  })
})
