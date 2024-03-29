import type { v1 } from "@mitodl/open-api-axios"
type ResourceSearchRequest =
  v1.LearningResourcesSearchApiLearningResourcesSearchRetrieveRequest
type ContentFileSearchRequest =
  v1.ContentFileSearchApiContentFileSearchRetrieveRequest

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
