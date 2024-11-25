import React from "react";
import "./PrimaryButton.css";
import PropTypes from "prop-types";

const PrimaryButton = (props) => {
  const { children, className, btntype, color, small, transparent, noPadding } =
    props;
  console.log(color);
  const getColorClass = () => {
    switch (color) {
      case "primary":
        return "PrimaryColorBtn";
      case "primary-outline":
        return "PrimaryOutlineColorBtn";
      case "black":
        return "BlackPrimaryBtn";
      case "red":
        return "PrimaryDeleteBtn";
      case "red-outline":
        return "PrimaryDeleteBtnOutline";
      default:
        return "primary-button--blue";
    }
  };
  return (
    <button
      {...props}
      className={`Primary-Btn ${className} ${
        btntype === "close" && "DeleteBtnOutline"
      }
        ${color && getColorClass()} ${
        small === true ? "SmallBtn" : undefined
      } ${transparent && "TransparentBtn"}
        ${noPadding && "NoPaddingBtn"}
      `}
    >
      {children}
    </button>
  );
};
PrimaryButton.propTypes = {
  small: PropTypes.bool,
};
PrimaryButton.defaultProps = {
  small: false,
};

export default PrimaryButton;
