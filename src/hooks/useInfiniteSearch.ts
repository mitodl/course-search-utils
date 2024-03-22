import { useCallback, useEffect, useRef, useState } from "react"
import { getSearchUrl } from "./util"
import type { Endpoint } from "./util"
import type { v1 } from "@mitodl/open-api-axios"

type ResourceSearchRequest =
  v1.LearningResourcesSearchApiLearningResourcesSearchRetrieveRequest
type ContentFileSearchRequest =
  v1.ContentFileSearchApiContentFileSearchRetrieveRequest
type SearchResponse = v1.LearningResourceSearchResponse

type Status = "pending" | "error" | "success"

type UseInfiniteSearchResult = {
  pages: SearchResponse[]
  error?: unknown
  status: Status
  isFetchingNextPage: boolean
  hasNextPage: boolean
  fetchNextPage: () => Promise<void>
}

type UseInfiniteSearchProps = {
  /**
   * Search parameters to use for API request.
   */
  params: ResourceSearchRequest | ContentFileSearchRequest
  endpoint: Endpoint
  /**
   * The base URL for the API.
   */
  baseUrl: string
  /**
   * The number of items to fetch per page.
   */
  limit?: number
  /**
   * A function which makes a request to API and returns a promise that resolves
   * to `{ data: <API RESPONSE> }`. Optional. Defaults to an implementation that
   * uses fetch.
   */
  makeRequest?: (url: string) => Promise<{ data: any }>
  /**
   * If true, keep previous data when fetching new pages.
   */
  keepPreviousData?: boolean
}

const DEFAULT_LIMIT = 10

const defaultMakeRequest = async (url: string) => {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error("Failed to fetch data")
  }
  const data = await response.json()
  return { data }
}

interface TracksCalled {
  called?: boolean
  (): Promise<void>
}

/**
 * Given a set of search parameters, this hook fetches search results from the
 * API and paginates through them.
 *
 * The return value is modeled after react-query's useInfiniteQuery hook.
 */
const useInfiniteSearch = ({
  params,
  endpoint,
  limit = DEFAULT_LIMIT,
  makeRequest = defaultMakeRequest,
  baseUrl,
  keepPreviousData
}: UseInfiniteSearchProps): UseInfiniteSearchResult => {
  const [nextPage, setNextPage] = useState(0)
  const [error, setError] = useState<unknown>()
  const [pages, setPages] = useState<SearchResponse[]>([])
  const [status, setStatus] = useState<Status>("pending")
  const [isFetchingNextPage, setIsFetchingNextPage] = useState(false)
  const [isPreviousData, setIsPreviousData] = useState(false)
  const urlRef = useRef<string | null>()

  const hasNextPage =
    pages[0] === undefined || pages[0]?.count > nextPage * limit

  const getPageUrl = useCallback(
    (page: number) => {
      const offset = page * limit
      return getSearchUrl(baseUrl, endpoint, {
        ...params,
        limit,
        offset
      })
    },
    [baseUrl, limit, params, endpoint]
  )

  const fetchNextPage: TracksCalled = useCallback(async () => {
    if (!hasNextPage || fetchNextPage.called) return
    fetchNextPage.called = true
    const url = getPageUrl(nextPage)
    urlRef.current = url
    try {
      setIsFetchingNextPage(true)
      const { data } = await makeRequest(url)
      if (url !== urlRef.current) return
      urlRef.current = null
      setIsFetchingNextPage(false)
      setStatus("success")
      setIsPreviousData(false)
      setPages(pages => {
        if (nextPage === 0) return [data]
        return [...pages, data]
      })
      setNextPage(nextPage + 1)
    } catch (err) {
      if (url !== urlRef.current) return
      setStatus("error")
      setError(err)
    }
  }, [getPageUrl, hasNextPage, makeRequest, nextPage])

  const firstPageUrl = getPageUrl(0)
  useEffect(() => {
    // Reset state when first page changes
    setNextPage(0)
    if (keepPreviousData) {
      setIsPreviousData(true)
    } else {
      setPages([])
      setError(undefined)
      setIsFetchingNextPage(false)
      setStatus("pending")
    }
  }, [firstPageUrl, keepPreviousData])

  useEffect(() => {
    if (status === "pending" || isPreviousData) {
      fetchNextPage()
    }
  }, [status, fetchNextPage, isPreviousData])

  return {
    pages,
    error,
    status,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage
  }
}

export default useInfiniteSearch
export type { UseInfiniteSearchResult, UseInfiniteSearchProps }
