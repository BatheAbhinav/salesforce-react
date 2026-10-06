import { createDataSDK } from '@salesforce/platform-sdk';

export type SObjectField = string;

export type SObjectQueryOptions = {
  object: string;
  fields: SObjectField[];
  filters?: Record<string, unknown>;
  orderBy?: Record<string, unknown>;
  first?: number;
  after?: string | null;
};

export type SObjectRecord = {
  Id: string;
  [field: string]: unknown;
};

type QueryResponse = {
  uiapi?: {
    query?: Record<
      string,
      {
        edges?: Array<{ node?: Record<string, unknown> } | null> | null;
      } | null
    >;
  } | null;
};

function assertIdentifier(value: string, label: string): void {
  if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(value)) {
    throw new Error(`Invalid ${label}: ${value}`);
  }
}

function buildQuery({ object, fields }: SObjectQueryOptions): string {
  assertIdentifier(object, 'object name');
  fields.forEach(field => assertIdentifier(field, 'field name'));

  const selections = fields
    .filter(field => field !== 'Id')
    .map(field => `${field} @optional { value displayValue }`);

  return `query QuerySObject($first: Int, $after: String, $where: ${object}_Filter, $orderBy: ${object}_OrderBy) {
	uiapi {
		query {
			${object}(first: $first, after: $after, where: $where, orderBy: $orderBy) {
				edges {
					node {
						Id
						${selections.join('\n\t\t\t\t\t\t')}
					}
				}
			}
		}
	}
}`;
}

export async function querySObject(
  options: SObjectQueryOptions
): Promise<SObjectRecord[]> {
  if (options.fields.length === 0) {
    throw new Error('At least one field is required to query an object.');
  }

  const data = await createDataSDK();
  const result = await data.graphql!.query<
    QueryResponse,
    Record<string, unknown>
  >({
    query: buildQuery(options),
    variables: {
      first: options.first ?? 200,
      after: options.after ?? null,
      where: options.filters ?? null,
      orderBy: options.orderBy ?? null,
    },
    cacheControl: {
      maxAge: 15,
      type: 'max-age',
    },
  });

  if (result.errors?.length) {
    throw new Error(result.errors.map(error => error.message).join('; '));
  }

  return (result.data?.uiapi?.query?.[options.object]?.edges ?? [])
    .flatMap(edge => (edge?.node ? [edge.node] : []))
    .map(node => normalizeRecord(node, options.fields))
    .filter((record): record is SObjectRecord => record.Id.length > 0);
}

function normalizeRecord(
  node: Record<string, unknown>,
  fields: SObjectField[]
): SObjectRecord {
  const record: SObjectRecord = { Id: String(node.Id ?? '') };

  fields
    .filter(field => field !== 'Id')
    .forEach(field => {
      const value = node[field];
      if (value && typeof value === 'object' && 'displayValue' in value) {
        const fieldValue = value as { value?: unknown; displayValue?: unknown };
        record[field] = fieldValue.displayValue ?? fieldValue.value ?? null;
      } else {
        record[field] = value ?? null;
      }
    });

  return record;
}
