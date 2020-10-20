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
