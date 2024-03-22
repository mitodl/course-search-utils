import type {
  LearningResourcesSearchApiLearningResourcesSearchRetrieveRequest as ResourceSearchRequest,
  ContentFileSearchApiContentFileSearchRetrieveRequest as ContentFileSearchRequest
} from "../open_api_generated"

type Endpoint = "resources" | "content_files"

const endpointUrls: Record<Endpoint, string> = {
  resources:     "api/v1/learning_resources_search/",
  content_files: "api/v1/content_file_search/"
}

export const getSearchUrl = (
  baseUrl: string,
  endpoint: Endpoint,
  params: ResourceSearchRequest | ContentFileSearchRequest
): string => {
  const url = new URL(endpointUrls[endpoint], baseUrl)

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      if (Array.isArray(value)) {
        value.forEach(v => url.searchParams.append(key, v))
      } else {
        url.searchParams.set(key, value)
      }
    }
  })
  url.searchParams.sort()
  return url.toString()
}

export type { Endpoint }
