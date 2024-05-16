export interface Bucket {
  key: string;
  doc_count: number;
}

export type BucketWithLabel = Bucket & { label: string };

export type Aggregation = Bucket[];

export type Aggregations = Map<string, Bucket[]>;

export type GetSearchPageSize = (ui: string | null) => number;

export type FacetKey = keyof Facets;
export type BooleanFacetKey = keyof BooleanFacets;

export type SingleFacetOptions = {
  type?: "static" | "filterable";
  name: FacetKey;
  title: string;
  expandedOnLoad: boolean;
  labelFunction?: ((value: string) => string) | null;
};
export type BooleanFacetGroupOptions = {
  type: "group";
  key: "string";
  facets: {
    value: true | false;
    name: BooleanFacetKey;
    label: string;
  }[];
};

export type FacetManifest = (SingleFacetOptions | BooleanFacetGroupOptions)[];

export interface Facets {
  platform?: string[];
  offered_by?: string[];
  topic?: string[];
  department?: string[];
  level?: string[];
  course_feature?: string[];
  resource_type?: string[];
  content_feature_type?: string[];
  learning_format?: string[];
}

export interface BooleanFacets {
  certification?: boolean | null;
  professional?: boolean | null;
  free?: boolean | null;
}
