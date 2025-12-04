// version 1.1 Gemini Pro
import { db } from "../server.js";

/**
 * Gets all test countries.
 */
export function getAllTestCountriesData() {
  const query = db.query(
    `SELECT iso_code, iso_name, official_state_name FROM test_countries ORDER BY gdp_billions_usd DESC`
  );
  return query.all();
}

/**
 * Searches for test countries by name.
 * Uses named parameters for consistency.
 */
export function searchTestCountriesData(searchTerm) {
  // Use named parameters ($) for consistency and maintainability
  const query = db.query(
    `SELECT iso_code, iso_name, official_state_name 
    FROM test_countries 
    WHERE iso_name LIKE $searchPattern OR official_state_name LIKE $searchPattern
    ORDER BY gdp_billions_usd DESC`
  );
  const searchPattern = `%${searchTerm}%`;

  // Pass an object to .all() to bind the named parameter
  return query.all({ $searchPattern: searchPattern });
}
