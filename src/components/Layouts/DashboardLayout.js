import React from "react";
import Header from "../Header";
import InformationBar from "../InformationBar";
import SideBar from "../SideBar";
import "./Layouts.css";

const DashboardLayout = (props) => {
  const { children, name, credits, header, short = false, appCategory } = props;
  return (
    <div className="DashboardPage">
      <div className="DashboardTopBarSection">
        <Header credits={credits?.amount} />
      </div>
      <div className="DashboardMainSection">
        <div className="DashboardSideBarSection">
          <SideBar name={name} appCategory={appCategory} />
        </div>
        <div className="DashboardMainContentSection">
          <div className="informationBarContainer">
            <InformationBar header={header} {...props} />
          </div>

          <div
            className={`${
              short ? "ShortContainer" : "SmallContainer"
            } DasboardChildrenSection`}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
