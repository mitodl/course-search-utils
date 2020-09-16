import { useState, useCallback, useEffect } from "react"
import { unionWith, eqBy, prop, either, isEmpty, clone, isNil } from "ramda"
import _ from "lodash"

import {
  LR_TYPE_ALL,
  LR_TYPE_LEARNINGPATH,
  LR_TYPE_USERLIST,
  LR_TYPE_PODCAST,
  LR_TYPE_PODCAST_EPISODE,
  INITIAL_FACET_STATE
} from "./constants"
import { deserializeSearchParams, serializeSearchParams } from "./url_utils"

export const mergeFacetResults = (...args) => ({
  buckets: args
    .map(prop("buckets"))
    .reduce((buckets, acc) => unionWith(eqBy(prop("key")), buckets, acc))
})

export const emptyOrNil = either(isEmpty, isNil)

// take runSearch, clearSearch as callbacks
export const useCourseSearch = (
  runSearch,
  clearSearch,
  updateURLBar,
  facets,
  loaded,
  searchPageSize
) => {
  const [incremental, setIncremental] = useState(false)
  const [from, setFrom] = useState(0)
  const [text, setText] = useState("")
  const [activeFacets, setActiveFacets] = useState(INITIAL_FACET_STATE)

  const facetOptions = useCallback(
    group => {
      const emptyFacet = { buckets: [] }
      const emptyActiveFacets = {
        buckets: (activeFacets[group] || []).map(facet => ({
          key:       facet,
          doc_count: 0
        }))
      }

      if (!facets) {
        return null
      }

      return mergeFacetResults(
        facets.get(group) || emptyFacet,
        emptyActiveFacets
      )
    },
    [facets, activeFacets]
  )

  const clearAllFilters = useCallback(() => {
    setText(undefined)
    setActiveFacets(INITIAL_FACET_STATE)
  }, [setText, setActiveFacets])

  const toggleFacet = useCallback(
    async (name, value, isEnabled) => {
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

  const onUpdateFacets = useCallback(
    e => {
      toggleFacet(e.target.name, e.target.value, e.target.checked)
    },
    [toggleFacet]
  )

  const updateText = useCallback(
    event => {
      const text = event ? event.target.value : ""
      setText(text)
    },
    [setText]
  )

  const internalRunSearch = useCallback(
    async (text, activeFacets, incremental = false) => {
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
      updateURLBar(
        serializeSearchParams({
          text,
          activeFacets
        })
      )
    },
    [
      from,
      setFrom,
      setIncremental,
      clearSearch,
      runSearch,
      updateURLBar,
      searchPageSize
    ]
  )

  const clearText = useCallback(
    event => {
      event.preventDefault()
      setText("")
      internalRunSearch("", activeFacets)
    },
    [activeFacets, setText, internalRunSearch]
  )

  const acceptSuggestion = useCallback(
    suggestion => {
      setText(suggestion)
      internalRunSearch(suggestion, activeFacets)
    },
    [setText, activeFacets, internalRunSearch]
  )

  // this is our 'on startup' useEffect call
  useEffect(() => {
    clearSearch()
    const { text, activeFacets } = deserializeSearchParams(window.location)
    setText(text)
    setActiveFacets(activeFacets)
    internalRunSearch(text, activeFacets)
    // dependencies intentionally left blank here, because this effect
    // needs to run only once - it's just to initialize the search state
    // based on the value of the URL (if any)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
  useEffect(
    () => {
      internalRunSearch(text, activeFacets)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activeFacets]
  )
  const onSubmit = useCallback(
    e => {
      e.preventDefault()
      internalRunSearch(text, activeFacets)
    },
    [internalRunSearch, text, activeFacets]
  )

  return {
    facetOptions,
    clearAllFilters,
    toggleFacet,
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
