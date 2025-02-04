import { useQuery } from "@tanstack/react-query";
import {userActivityLoggerAxios} from "./../axios";

export const useRecentActivity = (page, userID) => {
  let link;
  if (userID !== "") {
    link = `/activity_feed?user_id=${userID}&page=${page}`;
  } else {
    link = `/activity_feed`;
  }

  return useQuery({
    queryFn: ()=> userActivityLoggerAxios.get(link),
    queryKey: ["userRecentActivities", page,userID], 
    enabled: !!userID, 
    meta: {
      errorMessage: "Failed to fetch recent activities",
    },
  });
};
