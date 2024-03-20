import React, { useMemo, useContext, createContext } from "react"
import FilterableFacet from "./FilterableFacet"
import Facet from "./Facet"
import SearchFilter from "./SearchFilter"
import type { FacetManifest, Facets, Aggregation, Bucket } from "./types"
import { LEVELS, DEPARTMENTS } from "../constants"

export type BucketWithLabel = Bucket & { label: string }

interface FacetContextProps {
  facetMap: FacetManifest
  facetOptions: (group: string) => Aggregation | null
  activeFacets: Facets
  clearAllFilters: () => void
  onFacetChange: (name: string, value: string, isEnabled: boolean) => void
  children?: React.ReactNode
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

const alertNoProvider = () => {
  throw new Error("<FacetContext>...</FacetContext> not found.")
}

const FacetReactContext = createContext<FacetContextProps>({
  facetMap:        [],
  facetOptions:    alertNoProvider,
  activeFacets:    {},
  clearAllFilters: alertNoProvider,
  onFacetChange:   alertNoProvider
})

/**
 * Provides context for ActiveFacets and AvailableFacets.
 */
const FacetContext: React.FC<FacetContextProps> = ({
  facetMap,
  facetOptions,
  activeFacets,
  clearAllFilters,
  onFacetChange,
  children
}) => {
  const value = useMemo(
    () => ({
      facetMap,
      facetOptions,
      activeFacets,
      clearAllFilters,
      onFacetChange
    }),
    [facetMap, facetOptions, activeFacets, clearAllFilters, onFacetChange]
  )
  return (
    <FacetReactContext.Provider value={value}>
      {children}
    </FacetReactContext.Provider>
  )
}

/**
 * UI Display for what search facets are currently active.
 *
 * Must be used inside <FacetContext/>.
 */
const ActiveFacets: React.FC<{ className?: string }> = ({ className }) => {
  const { activeFacets, clearAllFilters, onFacetChange, facetMap } =
    useContext(FacetReactContext)
  const classNames = className ?
    `active-search-filters ${className}` :
    "active-search-filters"
  return (
    <div className={classNames}>
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
            clearFacet={() => onFacetChange(facetSetting.name, facet, false)}
            labelFunction={facetSetting.labelFunction || null}
          />
        ))
      )}
    </div>
  )
}

/**
 * UI Display for what search facets are available for use.
 *
 * Must be used inside <FacetContext/>.
 */
const AvailableFacets: React.FC = () => {
  const { facetMap, facetOptions, activeFacets, onFacetChange } =
    React.useContext(FacetReactContext)
  return (
    <>
      {facetMap.map((facetSetting, key) =>
        facetSetting.useFilterableFacet ? (
          <FilterableFacet
            key={key}
            results={resultsWithLabels(
              facetOptions(facetSetting.name) || [],
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
            key={key}
            title={facetSetting.title}
            name={facetSetting.name}
            results={resultsWithLabels(
              facetOptions(facetSetting.name) || [],
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

const FacetDisplayInner: React.FC<
  Omit<FacetContextProps, "children">
> = props => {
  return (
    <FacetContext {...props}>
      <ActiveFacets />
      <AvailableFacets />
    </FacetContext>
  )
}

const FacetDisplay = React.memo(FacetDisplayInner)

export default FacetDisplay
export { FacetContext, ActiveFacets, AvailableFacets }
