// ═══════════════════════════════════════════════════════════
// ECB FX RATE SERVICE
// ═══════════════════════════════════════════════════════════

import fetch from 'node-fetch';

const ECB_BASE_URL = 'https://data-api.ecb.europa.eu/service';
const CACHE_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

// In-memory cache
const fxCache = new Map();

/**
 * Currency code mapping for ECB
 */
const CURRENCY_MAPPING = {
    'BRL': 'BRL',
    'PYG': 'PYG',
    'ARS': 'ARS',
    'CLP': 'CLP',
    'UYU': 'UYU',
    'MXN': 'MXN',
    'CRC': 'CRC',
    'USD': 'USD',
    'GTQ': 'GTQ'
};

/**
 * Fetch FX rate from ECB Data Portal
 * Returns rate for CUR/EUR (e.g., how many EUR for 1 unit of currency)
 */
async function fetchECBRate(currencyCode) {
    const ecbCurrency = CURRENCY_MAPPING[currencyCode];

    if (!ecbCurrency) {
        throw new Error(`Currency ${currencyCode} not supported by ECB`);
    }

    // Check cache first
    const cacheKey = `${currencyCode}_EUR`;
    const cached = fxCache.get(cacheKey);

    if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION_MS) {
        console.log(`✅ Using cached FX rate for ${currencyCode}`);
        return cached.data;
    }

    // Fetch from ECB
    const url = `${ECB_BASE_URL}/data/EXR/D.${ecbCurrency}.EUR.SP00.A?lastNObservations=1&format=csvdata`;

    try {
        console.log(`🔄 Fetching FX rate from ECB for ${currencyCode}...`);
        const response = await fetch(url, {
            headers: {
                'Accept': 'text/csv'
            },
            timeout: 5000
        });

        if (!response.ok) {
            throw new Error(`ECB API returned ${response.status}`);
        }

        const csvData = await response.text();
        const lines = csvData.trim().split('\n');

        if (lines.length < 2) {
            throw new Error('Invalid CSV response from ECB');
        }

        // Parse CSV (last line contains the data)
        const dataLine = lines[lines.length - 1];
        const columns = dataLine.split(',');

        // CSV format: FREQ,CURRENCY,CURRENCY_DENOM,EXR_TYPE,EXR_SUFFIX,TIME_PERIOD,OBS_VALUE,...
        const obsValue = parseFloat(columns[6]);
        const timePeriod = columns[5];

        if (isNaN(obsValue)) {
            throw new Error('Invalid rate value from ECB');
        }

        const result = {
            rate: obsValue,
            date: timePeriod,
            source: 'ECB Data Portal (EXR)',
            currency: currencyCode,
            base: 'EUR'
        };

        // Cache the result
        fxCache.set(cacheKey, {
            data: result,
            timestamp: Date.now()
        });

        console.log(`✅ FX rate fetched: 1 ${currencyCode} = ${obsValue} EUR (${timePeriod})`);

        return result;

    } catch (error) {
        console.error(`❌ Error fetching FX rate for ${currencyCode}:`, error.message);
        throw error;
    }
}

/**
 * Convert local currency amount to EUR
 */
async function convertToEUR(amount, currencyCode) {
    if (currencyCode === 'EUR') {
        return {
            amountEUR: amount,
            rate: 1.0,
            date: new Date().toISOString().split('T')[0],
            source: 'ECB Data Portal (EXR)',
            currency: 'EUR'
        };
    }

    try {
        const fxData = await fetchECBRate(currencyCode);
        const amountEUR = amount * fxData.rate;

        return {
            amountEUR: parseFloat(amountEUR.toFixed(2)),
            rate: fxData.rate,
            date: fxData.date,
            source: fxData.source,
            currency: currencyCode
        };
    } catch (error) {
        // Failsafe: return null for EUR estimate
        console.warn(`⚠️ FX conversion failed for ${currencyCode}, storing local amount only`);
        return {
            amountEUR: null,
            rate: null,
            date: null,
            source: null,
            currency: currencyCode,
            error: error.message
        };
    }
}

/**
 * Clear FX cache (for testing or manual refresh)
 */
function clearFXCache() {
    fxCache.clear();
    console.log('✅ FX cache cleared');
}

export {
    fetchECBRate,
    convertToEUR,
    clearFXCache
};
