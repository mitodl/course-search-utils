import React, {
  useState,
  useCallback,
  useEffect,
  MouseEvent,
  ChangeEvent
} from "react"
import { unionWith, eqBy, prop, clone } from "ramda"
import _ from "lodash"
import { History as HHistory } from "history"

import {
  LearningResourceType,
  INITIAL_FACET_STATE,
  LR_TYPE_ALL
} from "./constants"
import {
  FacetsAndSort,
  Facets,
  deserializeSearchParams,
  deserializeSort,
  serializeSearchParams,
  SortParam
} from "./url_utils"
import { useDidMountEffect } from "./hooks"

export * from "./constants"

export * from "./url_utils"

export { buildSearchQuery, SearchQueryParams } from "./search"

export interface Bucket {
  key: string
  doc_count: number // eslint-disable-line camelcase
}

export type Aggregation = {
  doc_count_error_upper_bound?: number // eslint-disable-line camelcase
  sum_other_doc_count?: number // eslint-disable-line camelcase
  buckets: Bucket[]
}

export type Aggregations = Map<string, Aggregation>

export type GetSearchPageSize = (ui: string | null) => number

export const mergeFacetResults = (...args: Aggregation[]): Aggregation => ({
  buckets: args
    .map(prop("buckets"))
    // @ts-ignore
    .reduce((buckets, acc) => unionWith(eqBy(prop("key")), buckets, acc))
})

/**
 * Accounts for a difference in the listener API for v4 and v5.
 * See https://github.com/remix-run/history/issues/811
 */
const history4or5Listen = (
  history: HHistory,
  listener: (loc: Location, action: string) => void
): (() => void) => {
  // @ts-ignore
  return history.listen((e1: any, e2: any) => {
    if (e2) {
      listener(e1, e2)
    } else {
      listener(e1.location, e1.action)
    }
  })
}

interface PreventableEvent {
  preventDefault?: () => void
  type?: string
}
interface CourseSearchResult {
  facetOptions: (group: string) => Aggregation | null
  clearAllFilters: () => void
  toggleFacet: (name: string, value: string, isEnbaled: boolean) => void
  toggleFacets: (facets: [string, string, boolean][]) => void
  onUpdateFacets: React.ChangeEventHandler<HTMLInputElement>
  updateText: React.ChangeEventHandler<HTMLInputElement>
  clearText: React.MouseEventHandler
  updateSort: React.ChangeEventHandler
  acceptSuggestion: (suggestion: string) => void
  loadMore: () => void
  incremental: boolean
  text: string
  sort: SortParam | null
  activeFacets: Facets
  /**
   * Callback that handles search submission. Pass this to your search input
   * submission event target, e.g., `<form onSubmit={onSubmit} />` or
   * `<button onClick={onSubmit} />`.
   *
   * The event target does not need to emit submit events, but if it does, the
   * default form action will be prevented.
   */
  onSubmit: (e: PreventableEvent) => void
  from: number
  updateUI: (newUI: string | null) => void
  ui: string | null
}

export const useCourseSearch = (
  runSearch: (
    text: string,
    searchFacets: Facets,
    nextFrom: number,
    sort?: SortParam | null,
    ui?: string | null
  ) => Promise<void>,
  clearSearch: () => void,
  aggregations: Aggregations,
  loaded: boolean,
  searchPageSize: number | GetSearchPageSize,
  history: HHistory
): CourseSearchResult => {
  const [incremental, setIncremental] = useState(false)
  const [from, setFrom] = useState(0)
  const [text, setText] = useState<string>(() => {
    const { text } = deserializeSearchParams(history.location)
    return text
  })
  const [activeFacetsAndSort, setActiveFacetsAndSort] = useState<FacetsAndSort>(
    () => {
      const { activeFacets, sort, ui } = deserializeSearchParams(
        history.location
      )
      return { activeFacets, sort, ui }
    }
  )

  const facetOptions = useCallback(
    (group: string): Aggregation | null => {
      const emptyFacet = { buckets: [] }
      const { activeFacets } = activeFacetsAndSort
      const emptyActiveFacets = {
        buckets: (activeFacets[group] || []).map((facet: string) => ({
          key:       facet,
          doc_count: 0
        }))
      }

      if (!aggregations) {
        return null
      }

      return mergeFacetResults(
        aggregations.get(group) || emptyFacet,
        emptyActiveFacets
      )
    },
    [aggregations, activeFacetsAndSort]
  )

  const clearAllFilters = useCallback(() => {
    setText("")
    setActiveFacetsAndSort({
      activeFacets: INITIAL_FACET_STATE,
      sort:         null,
      ui:           null
    })
  }, [setText, setActiveFacetsAndSort])

  const toggleFacet: CourseSearchResult["toggleFacet"] = useCallback(
    (name, value, isEnabled) => {
      const { activeFacets, sort, ui } = activeFacetsAndSort
      const newFacets = clone(activeFacets)

      if (isEnabled) {
        newFacets[name] = _.union(newFacets[name] || [], [value])
      } else {
        newFacets[name] = _.without(newFacets[name] || [], value)
      }
      setActiveFacetsAndSort({ activeFacets: newFacets, sort, ui })
    },
    [activeFacetsAndSort, setActiveFacetsAndSort]
  )

  const toggleFacets: CourseSearchResult["toggleFacets"] = useCallback(
    facets => {
      const { activeFacets, sort, ui } = activeFacetsAndSort
      const newFacets = clone(activeFacets)

      facets.forEach(([name, value, isEnabled]) => {
        if (isEnabled) {
          newFacets[name] = _.union(newFacets[name] || [], [value])
        } else {
          newFacets[name] = _.without(newFacets[name] || [], value)
        }
      })
      setActiveFacetsAndSort({ activeFacets: newFacets, sort, ui })
    },
    [activeFacetsAndSort, setActiveFacetsAndSort]
  )

  const onUpdateFacets: CourseSearchResult["onUpdateFacets"] = useCallback(
    e => toggleFacet(e.target.name, e.target.value, e.target.checked),
    [toggleFacet]
  )

  const updateText: CourseSearchResult["updateText"] = useCallback(
    event => {
      const text = event ? event.target.value : ""
      setText(text)
    },
    [setText]
  )

  const updateSort = useCallback(
    (event: ChangeEvent): void => {
      const param = event ? (event.target as HTMLSelectElement).value : ""
      const newSort = deserializeSort(param)
      const { activeFacets, ui } = activeFacetsAndSort
      setActiveFacetsAndSort({ activeFacets, sort: newSort, ui: ui }) // this will cause a search via useDidMountEffect
    },
    [setActiveFacetsAndSort, activeFacetsAndSort]
  )

  const updateUI = useCallback(
    (newUI: string | null): void => {
      const { activeFacets, sort } = activeFacetsAndSort
      setActiveFacetsAndSort({ activeFacets, sort, ui: newUI }) // this will cause a search via useDidMountEffect
    },
    [setActiveFacetsAndSort, activeFacetsAndSort]
  )

  const internalRunSearch = useCallback(
    async (
      text: string,
      activeFacetsAndSort: FacetsAndSort,
      incremental = false
    ) => {
      const { activeFacets, sort, ui } = activeFacetsAndSort

      const currentPageSize =
        typeof searchPageSize === "number" ? searchPageSize : searchPageSize(ui)

      let nextFrom = from + currentPageSize

      if (!incremental) {
        clearSearch()
        nextFrom = 0
      }
      setFrom(nextFrom)
      setIncremental(incremental)

      const searchFacets = clone(activeFacets)

      if (searchFacets.type !== undefined && searchFacets.type.length > 0) {
        if (searchFacets.type.includes(LearningResourceType.Podcast)) {
          searchFacets.type.push(LearningResourceType.PodcastEpisode)
        }

        if (searchFacets.type.includes(LearningResourceType.Userlist)) {
          searchFacets.type.push(LearningResourceType.LearningPath)
        }
      } else {
        searchFacets.type = LR_TYPE_ALL
      }

      await runSearch(text, searchFacets, nextFrom, sort, ui)

      // search is updated, now echo params to URL bar
      const currentSearch = serializeSearchParams(
        deserializeSearchParams(history.location)
      )
      const newSearch = serializeSearchParams({
        text,
        activeFacets,
        sort,
        ui
      })
      if (currentSearch !== newSearch) {
        history.push(`?${newSearch}`)
      }
    },
    [
      from,
      setFrom,
      setIncremental,
      clearSearch,
      runSearch,
      searchPageSize,
      history
    ]
  )

  const initSearch = useCallback(
    (location: { search: string }) => {
      const { text, activeFacets, sort, ui } = deserializeSearchParams(location)
      clearSearch()
      setText(text)
      setActiveFacetsAndSort({ activeFacets, sort, ui })
    },
    [clearSearch, setText, setActiveFacetsAndSort]
  )

  const clearText = useCallback(
    (event: MouseEvent) => {
      event.preventDefault()
      setText("")
      internalRunSearch("", activeFacetsAndSort)
    },
    [activeFacetsAndSort, setText, internalRunSearch]
  )

  const acceptSuggestion = useCallback(
    (suggestion: string) => {
      setText(suggestion)
      internalRunSearch(suggestion, activeFacetsAndSort)
    },
    [setText, activeFacetsAndSort, internalRunSearch]
  )

  // this is our 'on startup' useEffect call
  useEffect(() => {
    initSearch(history.location)

    // dependencies intentionally left blank here, because this effect
    // needs to run only once - it's just to initialize the search state
    // based on the value of the URL (if any)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    // We push browser state into the history when a piece of the URL changes. However
    // pressing the back button will update the browser stack but the UI does not respond by default.
    // So we have to trigger this change explicitly.
    const unlisten = history4or5Listen(history, (location, action) => {
      if (action === "POP") {
        // back button pressed
        // @ts-ignore
        initSearch(location)
      }
    })

    return unlisten
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadMore = useCallback(() => {
    if (!loaded) {
      // this function will be triggered repeatedly by <InfiniteScroll />, filter it to just once at a time
      return
    }

    internalRunSearch(text, activeFacetsAndSort, true)
  }, [internalRunSearch, loaded, text, activeFacetsAndSort])

  // this effect here basically listens to parts of the search UI which should cause an immediate rerun of
  // the search whenever they change. we always want these changes to take
  // effect immediately, so we need to either do this or call runSearch from
  // our facet-related callbacks. this approach lets us avoid having the
  // facet-related callbacks (toggleFacet, etc) be dependent on then value of
  // the runSearch function, which leads to too much needless churn in the
  // facet callbacks and then causes excessive re-rendering of the facet UI
  useDidMountEffect(() => {
    internalRunSearch(text, activeFacetsAndSort)
  }, [activeFacetsAndSort])

  const onSubmit: CourseSearchResult["onSubmit"] = useCallback(
    e => {
      if (e.type === "submit") {
        e.preventDefault?.()
      }

      internalRunSearch(text, activeFacetsAndSort)
    },
    [internalRunSearch, text, activeFacetsAndSort]
  )

  const { sort, activeFacets, ui } = activeFacetsAndSort
  return {
    facetOptions,
    clearAllFilters,
    toggleFacet,
    toggleFacets,
    onUpdateFacets,
    updateText,
    clearText,
    updateSort,
    acceptSuggestion,
    loadMore,
    incremental,
    text,
    sort,
    activeFacets,
    onSubmit,
    from,
    updateUI,
    ui
  }
}
