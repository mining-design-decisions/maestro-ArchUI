import { getRequest } from "$lib/util/util";

export const ssr = false;
export const prerender = true;

export const load = async () => {
  const repos = await getRequest("/repos");
  return { repos: repos.repos };
};
