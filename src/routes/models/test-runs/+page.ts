import { getRequest } from "$lib/util/util.js";
import { error } from "@sveltejs/kit";

export const ssr = false;
export const prerender = true;

export const load = async ({ url }) => {
  const id = url.searchParams.get("id");
  if (id === null) {
    error(404, { message: "No id provided" });
  }

  const runs = (await getRequest(`/models/${id}/test-runs`)).runs;
  console.log(runs);

  return {
    runs: runs,
  };
};
