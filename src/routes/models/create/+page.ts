import { createDefaultConfig, getRequestDlManager } from "$lib/util/util.js";
import { error } from "@sveltejs/kit";

export const ssr = false;
export const prerender = true;

export const load = async ({ url }) => {
  const type = url.searchParams.get("type");
  if (type === null) {
    error(404, { message: "No type provided" });
  }

  let data;
  if (type === "InputEmbedding") {
    data = (await getRequestDlManager("/endpoints")).commands[
      "generate-embedding-internal"
    ].args;
    data["params"] = data["embedding-config"];
    delete data["embedding-config"];
    data["generator"] = data["embedding-generator"];
    delete data["embedding-generator"];
  } else if (type === "Classifier") {
    data = (await getRequestDlManager("/endpoints")).commands["run"].args;
  } else {
    error(404, { message: `Type ${type} not supported` });
  }

  let config = createDefaultConfig(data);
  return {
    data: data,
    config: config,
  };
};
