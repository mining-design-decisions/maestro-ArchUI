import { getRequest } from "$lib/util/util";

export const ssr = false;
export const prerender = true;

export const load = async () => {
  const data = await getRequest("/labels");
  return { labels: data["labels"] };
};