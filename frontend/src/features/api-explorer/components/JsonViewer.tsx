import { useState, useCallback } from "react";
import { ChevronRight, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface JsonViewerProps {
  data: unknown;
  className?: string;
}

export function JsonViewer({ data, className }: JsonViewerProps) {
  return (
    <div
      className={cn(
        "font-mono text-sm bg-muted/50 rounded-lg p-4 overflow-auto max-h-[600px]",
        className
      )}
    >
      <JsonNode data={data} depth={0} />
    </div>
  );
}

interface JsonNodeProps {
  data: unknown;
  depth: number;
  keyName?: string;
}

function JsonNode({ data, depth, keyName }: JsonNodeProps) {
  const [isExpanded, setIsExpanded] = useState(depth < 2);

  const toggle = useCallback(() => setIsExpanded((prev) => !prev), []);

  const indent = depth * 16;

  if (data === null) {
    return (
      <span>
        {keyName && <span className="text-primary">&quot;{keyName}&quot;</span>}
        {keyName && <span className="text-foreground">: </span>}
        <span className="text-orange-500">null</span>
      </span>
    );
  }

  if (typeof data === "boolean") {
    return (
      <span>
        {keyName && <span className="text-primary">&quot;{keyName}&quot;</span>}
        {keyName && <span className="text-foreground">: </span>}
        <span className="text-orange-500">{data.toString()}</span>
      </span>
    );
  }

  if (typeof data === "number") {
    return (
      <span>
        {keyName && <span className="text-primary">&quot;{keyName}&quot;</span>}
        {keyName && <span className="text-foreground">: </span>}
        <span className="text-green-500">{data}</span>
      </span>
    );
  }

  if (typeof data === "string") {
    return (
      <span>
        {keyName && <span className="text-primary">&quot;{keyName}&quot;</span>}
        {keyName && <span className="text-foreground">: </span>}
        <span className="text-yellow-500">&quot;{data}&quot;</span>
      </span>
    );
  }

  if (Array.isArray(data)) {
    if (data.length === 0) {
      return (
        <span>
          {keyName && (
            <span className="text-primary">&quot;{keyName}&quot;</span>
          )}
          {keyName && <span className="text-foreground">: </span>}
          <span className="text-foreground">[]</span>
        </span>
      );
    }

    return (
      <div>
        <button
          onClick={toggle}
          className="inline-flex items-center hover:bg-muted rounded"
        >
          {isExpanded ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
          {keyName && (
            <span className="text-primary">&quot;{keyName}&quot;</span>
          )}
          {keyName && <span className="text-foreground">: </span>}
          <span className="text-foreground">[</span>
          {!isExpanded && (
            <span className="text-muted-foreground ml-1">
              {data.length} items
            </span>
          )}
          {!isExpanded && <span className="text-foreground">]</span>}
        </button>
        {isExpanded && (
          <>
            <div style={{ marginLeft: indent + 16 }}>
              {data.map((item, index) => (
                <div key={index}>
                  <JsonNode data={item} depth={depth + 1} />
                  {index < data.length - 1 && (
                    <span className="text-foreground">,</span>
                  )}
                </div>
              ))}
            </div>
            <div style={{ marginLeft: indent }}>
              <span className="text-foreground">]</span>
            </div>
          </>
        )}
      </div>
    );
  }

  if (typeof data === "object") {
    const entries = Object.entries(data);

    if (entries.length === 0) {
      return (
        <span>
          {keyName && (
            <span className="text-primary">&quot;{keyName}&quot;</span>
          )}
          {keyName && <span className="text-foreground">: </span>}
          <span className="text-foreground">{"{}"}</span>
        </span>
      );
    }

    return (
      <div>
        <button
          onClick={toggle}
          className="inline-flex items-center hover:bg-muted rounded"
        >
          {isExpanded ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
          {keyName && (
            <span className="text-primary">&quot;{keyName}&quot;</span>
          )}
          {keyName && <span className="text-foreground">: </span>}
          <span className="text-foreground">{"{"}</span>
          {!isExpanded && (
            <span className="text-muted-foreground ml-1">
              {entries.length} keys
            </span>
          )}
          {!isExpanded && <span className="text-foreground">{"}"}</span>}
        </button>
        {isExpanded && (
          <>
            <div style={{ marginLeft: indent + 16 }}>
              {entries.map(([key, value], index) => (
                <div key={key}>
                  <JsonNode data={value} depth={depth + 1} keyName={key} />
                  {index < entries.length - 1 && (
                    <span className="text-foreground">,</span>
                  )}
                </div>
              ))}
            </div>
            <div style={{ marginLeft: indent }}>
              <span className="text-foreground">{"}"}</span>
            </div>
          </>
        )}
      </div>
    );
  }

  return <span className="text-muted-foreground">undefined</span>;
}
