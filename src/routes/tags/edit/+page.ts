import { getRequest } from "$lib/util/util.js";

export const ssr = false;
export const prerender = true;

export const load = async ({ url }) => {
  const id = url.searchParams.get("id");
  if (id != null) {
    const tag = await getRequest(`/tags/${id}`);
    return { tag: tag };
  }
  return { tag: null };
};
