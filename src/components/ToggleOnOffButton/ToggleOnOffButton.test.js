import React from "react";

import { shallow } from "enzyme";

import ToggleOnOffButton from "./index";

describe("Status Component", () => {
  it("Renders a Status component", () => {
    const ToggleOnOffComponent = shallow(
      <ToggleOnOffButton onClick={() => {}} />
    );
    expect(
      ToggleOnOffComponent.find(".ToggleBase").hasClass("ToggleBase")
    ).toBe(true);
    expect(ToggleOnOffComponent).toMatchSnapshot();
  });
});
