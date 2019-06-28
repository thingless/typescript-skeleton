import { Pool, types, FieldDef } from 'pg';
import * as moment from 'moment';
import { initLogger } from '../helpers/logger';
import { HttpError } from '../helpers/util'
const logger = initLogger(__filename);
types.setTypeParser(1114, (x) => moment.utc(x).toISOString()); //fix timestamp parsing

export type Filters<T extends { [key: string]: any }> = [keyof T, string][]
export type Columns<T extends { [key: string]: any }> = Array<keyof T>

export async function getMany<T extends { [key: string]: any }>(
  tableName: string,
  columns: Columns<T>,
  filters: Filters<T>,
  limit?: number,
  offset?: number,
  orderBy?: string,
  descending?: boolean,
): Promise<Array<T>> {
  if (orderBy && columns.indexOf(orderBy) === -1) {
    throw new HttpError(400, 'invalid order field');
  }
  limit = limit || 200;
  //generate SQL
  let sql = `SELECT ${columns.join(',')} FROM ${tableName} WHERE `;
  let builtFilter = buildFilterSQL<T>(filters, columns)
  sql += builtFilter.sql
  const vals = builtFilter.vals
  if (orderBy) {
    sql += ` ORDER BY ${orderBy} ${descending ? 'DESC' : 'ASC'}`;
  }
  if (typeof limit !== 'undefined') {
    sql += ` LIMIT $${vals.length + 1} `;
    vals.push(limit as any);
  }
  if (typeof offset !== 'undefined') {
    sql += ` OFFSET $${vals.length + 1}`;
    vals.push(offset as any);
  }
  //run SQL
  return (await pool.query(sql + ' ;', vals)).rows;
}

// e.g. filter = [["group_id", "eq.1234"]]
export function buildFilterSQL<T extends { [key: string]: any }>(
  filters: Filters<T>,
  allowedColumns: Columns<T>,
): { sql: string, vals: any[] } {
  //validate request
  const invalidField = filters.find((n) => allowedColumns.indexOf(n[0]) === -1)
  if (invalidField) {
    throw new HttpError(400, `invalid filter field: ${invalidField}`);
  } else if (filters.find((expr) => !FILTER_VALUE_REGEX.test(expr[1]))) {
    throw new HttpError(400, 'invalid filter value');
  } else if (!filters.length) {
    return {sql: ' TRUE ', vals:[]}
  }

  let sql = ' true ';
  const vals: Array<string> = [];
  filters.forEach(([name, value], index) => {
    const [_, op, val] = Array.from(FILTER_VALUE_REGEX.exec(value) as any);
    vals.push(val);
    sql += ` AND ${name} ${opToSql(op)} $${index + 1} `;
  });
  return { sql: sql, vals: vals };
}
const FILTER_VALUE_REGEX = /^(eq|lt|gt|neq|gte|lte)\.(.*)$/i;
enum OpToSqlMap {
  eq = '=',
  lt = '<',
  gt = '>',
  gte = '>=',
  lte = '<=',
  neq = '<>',
}
function opToSql(op: keyof typeof OpToSqlMap): string {
  return OpToSqlMap[op];
}

export async function upsert<T extends { [key: string]: any, id: string }>(tableName: string, columns: Columns<T>, data: T): Promise<void> {
  columns = columns.filter((f) => typeof (data as any)[f] !== 'undefined');
  const sql = `
  INSERT INTO ${tableName} (${columns.join(',')})
  VALUES(${columns.map((x, i) => '$' + (i + 1)).join(',')})
  ON CONFLICT(id) DO UPDATE SET
  ${columns.map((f, i) => `${f}=$${i + 1}`).join(',')}
  ; `;
  await pool.query(sql, columns.map((f) => (data as any)[f]));
}

export async function update<T extends { [key: string]: any, id: string }>(tableName: string, columns: Columns<T>, data: T): Promise<void> {
  columns = columns.filter((f) => typeof (data as any)[f] !== 'undefined');
  const sql = `
  UPDATE ${tableName} SET
  ${columns.map((f, i) => `${f}=$${i + 2}`).join(',')}
  WHERE id=$1;`;
  await pool.query(sql, [data.id].concat(columns.map((f) => (data as any)[f])));
}

export async function get<T extends { [key: string]: any, id: string }>(tableName: string, columns: Columns<T>, id: string): Promise<T | null> {
  return (await pool.query(`SELECT ${columns.join(',')} FROM ${tableName} WHERE id = $1`, [id])).rows[0];
}

export let pool: Pool;
export function connect(connectionString: string) {
  pool = new Pool({ connectionString: connectionString });
  return pool;
}