// ═══════════════════════════════════════════════════════════
// FINANCE CALCULATOR (SERVER-SIDE)
// ═══════════════════════════════════════════════════════════

const BASE_PRICES = {
    dublin: { am: 2850, pm: 2550 },
    cork: { am: 2550, pm: 2250 }
};

const FDI_FEE = 100;

const INTEREST_RATES = {
    6: 0.04,   // 4%
    12: 0.05,  // 5%
    15: 0.06,  // 6%
    18: 0.07   // 7%
};

/**
 * Calculate finance plan details
 */
export function calculateFinancePlan(campus, shift, entryPercent, installments) {
    // Validate inputs
    if (!BASE_PRICES[campus] || !BASE_PRICES[campus][shift]) {
        throw new Error('Invalid campus or shift');
    }

    if (![0.30, 0.40].includes(parseFloat(entryPercent))) {
        throw new Error('Invalid entry percentage');
    }

    if (![6, 12, 15, 18].includes(parseInt(installments))) {
        throw new Error('Invalid installments');
    }

    // Calculate
    const priceBase = BASE_PRICES[campus][shift] + FDI_FEE;
    const entryAmount = priceBase * parseFloat(entryPercent);
    const financedAmount = priceBase - entryAmount;
    const interestPercent = INTEREST_RATES[parseInt(installments)];
    const interestValue = financedAmount * interestPercent;
    const totalFinanced = financedAmount + interestValue;
    const monthlyInstallment = totalFinanced / parseInt(installments);

    return {
        campus,
        shift,
        priceBase: priceBase.toFixed(2),
        entryPercent: parseFloat(entryPercent).toFixed(2),
        entryAmount: entryAmount.toFixed(2),
        financedAmount: financedAmount.toFixed(2),
        interestPercent: interestPercent.toFixed(2),
        totalFinanced: totalFinanced.toFixed(2),
        installments: parseInt(installments),
        monthlyInstallment: monthlyInstallment.toFixed(2)
    };
}
