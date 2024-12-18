import React from "react";
import styles from "./RecentActivitySection.module.css";
import RecentActivityItem from "../RecentActivityItem";
import { ReactComponent as InfoSvg } from "../../assets/images/infosvg.svg";
import { useSelector } from "react-redux";
import Spinner from "../Spinner";
import usePaginator from "../../hooks/usePaginator";
import Pagination from "../Pagination";
import { useRecentActivity } from "../../hooks/useRecentActivity";

const RecentActivitySection = () => {
  const [currentPage, handleChangePage] = usePaginator();
  const user = useSelector((state) => state.user);
  const { data: userRecentActivities, isFetching: isFetchingRecentActivities}=useRecentActivity(1, user?.data?.id);
  const pagination = userRecentActivities?.data?.data?.pagination ||[];


  const handlePageChange = (currentPage) => {
    handleChangePage(currentPage);
    userRecentActivities();
  };

  return (
    <div className={styles.recentActivity}>
      <h2 className={styles.title}>Recent Activity</h2>

      {isFetchingRecentActivities ? (
        <div className={styles.noActivity}>
          <div className={styles.NoResourcesMessage}>
            <div className={styles.SpinnerWrapper}>
              <Spinner size="big" />
            </div>
          </div>
        </div>
      ) : (
        <>
          {userRecentActivities === undefined ? (
            <div className={styles.noActivity}>
              <InfoSvg />
              <p className={styles.noActivityMessage}>
                No Recent Activity Found
              </p>
            </div>
          ) : (
            userRecentActivities?.data?.user_feed?.data?.activity.slice(0,4).map((item, index) => (
              <React.Fragment key={index}>
                <RecentActivityItem item={item} />
              </React.Fragment>
            ))
          )}

          {userRecentActivities !== undefined && pagination?.pages > 1 && (
            <div className="AdminPaginationSection">
              <Pagination
                total={pagination.pages}
                current={currentPage}
                onPageChange={handlePageChange}
              />
            </div>

          )}
        </>
      )}
    </div>
  );
};

export default RecentActivitySection;
