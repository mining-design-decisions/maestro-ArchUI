import { getRequest } from "$lib/util/util.js";

export const ssr = false;
export const prerender = true;

export const load = async ({ url }) => {
  const id = url.searchParams.get("id");
  if (id != null) {
    const files = await getRequest(`/directories/${id}/files`);
    console.log(files);
    return { id: id, files: files.files };
  }
  return { id: id, properties: null };
};
