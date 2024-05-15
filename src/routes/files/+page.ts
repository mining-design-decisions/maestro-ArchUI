import { getRequest } from "$lib/util/util";

export const ssr = false;
export const prerender = true;

export const load = async () => {
  const directories = await getRequest("/directories");
  return { directories: directories["directories"] };
};
