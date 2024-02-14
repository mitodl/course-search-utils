/* eslint-disable camelcase */
import * as _ from "lodash"
import * as qs from "query-string"

// type for the values in the object returned by qs.parse
type ParsedParam = string[] | string | undefined | null

export const toArray = (obj: ParsedParam): string[] | undefined =>
  Array.isArray(obj) ? obj : obj ? [obj] : undefined

const urlParamToArray = (param: ParsedParam): string[] =>
  _.union(toArray(param) || [])

export interface Facets {
  platform?: string[]
  offered_by?: string[]
  topic?: string[]
  department?: string[]
  level?: string[]
  course_feature?: string[]
  resource_type?: string[]
  content_feature_type?: string[]
}

export interface FacetsAndSort {
  activeFacets: Facets
  sort: string | null
  ui: string | null
  endpoint: string | null
}

export type SearchParams = {
  text: string
  activeFacets: Facets
  sort: string | null
  ui: string | null
  endpoint: string | null
}

const handleText = (q: ParsedParam): string => {
  if (Array.isArray(q)) {
    return q.join("")
  }

  if (q === null || q === undefined) {
    return ""
  }
  return q
}

export const deserializeTextParam = (param: string): string | null => {
  if (!param) {
    return null
  }

  return param
}

export const deserializeSearchParams = ({
  search
}: {
  search: string
}): SearchParams => {
  const searchUrlParams = search.replace(/^\?/, "").split("?", 1)[0]

  const { p, o, t, q, d, l, f, cf, r, s, u, e } = qs.parse(searchUrlParams)

  return {
    text:         handleText(q),
    activeFacets: {
      platform:             urlParamToArray(p),
      offered_by:           urlParamToArray(o),
      topic:                urlParamToArray(t),
      department:           urlParamToArray(d),
      level:                urlParamToArray(l),
      course_feature:       urlParamToArray(f),
      resource_type:        urlParamToArray(r),
      content_feature_type: urlParamToArray(cf)
    },
    sort:     deserializeTextParam(handleText(s)),
    ui:       deserializeTextParam(handleText(u)),
    endpoint: deserializeTextParam(handleText(e))
  }
}

export const serializeTextParam = (
  param: string | null
): string | undefined => {
  if (param === null) {
    // leave it off the params if set to default
    return undefined
  }

  return param
}

export const serializeSearchParams = ({
  text,
  activeFacets,
  sort,
  ui,
  endpoint
}: Partial<SearchParams>): string => {
  const {
    platform,
    offered_by,
    topic,
    department,
    level,
    course_feature,
    resource_type,
    content_feature_type,
    ...others
  } = activeFacets ?? {}
  if (Object.keys(others).length > 0) {
    console.warn("Unrecognized facets:", others)
  }

  return qs.stringify({
    q:  text || undefined,
    o:  offered_by,
    t:  topic,
    d:  department,
    l:  level,
    f:  course_feature,
    r:  resource_type,
    cf: content_feature_type,
    s:  serializeTextParam(sort || null),
    u:  serializeTextParam(ui || null),
    e:  serializeTextParam(endpoint || null)
  })
}
