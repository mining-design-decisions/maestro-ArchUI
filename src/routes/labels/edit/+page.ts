import { getRequest } from "$lib/util/util.js";

export const ssr = false;
export const prerender = true;

export const load = async ({ url }) => {
  const id = url.searchParams.get("id");
  if (id != null) {
    const label = await getRequest(`/labels/${id}`);
    return { label: label };
  }
  return { label: null };
};
