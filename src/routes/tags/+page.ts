export const ssr = false;
export const prerender = true;

export const load = async ({ fetch }) => {
  const res = await fetch(
    `https://maestro.localhost:4269/issues-db-api-rust/api/v2/tags`
  );
  const item = await res.json();
  return { tags: item["tags"] };
};
