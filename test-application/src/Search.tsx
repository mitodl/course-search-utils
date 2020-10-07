import React, { useState, useCallback } from 'react';

import { useCourseSearch } from "../../src/index"

export default function Search() {
  const [results, setSearchResults] = useState([])
  const [facets, setSearchFacets] = useState(null)
  const [total, setTotal] = useState(0)
  const [completedInitialLoad, setCompletedInitialLoad] = useState(false)

  const runSearch = useCallback(
    async (text, activeFacets, from) => {
      if (activeFacets && activeFacets.type.length > 1) {
        // Default is LR_TYPE_ALL, don't want that here. course or resourcefile only
        activeFacets["type"] = [LR_TYPE_COURSE]
      }

      const newResults = await search({
        text,
        from,
        activeFacets,
        size: SEARCH_PAGE_SIZE
      })

      setSearchFacets(new Map(Object.entries(newResults.aggregations ?? {})))

      setSearchResults(
        from === 0 ?
          newResults.hits.hits :
          [...results, ...newResults.hits.hits]
      )
      setTotal(newResults.hits.total)
      setCompletedInitialLoad(true)
    },
    [setSearchResults, results, setTotal, setCompletedInitialLoad]
  )

  const clearSearch = useCallback(() => {
    setSearchResults([])
    setCompletedInitialLoad(false)
    setTotal(0)
  }, [setSearchResults, setCompletedInitialLoad, setTotal])

  // this callback just echos the updated params up to the URL bar
  // we debounce b/c it gets a little bit choppy otherwise
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const setURLParam = useCallback(
    debounce(newSearch => {
      window.history.replaceState(null, null, `?${newSearch}`)
    }, 300),
    []
  )



}
