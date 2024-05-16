import React, { useMemo } from "react";
import FilterableFacet from "./FilterableFacet";
import Facet from "./Facet";
import SearchFilter from "./SearchFilter";
import type {
  FacetManifest,
  Facets,
  Aggregation,
  Bucket,
  BooleanFacets,
  BucketWithLabel,
} from "./types";
import { LEVELS, DEPARTMENTS } from "../constants";
import BooleanFacetGroup from "./BooleanFacetGroup";

interface FacetDisplayProps {
  facetMap: FacetManifest;
  /**
   * Returns the aggregation options for a given group.
   *
   * If `activeFacets` includes a facet with no results, that facet will
   * automatically be included in the facet options.
   */
  facetOptions: Record<string, Bucket[]>;
  activeFacets: Facets & BooleanFacets;
  clearAllFilters: () => void;
  onFacetChange: (name: string, value: string, isEnabled: boolean) => void;
}

export const getDepartmentName = (departmentId: string): string => {
  if (departmentId in DEPARTMENTS) {
    return DEPARTMENTS[departmentId as keyof typeof DEPARTMENTS];
  } else {
    return departmentId;
  }
};

export const getLevelName = (levelValue: string): string => {
  if (levelValue in LEVELS) {
    return LEVELS[levelValue as keyof typeof LEVELS];
  } else {
    return levelValue;
  }
};

const resultsWithLabels = (
  results: Aggregation,
  labelFunction: ((value: string) => string) | null | undefined
): BucketWithLabel[] => {
  const newResults = [] as BucketWithLabel[];
  results.map((singleFacet: Bucket) => {
    newResults.push({
      key: singleFacet.key,
      doc_count: singleFacet.doc_count,
      label: labelFunction ? labelFunction(singleFacet.key) : singleFacet.key,
    });
  });

  return newResults;
};

/**
 * Augment the facet buckets for `groupKey` with active values that have no
 * results.
 */
const includeActiveZerosInBuckets = (
  bucketGroups: Record<string, Bucket[]>,
  params: Facets | BooleanFacets
) => {
  const copy = { ...bucketGroups };
  Object.entries(params).forEach(([groupKey, active]) => {
    if (!copy[groupKey]) {
      // params might include non-facets.
      return;
    }
    if (active.length === 0) return;
    const actives = Array.isArray(active) ? active : [active];
    const existing = new Set(copy[groupKey].map((bucket) => bucket.key));
    actives.forEach((key) => {
      if (!existing.has(key)) {
        copy[groupKey].push({ key, doc_count: 0 });
      }
    });
  });

  return copy;
};

const AvailableFacets: React.FC<Omit<FacetDisplayProps, "clearAllFilters">> = ({
  facetMap,
  facetOptions,
  activeFacets,
  onFacetChange,
}) => {
  const allOpts = useMemo(
    () => includeActiveZerosInBuckets(facetOptions, activeFacets),
    [facetOptions, activeFacets]
  );
  return (
    <>
      {facetMap.map((facetSettings) => {
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
              onUpdate={(e) =>
                onFacetChange(e.target.name, e.target.value, e.target.checked)
              }
              selected={activeFacets[facetSettings.name] || []}
              expandedOnLoad={facetSettings.expandedOnLoad}
            />
          );
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
              onUpdate={(e) =>
                onFacetChange(e.target.name, e.target.value, e.target.checked)
              }
              selected={activeFacets[facetSettings.name] || []}
              expandedOnLoad={facetSettings.expandedOnLoad}
            />
          );
        } else if (facetSettings.type === "group") {
          return (
            <BooleanFacetGroup
              key={facetSettings.key}
              facets={facetSettings.facets}
              results={allOpts}
              onUpdate={(e) =>
                onFacetChange(e.target.name, e.target.value, e.target.checked)
              }
              activeFacets={activeFacets}
            />
          );
        }
        throw new Error("Unexpected");
      })}
    </>
  );
};

type FacetValue = {
  name: string;
  value: string | boolean;
  label?: string;
};

const FacetDisplay = React.memo(
  function FacetDisplay(props: FacetDisplayProps) {
    const {
      facetMap,
      facetOptions,
      activeFacets,
      clearAllFilters,
      onFacetChange,
    } = props;

    const activeFacetValues = facetMap.flatMap((facetSetting): FacetValue[] => {
      if (facetSetting.type === "group") {
        return facetSetting.facets;
      } else {
        return (activeFacets[facetSetting.name] ?? []).map((value) => ({
          value,
          name: facetSetting.name,
          label: facetSetting.labelFunction?.(value),
        }));
      }
    });

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
            <SearchFilter
              key={`${name}-${value}`}
              value={String(value)}
              label={label}
              clearFacet={() => onFacetChange(name, String(value), false)}
            />
          ))}
        </div>
        <AvailableFacets
          facetMap={facetMap}
          facetOptions={facetOptions}
          activeFacets={activeFacets}
          onFacetChange={onFacetChange}
        />
      </>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.activeFacets === nextProps.activeFacets &&
      prevProps.clearAllFilters === nextProps.clearAllFilters &&
      prevProps.onFacetChange === nextProps.onFacetChange &&
      prevProps.facetOptions === nextProps.facetOptions
    );
  }
);

export default FacetDisplay;
export { AvailableFacets };
export type { FacetDisplayProps };
