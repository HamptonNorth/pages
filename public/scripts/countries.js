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

// async function searchCountries() {
//   const searchTerm = document.getElementById('searchTerm')
//   const resultDiv = document.getElementById('countriesResult')
//   const searchErrorDiv = document.getElementById('searchError')

//   const term = searchTerm.value
//   if (term.length < 2) {
//     searchErrorDiv.innerHTML = '<p class="text-red-500" >Must be 2 characters or longer</p>'
//     searchTerm.classList.add('outline-red-500')
//     searchTerm.classList.remove('outline-slate-300')
//     await delay(2000)
//     searchTerm.focus()
//     searchErrorDiv.innerHTML = ``
//     searchTerm.classList.remove('outline-red-500')
//     searchTerm.classList.add('outline-slate-300')

//     return
//   }
//   try {
//     // Show loading state
//     resultDiv.innerHTML = '<p class="text-slate-500">Loading...</p>'

//     // Fetch data
//     const response = await fetch('/api/search-test-countries?search=' + term)

//     if (!response.ok) {
//       throw new Error(`HTTP error! status: ${response.status}`)
//     }

//     const countries = await response.json()

//     // Display results
//     if (countries.length === 0) {
//       resultDiv.innerHTML = '<p class="text-slate-500">No countries found.</p>'
//     } else {
//       // resultDiv.innerHTML = JSON.stringify(countries)
//       resultDiv.innerHTML = `
//         <div class=""> Countries containing:  <span class="pl-2 font-semibold text-sm">${term}</span>
//           <table class="min-w-full divide-y divide-slate-200 mt-4 text-xs">
//             <thead class="bg-slate-50">
//               <tr>
//                 <th class="px-4 py-2 text-left text-xs font-medium text-slate-700 uppercase">ISO Code</th>
//                 <th class="px-4 py-2 text-left text-xs font-medium text-slate-700 uppercase">ISO Name</th>
//                 <th class="px-4 py-2 text-left text-xs font-medium text-slate-700 uppercase">Official Name</th>
//               </tr>
//             </thead>
//             <tbody class="bg-white divide-y divide-slate-100 ">

//               ${countries
//                 .map(
//                   (c) => `
//                 <tr>
//                   <td class="px-4 py-1 text-xs text-slate-700 font-light ">${c.iso_code}</td>
//                   <td class="px-4 py-1 text-xs text-slate-700 font-light">${c.iso_name}</td>
//                   <td class="px-4 py-1 text-xs text-slate-700 font-light">${c.official_state_name}</td>
//                 </tr>
//               `,
//                 )
//                 .join('')}
//             </tbody>
//           </table>
//         `
//     }
//   } catch (error) {
//     resultDiv.innerHTML = `<p class="text-red-600">Error: ${error.message}</p>`
//     console.error('Error fetching countries:', error)
//   }
// }

// A simple function that returns a Promise which resolves after a set duration.
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
