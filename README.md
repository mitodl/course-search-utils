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

We squash-merge, so **your PR title sets the version bump** ([conventional commits](https://www.conventionalcommits.org/en/v1.0.0/), enforced by the `Validate PR title` check):

| PR title | Bump |
| --- | --- |
| `fix:` / `perf:` | patch |
| `feat:` | minor |
| `feat!:` (or a `BREAKING CHANGE:` footer) | major |
| `chore:` `docs:` `ci:` `test:` `refactor:` | **nothing is published** |

⚠️ If your change should reach consumers, title it `fix:` or `feat:`. A user-facing change titled `refactor:` or `chore:` silently never ships.

**To release:** Actions → "Releases (Semantic & Pre-release)" → Run workflow → `main` → `release-type: semantic-release`. Merging alone does not publish; someone has to dispatch this.

**To test in a consuming app:** run that action against your branch with `release-type: pre-release`. It publishes `0.0.0-<short-sha>` under the `preview` tag, never touching `latest`, and comments the version on your PR.

Don't edit `version` in `package.json` — it stays `0.0.0`; git tags and npm are the source of truth. Publishing uses [npm trusted publishing](https://docs.npmjs.com/trusted-publishers) via GitHub Actions OIDC, so no npm tokens are stored here. Notes through 3.6.0 are archived in [`RELEASE.rst`](./RELEASE.rst); newer ones are in [GitHub Releases](https://github.com/mitodl/course-search-utils/releases).

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
