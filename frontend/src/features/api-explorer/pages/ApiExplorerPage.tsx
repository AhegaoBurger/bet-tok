import { useState, useCallback } from "react";
import { Loader2, Play, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { apiClient } from "@/lib/api-client";
import { EndpointSelector } from "../components/EndpointSelector";
import { ParameterForm } from "../components/ParameterForm";
import { JsonViewer } from "../components/JsonViewer";
import { CopyButton } from "../components/CopyButton";
import { API_ENDPOINTS, type ApiEndpoint } from "../types/api-explorer.types";

export function ApiExplorerPage() {
  const [selectedEndpoint, setSelectedEndpoint] = useState<ApiEndpoint>(
    API_ENDPOINTS[0]
  );
  const [params, setParams] = useState<Record<string, string>>({});
  const [response, setResponse] = useState<unknown>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleEndpointChange = useCallback((endpoint: ApiEndpoint) => {
    setSelectedEndpoint(endpoint);
    setParams({});
    setResponse(null);
    setError(null);
  }, []);

  const handleParamChange = useCallback((name: string, value: string) => {
    setParams((prev) => ({
      ...prev,
      [name]: value,
    }));
  }, []);

  const buildUrl = useCallback(() => {
    let path = selectedEndpoint.path;

    // Replace path parameters (e.g., :id)
    const pathParams = selectedEndpoint.parameters.filter((p) =>
      path.includes(`:${p.name}`)
    );
    pathParams.forEach((param) => {
      if (params[param.name]) {
        path = path.replace(`:${param.name}`, params[param.name]);
      }
    });

    // Build query string for non-path parameters
    const queryParams = selectedEndpoint.parameters
      .filter((p) => !selectedEndpoint.path.includes(`:${p.name}`))
      .filter((p) => params[p.name] && params[p.name].trim() !== "")
      .map(
        (p) => `${encodeURIComponent(p.name)}=${encodeURIComponent(params[p.name])}`
      )
      .join("&");

    return queryParams ? `${path}?${queryParams}` : path;
  }, [selectedEndpoint, params]);

  const handleExecute = async () => {
    setIsLoading(true);
    setError(null);
    setResponse(null);

    try {
      const url = buildUrl();
      const result = await apiClient.get(url);
      setResponse(result.data);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "An error occurred";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const isValid = useCallback(() => {
    const requiredParams = selectedEndpoint.parameters.filter((p) => p.required);
    return requiredParams.every(
      (p) => params[p.name] && params[p.name].trim() !== ""
    );
  }, [selectedEndpoint, params]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold">API Explorer</h1>
        <p className="text-muted-foreground">
          Explore and test Polymarket API endpoints. View raw JSON responses.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Request Panel */}
        <Card>
          <CardHeader>
            <CardTitle>Request</CardTitle>
            <CardDescription>
              Select an endpoint and configure parameters
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <EndpointSelector
              value={selectedEndpoint.id}
              onChange={handleEndpointChange}
            />

            <div className="space-y-2">
              <span className="text-sm font-medium">URL Preview</span>
              <code className="block p-3 bg-muted rounded-md text-sm break-all">
                {buildUrl()}
              </code>
            </div>

            <div className="space-y-2">
              <span className="text-sm font-medium">Description</span>
              <p className="text-sm text-muted-foreground">
                {selectedEndpoint.description}
              </p>
            </div>

            <div className="border-t pt-4">
              <span className="text-sm font-medium block mb-4">Parameters</span>
              <ParameterForm
                endpoint={selectedEndpoint}
                values={params}
                onChange={handleParamChange}
              />
            </div>

            <Button
              onClick={handleExecute}
              disabled={isLoading || !isValid()}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Executing...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Execute Request
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Response Panel */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Response</CardTitle>
              <CardDescription>Raw JSON response from the API</CardDescription>
            </div>
            {response !== null && (
              <CopyButton text={JSON.stringify(response, null, 2)} />
            )}
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {isLoading && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            )}

            {!isLoading && !error && response === null && (
              <div className="text-center py-12 text-muted-foreground">
                <p>Execute a request to see the response</p>
              </div>
            )}

            {!isLoading && !error && response !== null && (
              <JsonViewer data={response} />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
