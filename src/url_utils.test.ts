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
          platform:             [],
          offered_by:           [],
          topic:                [],
          department:           [],
          level:                [],
          course_feature:       [],
          resource_type:        [],
          content_feature_type: []
        },
        text:     "The Best Course",
        sort:     null,
        ui:       null,
        endpoint: null
      })
    })

    it("should deserialize offered by", () => {
      expect(deserializeSearchParams({ search: "o=mitx" })).toEqual({
        activeFacets: {
          platform:             [],
          offered_by:           ["mitx"],
          topic:                [],
          department:           [],
          level:                [],
          course_feature:       [],
          resource_type:        [],
          content_feature_type: []
        },
        text:     "",
        sort:     null,
        ui:       null,
        endpoint: null
      })
    })

    it("should deserialize departmen", () => {
      expect(deserializeSearchParams({ search: "d=2" })).toEqual({
        activeFacets: {
          platform:             [],
          offered_by:           [],
          topic:                [],
          department:           ["2"],
          level:                [],
          course_feature:       [],
          resource_type:        [],
          content_feature_type: []
        },
        text:     "",
        sort:     null,
        ui:       null,
        endpoint: null
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
          platform:   [],
          offered_by: [],
          topic:      [
            "Science",
            "Physics",
            "Chemistry",
            "Computer Science",
            "Electronics"
          ],
          department:           [],
          level:                [],
          course_feature:       [],
          resource_type:        [],
          content_feature_type: []
        },
        text:     "",
        sort:     null,
        ui:       null,
        endpoint: null
      })
    })

    it("should deserialize type from the URL", () => {
      expect(deserializeSearchParams({ search: "r=course" })).toEqual({
        activeFacets: {
          platform:             [],
          offered_by:           [],
          topic:                [],
          department:           [],
          level:                [],
          course_feature:       [],
          resource_type:        ["course"],
          content_feature_type: []
        },
        text:     "",
        sort:     null,
        ui:       null,
        endpoint: null
      })
    })

    it("should deserialize level from the URL", () => {
      expect(deserializeSearchParams({ search: "l=graduate" })).toEqual({
        activeFacets: {
          platform:             [],
          offered_by:           [],
          topic:                [],
          department:           [],
          level:                ["graduate"],
          course_feature:       [],
          resource_type:        [],
          content_feature_type: []
        },
        text:     "",
        sort:     null,
        ui:       null,
        endpoint: null
      })
    })

    it("should deserialize content featrue tags from the URL", () => {
      expect(
        deserializeSearchParams({
          search:
            "cf=Exams%20with%20Solutions&cf=Exams&cf=Media%20Assignments%20with%20Examples"
        })
      ).toEqual({
        activeFacets: {
          platform:             [],
          offered_by:           [],
          topic:                [],
          department:           [],
          level:                [],
          course_feature:       [],
          resource_type:        [],
          content_feature_type: [
            "Exams with Solutions",
            "Exams",
            "Media Assignments with Examples"
          ]
        },
        text:     "",
        sort:     null,
        ui:       null,
        endpoint: null
      })
    })

    it("should deserialize course_feature from the URL", () => {
      expect(
        deserializeSearchParams({
          search: "f=Assignments&f=Exams&f=Lecture%20Notes"
        })
      ).toEqual({
        activeFacets: {
          platform:             [],
          offered_by:           [],
          topic:                [],
          department:           [],
          level:                [],
          course_feature:       ["Assignments", "Exams", "Lecture Notes"],
          resource_type:        [],
          content_feature_type: []
        },
        text:     "",
        sort:     null,
        ui:       null,
        endpoint: null
      })
    })

    it("should deserialize a sort param", () => {
      expect(deserializeSearchParams({ search: "s=-coursenum" })).toEqual({
        activeFacets: {
          platform:             [],
          offered_by:           [],
          topic:                [],
          department:           [],
          level:                [],
          course_feature:       [],
          resource_type:        [],
          content_feature_type: []
        },
        text:     "",
        sort:     "-coursenum",
        ui:       null,
        endpoint: null
      })
    })

    it("should deserialize the ui param", () => {
      expect(deserializeSearchParams({ search: "u=list" })).toEqual({
        activeFacets: {
          platform:             [],
          offered_by:           [],
          topic:                [],
          department:           [],
          level:                [],
          course_feature:       [],
          resource_type:        [],
          content_feature_type: []
        },
        text:     "",
        sort:     null,
        ui:       "list",
        endpoint: null
      })
    })

    it("should deserialize the endpoint param", () => {
      expect(deserializeSearchParams({ search: "e=endpoint" })).toEqual({
        activeFacets: {
          platform:             [],
          offered_by:           [],
          topic:                [],
          department:           [],
          level:                [],
          course_feature:       [],
          resource_type:        [],
          content_feature_type: []
        },
        text:     "",
        sort:     null,
        ui:       null,
        endpoint: "endpoint"
      })
    })

    it("should ignore unknown params", () => {
      expect(deserializeSearchParams({ search: "eeee=beeeeeep" })).toEqual({
        activeFacets: {
          platform:             [],
          offered_by:           [],
          topic:                [],
          department:           [],
          level:                [],
          course_feature:       [],
          resource_type:        [],
          content_feature_type: []
        },
        text:     "",
        sort:     null,
        ui:       null,
        endpoint: null
      })
    })

    it("should ignore anything after the second ?", () => {
      expect(
        deserializeSearchParams({
          search: "s=-coursenum?some_tracking_string=string"
        })
      ).toEqual({
        activeFacets: {
          platform:             [],
          offered_by:           [],
          topic:                [],
          department:           [],
          level:                [],
          course_feature:       [],
          resource_type:        [],
          content_feature_type: []
        },
        text:     "",
        sort:     "-coursenum",
        ui:       null,
        endpoint: null
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
            topic: [
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
            level: ["graduate"]
          }
        })
      ).toEqual("l=graduate")
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

    it("should serialize resource_type to the URL", () => {
      expect(
        serializeSearchParams({
          activeFacets: {
            resource_type: ["course"]
          }
        })
      ).toEqual("r=course")
    })

    it("should serialize course_feature", () => {
      expect(
        serializeSearchParams({
          activeFacets: {
            course_feature: [
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

    it("should serialize content_feature_type", () => {
      expect(
        serializeSearchParams({
          activeFacets: {
            content_feature_type: [
              "Exams with Solutions",
              "Exams",
              "Media Assignments",
              "Media Assignments with Examples"
            ]
          }
        })
      ).toEqual(
        "cf=Exams%20with%20Solutions&cf=Exams&cf=Media%20Assignments&cf=Media%20Assignments%20with%20Examples"
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

    it("should serialize sort", () => {
      expect(
        serializeSearchParams({
          sort: "sort"
        })
      ).toEqual("s=sort")
    })

    it("should serialize endpoint", () => {
      expect(
        serializeSearchParams({
          endpoint: "endpoint"
        })
      ).toEqual("e=endpoint")
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
