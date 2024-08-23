import { Facets } from "./types"
import { LEVELS, DEPARTMENTS } from "../constants"

const reverseObject = (
  stringObject: Record<string, string>
): Record<string, string> => {
  return Object.fromEntries(
    Object.entries(stringObject).map(([key, value]) => [value, key])
  )
}

export const sanitizeFacets = (
  activeFacets: Facets,
  allowedFacetsOptions: Facets
): void => {
  const reverseLevels = reverseObject(LEVELS)
  const reverseDepartments = reverseObject(DEPARTMENTS)

  if (activeFacets) {
    Object.entries(activeFacets).forEach(([facet, values]) => {
      if (Object.keys(allowedFacetsOptions).indexOf(facet) > -1) {
        activeFacets[facet as keyof typeof activeFacets] = values.flatMap(
          (facetValue: string) => {
            if (
              // @ts-expect-error we checked that facet is also a key of FACET_OPTION
              allowedFacetsOptions[
                facet as keyof typeof allowedFacetsOptions
              ].indexOf(facetValue) > -1
            ) {
              return facetValue
            } else if (facet === "level" && facetValue in reverseLevels) {
              return reverseLevels[facetValue]
            } else if (
              facet === "department" &&
              facetValue in reverseDepartments
            ) {
              return reverseDepartments[facetValue]
            } else {
              return []
            }
          }
        )
      }
    })
  }
}
