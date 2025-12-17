// ═══════════════════════════════════════════════════════════
// FINANCE PLAN CALCULATOR
// ═══════════════════════════════════════════════════════════

// Base prices (before FDI fee)
const BASE_PRICES = {
    dublin: {
        am: 2850,
        pm: 2550
    },
    cork: {
        am: 2550,
        pm: 2250
    }
};

const FDI_FEE = 100;

// Interest rates based on installments
const INTEREST_RATES = {
    6: 0.04,   // 4%
    12: 0.05,  // 5%
    15: 0.06,  // 6%
    18: 0.07   // 7%
};

class FinanceCalculator {
    constructor() {
        this.campus = 'dublin';
        this.shift = 'am';
        this.entryPercent = 0.30;
        this.installments = 12;
    }

    calculatePriceBase() {
        return BASE_PRICES[this.campus][this.shift] + FDI_FEE;
    }

    calculateEntryAmount(priceBase) {
        return priceBase * this.entryPercent;
    }

    calculateFinancedAmount(priceBase, entryAmount) {
        return priceBase - entryAmount;
    }

    calculateInterestValue(financedAmount) {
        const interestRate = INTEREST_RATES[this.installments];
        return financedAmount * interestRate;
    }

    calculateTotalFinanced(financedAmount, interestValue) {
        return financedAmount + interestValue;
    }

    calculateMonthlyInstallment(totalFinanced) {
        return totalFinanced / this.installments;
    }

    getInterestRate() {
        return INTEREST_RATES[this.installments];
    }

    calculate() {
        const priceBase = this.calculatePriceBase();
        const entryAmount = this.calculateEntryAmount(priceBase);
        const financedAmount = this.calculateFinancedAmount(priceBase, entryAmount);
        const interestValue = this.calculateInterestValue(financedAmount);
        const totalFinanced = this.calculateTotalFinanced(financedAmount, interestValue);
        const monthlyInstallment = this.calculateMonthlyInstallment(totalFinanced);

        return {
            priceBase: priceBase.toFixed(2),
            entryAmount: entryAmount.toFixed(2),
            financedAmount: financedAmount.toFixed(2),
            interestRate: (this.getInterestRate() * 100).toFixed(0) + '%',
            interestValue: interestValue.toFixed(2),
            totalFinanced: totalFinanced.toFixed(2),
            monthlyInstallment: monthlyInstallment.toFixed(2),
            installments: this.installments
        };
    }
}

// Initialize calculator on page load
document.addEventListener('DOMContentLoaded', () => {
    const calculatorElement = document.getElementById('calculator');
    if (!calculatorElement) return;

    const calculator = new FinanceCalculator();

    // Get form elements
    const campusSelect = document.getElementById('campus');
    const shiftSelect = document.getElementById('shift');
    const entrySelect = document.getElementById('entry-percent');
    const installmentsSelect = document.getElementById('installments');

    // Result elements
    const resultPriceBase = document.getElementById('result-price-base');
    const resultEntryAmount = document.getElementById('result-entry-amount');
    const resultFinancedAmount = document.getElementById('result-financed-amount');
    const resultInterestRate = document.getElementById('result-interest-rate');
    const resultMonthlyInstallment = document.getElementById('result-monthly-installment');

    function updateCalculation() {
        calculator.campus = campusSelect.value;
        calculator.shift = shiftSelect.value;
        calculator.entryPercent = parseFloat(entrySelect.value);
        calculator.installments = parseInt(installmentsSelect.value);

        const result = calculator.calculate();

        // Get current language for formatting
        const lang = localStorage.getItem('seda_language') || 'en';
        const localeMap = {
            'en': 'en-IE',
            'pt': 'pt-BR',
            'es': 'es-ES'
        };
        const locale = localeMap[lang];

        // Format currency with locale
        const formatCurrency = (amount) => {
            return new Intl.NumberFormat(locale, {
                style: 'currency',
                currency: 'EUR',
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }).format(amount);
        };

        resultPriceBase.textContent = formatCurrency(result.priceBase);
        resultEntryAmount.textContent = formatCurrency(result.entryAmount);
        resultFinancedAmount.textContent = formatCurrency(result.financedAmount);
        resultInterestRate.textContent = result.interestRate;
        resultMonthlyInstallment.textContent = formatCurrency(result.monthlyInstallment);

        // Store calculation in sessionStorage for form page
        sessionStorage.setItem('seda_calculation', JSON.stringify(result));
    }

    // Add event listeners
    campusSelect.addEventListener('change', updateCalculation);
    shiftSelect.addEventListener('change', updateCalculation);
    entrySelect.addEventListener('change', updateCalculation);
    installmentsSelect.addEventListener('change', updateCalculation);

    // Initial calculation
    updateCalculation();
});
