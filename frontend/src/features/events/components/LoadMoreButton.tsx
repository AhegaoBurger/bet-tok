import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface LoadMoreButtonProps {
  onClick: () => void;
  isLoading: boolean;
  hasNextPage: boolean;
}

export function LoadMoreButton({
  onClick,
  isLoading,
  hasNextPage,
}: LoadMoreButtonProps) {
  if (!hasNextPage) {
    return (
      <p className="text-center text-muted-foreground py-4">
        No more events to load
      </p>
    );
  }

  return (
    <div className="flex justify-center pt-6">
      <Button variant="outline" size="lg" onClick={onClick} disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Loading...
          </>
        ) : (
          "Load More Events"
        )}
      </Button>
    </div>
  );
}
