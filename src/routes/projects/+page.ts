import { getRequest } from "$lib/util/util";

export const ssr = false;
export const prerender = true;

export const load = async () => {
  const projects = await getRequest("/projects");
  const repos = await getRequest("/repos");
  const repoIdToNameMap: any = {};
  for (let repo of repos.repos) {
    repoIdToNameMap[repo.id] = repo.name;
  }
  return { projects: projects["projects"], repos: repoIdToNameMap };
};
