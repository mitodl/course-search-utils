import { Bodybuilder } from "bodybuilder";
import { LearningResourceType } from "./constants";
import { SortParam, Facets } from "./url_utils";
export declare const LEARN_SUGGEST_FIELDS: string[];
export declare const RESOURCE_QUERY_NESTED_FIELDS: string[];
export declare const RESOURCEFILE_QUERY_FIELDS: string[];
export declare const SEARCH_FILTER_POST = "post";
export declare const SEARCH_FILTER_COMMENT = "comment";
export declare const SEARCH_FILTER_PROFILE = "profile";
export declare const channelField: (type: LearningResourceType) => string;
export declare const searchFields: (type: LearningResourceType) => string[];
export declare const isDoubleQuoted: (str: string | null | undefined) => boolean;
export declare const normalizeDoubleQuotes: (text: string | null | undefined) => string;
export declare const emptyOrNil: import("ramda").Pred;
/**
  Interface for parameters for generating a search query. Supported fields are text, from, size, sort, channelName
  and activeFacets. activeFacets supports audience, certification, type, offered_by, topics, department_name, level,
  course_feature_tags and resource_type as nested params
*/
export interface SearchQueryParams {
    text?: string;
    from?: number;
    size?: number;
    sort?: SortParam;
    activeFacets?: Facets;
    channelName?: string;
}
/**
 Generates an elasticsearch query object with nested string parameters from inputs of type SearchQueryParams.
*/
export declare const buildSearchQuery: ({ text, from, size, sort, activeFacets, channelName }: SearchQueryParams) => Record<string, any>;
export declare const buildChannelQuery: (builder: Bodybuilder, text: string | null, types: Array<string>, channelName: string | undefined) => Record<string, any>;
export declare const buildLearnQuery: (builder: Bodybuilder, text: string | null, types: Array<string>, facets?: Facets | undefined) => Record<string, any>;
export declare const buildFacetSubQuery: (facets: Facets | undefined, builder: Bodybuilder, objectType?: string | undefined) => any[];
export declare const buildOrQuery: (builder: Bodybuilder, searchType: string, textQuery: Record<string, any> | undefined, extraClauses: any[]) => Bodybuilder;
export declare const buildSuggestQuery: (text: string, suggestFields: string[]) => Record<string, any>;
export declare const buildDefaultSort: () => Array<any>;
