// import React from "react"
// import { render, screen, within } from "@testing-library/react"
// import user from "@testing-library/user-event"

// import FacetDisplay, { getDepartmentName } from "./FacetDisplay"
// import type { FacetDisplayProps } from "./FacetDisplay"
// import { Bucket, FacetManifest, Facets } from "./types"

// describe("FacetDisplay component", () => {
//   const defaultFacetMap: FacetManifest = [
//     {
//       name:               "topic",
//       title:              "Topics",
//       useFilterableFacet: false,
//       expandedOnLoad:     true
//     },
//     {
//       name:               "department",
//       title:              "Departments",
//       useFilterableFacet: false,
//       expandedOnLoad:     true
//     }
//   ]

//   const defaultAggregations = {
//     topic: [
//       { key: "Cats", doc_count: 10 },
//       { key: "Dogs", doc_count: 20 },
//       { key: "Monkeys", doc_count: 30 }
//     ],
//     department: [
//       { key: "1", doc_count: 100 },
//       { key: "2", doc_count: 200 }
//     ]
//   }

//   const setup = ({
//     props,
//     aggregations = defaultAggregations
//   }: {
//     props?: Partial<FacetDisplayProps>
//     aggregations?: Record<string, Bucket[]>
//   } = {}) => {
//     const activeFacets = {}
//     const facetOptions = (group: string) => aggregations[group] ?? []
//     const clearAllFilters = jest.fn()
//     const onFacetChange = jest.fn()

//     const view = render(
//       <FacetDisplay
//         facetMap={defaultFacetMap}
//         facetOptions={facetOptions}
//         activeFacets={activeFacets}
//         clearAllFilters={clearAllFilters}
//         onFacetChange={onFacetChange}
//         {...props}
//       />
//     )
//     const spies = {
//       onFacetChange,
//       clearAllFilters
//     }
//     const rerender = (newProps: Partial<FacetDisplayProps>) => {
//       view.rerender(
//         <FacetDisplay
//           facetMap={defaultFacetMap}
//           facetOptions={facetOptions}
//           activeFacets={activeFacets}
//           clearAllFilters={clearAllFilters}
//           onFacetChange={onFacetChange}
//           {...props}
//           {...newProps}
//         />
//       )
//     }
//     return { view, spies, rerender }
//   }

//   test("Renders facets with expected titles", async () => {
//     setup()
//     screen.getByRole("button", { name: defaultFacetMap[0].title })
//     screen.getByRole("button", { name: defaultFacetMap[1].title })
//   })

//   test.each([{ expandedOnLoad: false }, { expandedOnLoad: true }])(
//     "Initially expanded based on expandedOnLoad ($expandedOnLoad)",
//     ({ expandedOnLoad }) => {
//       const facetMap = [{ ...defaultFacetMap[0], expandedOnLoad }]
//       setup({
//         props: { facetMap }
//       })
//       screen.getByRole("button", {
//         name:     facetMap[0].title,
//         expanded: expandedOnLoad
//       })
//       const checkboxes = screen.queryAllByRole("checkbox")
//       expect(checkboxes).toHaveLength(expandedOnLoad ? 3 : 0)
//     }
//   )

//   test("Clicking facet title toggles expanded state", async () => {
//     setup({
//       props: { facetMap: [defaultFacetMap[0]] }
//     })
//     const button = screen.getByRole("button", {
//       name: defaultFacetMap[0].title
//     })
//     const checkboxCount = () => screen.queryAllByRole("checkbox").length
//     await user.click(button)
//     expect(button.getAttribute("aria-expanded")).toBe("false")
//     expect(checkboxCount()).toBe(0)
//     await user.click(button)
//     expect(button.getAttribute("aria-expanded")).toBe("true")
//     expect(checkboxCount()).toBe(3)
//   })

//   test("Shows filters which are active", async () => {
//     const activeFacets: Facets = {
//       topic:      ["Cats", "Dogs"],
//       department: ["1"]
//     }
//     const { spies } = setup({ props: { activeFacets } })
//     const activeDisplay = document.querySelector(".active-search-filters")
//     if (!(activeDisplay instanceof HTMLElement)) {
//       throw new Error("Expected activeDisplay to exist")
//     }
//     within(activeDisplay).getByText("Cats")
//     within(activeDisplay).getByText("Dogs")
//     within(activeDisplay).getByText("1")

//     await user.click(screen.getByRole("button", { name: "Clear All" }))
//     expect(spies.clearAllFilters).toHaveBeenCalled()
//     await user.click(screen.getAllByRole("button", { name: "clear filter" })[0])
//     expect(spies.onFacetChange).toHaveBeenCalledWith("topic", "Cats", false)
//   })

//   test("Clicking a facet checkbox calls onFacetChange", async () => {
//     const { spies } = setup({
//       props: {
//         facetMap: [
//           {
//             ...defaultFacetMap[0],
//             expandedOnLoad: true
//           }
//         ]
//       }
//     })
//     await user.click(screen.getByRole("checkbox", { name: "Cats" }))
//     expect(spies.onFacetChange).toHaveBeenCalledWith("topic", "Cats", true)
//   })

//   test("it accepts a label function to convert codes to names", () => {
//     setup({
//       props: {
//         facetMap: [
//           {
//             ...defaultFacetMap[1],
//             labelFunction:  getDepartmentName,
//             expandedOnLoad: true
//           }
//         ]
//       }
//     })
//     screen.getByRole("checkbox", {
//       name: "Civil and Environmental Engineering"
//     })
//     screen.getByRole("checkbox", {
//       name: "Mechanical Engineering"
//     })
//   })

//   test("Automically includes a zero-count option for active facets with no matches", () => {
//     const activeFacets: Facets = {
//       topic: ["Cats"]
//     }
//     const { rerender } = setup({
//       props: {
//         activeFacets,
//         facetMap: [
//           {
//             ...defaultFacetMap[0],
//             expandedOnLoad: true
//           }
//         ]
//       }
//     })
//     const checkboxCount = () => screen.getAllByRole("checkbox").length
//     expect(checkboxCount()).toBe(3)
//     screen.getByRole("checkbox", { name: "Cats" })
//     screen.getByRole("checkbox", { name: "Dogs" })
//     screen.getByRole("checkbox", { name: "Monkeys" })
//     rerender({
//       activeFacets: {
//         topic: ["Cats", "Dragons"]
//       }
//     })
//     expect(checkboxCount()).toBe(4)
//     screen.getByRole("checkbox", { name: "Dragons" })
//   })
// })
