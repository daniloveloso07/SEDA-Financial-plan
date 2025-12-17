// ═══════════════════════════════════════════════════════════
// FORMATTING UTILITIES - DATE & CURRENCY
// ═══════════════════════════════════════════════════════════

/**
 * Format date as DD/MM/YYYY
 */
function formatDate(dateString, locale = 'en') {
    if (!dateString) return '';

    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
}

/**
 * Format currency based on locale
 * EN: €2,950.00
 * PT-BR: € 2.950,00
 * ES: 2.950,00 €
 */
function formatCurrency(amount, currency = 'EUR', locale = 'en') {
    const numAmount = parseFloat(amount);

    if (isNaN(numAmount)) return amount;

    // Map language codes to locale codes
    const localeMap = {
        'en': 'en-IE',  // Ireland format
        'pt': 'pt-BR',  // Brazil format
        'es': 'es-ES'   // Spain format
    };

    const localeCode = localeMap[locale] || 'en-IE';

    try {
        return new Intl.NumberFormat(localeCode, {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(numAmount);
    } catch (error) {
        // Fallback
        return `€${numAmount.toFixed(2)}`;
    }
}

/**
 * Currency metadata by country
 */
const CURRENCY_BY_COUNTRY = {
    'brazil': { code: 'BRL', symbol: 'R$', locale: 'pt-BR' },
    'paraguay': { code: 'PYG', symbol: '₲', locale: 'es-PY' },
    'argentina': { code: 'ARS', symbol: '$', locale: 'es-AR' },
    'chile': { code: 'CLP', symbol: '$', locale: 'es-CL' },
    'uruguay': { code: 'UYU', symbol: '$U', locale: 'es-UY' },
    'mexico': { code: 'MXN', symbol: '$', locale: 'es-MX' },
    'costa_rica': { code: 'CRC', symbol: '₡', locale: 'es-CR' },
    'el_salvador': { code: 'USD', symbol: '$', locale: 'es-SV' },
    'guatemala': { code: 'GTQ', symbol: 'Q', locale: 'es-GT' }
};

/**
 * Get currency info for a country
 */
function getCurrencyForCountry(country) {
    return CURRENCY_BY_COUNTRY[country] || { code: 'USD', symbol: '$', locale: 'en-US' };
}

/**
 * Format local currency amount
 */
function formatLocalCurrency(amount, currencyCode, locale) {
    const numAmount = parseFloat(amount);

    if (isNaN(numAmount)) return amount;

    try {
        return new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: currencyCode,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(numAmount);
    } catch (error) {
        const currencyInfo = Object.values(CURRENCY_BY_COUNTRY).find(c => c.code === currencyCode);
        const symbol = currencyInfo ? currencyInfo.symbol : currencyCode;
        return `${symbol} ${numAmount.toFixed(2)}`;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        formatDate,
        formatCurrency,
        formatLocalCurrency,
        getCurrencyForCountry,
        CURRENCY_BY_COUNTRY
    };
}
