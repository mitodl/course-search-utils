import type { Facets } from "./facet_display/types"

export interface SearchQueryParams {
  text?: string
  from?: number
  size?: number
  sort?: string
  activeFacets?: Facets
  aggregations?: string[]
  endpoint?: string
}

export const buildSearchUrl = (
  baseUrl: string,
  { text, from, size, sort, activeFacets, aggregations }: SearchQueryParams
): string => {
  const url = new URL(baseUrl)

  if (text) {
    url.searchParams.append("q", text)
  }
  if (from) {
    url.searchParams.append("offset", from.toString())
  }

  if (size) {
    url.searchParams.append("limit", size.toString())
  }

  if (sort) {
    url.searchParams.append("sortby", sort)
  }

  if (aggregations && aggregations.length > 0) {
    url.searchParams.append("aggregations", aggregations.join(","))
  }

  if (activeFacets) {
    for (const [key, value] of Object.entries(activeFacets)) {
      if (value && value.length > 0) {
        url.searchParams.append(key, value.join(","))
      }
    }
  }

  return url.toString()
}
