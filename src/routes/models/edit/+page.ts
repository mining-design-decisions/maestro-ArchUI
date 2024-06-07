import {
  createConfigFromExistingConfig,
  getRequest,
  getRequestDlManager,
} from "$lib/util/util.js";
import { error } from "@sveltejs/kit";

export const ssr = false;
export const prerender = true;

export const load = async ({ url }) => {
  const id = url.searchParams.get("id");
  const type = url.searchParams.get("type");
  if (id === null && type === null) {
    error(404, { message: "No id and/or type provided" });
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

  let config = (await getRequest(`/models/${id}`)).config;
  return {
    data: data,
    config: createConfigFromExistingConfig(data, config),
  };
};
