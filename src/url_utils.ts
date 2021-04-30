import * as _ from "lodash"
import * as qs from "query-string"

// type for the values in the object returned by qs.parse
type ParsedParam = string[] | string | undefined | null

export const toArray = (obj: ParsedParam): string[] | undefined =>
  Array.isArray(obj) ? obj : obj ? [obj] : undefined

const urlParamToArray = (param: ParsedParam): string[] =>
  _.union(toArray(param) || [])

export interface Facets {
  audience: string[]
  certification: string[]
  type: string[]
  offered_by: string[] // eslint-disable-line camelcase
  topics: string[]
  department_name: string[] // eslint-disable-line camelcase
  level: string[]
  course_feature_tags: string[] // eslint-disable-line camelcase
  resource_type: string[] // eslint-disable-line camelcase
}

type SearchParams = {
  text: string
  activeFacets: Facets
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

export const deserializeSearchParams = (location: Location): SearchParams => {
  const { type, o, t, q, a, c, d, l, f, r } = qs.parse(location.search)

  return {
    text:         handleText(q),
    activeFacets: {
      audience:            urlParamToArray(a),
      certification:       urlParamToArray(c),
      type:                urlParamToArray(type),
      offered_by:          urlParamToArray(o), // eslint-disable-line camelcase
      topics:              urlParamToArray(t),
      department_name:     urlParamToArray(d), // eslint-disable-line camelcase
      level:               urlParamToArray(l),
      course_feature_tags: urlParamToArray(f), // eslint-disable-line camelcase
      resource_type:       urlParamToArray(r) // eslint-disable-line camelcase
    }
  }
}

export const serializeSearchParams = ({
  text,
  activeFacets
}: Partial<SearchParams>): string => {
  const {
    type,
    offered_by, // eslint-disable-line camelcase
    topics,
    audience,
    certification,
    department_name, // eslint-disable-line camelcase
    level,
    course_feature_tags, // eslint-disable-line camelcase
    resource_type // eslint-disable-line camelcase
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
    r: resource_type
  })
}