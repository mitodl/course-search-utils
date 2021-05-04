import {
  useState,
  useCallback,
  useEffect,
  MouseEvent,
  FormEvent,
  ChangeEvent
} from "react"
import { unionWith, eqBy, prop, either, isEmpty, clone, isNil } from "ramda"
import _ from "lodash"
import { createBrowserHistory } from "history"

import {
  LR_TYPE_ALL,
  LR_TYPE_LEARNINGPATH,
  LR_TYPE_USERLIST,
  LR_TYPE_PODCAST,
  LR_TYPE_PODCAST_EPISODE,
  INITIAL_FACET_STATE
} from "./constants"
import {
  Facets,
  deserializeSearchParams,
  serializeSearchParams
} from "./url_utils"
import { useDidMountEffect } from "./hooks"

export const emptyOrNil = either(isEmpty, isNil)

type Aggregation = {
  doc_count_error_upper_bound?: number // eslint-disable-line camelcase
  sum_other_doc_count?: number // eslint-disable-line camelcase
  buckets: Array<{ key: string; doc_count: number }> // eslint-disable-line camelcase
}

type Aggregations = Map<string, Aggregation>

export const mergeFacetResults = (...args: Aggregation[]): Aggregation => ({
  buckets: args
    .map(prop("buckets"))
    // @ts-ignore
    .reduce((buckets, acc) => unionWith(eqBy(prop("key")), buckets, acc))
})

const history = createBrowserHistory()

// disabling rule here because all functions and values returned by the hook are
// fully typed, so writing out the explicit return type for this thing is redundant
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const useCourseSearch = (
  runSearch: (
    text: string,
    searchFacets: Facets,
    nextFrom: number
  ) => Promise<void>,
  clearSearch: () => void,
  aggregations: Aggregations,
  loaded: boolean,
  searchPageSize: number
) => {
  const [incremental, setIncremental] = useState(false)
  const [from, setFrom] = useState(0)
  const [text, setText] = useState<string>(() => {
    const { text } = deserializeSearchParams(window.location)
    return text
  })
  const [activeFacets, setActiveFacets] = useState<Facets>(() => {
    const { activeFacets } = deserializeSearchParams(window.location)
    return activeFacets
  })

  const facetOptions = useCallback(
    (group: string): Aggregation | null => {
      const emptyFacet = { buckets: [] }
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
    [aggregations, activeFacets]
  )

  const clearAllFilters = useCallback(() => {
    setText("")
    setActiveFacets(INITIAL_FACET_STATE)
  }, [setText, setActiveFacets])

  const toggleFacet = useCallback(
    (name: string, value: string, isEnabled: boolean) => {
      const newFacets = clone(activeFacets)

      if (isEnabled) {
        newFacets[name] = _.union(newFacets[name] || [], [value])
      } else {
        newFacets[name] = _.without(newFacets[name] || [], value)
      }
      setActiveFacets(newFacets)
    },
    [activeFacets, setActiveFacets]
  )

  const toggleFacets = useCallback(
    (facets: Array<[string, string, boolean]>) => {
      const newFacets = clone(activeFacets)

      facets.forEach(([name, value, isEnabled]) => {
        if (isEnabled) {
          newFacets[name] = _.union(newFacets[name] || [], [value])
        } else {
          newFacets[name] = _.without(newFacets[name] || [], value)
        }
      })
      setActiveFacets(newFacets)
    },
    [activeFacets, setActiveFacets]
  )

  const onUpdateFacets = useCallback(
    (e: MouseEvent<HTMLInputElement>) => {
      toggleFacet(
        (e.target as HTMLInputElement).name,
        (e.target as HTMLInputElement).value,
        (e.target as HTMLInputElement).checked
      )
    },
    [toggleFacet]
  )

  const updateText = useCallback(
    (event: ChangeEvent): void => {
      const text = event ? (event.target as HTMLInputElement).value : ""
      setText(text)
    },
    [setText]
  )

  const internalRunSearch = useCallback(
    async (text: string, activeFacets: Facets, incremental = false) => {
      let nextFrom = from + searchPageSize

      if (!incremental) {
        clearSearch()
        nextFrom = 0
      }
      setFrom(nextFrom)
      setIncremental(incremental)

      const searchFacets = clone(activeFacets)

      if (emptyOrNil(searchFacets.type)) {
        searchFacets.type = LR_TYPE_ALL
      } else {
        if (searchFacets.type.includes(LR_TYPE_PODCAST)) {
          searchFacets.type.push(LR_TYPE_PODCAST_EPISODE)
        }

        if (searchFacets.type.includes(LR_TYPE_USERLIST)) {
          searchFacets.type.push(LR_TYPE_LEARNINGPATH)
        }
      }

      await runSearch(text, searchFacets, nextFrom)

      // search is updated, now echo params to URL bar
      const currentSearch = window.location.search
      const newSearch = serializeSearchParams({
        text,
        activeFacets
      })
      if (`?${newSearch}` !== currentSearch) {
        history.push(`?${newSearch}`)
      }
    },
    [from, setFrom, setIncremental, clearSearch, runSearch, searchPageSize]
  )

  const initSearch = useCallback(
    (location: Location) => {
      const { text, activeFacets } = deserializeSearchParams(location)
      clearSearch()
      setText(text)
      setActiveFacets(activeFacets)
      internalRunSearch(text, activeFacets)
    },
    [internalRunSearch, clearSearch, setText, setActiveFacets]
  )

  const clearText = useCallback(
    (event: MouseEvent) => {
      event.preventDefault()
      setText("")
      internalRunSearch("", activeFacets)
    },
    [activeFacets, setText, internalRunSearch]
  )

  const acceptSuggestion = useCallback(
    (suggestion: string) => {
      setText(suggestion)
      internalRunSearch(suggestion, activeFacets)
    },
    [setText, activeFacets, internalRunSearch]
  )

  // this is our 'on startup' useEffect call
  useEffect(() => {
    initSearch(window.location)

    // dependencies intentionally left blank here, because this effect
    // needs to run only once - it's just to initialize the search state
    // based on the value of the URL (if any)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    // We push browser state into the history when a piece of the URL changes. However
    // pressing the back button will update the browser stack but the UI does not respond by default.
    // So we have to trigger this change explicitly.
    const unlisten = history.listen(({ location, action }) => {
      if (action === "POP") {
        // back button pressed
        // @ts-ignore
        initSearch(location)
      }
    })

    return () => {
      unlisten()
    }
  })

  const loadMore = useCallback(() => {
    if (!loaded) {
      // this function will be triggered repeatedly by <InfiniteScroll />, filter it to just once at a time
      return
    }

    internalRunSearch(text, activeFacets, true)
  }, [internalRunSearch, loaded, text, activeFacets])

  // this effect here basically listens to activeFacets for changes and re-runs
  // the search whenever it changes. we always want the facet changes to take
  // effect immediately, so we need to either do this or call runSearch from
  // our facet-related callbacks. this approach lets us avoid having the
  // facet-related callbacks (toggleFacet, etc) be dependent on then value of
  // the runSearch function, which leads to too much needless churn in the
  // facet callbacks and then causes excessive re-rendering of the facet UI
  useDidMountEffect(() => {
    internalRunSearch(text, activeFacets)
  }, [activeFacets])

  const onSubmit = useCallback(
    (e: FormEvent): void => {
      e.preventDefault()
      internalRunSearch(text, activeFacets)
    },
    [internalRunSearch, text, activeFacets]
  )

  return {
    facetOptions,
    clearAllFilters,
    toggleFacet,
    toggleFacets,
    onUpdateFacets,
    updateText,
    clearText,
    acceptSuggestion,
    loadMore,
    incremental,
    text,
    activeFacets,
    onSubmit,
    from
  }
}
