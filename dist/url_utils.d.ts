declare type ParsedParam = string[] | string | undefined | null;
export declare const toArray: (obj: ParsedParam) => string[] | undefined;
export interface Facets {
    audience?: string[];
    certification?: string[];
    type?: string[];
    offered_by?: string[];
    topics?: string[];
    department_name?: string[];
    level?: string[];
    course_feature_tags?: string[];
    resource_type?: string[];
}
export interface SortParam {
    field: string;
    option: string;
}
export interface FacetsAndSort {
    activeFacets: Facets;
    sort: SortParam | null;
    ui: string | null;
}
declare type SearchParams = {
    text: string;
    activeFacets: Facets;
    sort: SortParam | null;
    ui: string | null;
};
export declare const deserializeSort: (sortParam: string) => SortParam | null;
export declare const deserializeUI: (uiParam: string) => string | null;
export declare const deserializeSearchParams: ({ search }: {
    search: string;
}) => SearchParams;
export declare const serializeSort: (sort: SortParam | null) => string | undefined;
export declare const serializeUI: (ui: string | null) => string | undefined;
export declare const serializeSearchParams: ({ text, activeFacets, sort, ui }: Partial<SearchParams>) => string;
export {};
