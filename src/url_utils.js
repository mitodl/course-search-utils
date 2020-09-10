// @flow
import _ from "lodash"
import qs from "query-string"

export const toArray = obj =>
  Array.isArray(obj) ? obj : obj ? [obj] : undefined

const urlParamToArray = param => _.union(toArray(param) || [])

// type URLSearchParams = {
//   text: string,
//   activeFacets: {
//     audience: Array<string>,
//     certification: Array<string>,
//     type: Array<string>,
//     offered_by: Array<string>,
//     topics: Array<string>
//   }
// }

export const deserializeSearchParams = location => {
  const { type, o, t, q, a, c } = qs.parse(location.search)

  return {
    text:         q,
    activeFacets: {
      audience:      urlParamToArray(a),
      certification: urlParamToArray(c),
      type:          urlParamToArray(type),
      offered_by:    urlParamToArray(o),
      topics:        urlParamToArray(t)
    }
  }
}

export const serializeSearchParams = ({ text, activeFacets }) => {
  // eslint-disable-next-line camelcase
  const { type, offered_by, topics, audience, certification } = activeFacets

  return qs.stringify({
    q: text || undefined,
    type,
    a: audience,
    c: certification,
    o: offered_by,
    t: topics
  })
}
