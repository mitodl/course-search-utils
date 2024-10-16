import React, { useState, useCallback, useMemo } from "react"
import Fuse from "fuse.js"
import {
  RiArrowDownSLine,
  RiArrowUpSLine,
  RiSearchLine,
  RiCloseLine
} from "@remixicon/react"
import { SearchFacetItem } from "./SearchFacetItem"
import { BucketWithLabel } from "./types"

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
  preserveItems?: boolean
}

function FilterableFacet(props: Props) {
  const {
    name,
    title,
    results,
    selected,
    onUpdate,
    expandedOnLoad,
    preserveItems
  } = props
  const [showFacetList, setShowFacetList] = useState(expandedOnLoad)
  const [filterText, setFilterText] = useState("")
  const [transitioning, setTransitioning] = useState(false)

  const handleFilterInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      e.preventDefault()
      const filterText = e.target.value || ""
      setFilterText(filterText)
    },
    []
  )

  const filteredResults = useMemo(() => {
    return filterText ?
      runSearch(
        new Fuse(results || [], { keys: ["key", "label"], threshold: 0.4 }),
        filterText
      ) :
      results
  }, [filterText, results])

  const buckets = (filteredResults || results) ?? []
  return results && results.length === 0 ? null : (
    <div
      className={`facets filterable-facet${
        showFacetList ?
          " facets-expanded" :
          transitioning ?
            " facets-transitioning" :
            ""
      }`}
      onTransitionEnd={() => setTransitioning(false)}
    >
      <button
        className="filter-section-button"
        type="button"
        aria-expanded={showFacetList ? "true" : "false"}
        onClick={() => {
          setTransitioning(true)
          setShowFacetList(!showFacetList)
        }}
      >
        {title}
        <i aria-hidden="true">
          {showFacetList ? <RiArrowUpSLine /> : <RiArrowDownSLine />}
        </i>
      </button>
      {showFacetList || preserveItems ? (
        <>
          <div className="input-wrapper">
            <input
              className="facet-filter"
              type="text"
              onChange={handleFilterInput}
              value={filterText}
              placeholder={`Search ${title || ""}`}
              aria-label={`Search ${title || ""}`}
            />
            {filterText === "" ? (
              <i
                className="input-postfix-icon"
                aria-hidden="true"
                aria-label="search"
              >
                <RiSearchLine />
              </i>
            ) : (
              <button
                className="input-postfix-button"
                type="button"
                onClick={() => setFilterText("")}
                aria-label="clear search text"
              >
                <RiCloseLine />
              </button>
            )}
          </div>
          <div className="facet-list">
            {buckets.map(bucket => (
              <SearchFacetItem
                key={`${name}-${bucket.key}`}
                bucket={bucket}
                isChecked={(selected || []).includes(bucket.key)}
                onUpdate={onUpdate}
                name={name}
                displayKey={bucket.label}
              />
            ))}
          </div>
        </>
      ) : null}
    </div>
  )
}

export default FilterableFacet
