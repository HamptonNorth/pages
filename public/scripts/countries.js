// Wait for the DOM content to be fully loaded before trying to access the element
//
//
document.addEventListener('DOMContentLoaded', function () {
  const getCountriesButton = document.getElementById('getAllCountriesBtn')
  if (getCountriesButton) {
    getCountriesButton.addEventListener('click', function () {
      getAllCountries()
    })
  } else {
    console.error('Button with ID "getAllCountriesBtn" not found.')
  }
})

async function getAllCountries() {
  const resultDiv = document.getElementById('countriesResult')
  try {
    // Show loading state
    resultDiv.innerHTML = '<p class="text-slate-500">Loading...</p>'

    // Fetch data
    const response = await fetch('/api/test-countries')

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const countries = await response.json()

    // Display results
    if (countries.length === 0) {
      resultDiv.innerHTML = '<p class="text-slate-500">No countries found.</p>'
    } else {
      // resultDiv.innerHTML = JSON.stringify(countries)
      resultDiv.innerHTML = `

          <table class="min-w-full divide-y divide-slate-200 mt-4 text-xs">
            <thead class="bg-slate-50">
              <tr>
                <th class="px-4 py-2 text-left text-xs font-medium text-slate-700 uppercase">ISO Code</th>
                <th class="px-4 py-2 text-left text-xs font-medium text-slate-700 uppercase">ISO Name</th>
                <th class="px-4 py-2 text-left text-xs font-medium text-slate-700 uppercase">Official Name</th>
                <th class="px-4 py-2 text-left text-xs font-medium text-slate-700 uppercase">Currency</th>
                <th class="px-4 py-2 text-right text-xs font-medium text-slate-700 uppercase">Population</th>
                <th class="px-4 py-2 text-right text-xs font-medium text-slate-700 uppercase ">GPD </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-slate-100 ">


              ${countries
                .map(
                  (c) => `
                <tr>
                  <td class="px-4 py-1 text-xs text-slate-700 font-light ">${c.iso_code}</td>
                  <td class="px-4 py-1 text-xs text-slate-700 font-light">${c.iso_name}</td>
                  <td class="px-4 py-1 text-xs text-slate-700 font-light">${c.official_state_name}</td>
                  <td class="px-4 py-1 text-xs text-slate-700 font-light">${c.currency}</td>
                  <td class="px-4 py-1 text-xs text-slate-700 font-light text-right">${c.population.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}</td>
                  <td class="px-4 py-1 text-xs text-slate-700 font-light text-right">${c.gdp_billions_usd.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}</td>
                </tr>
              `,
                )
                .join('')}
            </tbody>
          </table>
        `
    }
  } catch (error) {
    resultDiv.innerHTML = `<p class="text-red-600">Error: ${error.message}</p>`
    console.error('Error fetching countries:', error)
  }
}

// A simple function that returns a Promise which resolves after a set duration.
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
