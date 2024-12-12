import React from "react";
import { shallow } from "enzyme";
import RegisterPage from "./index";
import axios from "axios";

describe("<RegisterPage/> Component", () => {
  let RegisterPageComponent;

  beforeEach(() => {
    RegisterPageComponent = shallow(<RegisterPage />);
  });

  it("should render the component", () => {
    expect(RegisterPageComponent).toMatchSnapshot();
  });

  it("should initialize the state correctly", () => {
    const expectedInitialState = {
      name: "",
      username: "",
      email: "",
      password: "",
      organisation:"",
      passwordConfirm: "",
      displayPassword: false,
      hasAgreed: false,
      loading: false,
      registered: false,
      gitLoading: false,
      error: "",
      passwordShown: false,
      passwordChecked: false,
      passwordValidations: { 
        hasUppercase: false,
        hasLowercase: false,
        hasNumber: false,
        isMinLength: false,
      },
    };

    expect(RegisterPageComponent.state()).toEqual(expectedInitialState);
  });

  it("should toggle the 'hasAgreed' state when called", () => {
    RegisterPageComponent.instance().toggleAgreed();

    expect(RegisterPageComponent.state("hasAgreed")).toBe(true);

    RegisterPageComponent.instance().toggleAgreed();

    expect(RegisterPageComponent.state("hasAgreed")).toBe(false);
  });
  

  it("should toggle the 'passwordShown' state when 'togglePassword' is called", () => {
    RegisterPageComponent.instance().togglePassword();

    expect(RegisterPageComponent.state("passwordShown")).toBe(true);

    RegisterPageComponent.instance().togglePassword();

    expect(RegisterPageComponent.state("passwordShown")).toBe(false);
  });

  it("should toggle the 'displayPassword' state when 'togglePasswordConfirm' is called", () => {
    RegisterPageComponent.instance().togglePasswordConfirm();

    expect(RegisterPageComponent.state("displayPassword")).toBe(true);

    RegisterPageComponent.instance().togglePasswordConfirm();

    expect(RegisterPageComponent.state("displayPassword")).toBe(false);
  });

  it("should update the state correctly when 'handleOnChange' is called", () => {
    const mockEvent = {
      target: {
        name: "name",
        value: "John Doe",
      },
    };

    RegisterPageComponent.instance().handleOnChange(mockEvent);

    expect(RegisterPageComponent.state("name")).toBe("John Doe");
  });

  it("should validate the email correctly when 'validateEmail' is called", () => {
    const validEmail = "test@example.com";
    const invalidEmail = "invalid-email";

    expect(RegisterPageComponent.instance().validateEmail(validEmail)).toBe(
      true
    );
    expect(RegisterPageComponent.instance().validateEmail(invalidEmail)).toBe(
      false
    );
  });


  it("should update the state correctly when 'handleSubmit' is called with invalid data", () => {
    const mockEvent = {
      preventDefault: jest.fn(),
    };

    RegisterPageComponent.instance().handleSubmit(mockEvent);

    expect(RegisterPageComponent.state("error")).toBe("Please enter all fields");

    // You can add more expectations based on the specific behavior you want to test
  });

  it("should render the registration form when 'registered' state is false", () => {
    RegisterPageComponent.setState({
      registered: false,
    });

    expect(RegisterPageComponent.find(".LoginContentHeader").exists()).toBe(
      true
    );
    expect(RegisterPageComponent.find("form.LoginContentInputs").exists()).toBe(
      true
    );
    // You can add more expectations based on the specific behavior you want to test
  });

  it("should render the success message when 'registered' state is true", () => {
    RegisterPageComponent.setState({
      registered: true,
      email: "test@example.com",
    });

    expect(RegisterPageComponent.find(".RegisteredMessage").exists()).toBe(true);
    expect(RegisterPageComponent.find(".RegisteredMessage h2").text()).toBe(
      "Thank you for registering with us!"
    );
    expect(RegisterPageComponent.find(".RegisteredMessage p span").text()).toBe(
      "test@example.com"
    );
    // You can add more expectations based on the specific behavior you want to test
  });

  it("should render the GitHub login button", () => {
    RegisterPageComponent.setState({
      gitLoading: false,
    });

    expect(RegisterPageComponent.find(".GithubLoginBtn").exists()).toBe(true);
    expect(RegisterPageComponent.find(".GithubLoginBtn").prop("disabled")).toBe(
      false
    );
    // You can add more expectations based on the specific behavior you want to test
  });

  it("should display an error message if password does not meet requirements", () => {
    RegisterPageComponent.setState({
      name: "Moses Mulumba",
      username: "moses",
      email: "test@example.com",
      password: "123mo", 
      passwordConfirm: "123mo",
      hasAgreed: true,
      organisation: "crane-cloud",
    });
  
    const mockEvent = {
      preventDefault: jest.fn(),
    };
  
    RegisterPageComponent.instance().handleSubmit(mockEvent);
  
    // Expect an error message related to password requirements
    expect(RegisterPageComponent.state("error")).toBe(
      "Password must contain at least one uppercase letter, one lowercase letter, a number and 8 characters long"
    );
    
  });
  
});
