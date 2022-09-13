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
  audience?: string[]
  certification?: string[]
  type?: string[]
  offered_by?: string[]
  topics?: string[]
  department_name?: string[]
  level?: string[]
  course_feature_tags?: string[]
  resource_type?: string[]
}

export interface SortParam {
  field: string
  option: string
}

export interface FacetsAndSort {
  activeFacets: Facets
  sort: SortParam | null
  ui: string | null
}

type SearchParams = {
  text: string
  activeFacets: Facets
  sort: SortParam | null
  ui: string | null
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

export const deserializeSort = (sortParam: string): SortParam | null => {
  if (!sortParam) {
    return null
  }

  if (sortParam.startsWith("-")) {
    return {
      field:  sortParam.slice(1),
      option: "desc"
    }
  } else {
    return {
      field:  sortParam,
      option: "asc"
    }
  }
}

export const deserializeUI = (uiParam: string): string | null => {
  if (!uiParam) {
    return null
  }

  return uiParam
}

export const deserializeSearchParams = ({
  search
}: {
  search: string
}): SearchParams => {
  const searchUrlParams = search.replace(/^\?/, "").split("?", 1)[0]

  const { type, o, t, q, a, c, d, l, f, r, s, u } = qs.parse(searchUrlParams)

  return {
    text:         handleText(q),
    activeFacets: {
      audience:            urlParamToArray(a),
      certification:       urlParamToArray(c),
      type:                urlParamToArray(type),
      offered_by:          urlParamToArray(o),
      topics:              urlParamToArray(t),
      department_name:     urlParamToArray(d),
      level:               urlParamToArray(l),
      course_feature_tags: urlParamToArray(f),
      resource_type:       urlParamToArray(r)
    },
    sort: deserializeSort(handleText(s)),
    ui:   deserializeUI(handleText(u))
  }
}

export const serializeSort = (sort: SortParam | null): string | undefined => {
  if (sort === null) {
    // leave it off the params if set to default
    return undefined
  }

  if (sort.option === "desc") {
    return `-${sort.field}`
  } else {
    return sort.field
  }
}

export const serializeUI = (ui: string | null): string | undefined => {
  if (ui === null) {
    // leave it off the params if set to default
    return undefined
  }

  return ui
}

export const serializeSearchParams = ({
  text,
  activeFacets,
  sort,
  ui
}: Partial<SearchParams>): string => {
  const {
    type,
    offered_by,
    topics,
    audience,
    certification,
    department_name,
    level,
    course_feature_tags,
    resource_type
  } = activeFacets ?? {}

  return qs.stringify({
    q: text || undefined,
    type,
    a: audience,
    c: certification,
    o: offered_by,
    t: topics,
    d: department_name,
    l: level,
    f: course_feature_tags,
    r: resource_type,
    s: serializeSort(sort || null),
    u: serializeUI(ui || null)
  })
}
