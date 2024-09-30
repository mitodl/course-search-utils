import React, { useMemo } from "react"
import FilterableFacet from "./FilterableFacet"
import Facet from "./Facet"
import FilterIndicator from "./FilterIndicator"
import type {
  FacetManifest,
  Facets,
  Aggregation,
  Bucket,
  BooleanFacets,
  BucketWithLabel
} from "./types"
import { LEVELS, DEPARTMENTS, CERTIFICATION_TYPES } from "../constants"
import MultiFacetGroup from "./MultiFacetGroup"

interface FacetDisplayProps {
  facetManifest: FacetManifest
  /**
   * Returns the aggregation options for a given group.
   *
   * If `activeFacets` includes a facet with no results, that facet will
   * automatically be included in the facet options.
   */
  facetOptions: Record<string, Bucket[]>
  activeFacets: Facets & BooleanFacets
  clearAllFilters: () => void
  onFacetChange: (name: string, value: string, isEnabled: boolean) => void
}

export const getCertificationTypeName = (certificationType: string): string => {
  if (certificationType in CERTIFICATION_TYPES) {
    return CERTIFICATION_TYPES[
      certificationType as keyof typeof CERTIFICATION_TYPES
    ]
  } else {
    return certificationType
  }
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
  bucketGroups: Record<string, Bucket[]>,
  params: Facets | BooleanFacets
) => {
  const copy = { ...bucketGroups }
  Object.entries(params).forEach(([groupKey, active]) => {
    if (!copy[groupKey]) {
      // params might include non-facets.
      return
    }
    if (active.length === 0) return
    const actives = Array.isArray(active) ? active : [active]
    const existing = new Set(copy[groupKey].map(bucket => bucket.key))
    copy[groupKey] = [...copy[groupKey]]
    actives.forEach(key => {
      if (!existing.has(key)) {
        copy[groupKey].push({ key: String(key), doc_count: 0 })
      }
    })
  })

  return copy
}

/**
 * Display available facets for search UI.
 *
 */
const AvailableFacets: React.FC<Omit<FacetDisplayProps, "clearAllFilters">> = ({
  facetManifest,
  facetOptions,
  activeFacets,
  onFacetChange
}) => {
  const allOpts = useMemo(
    () => includeActiveZerosInBuckets(facetOptions, activeFacets),
    [facetOptions, activeFacets]
  )
  return (
    <>
      {facetManifest.map(facetSettings => {
        if (!facetSettings.type || facetSettings.type === "static") {
          return (
            <Facet
              key={facetSettings.name}
              title={facetSettings.title}
              name={facetSettings.name}
              results={resultsWithLabels(
                allOpts[facetSettings.name] ?? [],
                facetSettings.labelFunction
              )}
              onUpdate={e =>
                onFacetChange(e.target.name, e.target.value, e.target.checked)
              }
              selected={activeFacets[facetSettings.name] || []}
              expandedOnLoad={facetSettings.expandedOnLoad}
              preserveItems={facetSettings.preserveItems}
            />
          )
        } else if (facetSettings.type === "filterable") {
          return (
            <FilterableFacet
              key={facetSettings.name}
              title={facetSettings.title}
              name={facetSettings.name}
              results={resultsWithLabels(
                allOpts[facetSettings.name] ?? [],
                facetSettings.labelFunction
              )}
              onUpdate={e =>
                onFacetChange(e.target.name, e.target.value, e.target.checked)
              }
              selected={activeFacets[facetSettings.name] || []}
              expandedOnLoad={facetSettings.expandedOnLoad}
              preserveItems={facetSettings.preserveItems}
            />
          )
        } else if (facetSettings.type === "group") {
          if (facetSettings.facets.length === 0) return null
          const { name, value } = facetSettings.facets[0]
          /**
           * Assumption: no two FacetManifest entry will have the same name and
           * value for first facet in a group.
           * (It would be silly to include the same name-value pair twice).
           */
          const key = `${name}-${value}`
          return (
            <MultiFacetGroup
              key={key}
              facets={facetSettings.facets}
              results={allOpts}
              onUpdate={e =>
                onFacetChange(e.target.name, e.target.value, e.target.checked)
              }
              activeFacets={activeFacets}
            />
          )
        }
        console.error("Unrecognized facet configuration.")
        return null
      })}
    </>
  )
}

type FacetValue = {
  name: string
  value: string | boolean
  label?: string
}

/**
 * Display available facets along with "clear all" button and buttons indicating
 * currently active facets.
 */
const FacetDisplay = React.memo(
  function FacetDisplay(props: FacetDisplayProps) {
    const {
      facetManifest,
      facetOptions,
      activeFacets,
      clearAllFilters,
      onFacetChange
    } = props

    const activeFacetValues = facetManifest.flatMap(
      (facetSetting): FacetValue[] => {
        if (facetSetting.type === "group") {
          return facetSetting.facets.filter(
            ({ name, value }) => activeFacets[name] === value
          )
        } else {
          return (activeFacets[facetSetting.name] ?? []).map(value => ({
            value,
            name:  facetSetting.name,
            label: facetSetting.labelFunction?.(value)
          }))
        }
      }
    )

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
          {activeFacetValues.map(({ name, value, label }) => (
            <FilterIndicator
              key={`${name}-${value}`}
              label={label || String(value)}
              onClick={() => onFacetChange(name, String(value), false)}
            />
          ))}
        </div>
        <AvailableFacets
          facetManifest={facetManifest}
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
