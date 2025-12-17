// ═══════════════════════════════════════════════════════════
// LOCAL CURRENCY UTILITIES
// ═══════════════════════════════════════════════════════════

/**
 * Currency metadata by country
 */
const CURRENCY_BY_COUNTRY = {
    'brazil': { code: 'BRL', locale: 'pt-BR' },
    'paraguay': { code: 'PYG', locale: 'es-PY' },
    'argentina': { code: 'ARS', locale: 'es-AR' },
    'chile': { code: 'CLP', locale: 'es-CL' },
    'uruguay': { code: 'UYU', locale: 'es-UY' },
    'mexico': { code: 'MXN', locale: 'es-MX' },
    'costa_rica': { code: 'CRC', locale: 'es-CR' },
    'el_salvador': { code: 'USD', locale: 'es-SV' },
    'guatemala': { code: 'GTQ', locale: 'es-GT' }
};

/**
 * Get currency info for a country
 */
function getCurrencyForCountry(country) {
    return CURRENCY_BY_COUNTRY[country] || { code: 'USD', locale: 'en-US' };
}

/**
 * Format income in local currency
 */
function formatIncome(amount, country) {
    if (!amount || isNaN(amount)) return '';

    const currencyInfo = getCurrencyForCountry(country);

    try {
        return new Intl.NumberFormat(currencyInfo.locale, {
            style: 'currency',
            currency: currencyInfo.code,
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(parseFloat(amount));
    } catch (error) {
        // Fallback
        return `${currencyInfo.code} ${parseFloat(amount).toLocaleString()}`;
    }
}

/**
 * Get currency symbol for country
 */
function getCurrencySymbol(country) {
    const currencyInfo = getCurrencyForCountry(country);
    try {
        const formatted = new Intl.NumberFormat(currencyInfo.locale, {
            style: 'currency',
            currency: currencyInfo.code,
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(0);
        // Extract just the symbol
        return formatted.replace(/[\d\s.,]/g, '').trim();
    } catch (error) {
        return currencyInfo.code;
    }
}
