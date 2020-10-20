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
          audience:        [],
          certification:   [],
          offered_by:      [],
          topics:          [],
          type:            [],
          department_name: [],
          level:           []
        },
        text: "The Best Course"
      })
    })

    it("should deserialize offered by", () => {
      expect(deserializeSearchParams({ search: "o=MITx" })).toEqual({
        activeFacets: {
          audience:        [],
          certification:   [],
          offered_by:      ["MITx"],
          topics:          [],
          type:            [],
          department_name: [],
          level:           []
        },
        text: ""
      })
    })

    it("should deserialize department_name", () => {
      expect(deserializeSearchParams({ search: "d=Philosophy" })).toEqual({
        activeFacets: {
          audience:        [],
          certification:   [],
          offered_by:      [],
          topics:          [],
          type:            [],
          department_name: ["Philosophy"],
          level:           []
        },
        text: ""
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
          type:            [],
          department_name: [],
          level:           []
        },
        text: ""
      })
    })

    it("should deserialize type from the URL", () => {
      expect(deserializeSearchParams({ search: "type=course" })).toEqual({
        activeFacets: {
          audience:        [],
          certification:   [],
          offered_by:      [],
          topics:          [],
          type:            ["course"],
          department_name: [],
          level:           []
        },
        text: ""
      })
    })

    it("should deserialize audience from the URL", () => {
      expect(deserializeSearchParams({ search: "a=Open%20Content" })).toEqual({
        activeFacets: {
          audience:        ["Open Content"],
          certification:   [],
          offered_by:      [],
          topics:          [],
          type:            [],
          department_name: [],
          level:           []
        },
        text: ""
      })
    })

    it("should deserialize certification from the URL", () => {
      expect(deserializeSearchParams({ search: "c=Certification" })).toEqual({
        activeFacets: {
          audience:        [],
          certification:   ["Certification"],
          offered_by:      [],
          topics:          [],
          type:            [],
          department_name: [],
          level:           []
        },
        text: ""
      })
    })

    it("should deserialize level from the URL", () => {
      expect(deserializeSearchParams({ search: "l=Graduate" })).toEqual({
        activeFacets: {
          audience:        [],
          certification:   [],
          offered_by:      [],
          topics:          [],
          type:            [],
          department_name: [],
          level:           ["Graduate"]
        },
        text: ""
      })
    })

    it("should ignore unknown params", () => {
      expect(deserializeSearchParams({ search: "eeee=beeeeeep" })).toEqual({
        activeFacets: {
          audience:        [],
          certification:   [],
          offered_by:      [],
          topics:          [],
          type:            [],
          department_name: [],
          level:           []
        },
        text: ""
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
