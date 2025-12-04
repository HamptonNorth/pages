// version 1.1 Gemini 2.5 Pro
// ============================================================================
// GLOBAL VARIABLES
// ============================================================================
let currentMode = 'add'
let productsCache = [] // Store loaded products for ID lookup

// DOM Elements
let formTitle = null
let formButton = null
let idFieldContainer = null
let productIdInput = null
let codeInput = null
let descriptionInput = null
let colourInput = null
let statusSettingInput = null
let responseMessage = null
let allProductsResponse = null
let productForm = null // Added to global scope for easier access

// ============================================================================
// INITIALIZATION
// ============================================================================
document.addEventListener('DOMContentLoaded', function () {
  initializeDOMElements()
  attachEventListeners()
  updateFormForMode('add')
})

function initializeDOMElements() {
  // Get all form elements
  formTitle = document.getElementById('formTitle')
  formButton = document.getElementById('formButton')
  idFieldContainer = document.getElementById('idFieldContainer')
  productIdInput = document.getElementById('product_id')
  codeInput = document.getElementById('product_code')
  descriptionInput = document.getElementById('product_description')
  colourInput = document.getElementById('colour')
  statusSettingInput = document.getElementById('status_setting')
  responseMessage = document.getElementById('responseMessage')
  allProductsResponse = document.getElementById('allProductsResponse')
  productForm = document.getElementById('productForm') // Initialized here

  // Validate critical elements exist
  if (!formTitle || !formButton || !responseMessage || !productForm) {
    console.error('Critical form elements not found')
  }
}

function attachEventListeners() {
  // Get Products button
  const getProductsButton = document.getElementById('getProductsBtn')
  if (getProductsButton) {
    getProductsButton.addEventListener('click', getAllProducts)
  }

  // Mode radio buttons
  const modeRadios = document.querySelectorAll('input[name="mode"]')
  modeRadios.forEach((radio) => {
    radio.addEventListener('change', function () {
      currentMode = this.value
      updateFormForMode(currentMode)
    })
  })

  // Product ID input - auto-populate form when ID is entered
  productIdInput.addEventListener('input', handleProductIdInput)

  // --------------------------------------------------------------------------
  // FORM SUBMISSION LOGIC
  // --------------------------------------------------------------------------

  // 1. Handle Native Submit (e.g., triggering via code or potential future hidden submit buttons)
  if (productForm) {
    productForm.addEventListener('submit', handleFormSubmit)
  }

  // 2. Bridge Custom Button Click to Form Submission
  // Since <rm-button> is a Custom Element, the form doesn't automatically recognize
  // it as a submit button. We listen for the click and manually request submission.
  if (formButton && productForm) {
    formButton.addEventListener('click', (event) => {
      // We do not preventDefault here on the click, we just trigger the form.
      // requestSubmit() allows HTML5 validation to run and then fires the 'submit' event.
      productForm.requestSubmit()
    })
  }
}

// ============================================================================
// MODE MANAGEMENT
// ============================================================================
function updateFormForMode(mode) {
  switch (mode) {
    case 'add':
      setupAddMode()
      break
    case 'amend':
      setupAmendMode()
      break
    case 'delete':
      setupDeleteMode()
      break
  }
}

function setupAddMode() {
  formTitle.textContent = 'Add New Product'
  formButton.textContent = 'Add Product'

  // Hide ID field
  idFieldContainer.classList.add('hidden')
  productIdInput.removeAttribute('required')

  // Enable all input fields
  codeInput.disabled = false
  descriptionInput.disabled = false
  colourInput.disabled = false
  statusSettingInput.disabled = false

  // Reset form
  productForm.reset()
  hideResponseMessage()
}

function setupAmendMode() {
  formTitle.textContent = 'Amend Product'
  formButton.textContent = 'Amend Product'

  // Show ID field and make it required
  idFieldContainer.classList.remove('hidden')
  productIdInput.setAttribute('required', 'required')

  // Enable all input fields
  codeInput.disabled = false
  descriptionInput.disabled = false
  colourInput.disabled = false
  statusSettingInput.disabled = false

  // Clear form but we generally keep the ID if it was just typed.
  // Using reset() wipes the ID if it wasn't set via setAttribute value.
  // A cleaner approach for Amend is usually not to full reset if the product is typing an ID.
  productForm.reset()

  // Reset ID field styling
  productIdInput.classList.remove('border-green-500', 'border-red-300')
  productIdInput.classList.add('border-slate-300')

  hideResponseMessage()
}

function setupDeleteMode() {
  formTitle.textContent = 'Delete Product'
  formButton.textContent = 'Delete Product'

  // Show ID field and make it required
  idFieldContainer.classList.remove('hidden')
  productIdInput.setAttribute('required', 'required')

  // Disable other input fields (read-only for delete)
  codeInput.disabled = true
  descriptionInput.disabled = true
  colourInput.disabled = true
  statusSettingInput.disabled = true

  // Clear non-ID fields
  codeInput.value = ''
  descriptionInput.value = ''
  colourInput.value = ''

  // Reset ID field styling
  productIdInput.classList.remove('border-green-500', 'border-red-300')
  productIdInput.classList.add('border-slate-300')

  hideResponseMessage()
}

// ============================================================================
// USER ID AUTO-POPULATION
// ============================================================================
function handleProductIdInput() {
  const productId = productIdInput.value.trim()

  // Only try to populate if we have a valid ID and we're in amend/delete mode
  if (productId && (currentMode === 'amend' || currentMode === 'delete')) {
    populateFormFromProductId(productId)
  } else {
    // Clear form fields if ID is empty
    if (currentMode === 'amend') {
      clearFormFields()
    }
  }
}

function populateFormFromProductId(productId) {
  // Find product in cache
  const product = productsCache.find((u) => u.id == productId)

  if (product) {
    // Populate form fields
    codeInput.value = product.code || ''
    descriptionInput.value = product.description || ''
    colourInput.value = product.colour || ''
    statusSettingInput.value = product.status_setting || 'Active'

    // Show success indicator
    productIdInput.classList.remove('border-red-300', 'border-slate-300')
    productIdInput.classList.add('border-green-500')
    hideResponseMessage()
  } else {
    // Product not found - check if we need to fetch products first
    if (productsCache.length === 0) {
      showInfoMessage('Please click "Get Test Products" first to load product data')
    } else {
      // Product not found in cache
      productIdInput.classList.remove('border-green-500', 'border-slate-300')
      productIdInput.classList.add('border-red-300')

      if (currentMode === 'amend') {
        clearFormFields()
      }
    }
  }
}

function clearFormFields() {
  codeInput.value = ''
  descriptionInput.value = ''
  colourInput.value = ''
  statusSettingInput.value = 'inStock'

  // Reset ID field border
  productIdInput.classList.remove('border-green-500', 'border-red-300')
  productIdInput.classList.add('border-slate-300')
}

// ============================================================================
// FORM SUBMISSION
// ============================================================================
function handleFormSubmit(event) {
  // Prevent the browser from reloading the page
  event.preventDefault()

  switch (currentMode) {
    case 'add':
      addProduct()
      break
    case 'amend':
      amendProduct()
      break
    case 'delete':
      deleteProduct()
      break
  }
}

// ============================================================================
// API CALLS
// ============================================================================
async function addProduct() {
  const formData = getFormData()

  try {
    const response = await fetch('/api/add-test-product', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    })

    const data = await response.json()

    if (response.ok) {
      showSuccessMessage(`Product added successfully (ID: ${data.id})`)
      productForm.reset()
      refreshProductsTableIfVisible()
    } else {
      handleErrorResponse(data)
    }
  } catch (error) {
    showErrorMessage(error.message)
  }
}

async function amendProduct() {
  const formData = getFormData()

  try {
    const response = await fetch('/api/update-test-product', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    })

    const data = await response.json()

    if (response.ok) {
      showSuccessMessage(`Product amended successfully (id: ${data.id} ${data.product_name})`)
      productForm.reset()
      refreshProductsTableIfVisible()
    } else {
      handleErrorResponse(data)
    }
  } catch (error) {
    showErrorMessage(error.message)
  }
}

async function deleteProduct() {
  const productId = productIdInput.value

  if (!confirm(`Are you sure you want to delete product ID ${productId}?`)) {
    return
  }

  try {
    const response = await fetch('/api/delete-test-product', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ product_id: productId }),
    })

    const data = await response.json()

    if (response.ok) {
      showSuccessMessage(`Product deleted successfully (ID: ${productId})`)
      productForm.reset()
      refreshProductsTableIfVisible()
    } else {
      handleErrorResponse(data)
    }
  } catch (error) {
    showErrorMessage(error.message)
  }
}

async function getAllProducts() {
  try {
    // Show loading state
    allProductsResponse.innerHTML = '<p class="text-slate-500">Loading...</p>'

    // Fetch data
    const response = await fetch('/api/test-products')
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const products = await response.json()

    // Store products in cache for ID lookup
    productsCache = products

    if (products.length === 0) {
      allProductsResponse.innerHTML = '<p class="text-slate-500">No products found.</p>'
    } else {
      displayProductsTable(products)
    }
  } catch (error) {
    allProductsResponse.innerHTML = `<p class="text-red-600">Error: ${error.message}</p>`
    console.error('Error fetching products:', error)
  }
}

// ============================================================================
// DISPLAY FUNCTIONS
// ============================================================================
function displayProductsTable(products) {
  allProductsResponse.innerHTML = `
    <table class="min-w-full divide-y divide-slate-200 mt-4 text-xs">
      <thead class="bg-slate-50">
        <tr>
          <th class="px-4 py-2 text-left text-xs font-medium text-slate-700 uppercase">ID</th>
          <th class="px-4 py-2 text-left text-xs font-medium text-slate-700 uppercase">Code</th>
          <th class="px-4 py-2 text-left text-xs font-medium text-slate-700 uppercase">Description</th>
          <th class="px-4 py-2 text-left text-xs font-medium text-slate-700 uppercase">Colour</th>
          <th class="px-4 py-2 text-left text-xs font-medium text-slate-700 uppercase">Status</th>
          <th class="px-4 py-2 text-left text-xs font-medium text-slate-700 uppercase">Date Added</th>
          <th class="px-4 py-2 text-left text-xs font-medium text-slate-700 uppercase">Date Amended</th>
        </tr>
      </thead>
      <tbody class="bg-white divide-y divide-slate-100">
        ${products
          .map(
            (product) => `
          <tr class="hover:bg-slate-50">
            <td class="px-4 py-1 text-xs text-slate-700 font-light">${product.id}</td>
            <td class="px-4 py-1 text-xs text-slate-700 font-light">${product.code}</td>
            <td class="px-4 py-1 text-xs text-slate-700 font-light">${product.description}</td>
            <td class="px-4 py-1 text-xs text-slate-700 font-light">${product.colour}</td>
            <td class="px-4 py-1 text-xs text-slate-700 font-light">${product.status_setting}</td>
            <td class="px-4 py-1 text-xs text-slate-700 font-light">${product.date_added}</td>
            <td class="px-4 py-1 text-xs text-slate-700 font-light">${product.date_last_amended}</td>
          </tr>
        `,
          )
          .join('')}
      </tbody>
    </table>
  `
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================
function getFormData() {
  const formData = new FormData(productForm)
  return Object.fromEntries(formData.entries())
}

function refreshProductsTableIfVisible() {
  if (allProductsResponse && allProductsResponse.innerHTML.trim() !== '') {
    getAllProducts()
  }
}

function handleErrorResponse(data) {
  if (data.details && data.details.includes('UNIQUE constraint failed')) {
    showErrorMessage('Product code already exists. Product codes must be unique.')
  } else {
    showErrorMessage(data.error || data.message || 'Operation failed')
  }
}

function showSuccessMessage(message) {
  responseMessage.className =
    'mt-4 p-2 bg-green-100 border border-green-400 text-green-700 rounded-md'
  responseMessage.textContent = message
  responseMessage.classList.remove('hidden')

  // Auto-hide after 5 seconds
  setTimeout(() => {
    responseMessage.classList.add('hidden')
  }, 5000)
}

function showErrorMessage(message) {
  responseMessage.className =
    'flex-1 mt-4 p-2 bg-red-100 border border-red-400 text-red-700 rounded-md'
  responseMessage.textContent = message
  responseMessage.classList.remove('hidden')
}

function showInfoMessage(message) {
  responseMessage.className = 'mt-4 p-2 bg-blue-100 border border-blue-400 text-blue-700 rounded-md'
  responseMessage.textContent = message
  responseMessage.classList.remove('hidden')
}

function hideResponseMessage() {
  responseMessage.classList.add('hidden')
}
