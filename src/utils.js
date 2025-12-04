// Returns date in format suitable for SQLite text fileds holding dates e.g 2025-10-23 11:42:12
export function nowSQLiteFormat() {
  return new Date().toISOString().replace('T', ' ').split('.')[0]
}
