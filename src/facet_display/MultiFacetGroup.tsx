import React from "react"

import { SearchFacetItem } from "./SearchFacetItem"
import type {
  Bucket,
  MultiFacetGroupOptions,
  Facets,
  BooleanFacets
} from "./types"

interface Props {
  results: Record<string, Bucket[]>
  facets: MultiFacetGroupOptions["facets"]
  onUpdate: React.ChangeEventHandler<HTMLInputElement>
  activeFacets: Facets & BooleanFacets
}

/**
 * Used to display a specific set of facet name-value pairs.
 */
function MultiFacetGroup(props: Props) {
  const { results, facets, onUpdate, activeFacets } = props

  return (
    <div className="facets">
      {facets.map(facet => {
        const buckets = results[facet.name] ?? []
        const bucket = buckets.find(b => b.key === String(facet.value))
        if (!bucket) return
        const isChecked = activeFacets[facet.name] === facet.value
        return (
          <SearchFacetItem
            key={`${facet.name}-${facet.value}`}
            bucket={bucket}
            isChecked={isChecked}
            onUpdate={onUpdate}
            name={facet.name}
            displayKey={facet.label}
          />
        )
      })}
    </div>
  )
}

export default MultiFacetGroup
