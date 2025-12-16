import { db } from '../server.js'
import { nowSQLiteFormat } from '../utils.js'

/**
 * Gets all products.
 */
export function getAllTestProductsData() {
  const query = db.query(
    `SELECT id, code, description, colour, status_setting, date_added, date_last_amended
    FROM test_products
    ORDER BY id `,
  )
  return query.all()
}

/**
 * Gets a single product by their ID.
 * Used to check for existence before update/delete.
 * Also check it's not already deleted.
 */
export function getTestProductByIdData(id) {
  const query = db.query(
    `SELECT id FROM test_products
     WHERE id = $id `,
  )

  return query.get({ $id: id })
}

/**
 * Inserts a new product into the database.
 * Uses named parameters for better maintainability.
 */
export function addTestProductData(productData) {
  const query = db.query(
    `INSERT INTO test_products (code, description, colour, status_setting, date_added, date_last_amended)
     VALUES ($code, $description, $colour, $statusSetting, $now, $now)
  `,
  )

  return query.run({
    $code: productData.code,
    $description: productData.description,
    $colour: productData.colour,
    $statusSetting: productData.statusSetting,
    $now: nowSQLiteFormat(),
  })
}

/**
 * Updates an existing product in the database.
 */
export function updateTestProductData(productData) {
  const query = db.query(
    `UPDATE test_products
    SET code = $code,
        description = $description,
        colour = $colour,
        status_setting = $statusSetting,
        date_last_amended = $now
    WHERE id = $id
  `,
  )
  return query.run({
    $code: productData.code,
    $description: productData.description,
    $colour: productData.colour,
    $statusSetting: productData.statusSetting,
    $now: nowSQLiteFormat(),
    $id: productData.id,
  })
}

/**
 * Hard deletes a product from the database.
 */
export function deleteTestProductData(productData) {
  const query = db.query(`DELETE FROM test_products WHERE id = $id`)
  return query.run({
    $id: productData.id,
  })
}
