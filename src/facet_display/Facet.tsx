import React, { useState } from "react"
import { contains } from "ramda"

import { SearchFacetItem } from "./SearchFacetItem"
import { BucketWithLabel } from "./types"

const MAX_DISPLAY_COUNT = 5
const FACET_COLLAPSE_THRESHOLD = 15

interface Props {
  name: string
  title: string
  results: BucketWithLabel[] | null
  selected: string[]
  onUpdate: React.ChangeEventHandler<HTMLInputElement>
  expandedOnLoad: boolean
  preserveItems?: boolean
}

function SearchFacet(props: Props) {
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
  const [showAllFacets, setShowAllFacets] = useState(false)

  const titleLineIcon = showFacetList ? "expand_less" : "expand_more"

  return results && results.length === 0 ? null : (
    <div
      className={`facets base-facet${showFacetList ? " facets-expanded" : ""}`}
    >
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
      {showFacetList || preserveItems ? (
        <>
          {results ?
            results.map((bucket, i) =>
              showAllFacets ||
                i < MAX_DISPLAY_COUNT ||
                results.length < FACET_COLLAPSE_THRESHOLD ? (
                  <SearchFacetItem
                    key={`${name}-${bucket.key}`}
                    bucket={bucket}
                    isChecked={contains(bucket.key, selected || [])}
                    onUpdate={onUpdate}
                    name={name}
                    displayKey={bucket.label}
                  />
                ) : null
            ) :
            null}
          {results && results.length >= FACET_COLLAPSE_THRESHOLD ? (
            <button
              className="facet-more-less-button"
              onClick={() => setShowAllFacets(!showAllFacets)}
              type="button"
            >
              {showAllFacets ? "View less" : "View more"}
            </button>
          ) : null}
        </>
      ) : null}
    </div>
  )
}

export default SearchFacet
