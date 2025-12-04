// version 1.1 Gemini Pro
import {
  getAllTestCountriesData,
  searchTestCountriesData,
} from "../models/testCountries.model.js";

/**
 * Gets all test countries.
 * Errors are caught by the central error handler in api.js.
 */
export function getAllTestCountries() {
  // Business logic here (if any)
  const countries = getAllTestCountriesData();
  return Response.json(countries);
}

/**
 * Searches for test countries based on a search term.
 * Errors are caught by the central error handler in api.js.
 */
export function searchTestCountries(searchTerm) {
  // Business logic here (if any)

  // Validation (a 400 error) is not an exception, so it stays in the controller.
  if (!searchTerm) {
    return Response.json(
      { error: "Search term is required" },
      { status: 400 } // 400 Bad Request
    );
  }

  // Pass the search term to the model.
  // Any errors thrown from the model (e.g., db connection, query syntax)
  // will now be caught by the central handler in api.js and returned as a 500 error.
  const countries = searchTestCountriesData(searchTerm);

  return Response.json(countries);
}
