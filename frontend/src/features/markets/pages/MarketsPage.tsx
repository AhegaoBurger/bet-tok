import { useState } from "react";
import { useInfiniteMarkets, useSearchMarkets } from "../api/markets.queries";
import { MarketList } from "../components/MarketList";
import { SortDropdown } from "../components/SortDropdown";
import { LoadMoreButton } from "../components/LoadMoreButton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, RefreshCw } from "lucide-react";
import { DEFAULT_SORT, type MarketSortOption } from "../types/market.types";

export function MarketsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [sortOption, setSortOption] = useState<MarketSortOption>(DEFAULT_SORT);

  const {
    data,
    isLoading: isLoadingMarkets,
    isFetching: isFetchingMarkets,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch: refetchMarkets,
  } = useInfiniteMarkets({
    pageSize: 30,
    active: true,
    order: sortOption.value,
    ascending: sortOption.ascending,
  });

  const markets = data?.pages.flat() ?? [];

  const { data: searchResults, isLoading: isSearching } = useSearchMarkets(
    activeSearch,
    activeSearch.length >= 2
  );

  const displayedMarkets = activeSearch.length >= 2 ? searchResults : markets;
  const isLoading = activeSearch.length >= 2 ? isSearching : isLoadingMarkets;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveSearch(searchQuery);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setActiveSearch("");
  };

  const handleSortChange = (option: MarketSortOption) => {
    setSortOption(option);
  };

  const handleLoadMore = () => {
    fetchNextPage();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold">Markets</h1>
          <p className="text-muted-foreground">
            Browse active prediction markets
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => refetchMarkets()}
          disabled={isFetchingMarkets}
        >
          <RefreshCw
            className={`h-4 w-4 mr-2 ${isFetchingMarkets ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>

      {/* Search and Sort Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Search */}
        <form onSubmit={handleSearch} className="flex gap-2 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search markets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button type="submit" disabled={searchQuery.length < 2}>
            Search
          </Button>
          {activeSearch && (
            <Button type="button" variant="ghost" onClick={handleClearSearch}>
              Clear
            </Button>
          )}
        </form>

        {/* Sort dropdown - hide when searching */}
        {!activeSearch && (
          <SortDropdown value={sortOption} onChange={handleSortChange} />
        )}
      </div>

      {/* Results info */}
      {activeSearch && (
        <p className="text-sm text-muted-foreground">
          Showing results for "{activeSearch}"
        </p>
      )}

      {/* Market count */}
      {!activeSearch && !isLoading && markets.length > 0 && (
        <p className="text-sm text-muted-foreground">
          Showing {markets.length} markets
        </p>
      )}

      {/* Market list */}
      <MarketList markets={displayedMarkets || []} isLoading={isLoading} />

      {/* Load More button - only show when not searching */}
      {!activeSearch && !isLoading && markets.length > 0 && (
        <LoadMoreButton
          onClick={handleLoadMore}
          isLoading={isFetchingNextPage}
          hasNextPage={hasNextPage ?? false}
        />
      )}
    </div>
  );
}
