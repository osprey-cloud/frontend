/* eslint-disable no-undef */
import React from "react";
import { shallow } from "enzyme";
import ProjectCard from "./";

const props = {
    getProjectMemoryMetrics: jest.fn(),
    memoryMetrics: [{ slug: "slug" }],
};

describe("test the component", () => {
  it("matchs the component snapshot", () => {
    const wrapper = ProjectCard.WrappedComponent;
    const mycomponent = shallow(<wrapper {...props} />);
    expect(mycomponent).toMatchSnapshot();
  });
  it("component should match the snapshot", () => {
    const newComponent = ProjectCard.WrappedComponent;
    const wrapper = shallow(<newComponent {...props} />);
    wrapper.setProps(props);
    expect(wrapper).toBeDefined();
  });
});

