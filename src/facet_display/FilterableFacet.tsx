import React, { useState, useCallback, useMemo } from "react"
import { contains } from "ramda"
import Fuse from "fuse.js"

import { SearchFacetItem } from "./SearchFacetItem"
import { BucketWithLabel } from "./FacetDisplay"

// the `.search method returns records like { item, refindex }
// where item is the facet and refIndex is it's index in the original
// array. this helper just pulls out only the facets themselves
const runSearch = (searcher: Fuse<BucketWithLabel>, text: string) =>
  searcher.search(text).map(({ item }) => item)

interface Props {
  name: string
  title: string
  results: BucketWithLabel[] | null
  selected: string[]
  onUpdate: React.ChangeEventHandler<HTMLInputElement>
  expandedOnLoad: boolean
}

function FilterableFacet(props: Props) {
  const { name, title, results, selected, onUpdate, expandedOnLoad } = props
  const [showFacetList, setShowFacetList] = useState(expandedOnLoad)

  const [filterText, setFilterText] = useState("")

  const handleFilterInput = useCallback(e => {
    e.preventDefault()
    const filterText = e.target.value || ""
    setFilterText(filterText)
  }, [])

  const titleLineIcon = showFacetList ? "arrow_drop_down" : "arrow_right"

  const filteredResults = useMemo(() => {
    return filterText ?
      runSearch(
        new Fuse(results || [], { keys: ["key", "label"], threshold: 0.4 }),
        filterText
      ) :
      results
  }, [filterText, results])

  const facets = (filteredResults || results) ?? []
  return results && results.length === 0 ? null : (
    <div className="facets filterable-facet">
      <button
        className="filter-section-button"
        type="button"
        aria-expanded={showFacetList ? "true" : "false"}
        onClick={() => setShowFacetList(!showFacetList)}
      >
        {title}
        <i className={`material-icons ${titleLineIcon}`} aria-hidden="true">
          {titleLineIcon}
        </i>
      </button>
      {showFacetList ? (
        <>
          <div className="input-wrapper">
            <input
              className="facet-filter"
              type="text"
              onChange={handleFilterInput}
              value={filterText}
              placeholder={`Search ${title || ""}`}
            />
            {filterText === "" ? (
              <i
                className="input-postfix-icon material-icons search-icon"
                aria-hidden="true"
              >
                search
              </i>
            ) : (
              <button
                className="input-postfix-button"
                type="button"
                onClick={() => setFilterText("")}
                aria-label="clear search text"
              >
                <span className="material-icons" aria-hidden="true">
                  clear
                </span>
              </button>
            )}
          </div>
          <div className="facet-list">
            {facets.map(facet => (
              <SearchFacetItem
                key={`${name}-${facet.key}`}
                facet={facet}
                isChecked={contains(facet.key, selected || [])}
                onUpdate={onUpdate}
                name={name}
                displayKey={facet.label}
              />
            ))}
          </div>
        </>
      ) : null}
    </div>
  )
}

export default FilterableFacet
