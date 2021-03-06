// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import {
  deserializeSearchParams,
  serializeSearchParams,
  toArray
} from "./url_utils"

describe("course search library", () => {
  describe("deserializeSearchParams", () => {
    it("should deserialize text from the URL", () => {
      expect(deserializeSearchParams({ search: "q=The Best Course" })).toEqual({
        activeFacets: {
          audience:            [],
          certification:       [],
          offered_by:          [],
          topics:              [],
          type:                [],
          department_name:     [],
          level:               [],
          course_feature_tags: [],
          resource_type:       []
        },
        text: "The Best Course",
        sort: null
      })
    })

    it("should deserialize offered by", () => {
      expect(deserializeSearchParams({ search: "o=MITx" })).toEqual({
        activeFacets: {
          audience:            [],
          certification:       [],
          offered_by:          ["MITx"],
          topics:              [],
          type:                [],
          department_name:     [],
          level:               [],
          course_feature_tags: [],
          resource_type:       []
        },
        text: "",
        sort: null
      })
    })

    it("should deserialize department_name", () => {
      expect(deserializeSearchParams({ search: "d=Philosophy" })).toEqual({
        activeFacets: {
          audience:            [],
          certification:       [],
          offered_by:          [],
          topics:              [],
          type:                [],
          department_name:     ["Philosophy"],
          level:               [],
          course_feature_tags: [],
          resource_type:       []
        },
        text: "",
        sort: null
      })
    })

    it("should deserialize topics from the URL", () => {
      expect(
        deserializeSearchParams({
          search:
            "t=Science&t=Physics&t=Chemistry&t=Computer%20Science&t=Electronics"
        })
      ).toEqual({
        activeFacets: {
          audience:      [],
          certification: [],
          offered_by:    [],
          topics:        [
            "Science",
            "Physics",
            "Chemistry",
            "Computer Science",
            "Electronics"
          ],
          type:                [],
          department_name:     [],
          level:               [],
          course_feature_tags: [],
          resource_type:       []
        },
        text: "",
        sort: null
      })
    })

    it("should deserialize type from the URL", () => {
      expect(deserializeSearchParams({ search: "type=course" })).toEqual({
        activeFacets: {
          audience:            [],
          certification:       [],
          offered_by:          [],
          topics:              [],
          type:                ["course"],
          department_name:     [],
          level:               [],
          course_feature_tags: [],
          resource_type:       []
        },
        text: "",
        sort: null
      })
    })

    it("should deserialize audience from the URL", () => {
      expect(deserializeSearchParams({ search: "a=Open%20Content" })).toEqual({
        activeFacets: {
          audience:            ["Open Content"],
          certification:       [],
          offered_by:          [],
          topics:              [],
          type:                [],
          department_name:     [],
          level:               [],
          course_feature_tags: [],
          resource_type:       []
        },
        text: "",
        sort: null
      })
    })

    it("should deserialize certification from the URL", () => {
      expect(deserializeSearchParams({ search: "c=Certification" })).toEqual({
        activeFacets: {
          audience:            [],
          certification:       ["Certification"],
          offered_by:          [],
          topics:              [],
          type:                [],
          department_name:     [],
          level:               [],
          course_feature_tags: [],
          resource_type:       []
        },
        text: "",
        sort: null
      })
    })

    it("should deserialize level from the URL", () => {
      expect(deserializeSearchParams({ search: "l=Graduate" })).toEqual({
        activeFacets: {
          audience:            [],
          certification:       [],
          offered_by:          [],
          topics:              [],
          type:                [],
          department_name:     [],
          level:               ["Graduate"],
          course_feature_tags: [],
          resource_type:       []
        },
        text: "",
        sort: null
      })
    })

    it("should deserialize course feature tags from the URL", () => {
      expect(
        deserializeSearchParams({
          search:
            "f=Exams%20with%20Solutions&f=Exams&f=Media%20Assignments&f=Media%20Assignments%20with%20Examples"
        })
      ).toEqual({
        activeFacets: {
          audience:            [],
          certification:       [],
          offered_by:          [],
          topics:              [],
          type:                [],
          department_name:     [],
          level:               [],
          resource_type:       [],
          course_feature_tags: [
            "Exams with Solutions",
            "Exams",
            "Media Assignments",
            "Media Assignments with Examples"
          ]
        },
        text: "",
        sort: null
      })
    })

    it("should deserialize resource type from the URL", () => {
      expect(
        deserializeSearchParams({
          search: "r=Assignments&r=Exams&r=Lecture%20Notes"
        })
      ).toEqual({
        activeFacets: {
          audience:            [],
          certification:       [],
          offered_by:          [],
          topics:              [],
          type:                [],
          department_name:     [],
          level:               [],
          course_feature_tags: [],
          resource_type:       ["Assignments", "Exams", "Lecture Notes"]
        },
        text: "",
        sort: null
      })
    })

    it("should deserialize an ascending sort param", () => {
      expect(deserializeSearchParams({ search: "s=coursenum" })).toEqual({
        activeFacets: {
          audience:            [],
          certification:       [],
          offered_by:          [],
          topics:              [],
          type:                [],
          department_name:     [],
          level:               [],
          course_feature_tags: [],
          resource_type:       []
        },
        text: "",
        sort: {
          field:  "coursenum",
          option: "asc"
        }
      })
    })

    it("should deserialize a descending sort param", () => {
      expect(deserializeSearchParams({ search: "s=-coursenum" })).toEqual({
        activeFacets: {
          audience:            [],
          certification:       [],
          offered_by:          [],
          topics:              [],
          type:                [],
          department_name:     [],
          level:               [],
          course_feature_tags: [],
          resource_type:       []
        },
        text: "",
        sort: {
          field:  "coursenum",
          option: "desc"
        }
      })
    })

    it("should ignore unknown params", () => {
      expect(deserializeSearchParams({ search: "eeee=beeeeeep" })).toEqual({
        activeFacets: {
          audience:            [],
          certification:       [],
          offered_by:          [],
          topics:              [],
          type:                [],
          department_name:     [],
          level:               [],
          course_feature_tags: [],
          resource_type:       []
        },
        text: "",
        sort: null
      })
    })
  })

  describe("serializeSearchParams", () => {
    it("should be ok with missing facets", () => {
      expect(serializeSearchParams({ text: "hey!" })).toEqual("q=hey%21")
    })

    it("should serialize text to URL", () => {
      expect(
        serializeSearchParams({
          text:         "my search text",
          activeFacets: {}
        })
      ).toEqual("q=my%20search%20text")
    })

    it("should not serialize empty text string", () => {
      expect(
        serializeSearchParams({
          text:         "",
          activeFacets: {}
        })
      ).toEqual("")
    })

    it("should serialize topics", () => {
      expect(
        serializeSearchParams({
          activeFacets: {
            topics: [
              "Science",
              "Physics",
              "Chemistry",
              "Computer Science",
              "Electronics"
            ]
          }
        })
      ).toEqual(
        "t=Science&t=Physics&t=Chemistry&t=Computer%20Science&t=Electronics"
      )
    })

    it("should serialize level", () => {
      expect(
        serializeSearchParams({
          activeFacets: {
            level: ["Graduate"]
          }
        })
      ).toEqual("l=Graduate")
    })

    it("should serialize offered by", () => {
      expect(
        serializeSearchParams({
          activeFacets: {
            offered_by: ["MITx"]
          }
        })
      ).toEqual("o=MITx")
    })

    it("should serialize type to the URL", () => {
      expect(
        serializeSearchParams({
          activeFacets: {
            type: ["course"]
          }
        })
      ).toEqual("type=course")
    })

    it("should serialize audience", () => {
      expect(
        serializeSearchParams({
          activeFacets: {
            audience: ["Open Content"]
          }
        })
      ).toEqual("a=Open%20Content")
    })

    it("should serialize certification", () => {
      expect(
        serializeSearchParams({
          activeFacets: {
            certification: ["Certificate"]
          }
        })
      ).toEqual("c=Certificate")
    })

    it("should serialize course_feature_tags", () => {
      expect(
        serializeSearchParams({
          activeFacets: {
            course_feature_tags: [
              "Exams with Solutions",
              "Exams",
              "Media Assignments",
              "Media Assignments with Examples"
            ]
          }
        })
      ).toEqual(
        "f=Exams%20with%20Solutions&f=Exams&f=Media%20Assignments&f=Media%20Assignments%20with%20Examples"
      )
    })

    it("should serialize resource_type", () => {
      expect(
        serializeSearchParams({
          activeFacets: {
            resource_type: ["Assignments", "Exams", "Lecture Notes"]
          }
        })
      ).toEqual("r=Assignments&r=Exams&r=Lecture%20Notes")
    })

    it("should serialize sort for ascending params", () => {
      expect(
        serializeSearchParams({
          sort: {
            field:  "coursenum",
            option: "asc"
          }
        })
      ).toEqual("s=coursenum")
    })

    it("should serialize sort for descending params", () => {
      expect(
        serializeSearchParams({
          sort: {
            field:  "coursenum",
            option: "desc"
          }
        })
      ).toEqual("s=-coursenum")
    })
  })

  describe("toArray", () => {
    it("should wrap non-array items with array", () => {
      expect(toArray("hey")).toEqual(["hey"])
      expect(toArray(3)).toEqual([3])
      expect(toArray({ foo: "bar" })).toEqual([{ foo: "bar" }])
    })

    it("should leave arrays alone", () => {
      expect(toArray(["foo", "bar"])).toEqual(["foo", "bar"])
      expect(toArray([])).toEqual([])
    })

    it("should convert null-ish values to undefined", () => {
      expect(toArray("")).toBeUndefined()
      expect(toArray(0)).toBeUndefined()
      expect(toArray(null)).toBeUndefined()
      expect(toArray(undefined)).toBeUndefined()
    })
  })
})
