import React, { useCallback } from "react"
import FilterableFacet from "./FilterableFacet"
import Facet from "./Facet"
import SearchFilter from "./SearchFilter"
import type { FacetManifest, Facets, Aggregation, Bucket } from "./types"
import { LEVELS, DEPARTMENTS } from "../constants"

export type BucketWithLabel = Bucket & { label: string }

interface FacetDisplayProps {
  facetMap: FacetManifest
  /**
   * Returns the aggregation options for a given group.
   *
   * If `activeFacets` includes a facet with no results, that facet will
   * automatically be included in the facet options.
   */
  facetOptions: (group: string) => Aggregation | null
  activeFacets: Facets
  clearAllFilters: () => void
  onFacetChange: (name: string, value: string, isEnabled: boolean) => void
}

export const getDepartmentName = (departmentId: string): string => {
  if (departmentId in DEPARTMENTS) {
    return DEPARTMENTS[departmentId as keyof typeof DEPARTMENTS]
  } else {
    return departmentId
  }
}

export const getLevelName = (levelValue: string): string => {
  if (levelValue in LEVELS) {
    return LEVELS[levelValue as keyof typeof LEVELS]
  } else {
    return levelValue
  }
}

const resultsWithLabels = (
  results: Aggregation,
  labelFunction: ((value: string) => string) | null | undefined
): BucketWithLabel[] => {
  const newResults = [] as BucketWithLabel[]
  results.map((singleFacet: Bucket) => {
    newResults.push({
      key:       singleFacet.key,
      doc_count: singleFacet.doc_count,
      label:     labelFunction ? labelFunction(singleFacet.key) : singleFacet.key
    })
  })

  return newResults
}

/**
 * Augment the facet buckets for `groupKey` with active values that have no
 * results.
 */
const includeActiveZerosInBuckets = (
  groupKey: string,
  buckets: Bucket[],
  params: Facets
) => {
  const opts = [...buckets]
  const active = params[groupKey as keyof Facets] ?? []
  const actives = Array.isArray(active) ? active : [active]
  actives.forEach(key => {
    if (!opts.find(o => o.key === key)) {
      opts.push({ key: String(key), doc_count: 0 })
    }
  })
  return opts
}

const AvailableFacets: React.FC<Omit<FacetDisplayProps, "clearAllFilters">> = ({
  facetMap,
  facetOptions,
  activeFacets,
  onFacetChange
}) => {
  const allFacetOptions: FacetDisplayProps["facetOptions"] = useCallback(
    name => {
      return includeActiveZerosInBuckets(
        name,
        facetOptions(name) ?? [],
        activeFacets
      )
    },
    [facetOptions, activeFacets]
  )
  return (
    <>
      {facetMap.map(facetSetting =>
        facetSetting.useFilterableFacet ? (
          <FilterableFacet
            key={facetSetting.name}
            results={resultsWithLabels(
              allFacetOptions(facetSetting.name) || [],
              facetSetting.labelFunction
            )}
            name={facetSetting.name}
            title={facetSetting.title}
            selected={activeFacets[facetSetting.name] || []}
            onUpdate={e =>
              onFacetChange(e.target.name, e.target.value, e.target.checked)
            }
            expandedOnLoad={facetSetting.expandedOnLoad}
          />
        ) : (
          <Facet
            key={facetSetting.name}
            title={facetSetting.title}
            name={facetSetting.name}
            results={resultsWithLabels(
              allFacetOptions(facetSetting.name) || [],
              facetSetting.labelFunction
            )}
            onUpdate={e =>
              onFacetChange(e.target.name, e.target.value, e.target.checked)
            }
            selected={activeFacets[facetSetting.name] || []}
            expandedOnLoad={facetSetting.expandedOnLoad}
          />
        )
      )}
    </>
  )
}

const FacetDisplay = React.memo(
  function FacetDisplay(props: FacetDisplayProps) {
    const {
      facetMap,
      facetOptions,
      activeFacets,
      clearAllFilters,
      onFacetChange
    } = props

    return (
      <>
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
                clearFacet={() =>
                  onFacetChange(facetSetting.name, facet, false)
                }
                labelFunction={facetSetting.labelFunction || null}
              />
            ))
          )}
        </div>
        <AvailableFacets
          facetMap={facetMap}
          facetOptions={facetOptions}
          activeFacets={activeFacets}
          onFacetChange={onFacetChange}
        />
      </>
    )
  },
  (prevProps, nextProps) => {
    return (
      prevProps.activeFacets === nextProps.activeFacets &&
      prevProps.clearAllFilters === nextProps.clearAllFilters &&
      prevProps.onFacetChange === nextProps.onFacetChange &&
      prevProps.facetOptions === nextProps.facetOptions
    )
  }
)

export default FacetDisplay
export { AvailableFacets }
export type { FacetDisplayProps }
