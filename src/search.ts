import bodybuilder, { Bodybuilder } from "bodybuilder"
import { either, isEmpty, isNil, uniq, intersection, equals } from "ramda"

import {
  LearningResourceType,
  COURSENUM_SORT_FIELD,
  Level,
  LR_TYPE_ALL
} from "./constants"
import { SortParam, Facets } from "./url_utils"
const PODCAST_QUERY_FIELDS = [
  "title.english^3",
  "short_description.english^2",
  "full_description.english",
  "topics"
]

export const LEARN_SUGGEST_FIELDS = [
  "title.trigram",
  "short_description.trigram"
]

const CHANNEL_SUGGEST_FIELDS = ["suggest_field1", "suggest_field2"]

const PODCAST_EPISODE_QUERY_FIELDS = [
  "title.english^3",
  "short_description.english^2",
  "full_description.english",
  "topics",
  "series_title^2"
]

const COURSE_QUERY_FIELDS = [
  "title.english^3",
  "short_description.english^2",
  "full_description.english",
  "topics",
  "platform",
  "course_id",
  "offered_by",
  "department_name",
  "course_feature_tags"
]
const VIDEO_QUERY_FIELDS = [
  "title.english^3",
  "short_description.english^2",
  "full_description.english",
  "transcript.english^2",
  "topics",
  "platform",
  "video_id",
  "offered_by"
]

const LIST_QUERY_FIELDS = [
  "title.english^3",
  "short_description.english^2",
  "topics"
]

const POST_QUERY_FIELDS = [
  "text.english",
  "post_title.english",
  "plain_text.english"
]
const COMMENT_QUERY_FIELDS = ["text.english"]
const PROFILE_QUERY_FIELDS = [
  "author_headline.english",
  "author_bio.english",
  "author_name.english"
]

export const RESOURCE_QUERY_NESTED_FIELDS = [
  "runs.year",
  "runs.semester",
  "runs.level",
  "runs.instructors^5",
  "department_name"
]

export const RESOURCEFILE_QUERY_FIELDS = [
  "content",
  "title.english^3",
  "short_description.english^2",
  "department_name",
  "resource_type"
]

const OBJECT_TYPE = "type"
const POST_CHANNEL_FIELD = "channel_name"
const COMMENT_CHANNEL_FIELD = "channel_name"
const PROFILE_CHANNEL_FIELD = "author_channel_membership"

export const SEARCH_FILTER_POST = "post"
export const SEARCH_FILTER_COMMENT = "comment"
export const SEARCH_FILTER_PROFILE = "profile"

export const channelField = (type: LearningResourceType): string => {
  if (type === LearningResourceType.Post) {
    return POST_CHANNEL_FIELD
  } else if (type === LearningResourceType.Comment) {
    return COMMENT_CHANNEL_FIELD
  } else if (type === LearningResourceType.Profile) {
    return PROFILE_CHANNEL_FIELD
  } else {
    throw new Error("Missing type")
  }
}

export const searchFields = (type: LearningResourceType): string[] => {
  switch (type) {
  case LearningResourceType.Course:
    return COURSE_QUERY_FIELDS
  case LearningResourceType.Video:
    return VIDEO_QUERY_FIELDS
  case LearningResourceType.Podcast:
    return PODCAST_QUERY_FIELDS
  case LearningResourceType.PodcastEpisode:
    return PODCAST_EPISODE_QUERY_FIELDS
  case LearningResourceType.ResourceFile:
    return RESOURCEFILE_QUERY_FIELDS
  case LearningResourceType.Comment:
    return COMMENT_QUERY_FIELDS
  case LearningResourceType.Post:
    return POST_QUERY_FIELDS
  case LearningResourceType.Profile:
    return PROFILE_QUERY_FIELDS
  case LearningResourceType.Program:
  case LearningResourceType.Userlist:
  case LearningResourceType.LearningPath:
    return LIST_QUERY_FIELDS
  default:
    return uniq([
      ...POST_QUERY_FIELDS,
      ...COMMENT_QUERY_FIELDS,
      ...PROFILE_QUERY_FIELDS
    ])
  }
}

export const isDoubleQuoted = (str: string | null | undefined): boolean =>
  /^".+"$/.test(normalizeDoubleQuotes(str) || "")

export const normalizeDoubleQuotes = (
  text: string | null | undefined
): string => (text || "").replace(/[\u201C\u201D]/g, '"')

export const emptyOrNil = either(isEmpty, isNil)

/**
  Interface for parameters for generating a search query. Supported fields are text, searchAfter, size, sort, channelName
  and activeFacets. activeFacets supports audience, certification, type, offered_by, topics, department_name, level,
  course_feature_tags and resource_type as nested params
*/
export interface SearchQueryParams {
  text?: string
  searchAfter?: number[]
  size?: number
  sort?: SortParam
  activeFacets?: Facets
  channelName?: string
  resourceTypes?: string[]
  aggregations?: string[]
}

const getTypes = (activeFacets: Facets | undefined) => {
  if (activeFacets?.type) {
    return activeFacets.type
  } else {
    return [SEARCH_FILTER_COMMENT, SEARCH_FILTER_POST, SEARCH_FILTER_PROFILE]
  }
}

/**
 Generates an elasticsearch query object with nested string parameters from inputs of type SearchQueryParams.
*/
export const buildSearchQuery = ({
  text,
  searchAfter,
  size,
  sort,
  activeFacets,
  channelName,
  resourceTypes,
  aggregations
}: SearchQueryParams): Record<string, any> => {
  let builder = bodybuilder()

  if (!isNil(searchAfter)) {
    builder = builder.rawOption("search_after", searchAfter)
  }

  if (!isNil(size)) {
    builder = builder.size(size)
  }
  if (
    sort &&
    activeFacets &&
    !(activeFacets.type ?? []).includes(LearningResourceType.ResourceFile)
  ) {
    const { field, option } = sort
    const fieldPieces = field.split(".")

    const sortQuery = {
      order:  option,
      nested: {
        path: fieldPieces[0]
      }
    }

    if (field === COURSENUM_SORT_FIELD) {
      if ((activeFacets.department_name ?? []).length === 0) {
        sortQuery["nested"]["filter"] = {
          term: {
            "department_course_numbers.primary": true
          }
        }
      } else {
        const filterClause: any[] = []
        addFacetClauseToArray(
          filterClause,
          "department_course_numbers.department",
          activeFacets.department_name || [],
          LearningResourceType.Course
        )
        sortQuery["nested"]["filter"] = filterClause[0]
      }
    }

    builder.sort(field, sortQuery)
  }

  const types = resourceTypes ?? getTypes(activeFacets)
  const searchText = normalizeDoubleQuotes(text)
  return emptyOrNil(
    intersection([...LR_TYPE_ALL, LearningResourceType.ResourceFile], types)
  ) ?
    buildChannelQuery(builder, searchText, types, channelName) :
    buildLearnQuery(builder, searchText, types, activeFacets, aggregations)
}

export const buildChannelQuery = (
  builder: Bodybuilder,
  text: string | null,
  types: Array<string>,
  channelName: string | undefined
): Record<string, any> => {
  for (const type of types) {
    const textQuery = emptyOrNil(text) ?
      {} :
      {
        should: [
          {
            multi_match: {
              query:  text,
              fields: searchFields(type as LearningResourceType)
            }
          }
        ].filter(clause => clause !== null)
      }

    // If channelName is present add a filter for the type
    const channelClauses = channelName ?
      [
        {
          term: {
            [channelField(type as LearningResourceType)]: channelName
          }
        }
      ] :
      []

    builder = buildOrQuery(builder, type, textQuery, channelClauses)
  }

  if (!emptyOrNil(text)) {
    builder = builder.rawOption(
      "suggest",
      // @ts-expect-error
      buildSuggestQuery(text, CHANNEL_SUGGEST_FIELDS)
    )
  }

  return builder.build()
}

export const buildLearnQuery = (
  builder: Bodybuilder,
  text: string | null,
  types: Array<string>,
  facets?: Facets,
  aggregations?: Array<string>
): Record<string, any> => {
  for (const type of types) {
    const queryType = isDoubleQuoted(text) ? "query_string" : "multi_match"
    const textQuery = emptyOrNil(text) ?
      {} :
      {
        should: [
          {
            [queryType]: {
              query:  text,
              fields: searchFields(type as LearningResourceType)
            }
          },
          {
            wildcard: {
              coursenum: {
                value:   `${(text || "").toUpperCase()}*`,
                boost:   100.0,
                rewrite: "constant_score"
              }
            }
          },
          [
            LearningResourceType.Course,
            LearningResourceType.Program
          ].includes(type as LearningResourceType) ?
            {
              nested: {
                path:  "runs",
                query: {
                  [queryType]: {
                    query:  text,
                    fields: RESOURCE_QUERY_NESTED_FIELDS
                  }
                }
              }
            } :
            null,
          type === LearningResourceType.Course ?
            {
              has_child: {
                type:  "resourcefile",
                query: {
                  [queryType]: {
                    query:  text,
                    fields: RESOURCEFILE_QUERY_FIELDS
                  }
                },
                score_mode: "avg"
              }
            } :
            null
        ]
          .flat()
          .filter(clause => clause !== null)
      }

    // Add filters for facets if necessary
    const facetClauses = buildFacetSubQuery(facets, builder, type, aggregations)
    builder = buildOrQuery(builder, type, textQuery, [])
    builder = builder.rawOption("post_filter", {
      bool: {
        must: [...facetClauses]
      }
    })

    // Include suggest if search test is not null/empty
    if (!emptyOrNil(text)) {
      builder = builder.rawOption(
        "suggest",
        // @ts-expect-error
        buildSuggestQuery(text, LEARN_SUGGEST_FIELDS)
      )
    } else if (facetClauses.length === 0 && equals(types, LR_TYPE_ALL)) {
      builder = builder.rawOption("sort", buildDefaultSort())
    }
  }
  return builder.build()
}

interface LevelFilter {
  nested: {
    path: "runs"
    query: {
      match: {
        "runs.level": Level
      }
    }
  }
}

const buildLevelQuery = (
  _builder: Bodybuilder,
  values: Level[],
  facetClauses: any
) => {
  if (values && values.length > 0) {
    const facetFilter: LevelFilter[] = values.map(value => ({
      nested: {
        path:  "runs",
        query: {
          match: {
            "runs.level": value
          }
        }
      }
    }))
    facetClauses.push({
      bool: {
        should: facetFilter
      }
    })
  }
}

export const buildFacetSubQuery = (
  facets: Facets | undefined,
  builder: Bodybuilder,
  objectType?: string,
  aggregations?: string[]
): any[] => {
  const facetClauses: any[] = []
  if (facets) {
    Object.entries(facets).forEach(([key, values]) => {
      const facetClausesForFacet: any[] = []

      if (values && values.length > 0) {
        if (key === "level") {
          buildLevelQuery(builder, values, facetClauses)
        } else {
          addFacetClauseToArray(facetClauses, key, values, objectType)
        }
      }

      if (aggregations && aggregations.includes(key)) {
        // $FlowFixMe: we check for null facets earlier
        Object.entries(facets).forEach(([otherKey, otherValues]) => {
          if (otherKey !== key && otherValues && otherValues.length > 0) {
            if (otherKey === "level") {
              buildLevelQuery(builder, otherValues, facetClausesForFacet)
            } else {
              addFacetClauseToArray(
                facetClausesForFacet,
                otherKey,
                otherValues,
                objectType
              )
            }
          }
        })

        if (facetClausesForFacet.length > 0) {
          const filter = {
            filter: {
              bool: {
                must: [...facetClausesForFacet]
              }
            }
          }

          if (key === "level") {
            // this is done seperately b/c it's a nested field
            builder.agg("filter", key, aggr =>
              aggr
                .orFilter("bool", filter)
                .agg("nested", { path: "runs" }, "level", aggr =>
                  aggr.agg(
                    "terms",
                    "runs.level",
                    { size: 10000 },
                    "level",
                    aggr =>
                      aggr.agg("reverse_nested", null as any, {}, "courses")
                  )
                )
            )
          } else {
            builder.agg("filter", key, aggregation =>
              aggregation
                .orFilter("bool", filter)
                .agg(
                  "terms",
                  key === OBJECT_TYPE ? "object_type.keyword" : key,
                  { size: 10000 },
                  key
                )
            )
          }
        } else {
          if (key === "level") {
            // this is done seperately b/c it's a nested field
            builder.agg("nested", { path: "runs" }, "level", aggr =>
              aggr.agg(
                "terms",
                "runs.level",
                {
                  size: 10000
                },
                "level",
                aggr => aggr.agg("reverse_nested", null as any, {}, "courses")
              )
            )
          } else {
            builder.agg(
              "terms",
              key === OBJECT_TYPE ? "object_type.keyword" : key,
              { size: 10000 },
              key
            )
          }
        }
      }
    })
  }
  return facetClauses
}

export const buildOrQuery = (
  builder: Bodybuilder,
  searchType: string,
  textQuery: Record<string, any> | undefined,
  extraClauses: any[]
): Bodybuilder => {
  if (emptyOrNil(textQuery)) {
    builder = builder.orQuery("bool", {
      filter: {
        bool: {
          must: [
            {
              term: {
                object_type: searchType
              }
            },
            ...extraClauses
          ]
        }
      }
    })
  } else {
    const textFilter = emptyOrNil(textQuery) ? [] : [{ bool: textQuery }]

    builder = builder.query(
      "function_score",
      {
        boost_mode:   "replace",
        script_score: {
          script: {
            source: "Math.round(_score*2)"
          }
        }
      },
      (nested : Bodybuilder)  =>
        nested.orQuery("bool", {
          filter: {
            bool: {
              must: [
                {
                  term: {
                    object_type: searchType
                  }
                },
                ...extraClauses,
                // Add multimatch text query here to filter out non-matching results
                ...textFilter
              ]
            }
          },
          // Add multimatch text query here again to score results based on match
          ...textQuery
        })
    )
  }
  return builder
}

const addFacetClauseToArray = (
  facetClauses: any[],
  facet: string,
  values: string[],
  type?: string
) => {
  if (
    facet === OBJECT_TYPE &&
    values.toString() === buildSearchQuery.toString()
  ) {
    return
  }

  const filterKey = facet === OBJECT_TYPE ? "object_type.keyword" : facet
  let valueClauses
  // Apply standard facet clause unless this is an offered_by facet for resources.
  if (facet !== "offered_by" || type !== LearningResourceType.ResourceFile) {
    valueClauses = values.map(value => ({
      term: {
        [filterKey]: value
      }
    }))
  } else {
    // offered_by facet should apply to parent doc of resource
    valueClauses = [
      {
        has_parent: {
          parent_type: "resource",
          query:       {
            bool: {
              should: values.map(value => ({
                term: {
                  [filterKey]: value
                }
              }))
            }
          }
        }
      }
    ]
  }

  facetClauses.push({
    bool: {
      should: valueClauses
    }
  })
}

export const buildSuggestQuery = (
  text: string,
  suggestFields: string[]
): Record<string, any> => {
  const suggest: any = {
    text
  }
  suggestFields.forEach(
    field =>
      (suggest[field] = {
        phrase: {
          field:      `${field}`,
          size:       5,
          gram_size:  1,
          confidence: 0.0001,
          max_errors: 3,
          collate:    {
            query: {
              source: {
                match_phrase: {
                  "{{field_name}}": "{{suggestion}}"
                }
              }
            },
            params: { field_name: `${field}` },
            prune:  true
          }
        }
      })
  )
  return suggest
}

export const buildDefaultSort = (): Array<any> => {
  return [
    { minimum_price: { order: "asc" } },
    { default_search_priority: { order: "desc" } },
    { created: { order: "desc" } }
  ]
}
