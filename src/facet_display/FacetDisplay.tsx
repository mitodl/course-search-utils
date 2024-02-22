import React from "react"
import FilterableFacet from "./FilterableFacet"
import Facet from "./Facet"
import SearchFilter from "./SearchFilter"
import type { FacetManifest, Facets, Aggregation, Bucket } from "./types"
import { LEVELS, DEPARTMENTS } from "../constants"

export type BucketWithLabel = Bucket & { label: string | null }

interface Props {
  facetMap: FacetManifest
  facetOptions: (group: string) => Aggregation | null
  activeFacets: Facets
  onUpdateFacets: React.ChangeEventHandler<HTMLInputElement>
  clearAllFilters: () => void
  toggleFacet: (name: string, value: string, isEnabled: boolean) => void
}

export const getDepartmentName = (departmentId: string): string | null => {
  if (departmentId in DEPARTMENTS) {
    return DEPARTMENTS[departmentId as keyof typeof DEPARTMENTS]
  } else {
    return departmentId
  }
}

export const getLevelName = (levelValue: string): string | null => {
  if (levelValue in LEVELS) {
    return LEVELS[levelValue as keyof typeof LEVELS]
  } else {
    return levelValue
  }
}

const resultsWithLabels = (
  results: Aggregation | null,
  labelFunction: ((value: string) => string | null) | null | undefined
): BucketWithLabel[] => {
  const newResults = [] as BucketWithLabel[]
  ;(results || []).map((singleFacet: Bucket) => {
    if (labelFunction) {
      newResults.push({
        key:       singleFacet.key,
        doc_count: singleFacet.doc_count,
        label:     labelFunction(singleFacet.key)
      })
    } else {
      newResults.push({
        key:       singleFacet.key,
        doc_count: singleFacet.doc_count,
        label:     null
      })
    }
  })

  return newResults
}

const FacetDisplay = React.memo(
  function FacetDisplay(props: Props) {
    const {
      facetMap,
      facetOptions,
      activeFacets,
      onUpdateFacets,
      clearAllFilters,
      toggleFacet
    } = props

    return (
      <React.Fragment>
        <div className="active-search-filters">
          <div className="filter-section-main-title">
            Filters
            <button
              className="clear-all-filters-button"
              type="button"
              onClick={clearAllFilters}
            >
              Clear All
            </button>
          </div>
          {facetMap.map(facetSetting =>
            (activeFacets[facetSetting.name] || []).map((facet, i) => (
              <SearchFilter
                key={i}
                value={facet}
                clearFacet={() => toggleFacet(facetSetting.name, facet, false)}
                labelFunction={facetSetting.labelFunction || null}
              />
            ))
          )}
        </div>
        {facetMap.map((facetSetting, key) =>
          facetSetting.useFilterableFacet ? (
            <FilterableFacet
              key={key}
              results={resultsWithLabels(
                facetOptions(facetSetting.name),
                facetSetting.labelFunction
              )}
              name={facetSetting.name}
              title={facetSetting.title}
              currentlySelected={activeFacets[facetSetting.name] || []}
              onUpdate={onUpdateFacets}
              expandedOnLoad={facetSetting.expandedOnLoad}
            />
          ) : (
            <Facet
              key={key}
              title={facetSetting.title}
              name={facetSetting.name}
              results={resultsWithLabels(
                facetOptions(facetSetting.name),
                facetSetting.labelFunction
              )}
              onUpdate={onUpdateFacets}
              currentlySelected={activeFacets[facetSetting.name] || []}
              expandedOnLoad={facetSetting.expandedOnLoad}
            />
          )
        )}
      </React.Fragment>
    )
  },
  (prevProps, nextProps) => {
    return (
      prevProps.activeFacets === nextProps.activeFacets &&
      prevProps.clearAllFilters === nextProps.clearAllFilters &&
      prevProps.toggleFacet === nextProps.toggleFacet &&
      prevProps.facetOptions === nextProps.facetOptions &&
      prevProps.onUpdateFacets === nextProps.onUpdateFacets
    )
  }
)

export default FacetDisplay
