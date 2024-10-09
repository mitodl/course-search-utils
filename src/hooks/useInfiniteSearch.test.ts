import { renderHook, act } from "@testing-library/react"
import useInfiniteSearch from "./useInfiniteSearch"

/**
 * Return a fetcher that can be resolved or rejected externally.
 */
const getDefferedFetcher = ({ count }: { count: number }) => {
  const result = {
    fetch: jest.fn(
      (_url: string) =>
        new Promise<any>((res, rej) => {
          result.resolve = (id?: string) => res({ data: { count, id } })
          result.reject = (error: Error) => rej(error)
        })
    ),
    lastResult: () =>
      result.fetch.mock.results[result.fetch.mock.results.length - 1],
    resolve: (_id?: string): void => {
      throw new Error("Not yet assigned.")
    },
    reject: (_error: Error): void => {
      throw new Error("Not yet assigned.")
    },
    waitForFetch: async (id?: string) => {
      return act(async () => {
        result.resolve(id)
        await result.lastResult()
      })
    },
    lastUrl: () => {
      const lastCall =
        result.fetch.mock.calls[result.fetch.mock.calls.length - 1]
      return new URL(lastCall[0])
    },
    lastUrlQueryString: () => {
      return result.lastUrl().searchParams.toString().replace(/%2C/g, ",")
    }
  }
  return result
}

describe("useInfiniteSearchApi", () => {
  test("Makes paginated requests with given parameters", async () => {
    const fetcher = getDefferedFetcher({ count: 23 })
    const { result } = renderHook(useInfiniteSearch, {
      initialProps: {
        params: {
          q:          "test",
          department: ["6", "8"]
        },
        endpoint:    "resources",
        baseUrl:     "https://example.com",
        makeRequest: fetcher.fetch
      }
    })

    /**
     * First page --- fetched automatically
     */
    expect(fetcher.fetch).toHaveBeenCalledTimes(1)
    expect(fetcher.lastUrlQueryString()).toEqual(
      "department=6&department=8&limit=10&offset=0&q=test"
    )
    expect(result.current).toEqual(
      expect.objectContaining({
        status:             "pending",
        isFetchingNextPage: true,
        hasNextPage:        true,
        pages:              []
      })
    )
    await fetcher.waitForFetch()
    expect(result.current).toEqual(
      expect.objectContaining({
        status:             "success",
        isFetchingNextPage: false,
        hasNextPage:        true,
        pages:              [expect.anything()]
      })
    )

    /**
     * Second page --- fetched via fetchNextPage
     */
    expect(fetcher.fetch).toHaveBeenCalledTimes(1)
    act(() => {
      result.current.fetchNextPage()
    })
    expect(fetcher.fetch).toHaveBeenCalledTimes(2)
    expect(fetcher.lastUrlQueryString()).toEqual(
      "department=6&department=8&limit=10&offset=10&q=test"
    )
    await fetcher.waitForFetch()
    expect(result.current).toEqual(
      expect.objectContaining({
        status:             "success",
        isFetchingNextPage: false,
        hasNextPage:        true,
        pages:              [expect.anything(), expect.anything()]
      })
    )

    /**
     * Third page --- fetched via fetchNextPage
     */
    expect(fetcher.fetch).toHaveBeenCalledTimes(2)
    act(() => {
      result.current.fetchNextPage()
    })
    expect(fetcher.fetch).toHaveBeenCalledTimes(3)
    expect(fetcher.lastUrlQueryString()).toEqual(
      "department=6&department=8&limit=10&offset=20&q=test"
    )
    await fetcher.waitForFetch()
    expect(result.current).toEqual(
      expect.objectContaining({
        status:             "success",
        isFetchingNextPage: false,
        hasNextPage:        false, // No more pages
        pages:              [expect.anything(), expect.anything(), expect.anything()]
      })
    )

    // No more pages
    result.current.fetchNextPage()
    result.current.fetchNextPage()
    result.current.fetchNextPage()
    expect(fetcher.fetch).toHaveBeenCalledTimes(3)
  })

  test("fetchNextPage is a no-op if fetch is already underway", async () => {
    const fetcher = getDefferedFetcher({ count: 23 })
    const { result } = renderHook(useInfiniteSearch, {
      initialProps: {
        params: {
          q:          "test",
          department: ["6", "8"]
        },
        endpoint:    "resources",
        baseUrl:     "https://example.com",
        makeRequest: fetcher.fetch
      }
    })
    await fetcher.waitForFetch()

    expect(fetcher.fetch).toHaveBeenCalledTimes(1)
    act(() => {
      result.current.fetchNextPage()
      result.current.fetchNextPage()
      result.current.fetchNextPage()
    })
    expect(fetcher.fetch).toHaveBeenCalledTimes(2)
  })

  test("when parameters change, result is reset and refetch occurs", async () => {
    const fetcher = getDefferedFetcher({ count: 23 })
    const { result, rerender } = renderHook(useInfiniteSearch, {
      initialProps: {
        params: {
          q:          "test",
          department: ["6", "8"]
        },
        endpoint:    "resources",
        baseUrl:     "https://example.com",
        makeRequest: fetcher.fetch
      }
    })
    await fetcher.waitForFetch()
    expect(result.current).toEqual(
      expect.objectContaining({
        status:             "success",
        isFetchingNextPage: false,
        hasNextPage:        true,
        pages:              [expect.anything()]
      })
    )

    rerender({
      params: {
        q:          "test",
        department: ["6"]
      },
      endpoint:    "resources",
      baseUrl:     "https://example.com",
      makeRequest: fetcher.fetch
    })
    expect(result.current).toEqual(
      expect.objectContaining({
        status:             "pending",
        isFetchingNextPage: true,
        hasNextPage:        true,
        pages:              []
      })
    )
    expect(fetcher.lastUrlQueryString()).toEqual(
      "department=6&limit=10&offset=0&q=test"
    )
  })

  test("when parameters change and keepPreviousData=true, previous data is kept during refetch", async () => {
    const fetcher = getDefferedFetcher({ count: 23 })
    const { result, rerender } = renderHook(useInfiniteSearch, {
      initialProps: {
        params: {
          q:          "test",
          department: ["6", "8"]
        },
        endpoint:         "resources",
        baseUrl:          "https://example.com",
        makeRequest:      fetcher.fetch,
        keepPreviousData: true
      }
    })
    await fetcher.waitForFetch("1")
    expect(result.current).toEqual(
      expect.objectContaining({
        status:             "success",
        isFetchingNextPage: false,
        hasNextPage:        true,
        pages:              [{ count: 23, id: "1" }]
      })
    )

    rerender({
      params: {
        q:          "test",
        department: ["6"]
      },
      endpoint:         "resources",
      baseUrl:          "https://example.com",
      makeRequest:      fetcher.fetch,
      keepPreviousData: true
    })
    expect(result.current).toEqual(
      expect.objectContaining({
        status:             "success",
        isFetchingNextPage: true,
        hasNextPage:        true,
        pages:              [{ count: 23, id: "1" }]
      })
    )
    expect(fetcher.lastUrlQueryString()).toEqual(
      "department=6&limit=10&offset=0&q=test"
    )
    await fetcher.waitForFetch("2")
    expect(result.current).toEqual(
      expect.objectContaining({
        status:             "success",
        isFetchingNextPage: false,
        hasNextPage:        true,
        pages:              [{ count: 23, id: "2" }]
      })
    )
  })

  test("fetch errors are reflected in status", async () => {
    const fetcher = getDefferedFetcher({ count: 23 })
    const { result } = renderHook(useInfiniteSearch, {
      initialProps: {
        params: {
          q:          "test",
          department: ["6", "8"]
        },
        endpoint:    "resources",
        baseUrl:     "https://example.com",
        makeRequest: fetcher.fetch
      }
    })
    expect(result.current.status).toBe("pending")
    await fetcher.waitForFetch()
    expect(result.current.status).toBe("success")
    await act(async () => {
      result.current.fetchNextPage()
      fetcher.reject(new Error("Shucks."))
      await fetcher.lastResult()
    })
    expect(result.current.status).toBe("error")
    expect(result.current.error).toEqual(new Error("Shucks."))
  })

  test("Outdated responses are ignored", async () => {
    const fetcher = getDefferedFetcher({ count: 23 })
    const { result, rerender } = renderHook(useInfiniteSearch, {
      initialProps: {
        params: {
          q: "one"
        },
        endpoint:    "resources",
        baseUrl:     "https://example.com",
        makeRequest: fetcher.fetch
      }
    })
    const resolveFirst = fetcher.resolve
    rerender({
      params: {
        q: "two"
      },
      endpoint:    "resources",
      baseUrl:     "https://example.com",
      makeRequest: fetcher.fetch
    })
    const resolveSecond = fetcher.resolve
    expect(resolveFirst).not.toBe(resolveSecond) // sanity

    /**
     * Resolve the second promise first
     */
    await act(async () => {
      resolveSecond("two")
      await fetcher.lastResult()
    })
    expect(result.current).toEqual(
      expect.objectContaining({
        status: "success",
        pages:  [expect.objectContaining({ id: "two" })]
      })
    )

    /**
     * Resolve the first promise
     */
    await act(async () => {
      resolveFirst("one")
      await fetcher.lastResult()
    })
    // First promise result should be ignored
    expect(result.current).toEqual(
      expect.objectContaining({
        status: "success",
        pages:  [expect.objectContaining({ id: "two" })]
      })
    )
  })

  test("Changing endpoint changes the URL", async () => {
    const fetcher = getDefferedFetcher({ count: 23 })
    const { rerender } = renderHook(useInfiniteSearch, {
      initialProps: {
        params: {
          q: "one"
        },
        endpoint:    "resources",
        baseUrl:     "https://example.com",
        makeRequest: fetcher.fetch
      }
    })
    expect(fetcher.lastUrl().pathname).toBe(
      "/api/v1/learning_resources_search/"
    )
    rerender({
      params: {
        q: "one"
      },
      endpoint:    "content_files",
      baseUrl:     "https://example.com",
      makeRequest: fetcher.fetch
    })
    expect(fetcher.lastUrl().pathname).toBe("/api/v1/content_file_search/")
  })
})
