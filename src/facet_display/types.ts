export interface Bucket {
  key: string
  doc_count: number
}

export type Aggregation = Bucket[]

export type Aggregations = Map<string, Bucket[]>

export type GetSearchPageSize = (ui: string | null) => number

export type FacetKey = keyof Facets
export type BooleanFacetKey = keyof BooleanFacets

export type SingleFacetOptions = {
  name: FacetKey
  title: string
  useFilterableFacet: boolean
  expandedOnLoad: boolean
  labelFunction?: ((value: string) => string) | null
}

export type FacetManifest = SingleFacetOptions[]

export interface Facets {
  platform?: string[]
  offered_by?: string[]
  topic?: string[]
  department?: string[]
  level?: string[]
  course_feature?: string[]
  resource_type?: string[]
  content_feature_type?: string[]
}

export interface BooleanFacets {
  certification?: boolean | null
  professional?: boolean | null
}
