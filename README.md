# Course Search Utils

This repo holds the core logic for our learning resource search. The basic API
is a React hook (`useCourseSearch`) which provides for deserializing the params from
the URL, managing the internal state of which facets are selected, etc.

## development

run the tests:

```
npm run test
npm run test:watch # for watch mode
```

run the typechecker:

```
npm run typecheck
```

## publishing

to publish a new version, open a PR with your changes and, once that is merged, check
out the latest commit locally and do the following:

```
npm version x.x.x # increment this from the previous version appropriately
npm publish
git push origin # npm writes a version increment commit
git push --tags # and it tags it too
```

## Usage

### Hooks

`@mitodl/course-search-utils` exports a few hooks to assist in making search requests to MIT Open's APIs. They are:

1. `useResourceSearchParams({ searchParams, setSearchParams, ...opts? })` and `useContentFileSearchParams`: Derive search API parameters from a `URLSearchParams` object. Often, the `URLSearchParams` object will be derived from the browser URL, though it could be state internal to react.

   The hook extracts validated API parameters from the `URLSearchParams` object and returns setters that can be used to manipulate the `URLSearchParams` (e.g., toggling a search facet on or off).

   The `URLSearchParams` keys are mapped directly to API parameters.

2. `useInfiniteSearch({ params, endpoint, baseUrl, ...opts? })`: Assists in making search API calls used in an infinite scrolling UI. The initial page is loaded by the hook, susbsequent pages via returm value `{ fetchNextPage }`. The hook's result is based on [useInfiniteQuery](https://tanstack.com/query/v4/docs/framework/react/reference/useInfiniteQuery).

See Typescript annotations and docstrings for more information on hook props and results. Typical usage might look like:

```tsx
import { useSearchQueryParams, useInfiniteSearch, } from "@mitodl/course-search-utils"
import type { UseInfiniteSearchProps } from "@mitodl/course-search-utils"

const CONSTANT_PARAMETERS = {
  platform: ["ocw"],
  aggregations: ["topic", "offered_by"]
}

const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const {
    params,
    toggleParamValue,
    clearAllFacets,
    currentText,
    setCurrentText,
    setCurrentTextAndQuery,
  } = useSearchQueryParams({
    searchParams,
    setSearchParams,
    facets: FACETS
  })

  // If necessary
  const allParams = useMemo(() => {
    return _.merge(params, CONSTANT_PARAMETERS)
  }, [params])

  const { pages, hasNextPage, fetchNextPage } = useInfiniteSearch({
    params: allParams,
    baseUrl: "http://mitopen.odl.mit.edu/",
    keepPreviousData: true,
  })

  const results = pages?.flatMap(p => p.results) ?? []

  return (/* Search component JSX*/)
}
```
