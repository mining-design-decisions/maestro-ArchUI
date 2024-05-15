import { getRequest, postRequest } from "$lib/util/util.js";

export const ssr = false;
export const prerender = true;

export const load = async ({ url }) => {
  const id = url.searchParams.get("id");
  if (id != null) {
    const body = {
      attributes: ["id", "key", "summary"],
      issue_ids: [Number(id)],
    };
    const issueData = await postRequest(`/issue-data`, JSON.stringify(body));

    const comments = await getRequest(
      `/issues/${id}/comments?validate_issue_existence=false`
    );

    const users = await getRequest(`/users`);
    let userMapping: Record<number, string> = {};
    for (let user of users.users) {
      userMapping[user.id] = user.username;
    }

    const userLabels = await postRequest(
      `/issues/${id}/user-labels?validate_issue_existence=false&validate_user_existence=false`,
      JSON.stringify({ users: "All" })
    );

    const labels = await getRequest(
      `/issues/${id}/labels?validate_issue_existence=false`
    );
    const allLabels = await getRequest(`/labels`);

    let labelMapping: Record<string, boolean> = {};
    for (let label of allLabels.labels) {
      labelMapping[label.name] = false;
    }
    for (let label of labels.labels) {
      labelMapping[label.name] = label.value;
    }

    const tags = await getRequest(`/issues/${id}/tags`);

    const allTags = await getRequest(`/tags`);

    return {
      issueData: issueData.data[id],
      comments: comments.comments,
      users: userMapping,
      userLabels: userLabels.labels,
      labels: labelMapping,
      tags: tags.tags,
      allTags: allTags.tags,
    };
  }
  return {
    issueData: null,
    comments: null,
    users: null,
    userLabels: null,
    labels: {},
    tags: null,
    allTags: null,
  };
};
