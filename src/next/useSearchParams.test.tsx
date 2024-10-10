import { renderHook, act, waitFor } from "@testing-library/react";
import useSearchParams from "./useSearchParams";

describe("useSearchParams > setSearchParams", () => {
  beforeEach(() => {
    window.history.replaceState({}, "", "/");
  });
  /**
   * useSearchParams returns [searchParams, setSearchParams]
   *
   * We do NOT check the searchParams value in these tests, as that relies on
   * NextJS's App Router. But it should always be in-sync with
   * window.location.search, so we'll check that instead.
   *
   * (The purpose of the first arg is an immutable searchParams object, ensuring
   * react components re-render appropriately. But that's NextJS's responsibility)
   */
  it("allows setting searchParams with an instance", async () => {
    const { result } = renderHook(() => useSearchParams());
    const [_, setSearchParams] = result.current;
    act(() => {
      setSearchParams(new URLSearchParams("cat=meow"));
    });
    expect(window.location.search.toString()).toBe("?cat=meow");
  });

  it("allows setting searchParams with a function", () => {
    const { result } = renderHook(() => useSearchParams());
    const [_, setSearchParams] = result.current;
    act(() => {
      setSearchParams((prev) => {
        const copy = new URLSearchParams(prev);
        copy.set("cat", "meow");
        return copy;
      });
    });
    expect(window.location.search).toBe("?cat=meow");
  });

  it("Take into account the current value of searchParams", () => {
    window.history.replaceState({}, "", "?cat=meow");
    const { result } = renderHook(() => useSearchParams());
    const [_, setSearchParams] = result.current;
    expect(window.location.search).toBe("?cat=meow");
    act(() => {
      setSearchParams((prev) => {
        const copy = new URLSearchParams(prev);
        copy.set("dog", "woof");
        return copy;
      });
    });
    expect(window.location.search).toBe("?cat=meow&dog=woof");
  });

  it("Multiple synchronous setSearchParams call use current value and trigger one push", async () => {
    window.history.replaceState({}, "", "?a=1&b=2");
    const { result } = renderHook(() => useSearchParams());
    const [_, setSearchParams] = result.current;
    act(() => {
      setSearchParams((prev) => {
        const copy = new URLSearchParams(prev);
        copy.set("b", "22");
        return copy;
      });
      setSearchParams((prev) => {
        const copy = new URLSearchParams(prev);
        copy.set("c", "3");
        return copy;
      });
    });
    expect(window.location.search).toBe("?a=1&b=22&c=3");
    window.history.back();
    await waitFor(() => {
      expect(window.location.search).toBe("?a=1&b=2");
    });
  });
});
