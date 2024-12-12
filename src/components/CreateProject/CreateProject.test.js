// import React from "react";
// import { shallow } from "enzyme";
// import { useSelector } from "react-redux";
// import CreateProject from "./";

// import PrimaryButton from "../PrimaryButton";

// jest.mock("react-redux", () => ({
//   useSelector: jest.fn(),
// }));

// describe("CreateProject Component", () => {
//   let closeComponent;

//   beforeEach(() => {
//     closeComponent = jest.fn();
//     // Mock the redux state
//     useSelector.mockImplementation((selector) =>
//       selector({
//         clustersReducer: {
//           clusters: [
//             { id: "1", name: "Cluster1" },
//             { id: "2", name: "Cluster2" },
//           ],
//         },
//         user: {
//           data: { id: "user1" },
//         },
//       })
//     );
//   });

//   afterEach(() => {
//     jest.clearAllMocks();
//   });

//   it("should render the component correctly", () => {
//     const wrapper = shallow(<CreateProject closeComponent={closeComponent} />);

//     expect(wrapper.find(PrimaryButton).exists()).toBe(true);
//   });
//   it("matches the Header snapshot", () => {
//     const wrapper = shallow(<CreateProject closeComponent={closeComponent} />);
//     expect(wrapper).toMatchSnapshot();
//   });

// });

import React from "react";
import { shallow } from "enzyme";
import { useSelector, useDispatch } from "react-redux";
import CreateProject from "./";
import PrimaryButton from "../PrimaryButton";

jest.mock("react-redux", () => ({
  useSelector: jest.fn(),
  useDispatch: jest.fn(),
}));

describe("CreateProject Component", () => {
  let closeComponent;
  let mockDispatch;

  beforeEach(() => {
    closeComponent = jest.fn();
    mockDispatch = jest.fn();
    // Mock the useDispatch function
    useDispatch.mockReturnValue(mockDispatch);
    // Mock the redux state
    useSelector.mockImplementation((selector) =>
      selector({
        clustersReducer: {
          clusters: [
            { id: "1", name: "Cluster1" },
            { id: "2", name: "Cluster2" },
          ],
        },
        user: {
          data: { id: "user1" },
        },
      })
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should render the component correctly", () => {
    const wrapper = shallow(<CreateProject closeComponent={closeComponent} />);

    expect(wrapper.find(PrimaryButton).exists()).toBe(true);
  });

  it("matches the Header snapshot", () => {
    const wrapper = shallow(<CreateProject closeComponent={closeComponent} />);
    expect(wrapper).toMatchSnapshot();
  });
});
