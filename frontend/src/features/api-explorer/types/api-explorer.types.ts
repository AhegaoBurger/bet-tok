export interface ApiEndpoint {
  id: string;
  name: string;
  method: "GET";
  path: string;
  description: string;
  parameters: ApiParameter[];
}

export interface ApiParameter {
  name: string;
  type: "string" | "number" | "boolean";
  required: boolean;
  description: string;
  placeholder?: string;
}

export const API_ENDPOINTS: ApiEndpoint[] = [
  {
    id: "markets-list",
    name: "List Markets",
    method: "GET",
    path: "/api/markets",
    description: "Get a list of prediction markets",
    parameters: [
      {
        name: "limit",
        type: "number",
        required: false,
        description: "Maximum number of markets to return",
        placeholder: "10",
      },
      {
        name: "offset",
        type: "number",
        required: false,
        description: "Number of markets to skip",
        placeholder: "0",
      },
      {
        name: "active",
        type: "boolean",
        required: false,
        description: "Filter by active status",
      },
      {
        name: "closed",
        type: "boolean",
        required: false,
        description: "Filter by closed status",
      },
      {
        name: "order",
        type: "string",
        required: false,
        description: "Sort field (volume, liquidity, createdAt, endDate)",
        placeholder: "volume",
      },
      {
        name: "ascending",
        type: "boolean",
        required: false,
        description: "Sort direction",
      },
    ],
  },
  {
    id: "markets-get",
    name: "Get Market",
    method: "GET",
    path: "/api/markets/:id",
    description: "Get a single market by ID",
    parameters: [
      {
        name: "id",
        type: "string",
        required: true,
        description: "Market ID",
        placeholder: "123456",
      },
    ],
  },
  {
    id: "markets-search",
    name: "Search Markets",
    method: "GET",
    path: "/api/markets/search",
    description: "Search markets by query",
    parameters: [
      {
        name: "q",
        type: "string",
        required: true,
        description: "Search query",
        placeholder: "bitcoin",
      },
    ],
  },
  {
    id: "events-list",
    name: "List Events",
    method: "GET",
    path: "/api/events",
    description: "Get a list of events (grouped markets)",
    parameters: [
      {
        name: "limit",
        type: "number",
        required: false,
        description: "Maximum number of events to return",
        placeholder: "10",
      },
      {
        name: "offset",
        type: "number",
        required: false,
        description: "Number of events to skip",
        placeholder: "0",
      },
      {
        name: "active",
        type: "boolean",
        required: false,
        description: "Filter by active status",
      },
      {
        name: "closed",
        type: "boolean",
        required: false,
        description: "Filter by closed status",
      },
      {
        name: "order",
        type: "string",
        required: false,
        description: "Sort field (volume, liquidity, creationDate, endDate)",
        placeholder: "volume",
      },
      {
        name: "ascending",
        type: "boolean",
        required: false,
        description: "Sort direction",
      },
    ],
  },
  {
    id: "events-get",
    name: "Get Event",
    method: "GET",
    path: "/api/events/:id",
    description: "Get a single event by ID",
    parameters: [
      {
        name: "id",
        type: "string",
        required: true,
        description: "Event ID",
        placeholder: "123456",
      },
    ],
  },
];
