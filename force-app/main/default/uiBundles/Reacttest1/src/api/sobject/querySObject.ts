import { ApexClient, ApexResponse } from '@/utils/apexClient';
import { executeGraphQL } from '../graphqlClient';
import { QueryResponse, SObjectQueryOptions, SObjectRecord } from '@/lib/types';

const apexClient = new ApexClient();

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

  return `  QuerySObject($first: Int, $after: String, $where: ${object}_Filter, $orderBy: ${object}_OrderBy) {
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

  if (options.method === 'rest') {
    const result = await apexClient.callApexMethod<ApexResponse>(`accounts`);
    if (result.errors?.length) {
      throw new Error(result.errors.map(error => error.message).join('; '));
    }
    return result.data.map(record => ({
      ...record,
      Id: String(record.Id ?? ''),
    }));
  }

  const data = await executeGraphQL<QueryResponse, Record<string, unknown>>(
    buildQuery(options),
    {
      first: options.first ?? 200,
      after: options.after ?? null,
      where: options.filters ?? null,
      orderBy: options.orderBy ?? null,
    }
  );

  return (data.uiapi?.query?.[options.object]?.edges ?? [])
    .flatMap(edge => (edge?.node ? [edge.node] : []))
    .map(node => normalizeRecord(node, options.fields))
    .filter(record => record.Id.length > 0);
}

function normalizeRecord(
  node: Record<string, unknown>,
  fields: SObjectQueryOptions['fields']
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
