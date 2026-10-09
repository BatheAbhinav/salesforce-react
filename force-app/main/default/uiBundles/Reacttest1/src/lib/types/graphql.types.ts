export type QueryResponse = {
  uiapi?: {
    query?: Record<
      string,
      {
        edges?: Array<{ node?: Record<string, unknown> } | null> | null;
      } | null
    >;
  } | null;
};

export type SObjectField = string;

export type SObjectQueryOptions = {
  object: string;
  fields: SObjectField[];
  filters?: Record<string, unknown>;
  orderBy?: Record<string, unknown>;
  first?: number;
  after?: string | null;
  method: 'graphql' | 'rest';
};

export type SObjectRecord = {
  Id: string;
  [field: string]: unknown;
};
