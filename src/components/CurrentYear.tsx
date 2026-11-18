import { cacheLife } from "next/cache";

// Cache Components forbids reading the clock (`new Date()`) during prerender
// unless the value is cached. "use cache" bakes the year into the static
// shell and cacheLife("days") refreshes it daily, so it rolls over on New Year
// without a redeploy.
export default async function CurrentYear() {
  "use cache";
  cacheLife("days");
  return <>{new Date().getFullYear()}</>;
}
