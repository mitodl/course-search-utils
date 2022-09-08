import React from "react";
import { History as HHistory } from "history";
import { Facets, SortParam } from "./url_utils";
export * from "./constants";
export * from "./url_utils";
export { buildSearchQuery, SearchQueryParams } from "./search";
export interface Bucket {
    key: string;
    doc_count: number;
}
export declare type Aggregation = {
    doc_count_error_upper_bound?: number;
    sum_other_doc_count?: number;
    buckets: Bucket[];
};
export declare type Aggregations = Map<string, Aggregation>;
export declare const mergeFacetResults: (...args: Aggregation[]) => Aggregation;
interface PreventableEvent {
    preventDefault?: () => void;
    type?: string;
}
interface CourseSearchResult {
    facetOptions: (group: string) => Aggregation | null;
    clearAllFilters: () => void;
    toggleFacet: (name: string, value: string, isEnbaled: boolean) => void;
    toggleFacets: (facets: [string, string, boolean][]) => void;
    onUpdateFacets: React.ChangeEventHandler<HTMLInputElement>;
    updateText: React.ChangeEventHandler<HTMLInputElement>;
    clearText: React.MouseEventHandler;
    updateSort: React.ChangeEventHandler;
    acceptSuggestion: (suggestion: string) => void;
    loadMore: () => void;
    incremental: boolean;
    text: string;
    sort: SortParam | null;
    activeFacets: Facets;
    onSubmit: (e: PreventableEvent) => void;
    from: number;
    updateUI: (newUI: string) => void;
    ui: string | null;
}
export declare const useCourseSearch: (runSearch: (text: string, searchFacets: Facets, nextFrom: number, sort?: SortParam | null | undefined, ui?: string | null | undefined) => Promise<void>, clearSearch: () => void, aggregations: Aggregations, loaded: boolean, searchPageSize: number, history?: HHistory) => CourseSearchResult;
