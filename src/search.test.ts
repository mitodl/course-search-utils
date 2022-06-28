import bodybuilder from "bodybuilder"

import {
  INITIAL_FACET_STATE,
  LearningResourceType,
  LR_TYPE_ALL
} from "./constants"

import {
  LEARN_SUGGEST_FIELDS,
  RESOURCE_QUERY_NESTED_FIELDS,
  RESOURCEFILE_QUERY_FIELDS,
  searchFields,
  buildSuggestQuery,
  buildSearchQuery,
  buildDefaultSort,
  buildLearnQuery,
  channelField
} from "./search"

import { Facets } from "./url_utils"

describe("search library", () => {
  let activeFacets: Facets

  beforeEach(() => {
    activeFacets = {
      ...INITIAL_FACET_STATE,
      type: [LearningResourceType.Course]
    }
  })

  it("builds a search query with empty values", () => {
    expect(buildSearchQuery({})).toStrictEqual({
      query: {
        bool: {
          should: ["comment", "post", "profile"].map(objectType => ({
            bool: {
              filter: {
                bool: {
                  must: [{ term: { object_type: objectType } }]
                }
              }
            }
          }))
        }
      }
    })
  })

  it("form a basic text query", () => {
    // @ts-ignore
    const { query } = buildSearchQuery({
      text: "Dogs are the best",
      activeFacets
    })
    const repeatedPart = {
      should: [
        {
          multi_match: {
            query:  "Dogs are the best",
            fields: searchFields(LearningResourceType.Course)
          }
        },
        {
          wildcard: {
            coursenum: {
              boost:   100,
              rewrite: "constant_score",
              value:   "DOGS ARE THE BEST*"
            }
          }
        },
        {
          nested: {
            path:  "runs",
            query: {
              multi_match: {
                query:  "Dogs are the best",
                fields: RESOURCE_QUERY_NESTED_FIELDS
              }
            }
          }
        },
        {
          has_child: {
            type:  "resourcefile",
            query: {
              multi_match: {
                query:  "Dogs are the best",
                fields: RESOURCEFILE_QUERY_FIELDS
              }
            },
            score_mode: "avg"
          }
        }
      ]
    }

    expect(query).toStrictEqual({
      bool: {
        should: [
          {
            bool: {
              filter: {
                bool: {
                  must: [
                    {
                      term: {
                        object_type: LearningResourceType.Course
                      }
                    },
                    {
                      bool: repeatedPart
                    }
                  ]
                }
              },
              ...repeatedPart
            }
          }
        ]
      }
    })
  })

  it("filters on object type", () => {
    expect(buildSearchQuery({ activeFacets: { type: ["xyz"] } })).toStrictEqual(
      {
        query: {
          bool: {
            should: ["xyz"].map(objectType => ({
              bool: {
                filter: {
                  bool: {
                    must: [{ term: { object_type: objectType } }]
                  }
                }
              }
            }))
          }
        }
      }
    )
  })

  it(`filters by platform and topics`, () => {
    const text = ""
    const facets = {
      offered_by: ["MITx"],
      topics:     ["Engineering", "Science"],
      type:       [LearningResourceType.Course]
    }

    expect(
      // @ts-ignore
      buildSearchQuery({ text: text, activeFacets: facets })
    ).toStrictEqual({
      aggs: {
        agg_filter_offered_by: {
          aggs: {
            offered_by: {
              terms: {
                field: "offered_by",
                size:  10000
              }
            }
          },
          filter: {
            bool: {
              should: [
                {
                  bool: {
                    filter: {
                      bool: {
                        must: [
                          {
                            bool: {
                              should: [
                                {
                                  term: {
                                    topics: "Engineering"
                                  }
                                },
                                {
                                  term: {
                                    topics: "Science"
                                  }
                                }
                              ]
                            }
                          },
                          {
                            bool: {
                              should: [
                                {
                                  term: {
                                    "object_type.keyword": "course"
                                  }
                                }
                              ]
                            }
                          }
                        ]
                      }
                    }
                  }
                }
              ]
            }
          }
        },
        agg_filter_topics: {
          aggs: {
            topics: {
              terms: {
                field: "topics",
                size:  10000
              }
            }
          },
          filter: {
            bool: {
              should: [
                {
                  bool: {
                    filter: {
                      bool: {
                        must: [
                          {
                            bool: {
                              should: [
                                {
                                  term: {
                                    offered_by: "MITx"
                                  }
                                }
                              ]
                            }
                          },
                          {
                            bool: {
                              should: [
                                {
                                  term: {
                                    "object_type.keyword": "course"
                                  }
                                }
                              ]
                            }
                          }
                        ]
                      }
                    }
                  }
                }
              ]
            }
          }
        },
        agg_filter_type: {
          aggs: {
            type: {
              terms: {
                field: "object_type.keyword",
                size:  10000
              }
            }
          },
          filter: {
            bool: {
              should: [
                {
                  bool: {
                    filter: {
                      bool: {
                        must: [
                          {
                            bool: {
                              should: [
                                {
                                  term: {
                                    offered_by: "MITx"
                                  }
                                }
                              ]
                            }
                          },
                          {
                            bool: {
                              should: [
                                {
                                  term: {
                                    topics: "Engineering"
                                  }
                                },
                                {
                                  term: {
                                    topics: "Science"
                                  }
                                }
                              ]
                            }
                          }
                        ]
                      }
                    }
                  }
                }
              ]
            }
          }
        }
      },
      post_filter: {
        bool: {
          must: [
            {
              bool: {
                should: [
                  {
                    term: {
                      offered_by: "MITx"
                    }
                  }
                ]
              }
            },
            {
              bool: {
                should: [
                  {
                    term: {
                      topics: "Engineering"
                    }
                  },
                  {
                    term: {
                      topics: "Science"
                    }
                  }
                ]
              }
            },
            {
              bool: {
                should: [
                  {
                    term: {
                      "object_type.keyword": "course"
                    }
                  }
                ]
              }
            }
          ]
        }
      },
      query: {
        bool: {
          should: [
            {
              bool: {
                filter: {
                  bool: {
                    must: [
                      {
                        term: {
                          object_type: "course"
                        }
                      }
                    ]
                  }
                }
              }
            }
          ]
        }
      }
    })
  })

  it("should do a nested query for level", () => {
    activeFacets["level"] = ["Undergraduate"]
    //eslint-disable-next-line camelcase
    const { query, post_filter, aggs } = buildSearchQuery({
      text: "",
      activeFacets
    })
    expect(query).toStrictEqual({
      bool: {
        should: [
          {
            bool: {
              filter: {
                bool: {
                  must: [
                    {
                      term: {
                        object_type: LearningResourceType.Course
                      }
                    }
                  ]
                }
              }
            }
          }
        ]
      }
    })

    // this is the part of aggregation specific to the nesting
    expect(aggs.agg_filter_level.aggs).toStrictEqual({
      level: {
        aggs: {
          level: {
            aggs: {
              courses: {
                reverse_nested: {}
              }
            },
            terms: {
              field: "runs.level",
              size:  10000
            }
          }
        },
        nested: {
          path: "runs"
        }
      }
    })

    expect(post_filter).toStrictEqual({
      bool: {
        must: [
          {
            bool: {
              should: [
                {
                  term: {
                    "object_type.keyword": "course"
                  }
                }
              ]
            }
          },
          {
            bool: {
              should: [
                {
                  nested: {
                    path:  "runs",
                    query: {
                      match: {
                        "runs.level": "Undergraduate"
                      }
                    }
                  }
                }
              ]
            }
          }
        ]
      }
    })
  })

  it("should include an appropriate resource query and aggregation for resource_type ", () => {
    //eslint-disable-next-line camelcase
    const { query, post_filter, aggs } = buildSearchQuery({
      text:         "",
      activeFacets: {
        ...INITIAL_FACET_STATE,
        resource_type: ["Exams"],
        type:          [LearningResourceType.ResourceFile],
        offered_by:    ["OCW"]
      }
    })

    expect(query).toStrictEqual({
      bool: {
        should: [
          {
            bool: {
              filter: {
                bool: {
                  must: [
                    {
                      term: {
                        object_type: LearningResourceType.ResourceFile
                      }
                    }
                  ]
                }
              }
            }
          }
        ]
      }
    })

    expect(aggs.agg_filter_resource_type.aggs).toStrictEqual({
      resource_type: {
        terms: {
          field: "resource_type",
          size:  10000
        }
      }
    })

    expect(post_filter).toStrictEqual({
      bool: {
        must: [
          {
            bool: {
              should: [
                {
                  has_parent: {
                    parent_type: "resource",
                    query:       {
                      bool: {
                        should: [
                          {
                            term: {
                              offered_by: "OCW"
                            }
                          }
                        ]
                      }
                    }
                  }
                }
              ]
            }
          },
          {
            bool: {
              should: [
                {
                  term: {
                    "object_type.keyword": LearningResourceType.ResourceFile
                  }
                }
              ]
            }
          },
          {
            bool: {
              should: [
                {
                  term: {
                    resource_type: "Exams"
                  }
                }
              ]
            }
          }
        ]
      }
    })
  })

  it("should include suggest query, if text", () => {
    expect(
      // @ts-ignore
      buildSearchQuery({ text: "text!", activeFacets }).suggest
    ).toStrictEqual(buildSuggestQuery("text!", LEARN_SUGGEST_FIELDS))
    // @ts-ignore
    expect(buildSearchQuery({ activeFacets }).suggest).toBeUndefined()
  })

  it("should set from, size values", () => {
    // @ts-ignore
    const query = buildSearchQuery({ from: 10, size: 100, activeFacets })
    // @ts-ignore
    expect(query.from).toBe(10)
    // @ts-ignore
    expect(query.size).toBe(100)
  })

  //
  ;[
    [null, LearningResourceType.Course, undefined, []],
    [undefined, LearningResourceType.Course, undefined, []],
    [
      { field: "nested.field", option: "desc" },
      LearningResourceType.ResourceFile,
      undefined,
      []
    ],
    [
      { field: "nested.field", option: "desc" },
      LearningResourceType.Course,
      [{ "nested.field": { order: "desc", nested: { path: "nested" } } }],
      []
    ],
    [
      { field: "department_course_numbers.sort_coursenum", option: "asc" },
      LearningResourceType.Course,
      [
        {
          "department_course_numbers.sort_coursenum": {
            nested: {
              filter: {
                term: {
                  "department_course_numbers.primary": true
                }
              },
              path: "department_course_numbers"
            },
            order: "asc"
          }
        }
      ],
      []
    ],
    [
      { field: "department_course_numbers.sort_coursenum", option: "asc" },
      LearningResourceType.Course,
      [
        {
          "department_course_numbers.sort_coursenum": {
            nested: {
              filter: {
                bool: {
                  should: [
                    {
                      term: {
                        "department_course_numbers.department": "Physics"
                      }
                    }
                  ]
                }
              },
              path: "department_course_numbers"
            },
            order: "asc"
          }
        }
      ],
      ["Physics"]
    ],
    [
      { field: "department_course_numbers.sort_coursenum", option: "asc" },
      LearningResourceType.ResourceFile,
      undefined,
      []
    ]
  ].forEach(([sortField, type, expectedSort, departmentFilter]) => {
    it(`should add a sort option if field is ${JSON.stringify(
      sortField
    )} and type is ${type}`, () => {
      // @ts-ignore
      activeFacets["type"] = [type]
      // @ts-ignore
      activeFacets["department_name"] = departmentFilter
      // @ts-ignore
      const query = buildSearchQuery({ sort: sortField, activeFacets })
      // @ts-ignore
      expect(query.sort).toStrictEqual(expectedSort)
    })
  })

  it(`sorts the search results when there are no filters or text`, () => {
    const query = buildLearnQuery(bodybuilder(), null, LR_TYPE_ALL, {})
    expect(query.sort).toStrictEqual(buildDefaultSort())
  })

  it("filters by channelName", () => {
    const type = LearningResourceType.Comment
    const channelName = "a_channel"
    expect(
      buildSearchQuery({ channelName, activeFacets: { type: [type] } })
    ).toStrictEqual({
      query: {
        bool: {
          should: [
            {
              bool: {
                filter: {
                  bool: {
                    must: [
                      {
                        term: {
                          object_type: type
                        }
                      },
                      {
                        term: {
                          ["channel_name"]: channelName
                        }
                      }
                    ]
                  }
                }
              }
            }
          ]
        }
      }
    })
  })

  describe("channelField", () => {
    [
      [LearningResourceType.Post, "channel_name"],
      [LearningResourceType.Comment, "channel_name"],
      [LearningResourceType.Profile, "author_channel_membership"]
    ].forEach(([type, field]) => {
      it(`has the right channelField for ${type}`, () => {
        expect(channelField(type as LearningResourceType)).toStrictEqual(field)
      })
    })
  })

  describe("searchFields", () => {
    [
      ["post", ["text.english", "post_title.english", "plain_text.english"]],
      ["comment", ["text.english"]],
      [
        "profile",
        ["author_headline.english", "author_bio.english", "author_name.english"]
      ],
      [
        "course",
        [
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
      ],
      ["program", ["title.english^3", "short_description.english^2", "topics"]],
      [
        "userlist",
        ["title.english^3", "short_description.english^2", "topics"]
      ],
      [
        "video",
        [
          "title.english^3",
          "short_description.english^2",
          "full_description.english",
          "transcript.english^2",
          "topics",
          "platform",
          "video_id",
          "offered_by"
        ]
      ]
    ].forEach(([type, fields]) => {
      it(`has the right searchFields for ${type}`, () => {
        expect(searchFields(type as LearningResourceType)).toStrictEqual(fields)
      })
    })
  })
  ;[
    ['"mechanical engineering"', "query_string"],
    ["'mechanical engineering\"", "multi_match"],
    ["'mechanical engineering'", "multi_match"],
    ["mechanical engineering", "multi_match"]
  ].forEach(([text, queryType]) => {
    it(`constructs a ${queryType} query on text ${text}`, () => {
      const esQuery = buildLearnQuery(bodybuilder(), text, [
        LearningResourceType.Course
      ])
      expect(
        Object.keys(esQuery.query.bool.should[0].bool.should[0])
      ).toStrictEqual([queryType])
    })
  })

  it("should include a childQuery for course type", () => {
    const text = "search query"
    const esQuery = buildLearnQuery(bodybuilder(), text, [
      LearningResourceType.Course
    ])
    expect(esQuery.query.bool.should[0].bool.should.length).toStrictEqual(4)

    expect(esQuery.query.bool.should[0].bool.should[3]).toStrictEqual({
      has_child: {
        type:  "resourcefile",
        query: {
          multi_match: {
            query:  text,
            fields: [
              "content",
              "title.english^3",
              "short_description.english^2",
              "department_name",
              "resource_type"
            ]
          }
        },
        score_mode: "avg"
      }
    })
  })
})
