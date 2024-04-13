import { createDefaultConfig, getRequestDlManager } from "$lib/util/util.js";

export const ssr = false;
export const prerender = true;

export const load = async () => {
  let data = (await getRequestDlManager("/endpoints")).commands["run"].args;

  let config = createDefaultConfig(data);
  return {
    data: data,
    config: config,
  };
};
