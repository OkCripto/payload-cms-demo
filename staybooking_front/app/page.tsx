import { Marketplace } from "@/components/marketplace";
import { getFilterOptions, getPriceBounds, getStays } from "@/lib/queries";
import { parseFilters } from "@/lib/stays-ui";

/**
 * Marketplace home. Server Component: every render queries Neon directly
 * through the read-only Drizzle client (no API layer, per the architecture
 * in AGENTS.md §2). Filter state lives in the URL; parsing happens here on
 * the server so a shared/bookmarked link restores the same filtered view.
 */
export default async function Page(props: PageProps<"/">) {
  const searchParams = await props.searchParams;

  const [options, priceBounds, stays] = await Promise.all([
    getFilterOptions(),
    getPriceBounds(),
    getStays(),
  ]);
  const initialFilters = parseFilters(searchParams, priceBounds);

  return (
    <Marketplace
      options={options}
      stays={stays}
      priceBounds={priceBounds}
      initialFilters={initialFilters}
    />
  );
}
