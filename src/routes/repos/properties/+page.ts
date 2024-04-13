import { getRequest } from "$lib/util/util.js";

export const ssr = false;
export const prerender = true;

export const load = async ({ url }) => {
  const id = url.searchParams.get("id");
  if (id != null) {
    const properties = await getRequest(`/repos/${id}/properties`);
    return { id: id, properties: properties.properties };
  }
  return { id: id, properties: null };
};
