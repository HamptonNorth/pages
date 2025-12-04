import {
  getAllTestProductsData,
  getTestProductByIdData, // Import new function for checking existence
  addTestProductData,
  updateTestProductData,
  deleteTestProductData,
} from '../models/testProducts.model.js'

/**
 * Gets all non-deleted test products.
 * Errors are caught by the central error handler in api.js.
 */
export function getAllTestProducts() {
  // Business logic here (if any)
  const products = getAllTestProductsData()
  return Response.json(products)
}

/**
 * Adds a new test product.
 */
export function addTestProduct(productData) {
  // Extract data from the request body
  const code = productData.code
  const description = productData.description
  const colour = productData.colour
  const statusSetting = productData.status_setting

  if (!code || !description || !colour || !statusSetting) {
    return Response.json(
      {
        error: 'Missing input',
        details: 'All fields are required',
      },
      { status: 400 }, // 400 Bad Request
    )
  }

  // Pass data to model
  const result = addTestProductData({
    code,
    description,
    colour,
    statusSetting,
  })

  // Return success response
  return Response.json(
    {
      success: true,
      message: 'Product added successfully',
      id: result.lastInsertRowid,
    },
    { status: 201 }, // 201 Created
  )
}

/**
 * Updates an existing test product.
 */
export function updateTestProduct(productData) {
  // Extract data from the request body
  const id = productData.product_id
  const code = productData.code
  const description = productData.description
  const colour = productData.colour
  const statusSetting = productData.status_setting

  // Check if ID was provided
  if (!id) {
    return Response.json(
      {
        error: 'Row id missing',
        details: 'No id in productData',
      },
      { status: 400 },
    )
  }

  // Check if the product ID exists before attempting to update
  const existingProduct = getTestProductByIdData(id)
  if (!existingProduct) {
    return Response.json(
      {
        error: 'Not Found',
        details: 'The id entered does not exist', // Product's requested message
      },
      { status: 404 }, // 404 Not Found
    )
  }

  // Check for other required fields
  if (!code || !description || !colour || !statusSetting) {
    return Response.json(
      {
        error: 'Missing field',
        details: 'All fields are required in productData',
      },
      { status: 400 },
    )
  }

  // Pass data to model
  const result = updateTestProductData({
    id,
    code,
    description,
    colour,
    statusSetting,
  })

  // Return success response
  return Response.json(
    {
      success: true,
      message: 'Product updated successfully',
      id: id,
      code: code,
    },
    { status: 200 }, // 200 OK
  )
}

/**
 * Deletes (soft) an existing test product.
 */
export function deleteTestProduct(productData) {
  // Extract data from the request body
  const id = productData.product_id

  // Check if ID was provided
  if (!id) {
    return Response.json(
      {
        error: 'Row id missing',
        details: 'No id in productData',
      },
      { status: 400 },
    )
  }

  // Check if the product ID exists before attempting to delete
  const existingProduct = getTestProductByIdData(id)
  if (!existingProduct) {
    return Response.json(
      {
        error: 'Not Found',
        details: 'The id entered does not exist', // Product's requested message
      },
      { status: 404 }, // 404 Not Found
    )
  }

  // Pass data to model
  const result = deleteTestProductData({
    id,
  })

  // Return success response
  return Response.json(
    {
      success: true,
      message: 'Product deleted successfully',
      id: id,
    },
    { status: 200 }, // 200 OK
  )
}
