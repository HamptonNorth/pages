import { Database } from 'bun:sqlite'
import { resolve, dirname, join } from 'path'
import { existsSync, mkdirSync } from 'fs'
import { fileURLToPath } from 'url'
import { nowSQLiteFormat } from './utils.js'

// Resolve Path
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const projectRoot = resolve(__dirname, '..')
const dbPath = join(projectRoot, 'data', 'app3.db')

// Fail early if DB is missing
if (!existsSync(dbPath)) {
  console.error(`\n❌ CRITICAL ERROR: Database not found at ${dbPath}`)
  console.error(
    `   Please run the setup script first. This creates an empty database and creates all the `,
  )
  console.error(`   empty tables for authentication and adds the default admin user. \n`)
  console.error(
    `   Ensure the variables ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD and BETTER_AUTH_SECRET are set in .env and then:\n `,
  )
  console.error(`   From the terminal run:      node --env-file=.env public/scripts/setup.js\n`)
  process.exit(1)
}

// Initialize Bun Database Connection
export const db = new Database(dbPath)
console.log(`✅ Runtime DB Connected: ${dbPath}`)

// Test Table Checks (Countries/Test Users)
// These run on every startup to ensure your app specific test data is available
// (Better-auth tables are handled by the Node script, ignored them here)

export function tableExists(tableName) {
  const query = db.query("SELECT name FROM sqlite_master WHERE type='table' AND name=?")
  return query.get(tableName) !== null
}

export function initialiseTestCountries(tableName = 'test_countries') {
  if (tableExists(tableName)) return

  // Create table
  db.run(`CREATE TABLE ${tableName} (
        rank INTEGER PRIMARY KEY,
        iso_code TEXT NOT NULL UNIQUE,
        iso_name TEXT NOT NULL,
        official_state_name TEXT,
        currency TEXT,
        currency_code TEXT,
        tld TEXT,
        population REAL,
        gdp_billions_usd REAL
    );`)

  // Insert Data
  db.run(`INSERT INTO ${tableName} (rank, iso_code, iso_name, official_state_name, currency, currency_code, tld, population, gdp_billions_usd) VALUES
      (1, 'USA', 'United States of America', 'United States of America', 'US Dollar', 'USD', '.us', 341.8, 30615.7),
      (2, 'CHN', 'China', 'People''s Republic of China', 'Chinese Yuan', 'CNY', '.cn', 1425.2, 19398.6),
      (3, 'DEU', 'Germany', 'Federal Republic of Germany', 'Euro', 'EUR', '.de', 84.8, 5013.6),
      (4, 'JPN', 'Japan', 'Japan', 'Japanese Yen', 'JPY', '.jp', 122.6, 4279.8),
      (5, 'IND', 'India', 'Republic of India', 'Indian Rupee', 'INR', '.in', 1441.7, 4125.2),
      (6, 'GBR', 'United Kingdom', 'United Kingdom of Great Britain and Northern Ireland', 'Pound Sterling', 'GBP', '.uk', 69.8, 3958.8),
      (7, 'FRA', 'France', 'French Republic', 'Euro', 'EUR', '.fr', 64.9, 3361.6),
      (8, 'ITA', 'Italy', 'Italian Republic', 'Euro', 'EUR', '.it', 58.7, 2543.7),
      (9, 'RUS', 'Russian Federation', 'Russian Federation', 'Russian Ruble', 'RUB', '.ru', 144.1, 2540.7),
      (10, 'CAN', 'Canada', 'Canada', 'Canadian Dollar', 'CAD', '.ca', 41.1, 2283.6),
      (11, 'BRA', 'Brazil', 'Federative Republic of Brazil', 'Brazilian Real', 'BRL', '.br', 219.0, 2256.9),
      (12, 'ESP', 'Spain', 'Kingdom of Spain', 'Euro', 'EUR', '.es', 48.6, 1891.4),
      (13, 'MEX', 'Mexico', 'United Mexican States', 'Mexican Peso', 'MXN', '.mx', 130.8, 1862.7),
      (14, 'KOR', 'Korea (Republic of)', 'Republic of Korea', 'South Korean Won', 'KRW', '.kr', 51.8, 1858.6),
      (15, 'AUS', 'Australia', 'Commonwealth of Australia', 'Australian Dollar', 'AUD', '.au', 26.6, 1829.5),
      (16, 'TUR', 'Turkiye', 'Republic of Turkiye', 'Turkish Lira', 'TRY', '.tr', 86.4, 1565.5),
      (17, 'IDN', 'Indonesia', 'Republic of Indonesia', 'Indonesian Rupiah', 'IDR', '.id', 280.9, 1443.3),
      (18, 'NLD', 'Netherlands', 'Kingdom of the Netherlands', 'Euro', 'EUR', '.nl', 17.9, 1320.6),
      (19, 'SAU', 'Saudi Arabia', 'Kingdom of Saudi Arabia', 'Saudi Riyal', 'SAR', '.sa', 37.7, 1268.5),
      (20, 'POL', 'Poland', 'Republic of Poland', 'Polish Zloty', 'PLN', '.pl', 37.8, 1039.6),
      (21, 'CHE', 'Switzerland', 'Swiss Confederation', 'Swiss Franc', 'CHF', '.ch', 8.9, 1002.7),
      (22, 'TWN', 'Taiwan (Province of China)', 'Republic of China (Taiwan)', 'New Taiwan Dollar', 'TWD', '.tw', 23.6, 884.4),
      (23, 'ARG', 'Argentina', 'Argentine Republic', 'Argentine Peso', 'ARS', '.ar', 46.1, 683.4),
      (24, 'SWE', 'Sweden', 'Kingdom of Sweden', 'Swedish Krona', 'SEK', '.se', 10.7, 662.3),
      (25, 'BEL', 'Belgium', 'Kingdom of Belgium', 'Euro', 'EUR', '.be', 11.8, 717.0),
      (26, 'IRL', 'Ireland', 'Ireland', 'Euro', 'EUR', '.ie', 5.1, 708.8),
      (27, 'ISR', 'Israel', 'State of Israel', 'Israeli New Shekel', 'ILS', '.il', 9.9, 610.8),
      (28, 'SGP', 'Singapore', 'Republic of Singapore', 'Singapore Dollar', 'SGD', '.sg', 6.0, 574.2),
      (29, 'ARE', 'United Arab Emirates', 'United Arab Emirates', 'UAE Dirham', 'AED', '.ae', 9.7, 569.1),
      (30, 'AUT', 'Austria', 'Republic of Austria', 'Euro', 'EUR', '.at', 9.1, 566.5),
      (31, 'THA', 'Thailand', 'Kingdom of Thailand', 'Thai Baht', 'THB', '.th', 71.8, 558.6),
      (32, 'NOR', 'Norway', 'Kingdom of Norway', 'Norwegian Krone', 'NOK', '.no', 5.6, 517.1),
      (33, 'VNM', 'Viet Nam', 'Socialist Republic of Vietnam', 'Vietnamese Dong', 'VND', '.vn', 99.6, 484.7),
      (34, 'PHL', 'Philippines', 'Republic of the Philippines', 'Philippine Peso', 'PHP', '.ph', 119.1, 494.2),
      (35, 'BGD', 'Bangladesh', 'People''s Republic of Bangladesh', 'Bangladeshi Taka', 'BDT', '.bd', 174.7, 475.0),
      (36, 'MYS', 'Malaysia', 'Malaysia', 'Malaysian Ringgit', 'MYR', '.my', 34.0, 470.6),
      (37, 'DNK', 'Denmark', 'Kingdom of Denmark', 'Danish Krone', 'DKK', '.dk', 6.0, 459.6),
      (38, 'COL', 'Colombia', 'Republic of Colombia', 'Colombian Peso', 'COP', '.co', 52.3, 438.1),
      (39, 'HKG', 'Hong Kong', 'Hong Kong Special Administrative Region', 'Hong Kong Dollar', 'HKD', '.hk', 7.5, 428.2),
      (40, 'ZAF', 'South Africa', 'Republic of South Africa', 'South African Rand', 'ZAR', '.za', 62.9, 426.4),
      (41, 'ROU', 'Romania', 'Romania', 'Romanian Leu', 'RON', '.ro', 19.1, 422.5),
      (42, 'PAK', 'Pakistan', 'Islamic Republic of Pakistan', 'Pakistani Rupee', 'PKR', '.pk', 249.6, 410.5),
      (43, 'CZE', 'Czechia', 'Czech Republic', 'Czech Koruna', 'CZK', '.cz', 10.9, 383.4),
      (44, 'IRN', 'Iran (Islamic Republic of)', 'Islamic Republic of Iran', 'Iranian Rial', 'IRR', '.ir', 90.5, 356.5),
      (45, 'EGY', 'Egypt', 'Arab Republic of Egypt', 'Egyptian Pound', 'EGP', '.eg', 114.5, 349.3),
      (46, 'CHL', 'Chile', 'Republic of Chile', 'Chilean Peso', 'CLP', '.cl', 19.8, 347.2),
      (47, 'PRT', 'Portugal', 'Portuguese Republic', 'Euro', 'EUR', '.pt', 10.3, 337.9),
      (48, 'PER', 'Peru', 'Republic of Peru', 'Peruvian Sol', 'PEN', '.pe', 33.7, 318.5),
      (49, 'FIN', 'Finland', 'Republic of Finland', 'Euro', 'EUR', '.fi', 5.6, 314.7),
      (50, 'KAZ', 'Kazakhstan', 'Republic of Kazakhstan', 'Kazakhstani Tenge', 'KZT', '.kz', 20.1, 300.1),
      (51, 'DZA', 'Algeria', 'People''s Democratic Republic of Algeria', 'Algerian Dinar', 'DZD', '.dz', 45.9, 288.0),
      (52, 'NGA', 'Nigeria', 'Federal Republic of Nigeria', 'Nigerian Naira', 'NGN', '.ng', 229.2, 285.0),
      (53, 'GRC', 'Greece', 'Hellenic Republic', 'Euro', 'EUR', '.gr', 10.4, 282.0),
      (54, 'IRQ', 'Iraq', 'Republic of Iraq', 'Iraqi Dinar', 'IQD', '.iq', 45.4, 265.5),
      (55, 'NZL', 'New Zealand', 'New Zealand', 'New Zealand Dollar', 'NZD', '.nz', 5.3, 262.9),
      (56, 'HUN', 'Hungary', 'Hungary', 'Hungarian Forint', 'HUF', '.hu', 9.6, 247.8),
      (57, 'QAT', 'Qatar', 'State of Qatar', 'Qatari Riyal', 'QAR', '.qa', 2.8, 222.1),
      (58, 'UKR', 'Ukraine', 'Ukraine', 'Ukrainian Hryvnia', 'UAH', '.ua', 37.9, 209.7),
      (59, 'MAR', 'Morocco', 'Kingdom of Morocco', 'Moroccan Dirham', 'MAD', '.ma', 37.8, 179.6),
      (60, 'KWT', 'Kuwait', 'State of Kuwait', 'Kuwaiti Dinar', 'KWD', '.kw', 4.3, 157.5),
      (61, 'SVK', 'Slovakia', 'Slovak Republic', 'Euro', 'EUR', '.sk', 5.8, 154.6),
      (62, 'UZB', 'Uzbekistan', 'Republic of Uzbekistan', 'Uzbekistani So''m', 'UZS', '.uz', 35.1, 137.5),
      (63, 'KEN', 'Kenya', 'Republic of Kenya', 'Kenyan Shilling', 'KES', '.ke', 55.8, 136.0),
      (64, 'ECU', 'Ecuador', 'Republic of Ecuador', 'US Dollar', 'USD', '.ec', 18.3, 130.5),
      (65, 'DOM', 'Dominican Republic', 'Dominican Republic', 'Dominican Peso', 'DOP', '.do', 11.5, 129.7),
      (66, 'BGR', 'Bulgaria', 'Republic of Bulgaria', 'Bulgarian Lev', 'BGN', '.bg', 6.4, 127.9),
      (67, 'GTM', 'Guatemala', 'Republic of Guatemala', 'Guatemalan Quetzal', 'GTQ', '.gt', 18.5, 120.9),
      (68, 'AGO', 'Angola', 'Republic of Angola', 'Angolan Kwanza', 'AOA', '.ao', 37.8, 115.2),
      (69, 'GHA', 'Ghana', 'Republic of Ghana', 'Ghanaian Cedi', 'GHS', '.gh', 34.7, 112.0),
      (70, 'ETH', 'Ethiopia', 'Federal Democratic Republic of Ethiopia', 'Ethiopian Birr', 'ETB', '.et', 129.7, 109.5),
      (71, 'OMN', 'Oman', 'Sultanate of Oman', 'Omani Rial', 'OMR', '.om', 4.7, 105.2),
      (72, 'HRV', 'Croatia', 'Republic of Croatia', 'Euro', 'EUR', '.hr', 3.8, 103.9),
      (73, 'CRI', 'Costa Rica', 'Republic of Costa Rica', 'Costa Rican ColÃ³n', 'CRC', '.cr', 5.3, 102.6),
      (74, 'LUX', 'Luxembourg', 'Grand Duchy of Luxembourg', 'Euro', 'EUR', '.lu', 0.7, 100.6),
      (75, 'SRB', 'Serbia', 'Republic of Serbia', 'Serbian Dinar', 'RSD', '.rs', 7.1, 100.0),
      (76, 'LKA', 'Sri Lanka', 'Democratic Socialist Republic of Sri Lanka', 'Sri Lankan Rupee', 'LKR', '.lk', 21.7, 99.0),
      (77, 'CIV', 'CÃ´te d''Ivoire', 'Republic of CÃ´te d''Ivoire', 'West African CFA Franc', 'XOF', '.ci', 29.4, 99.2),
      (78, 'LTU', 'Lithuania', 'Republic of Lithuania', 'Euro', 'EUR', '.lt', 2.8, 95.3),
      (79, 'PAN', 'Panama', 'Republic of Panama', 'Balboa/US Dollar', 'PAB', '.pa', 4.5, 90.4),
      (80, 'TZA', 'Tanzania (United Republic of)', 'United Republic of Tanzania', 'Tanzanian Shilling', 'TZS', '.tz', 69.4, 87.4),
      (81, 'BLR', 'Belarus', 'Republic of Belarus', 'Belarusian Ruble', 'BYN', '.by', 9.5, 85.7),
      (82, 'URY', 'Uruguay', 'Oriental Republic of Uruguay', 'Uruguayan Peso', 'UYU', '.uy', 3.5, 85.0),
      (83, 'VEN', 'Venezuela (Bolivarian Republic of)', 'Bolivarian Republic of Venezuela', 'Venezuelan BolÃ­var', 'VES', '.ve', 29.7, 82.8),
      (84, 'COD', 'Congo (Democratic Republic of the)', 'Democratic Republic of the Congo', 'Congolese Franc', 'CDF', '.cd', 105.0, 82.3),
      (85, 'SVN', 'Slovenia', 'Republic of Slovenia', 'Euro', 'EUR', '.si', 2.1, 79.2),
      (86, 'AZE', 'Azerbaijan', 'Republic of Azerbaijan', 'Azerbaijani Manat', 'AZN', '.az', 10.2, 76.4),
      (87, 'TKM', 'Turkmenistan', 'Turkmenistan', 'Turkmenistan Manat', 'TMT', '.tm', 7.1, 72.1),
      (88, 'UGA', 'Uganda', 'Republic of Uganda', 'Ugandan Shilling', 'UGX', '.ug', 51.6, 65.0),
      (89, 'CMR', 'Cameroon', 'Republic of Cameroon', 'Central African CFA Franc', 'XAF', '.cm', 29.5, 60.6),
      (90, 'MMR', 'Myanmar', 'Republic of the Union of Myanmar', 'Myanmar Kyat', 'MMK', '.mm', 54.4, 60.6),
      (91, 'TUN', 'Tunisia', 'Republic of Tunisia', 'Tunisian Dinar', 'TND', '.tn', 12.3, 59.1),
      (92, 'BOL', 'Bolivia (Plurinational State of)', 'Plurinational State of Bolivia', 'Bolivian Boliviano', 'BOB', '.bo', 12.4, 57.1),
      (93, 'JOR', 'Jordan', 'Hashemite Kingdom of Jordan', 'Jordanian Dinar', 'JOD', '.jo', 11.5, 56.2),
      (94, 'ZWE', 'Zimbabwe', 'Republic of Zimbabwe', 'US Dollar / Zimbabwe Dollar', 'USD', '.zw', 17.6, 53.3),
      (95, 'MAC', 'Macao', 'Macao Special Administrative Region', 'Macanese Pataca', 'MOP', '.mo', 0.7, 52.4),
      (96, 'KHM', 'Cambodia', 'Kingdom of Cambodia', 'Cambodian Riel', 'KHR', '.kh', 17.2, 48.8),
      (97, 'LVA', 'Latvia', 'Republic of Latvia', 'Euro', 'EUR', '.lv', 1.9, 47.9),
      (98, 'LBY', 'Libya', 'State of Libya', 'Libyan Dinar', 'LYD', '.ly', 7.9, 47.9),
      (99, 'PRY', 'Paraguay', 'Republic of Paraguay', 'Paraguayan Guarani', 'PYG', '.py', 6.9, 47.4),
      (100, 'BHR', 'Bahrain', 'Kingdom of Bahrain', 'Bahraini Dinar', 'BHD', '.bh', 1.5, 47.4)
    ;`)
  console.log(`   - Created and populated ${tableName} `)
}

export function initialiseTestProducts(tableName = 'test_products') {
  if (tableExists(tableName)) return

  db.query(
    `CREATE TABLE ${tableName} (
    id INTEGER PRIMARY KEY,
    code TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL,
    colour TEXT,
    status_setting TEXT,
    date_added TEXT,
    date_last_amended TEXT
  );`,
  ).run()

  const now = nowSQLiteFormat()
  const productsToInsert = [
    {
      id: 1,
      code: 'AX-145',
      description: '18v Hammer Drill (no battery)',
      colour: 'Yellow',
      status_setting: 'inStock',
      date_added: now,
      date_last_amended: now,
    },
    {
      id: 2,
      code: 'AX-190',
      description: '18v Orbital Sander (no battery)',
      colour: 'Blue',
      status_setting: 'inStock',
      date_added: now,
      date_last_amended: now,
    },
    {
      id: 3,
      code: 'AX-197',
      description: '18v Hedge Trimmer 900mm (no battery)',
      colour: 'Green',
      status_setting: 'inStock',
      date_added: now,
      date_last_amended: now,
    },
    {
      id: 4,
      code: 'AX-215',
      description: '18v Battery & Rapid Charger Set ',
      colour: 'Blue',
      status_setting: 'inStock',
      date_added: now,
      date_last_amended: now,
    },
  ]

  // Prepared statement (Bun syntax)
  const sql = `INSERT INTO ${tableName} (id, code, description, colour, status_setting, date_added, date_last_amended) VALUES ($id, $code, $description, $colour, $status_setting, $date_added, $date_last_amended);`
  const stmt = db.query(sql)

  // Transaction wrapper (Bun syntax)
  const insertTransaction = db.transaction((products) => {
    for (const product of products) {
      // Bun uses $param syntax matching the object keys automatically if passed as object
      // Or we can pass ordered arguments. Let's use the object syntax for clarity.
      stmt.run({
        $id: product.id,
        $code: product.code,
        $description: product.description,
        $colour: product.colour,
        $status_setting: product.status_setting,
        $date_added: product.date_added,
        $date_last_amended: product.date_last_amended,
      })
    }
    return products.length
  })

  try {
    insertTransaction(productsToInsert)
    console.log(`   - Created and populated ${tableName} `)
  } catch (error) {
    console.error('Insert transaction failed:', error)
  }
}
// Run legacy checks immediately
initialiseTestCountries()
initialiseTestProducts()
