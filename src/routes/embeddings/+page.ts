import { createDefaultConfig, getRequestDlManager } from "$lib/util/util.js";

export const ssr = false;
export const prerender = true;

export const load = async () => {
  let data = (await getRequestDlManager("/endpoints")).commands[
    "generate-embedding-internal"
  ].args;

  data["params"] = data["embedding-config"];
  delete data["embedding-config"];
  data["generator"] = data["embedding-generator"];
  delete data["embedding-generator"];

  let config = createDefaultConfig(data);
  return {
    data: data,
    config: config,
  };
};
