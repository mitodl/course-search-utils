import { v1 } from "@mitodl/open-api-axios"

const {
  ResourceTypeEnum,
  LearningResourcesSearchRetrieveDepartmentEnum: DepartmentEnum,
  LearningResourcesSearchRetrieveLevelEnum: LevelEnum,
  LearningResourcesSearchRetrievePlatformEnum: PlatformEnum,
  LearningResourcesSearchRetrieveOfferedByEnum: OfferedByEnum,
  LearningResourcesSearchRetrieveSortbyEnum: SortByEnum,
  LearningResourcesSearchRetrieveAggregationsEnum: AggregationsEnum,
  LearningResourcesSearchRetrieveLearningFormatEnum: LearningFormatEnum,
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

type QueryParamValidators<ReqParams> = {
  [k in keyof Required<ReqParams>]: (v: string[]) => ReqParams[k]
}

const resourceSearchValidators: QueryParamValidators<ResourceSearchRequest> = {
  resource_type:        withinEnum(Object.values(ResourceTypeEnum)),
  department:           withinEnum(Object.values(DepartmentEnum)),
  level:                withinEnum(Object.values(LevelEnum)),
  platform:             withinEnum(Object.values(PlatformEnum)),
  offered_by:           withinEnum(Object.values(OfferedByEnum)),
  sortby:               values => withinEnum(Object.values(SortByEnum))(values)[0],
  q:                    first,
  topic:                identity,
  certification:        firstBoolean,
  professional:         firstBoolean,
  aggregations:         withinEnum(Object.values(AggregationsEnum)),
  course_feature:       identity,
  limit:                firstNumber,
  offset:               firstNumber,
  id:                   numbers,
  free:                 firstBoolean,
  learning_format:      withinEnum(Object.values(LearningFormatEnum)),
  certification_type:   withinEnum(Object.values(CertificationTypeEnum)),
  is_learning_material: firstBoolean
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
    run_id:      numbers
  }

export { resourceSearchValidators, contentSearchValidators }
export type { QueryParamValidators }
