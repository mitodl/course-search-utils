import React, { useState } from "react"
import { contains } from "ramda"

import { SearchFacetItem } from "./SearchFacetItem"
import { BucketWithLabel } from "./FacetDisplay"

const MAX_DISPLAY_COUNT = 5
const FACET_COLLAPSE_THRESHOLD = 15

interface Props {
  name: string
  title: string
  results: BucketWithLabel[] | null
  selected: string[]
  onUpdate: React.ChangeEventHandler<HTMLInputElement>
  expandedOnLoad: boolean
}

function SearchFacet(props: Props) {
  const { name, title, results, selected, onUpdate, expandedOnLoad } = props

  const [showFacetList, setShowFacetList] = useState(expandedOnLoad)
  const [showAllFacets, setShowAllFacets] = useState(false)

  const titleLineIcon = showFacetList ? "arrow_drop_down" : "arrow_right"

  return results && results.length === 0 ? null : (
    <div className="facets">
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
          {results ?
            results.map((facet, i) =>
              showAllFacets ||
                i < MAX_DISPLAY_COUNT ||
                results.length < FACET_COLLAPSE_THRESHOLD ? (
                  <SearchFacetItem
                    key={i}
                    facet={facet}
                    isChecked={contains(facet.key, selected || [])}
                    onUpdate={onUpdate}
                    name={name}
                    displayKey={facet.label}
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
