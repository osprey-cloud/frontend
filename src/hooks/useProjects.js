import { useQuery } from "@tanstack/react-query";
import api from "./../axios";

export const useProjects = (page, keyword = "") => {
  let link = `/projects?page=${page}`;
  if (keyword) {
    link += `&keywords=${keyword}`;
  }
  return useQuery({
    queryFn: () => api.get(link),
    queryKey: ["userProjects", keyword, page],
    meta: {
      errorMessage: "Failed to fetch projects",
    },
  });
};

