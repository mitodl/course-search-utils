export interface Bucket {
  key: string
  doc_count: number
}

export type BucketWithLabel = Bucket & { label: string }

export type Aggregation = Bucket[]

export type Aggregations = Map<string, Bucket[]>

export type GetSearchPageSize = (ui: string | null) => number

export type FacetKey = keyof Facets
export type BooleanFacetKey = keyof BooleanFacets

/**
 * Configure a single facet with multiple values. For example, facet name
 * "department" with values "1", "2", ... "21".
 */
export type SingleFacetOptions = {
  type?: "static" | "filterable"
  name: FacetKey
  title: string
  expandedOnLoad: boolean
  preserveItems?: boolean
  labelFunction?: ((value: string) => string) | null
}

/**
 * Configure a group of facets with multiple names and specific values. For
 * example,
 *    "Certification" with value `true`
 *    "Professional" with value `false`
 */
export type MultiFacetGroupOptions = {
  type: "group"
  facets: {
    value: boolean | string
    name: BooleanFacetKey
    label: string
  }[]
}

export type FacetManifest = (SingleFacetOptions | MultiFacetGroupOptions)[]

export interface Facets {
  platform?: string[]
  offered_by?: string[]
  topic?: string[]
  department?: string[]
  level?: string[]
  course_feature?: string[]
  resource_type?: string[]
  content_feature_type?: string[]
  learning_format?: string[]
  certification_type?: string[]
  resource_category?: string[]
}

export interface BooleanFacets {
  certification?: boolean | null
  professional?: boolean | null
  free?: boolean | null
}
