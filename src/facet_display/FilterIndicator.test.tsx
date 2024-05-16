import React from "react";
import { render, screen } from "@testing-library/react";
import user from "@testing-library/user-event";

import FilterIndicator from "./FilterIndicator";
import type { FilterIndicatorProps } from "./FilterIndicator";

describe("FilterIndicator", () => {
  function setup(props?: Partial<FilterIndicatorProps>) {
    const onClickStub = jest.fn();

    render(
      <FilterIndicator
        onClick={onClickStub}
        label="default-test-label"
        {...props}
      />
    );

    return { onClickStub };
  }

  it("should render a search filter correctly", () => {
    const label = "Some Label";
    setup({ label });
    screen.getByText(label);
  });

  it("should trigger clearFacet function on click", async () => {
    const { onClickStub } = setup();
    const button = screen.getByRole("button", { name: "clear filter" });
    await user.click(button);
    expect(onClickStub).toHaveBeenCalledTimes(1);
  });
});
