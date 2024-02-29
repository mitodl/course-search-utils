import {
  ResourceTypeEnum,
  LearningResourcesSearchRetrieveDepartmentEnum as DepartmentEnum,
  LearningResourcesSearchRetrieveLevelEnum as LevelEnum,
  LearningResourcesSearchRetrievePlatformEnum as PlatformEnum,
  LearningResourcesSearchRetrieveOfferedByEnum as OfferedByEnum,
  LearningResourcesSearchRetrieveSortbyEnum as SortByEnum,
  // ContentFile Search Enums
  ContentFileSearchRetrieveSortbyEnum as ContentFileSortEnum
} from "../open_api_generated"

type Endpoint = "resources" | "content_files"

type SearchParams = {
  endpoint: Endpoint
  activeFacets: {
    resource_type?: ResourceTypeEnum[]
    department?: DepartmentEnum[]
    course_feature?: string[]
    content_feature_type?: string[]
    level?: LevelEnum[]
    platform?: PlatformEnum[]
    offered_by?: OfferedByEnum[]
    topic?: string[]
    certification?: boolean
    professional?: boolean
  }
  sort?: SortByEnum | ContentFileSortEnum
  queryText: string
}

type FacetName = keyof SearchParams["activeFacets"]

const withinEnum =
  <T>(allowed: T[]) =>
    (value: string) =>
      (allowed as string[]).includes(value)

type EndpointParamConfig = {
  sort: {
    alias: string
    isValid: (value: string) => boolean
  }
  facets: {
    [K in keyof SearchParams["activeFacets"]]?: {
      alias: string
      isValid: (value: string) => boolean
      isBoolean?: boolean
    }
  }
}

const searchParamConfig: Record<Endpoint, EndpointParamConfig> = {
  resources: {
    sort: {
      alias:   "s",
      isValid: withinEnum(Object.values(SortByEnum))
    },
    facets: {
      resource_type: {
        alias:   "r",
        isValid: withinEnum(Object.values(ResourceTypeEnum))
      },
      department: {
        alias:   "d",
        isValid: withinEnum(Object.values(DepartmentEnum))
      },
      level: {
        alias:   "l",
        isValid: withinEnum(Object.values(LevelEnum))
      },
      platform: {
        alias:   "p",
        isValid: withinEnum(Object.values(PlatformEnum))
      },
      offered_by: {
        alias:   "o",
        isValid: withinEnum(Object.values(OfferedByEnum))
      },
      topic: {
        alias:   "t",
        isValid: (value: string) => value.length > 0
      },
      certification: {
        alias:     "c",
        isValid:   (value: string) => value === "true",
        isBoolean: true
      },
      professional: {
        alias:     "pr",
        isValid:   (value: string) => value === "true",
        isBoolean: true
      },
      course_feature: {
        alias:   "cf",
        isValid: (value: string) => value.length > 0
      }
    }
  },
  content_files: {
    sort: {
      alias:   "s",
      isValid: withinEnum(Object.values(ContentFileSortEnum))
    },
    facets: {
      offered_by: {
        alias:   "o",
        isValid: withinEnum(Object.values(OfferedByEnum))
      },
      platform: {
        alias:   "p",
        isValid: withinEnum(Object.values(PlatformEnum))
      },
      content_feature_type: {
        alias:   "cf",
        isValid: (value: string) => value.length > 0
      },
      topic: {
        alias:   "t",
        isValid: (value: string) => value.length > 0
      }
    }
  }
}

const QUERY_TEXT_ALIAS = "q"
const ENDPOINT_ALIAS = "e"

export type { SearchParams, Endpoint, FacetName }
export { searchParamConfig, QUERY_TEXT_ALIAS, ENDPOINT_ALIAS }
