import { v1 } from "@mitodl/mit-learn-api-axios"

const {
  ResourceTypeEnum,
  LearningResourcesSearchRetrieveDepartmentEnum: DepartmentEnum,
  LearningResourcesSearchRetrieveLevelEnum: LevelEnum,
  LearningResourcesSearchRetrievePlatformEnum: PlatformEnum,
  LearningResourcesSearchRetrieveOfferedByEnum: OfferedByEnum,
  LearningResourcesSearchRetrieveSortbyEnum: SortByEnum,
  LearningResourcesSearchRetrieveAggregationsEnum: AggregationsEnum,
  LearningResourcesSearchRetrieveDeliveryEnum: DeliveryEnum,
  LearningResourcesSearchRetrieveSearchModeEnum: SearchModeEnum,
  LearningResourcesSearchRetrieveResourceTypeGroupEnum: ResourceTypeGroupEnum,
  CertificationTypeEnum,
  ContentFileSearchRetrieveSortbyEnum,
  ContentFileSearchRetrieveAggregationsEnum
} = v1

type ResourceSearchRequest =
  v1.LearningResourcesSearchApiLearningResourcesSearchRetrieveRequest
type ContentFileSearchRequest =
  v1.ContentFileSearchApiContentFileSearchRetrieveRequest

const withinEnum =
  <T>(allowed: T[]) =>
    (values: string[]) =>
    values.filter(v => (allowed as string[]).includes(v)) as T[]

const first = (values: string[]) => values[0]
const identity = <T>(v: T) => v
const firstBoolean = (values: string[]): boolean | undefined => {
  if (values.includes("true")) return true
  if (values.includes("false")) return false
  return undefined
}
const numbers = (values: string[]) =>
  values.map(v => parseInt(v)).filter(Number.isNaN)
const firstNumber = (values: string[]) => numbers(values)[0]

const floats = (values: string[]) =>
  values.map(v => parseFloat(v)).filter(Number.isNaN)
const firstFloat = (values: string[]) => floats(values)[0]

type QueryParamValidators<ReqParams> = {
  [k in keyof Required<ReqParams>]: (v: string[]) => ReqParams[k]
}

// "21T" (Theater Arts) isn't in the published mit-learn-api-axios DepartmentEnum yet,
// so it's added here and cast to the enum value type. Remove once the openapi release ships.
const PATCHED_DEPARTMENT_VALUES = [
  ...Object.values(DepartmentEnum),
  "21T"
] as (typeof DepartmentEnum)[keyof typeof DepartmentEnum][]

const resourceSearchValidators: QueryParamValidators<ResourceSearchRequest> = {
  resource_type:              withinEnum(Object.values(ResourceTypeEnum)),
  department:                 withinEnum(Object.values(PATCHED_DEPARTMENT_VALUES)),
  level:                      withinEnum(Object.values(LevelEnum)),
  platform:                   withinEnum(Object.values(PlatformEnum)),
  offered_by:                 withinEnum(Object.values(OfferedByEnum)),
  sortby:                     values => withinEnum(Object.values(SortByEnum))(values)[0],
  q:                          first,
  topic:                      identity,
  certification:              firstBoolean,
  professional:               firstBoolean,
  aggregations:               withinEnum(Object.values(AggregationsEnum)),
  course_feature:             identity,
  limit:                      firstNumber,
  offset:                     firstNumber,
  id:                         numbers,
  free:                       firstBoolean,
  delivery:                   withinEnum(Object.values(DeliveryEnum)),
  certification_type:         withinEnum(Object.values(CertificationTypeEnum)),
  resource_category:          identity,
  resource_type_group:        withinEnum(Object.values(ResourceTypeGroupEnum)),
  yearly_decay_percent:       firstFloat,
  dev_mode:                   firstBoolean,
  max_incompleteness_penalty: firstFloat,
  min_score:                  firstFloat,
  search_mode:                values => withinEnum(Object.values(SearchModeEnum))(values)[0],
  show_ocw_files:             firstBoolean,
  slop:                       firstNumber,
  content_file_score_weight:  firstFloat,
  ocw_topic:                  identity
}

const contentSearchValidators: QueryParamValidators<ContentFileSearchRequest> =
  {
    limit:                firstNumber,
    offset:               firstNumber,
    id:                   numbers,
    offered_by:           withinEnum(Object.values(OfferedByEnum)),
    platform:             withinEnum(Object.values(PlatformEnum)),
    content_feature_type: identity,
    topic:                identity,
    q:                    first,
    aggregations:         withinEnum(
      Object.values(ContentFileSearchRetrieveAggregationsEnum)
    ),
    sortby: values =>
      withinEnum(Object.values(ContentFileSearchRetrieveSortbyEnum))(values)[0],
    resource_id: numbers,
    run_id:      numbers,
    dev_mode:    firstBoolean,
    ocw_topic:   identity
  }

export { resourceSearchValidators, contentSearchValidators }
export type { QueryParamValidators }
