import { useQuery } from "@tanstack/react-query";
import api from "./../axios";

export const useGenericSearch = (keywords) => {
  return useQuery({
    queryFn: () => api.get(`/search?keywords=${keywords}`),
    queryKey: ["generic_search"],
    meta: {
      errorMessage: "Failed to fetch resources",
    },
  });
};
