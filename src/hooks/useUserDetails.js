import { useQuery } from "@tanstack/react-query";
import api from "./../axios";

export const useUserDetails = (userID) => {
  return useQuery({
    queryFn: () => api.get(`/users/${userID}`),
    queryKey: ["user", userID],
    meta: {
      errorMessage: "Failed to fetch user details",
    },
  });
};

