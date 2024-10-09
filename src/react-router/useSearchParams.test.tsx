import { renderHook, act } from "@testing-library/react"
import React from "react"
import { MemoryRouter, useNavigate } from "react-router"
import type { MemoryRouterProps, NavigateFunction } from "react-router"
import useSearchParams from "./useSearchParams"

const setupTest = (initialEntries?: MemoryRouterProps["initialEntries"]) => {
  let navigate: NavigateFunction = () => {
    throw new Error("Not yet assigned")
  }
  const Navigator = () => {
    const navigateFunc = useNavigate()
    navigate = navigateFunc
    return null
  }
  const Wrapper = ({ children }: { children: React.ReactNode }) => {
    return (
      <MemoryRouter initialEntries={initialEntries}>
        <Navigator />
        {children}
      </MemoryRouter>
    )
  }
  return {
    ...renderHook(() => useSearchParams(), { wrapper: Wrapper }),
    navigate
  }
}

describe("useSearchParams", () => {
  it("allows setting searchParams with an instance", async () => {
    const { result } = setupTest()
    const [_searchParams, setSearchParams] = result.current
    act(() => {
      setSearchParams(new URLSearchParams("cat=meow"))
    })
    expect(result.current[0].toString()).toBe("cat=meow")
  })

  it("allows setting searchParams with a function", () => {
    const { result } = setupTest()
    const [_searchParams, setSearchParams] = result.current
    act(() => {
      setSearchParams(prev => {
        const copy = new URLSearchParams(prev)
        copy.set("cat", "meow")
        return copy
      })
    })
    expect(result.current[0].toString()).toBe("cat=meow")
  })

  it("Take into account the current value of searchParams", () => {
    const { result } = setupTest(["/?cat=meow"])
    const [_searchParams, setSearchParams] = result.current
    expect(result.current[0].toString()).toBe("cat=meow")
    act(() => {
      setSearchParams(prev => {
        const copy = new URLSearchParams(prev)
        copy.set("dog", "woof")
        return copy
      })
    })
    expect(result.current[0].toString()).toBe("cat=meow&dog=woof")
  })

  it("External navigations update searchParams", () => {
    const { result, navigate } = setupTest()
    act(() => {
      navigate("/?cat=meow")
    })
    expect(result.current[0].toString()).toBe("cat=meow")
  })

  it("Uses current value in updater function", () => {
    const { result } = setupTest()
    const [_searchParams, setSearchParams] = result.current
    act(() => {
      setSearchParams(prev => {
        const copy = new URLSearchParams(prev)
        copy.set("cat", "meow")
        return copy
      })
      setSearchParams(prev => {
        const copy = new URLSearchParams(prev)
        copy.set("dog", "woof")
        return copy
      })
    })
    expect(result.current[0].toString()).toBe("cat=meow&dog=woof")
  })

  test("Multiple searchParam updates only trigger one history stack update", () => {
    const { result, navigate } = setupTest()
    const [_searchParams, setSearchParams] = result.current

    act(() => {
      setSearchParams(prev => {
        const copy = new URLSearchParams(prev)
        copy.set("a", "1")
        return copy
      })
      setSearchParams(prev => {
        const copy = new URLSearchParams(prev)
        copy.set("b", "2")
        return copy
      })
    })
    expect(result.current[0].toString()).toBe("a=1&b=2")
    act(() => {
      setSearchParams(prev => {
        const copy = new URLSearchParams(prev)
        copy.set("c", "3")
        return copy
      })
      setSearchParams(prev => {
        const copy = new URLSearchParams(prev)
        copy.set("d", "4")
        return copy
      })
    })
    expect(result.current[0].toString()).toBe("a=1&b=2&c=3&d=4")

    /*
    We did two navigations above, each with two searchParams updates.
    The purpose of two navigations was to check that hasNavigatedRef updates
    correctly between navigations.
    */

    act(() => {
      navigate(-1)
    })
    expect(result.current[0].toString()).toBe("a=1&b=2")
    act(() => {
      navigate(-1)
    })
    expect(result.current[0].toString()).toBe("")
  })
})
