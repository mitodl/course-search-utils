import type { SearchParams, Endpoint } from "./configs"

const endpointUrls: Record<Endpoint, string> = {
  resources:     "api/v1/learning_resources_search/",
  content_files: "api/v1/content_file_search/"
}

export const getSearchUrl = (
  baseUrl: string,
  {
    endpoint,
    queryText,
    sort,
    activeFacets,
    aggregations,
    limit,
    offset
  }: SearchParams & {
    aggregations: string[]
    limit?: number
    offset?: number
  }
): string => {
  const url = new URL(endpointUrls[endpoint], baseUrl)

  if (queryText) {
    url.searchParams.append("q", queryText)
  }
  if (offset) {
    url.searchParams.append("offset", offset.toString())
  }

  if (limit) {
    url.searchParams.append("limit", limit.toString())
  }

  if (sort) {
    url.searchParams.append("sortby", sort)
  }

  if (aggregations && aggregations.length > 0) {
    url.searchParams.append("aggregations", aggregations.join(","))
  }

  if (activeFacets) {
    for (const [key, value] of Object.entries(activeFacets)) {
      const asArray = Array.isArray(value) ? value : [value]
      if (asArray.length > 0) {
        url.searchParams.append(key, asArray.join(","))
      }
    }
  }

  url.searchParams.sort()
  return url.toString()
}
