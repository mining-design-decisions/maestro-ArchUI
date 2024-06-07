import { createDefaultConfig, getRequest } from "$lib/util/util.js";

export const ssr = false;
export const prerender = true;

export const load = async () => {
  let data = await getRequest("/models");

  return {
    models: data.models,
  };
};
