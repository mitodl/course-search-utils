import { buildSearchUrl } from "./search"

describe("buildSearchUrl", () => {
  it("should build a GET request url from the parameters and base url", () => {
    const params = {
      text:         "The Best Course",
      from:         10,
      size:         20,
      sort:         "sort",
      activeFacets: {
        platform:   ["mitx", "ocw"],
        department: ["2"]
      },
      aggregations: ["platform"]
    }

    expect(buildSearchUrl("http://www.base.edu/", params)).toEqual(
      "http://www.base.edu/?q=The+Best+Course&offset=10&limit=20&sortby=sort&aggregations=platform&platform=mitx%2Cocw&department=2"
    )
  })
})
