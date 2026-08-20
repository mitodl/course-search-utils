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

All PR titles and commits to `main` should use the [conventional commits](https://www.conventionalcommits.org/en/v1.0.0/) format. During release, the types of commits included since the last release inform what sort of version bump should be made. For example, bugfixes yield a new patch version, whereas breaking changes trigger a major version bump.

To trigger a release, use the "Releases (Semantic & Pre-release)" GitHub action (`release.yml`). This action will perform a semantic release or pre-release based on the `release-type` input.

**Pre-releases:** The action will (1) publish the latest commit on the specified branch to NPM, with a version `0.0.0-<git-short-sha>`, e.g. `0.0.0-7bc0c0f`; and (2) leave a comment on the branch's PR indicating the released version number, if such a PR is open.

**Semantic Release:** The action will:

1. Inspect the commit history since the previous release for [conventional commits](https://www.conventionalcommits.org/en/v1.0.0/).
2. Determine whether the version bump should be major, minor, or patch based on commit types. Breaking changes (e.g. `feat!: remove useCourseSearch`) will result in major version bumps.
3. Publish the package to NPM and the repository's [GitHub Releases](https://github.com/mitodl/course-search-utils/releases).

The `version` field in `package.json` is deliberately pinned at `0.0.0`; git tags and the npm registry are the source of truth for released versions.

Publishing uses [npm trusted publishing](https://docs.npmjs.com/trusted-publishers) via GitHub Actions OIDC, so no npm tokens are stored in this repository. Release notes for versions up to 3.6.0 are archived in [`RELEASE.rst`](./RELEASE.rst); newer releases are documented in GitHub Releases.

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
