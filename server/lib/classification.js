// ═══════════════════════════════════════════════════════════
// AUTOMATIC CLASSIFICATION LOGIC
// ═══════════════════════════════════════════════════════════

const ELIGIBLE_COUNTRIES = [
    'brazil', 'paraguay', 'argentina', 'chile', 'uruguay',
    'mexico', 'costa_rica', 'el_salvador', 'guatemala'
];

/**
 * Calculate age from birthdate
 */
function calculateAge(birthdate) {
    const birth = new Date(birthdate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
    }

    return age;
}

/**
 * Check if all guarantor fields are completed
 */
function isGuarantorComplete(data) {
    const requiredFields = [
        'guarantor_name',
        'guarantor_email',
        'guarantor_phone',
        'guarantor_birthdate',
        'guarantor_address',
        'guarantor_postal',
        'guarantor_occupation',
        'guarantor_relationship'
    ];

    return requiredFields.every(field => data[field] && data[field].toString().trim() !== '');
}

/**
 * Calculate approximate months until travel from today
 */
function getMonthsUntilTravel(travelDate) {
    if (!travelDate) return 0;
    const travel = new Date(travelDate);
    const today = new Date();
    const diffTime = travel - today;
    // Difference in days / average month length
    return diffTime / (1000 * 60 * 60 * 24 * 30.44);
}

/**
 * Classify application based on business rules
 * 
 * OUT_OF_PROFILE if:
 * - Student age < 18
 * - Country not eligible
 * - Entry < 30%
 * - Missing mandatory guarantor data
 * - Installment > 30% of combined income (Income Ratio Rule)
 * 
 * PRE_APPROVED_UNDER_REVIEW if:
 * - Basic profile met
 * - Income Ratio Rule satisfied (Installment <= 30% of income)
 * - Travel date >= 3 months from today
 * 
 * UNDER_ANALYSIS if:
 * - Travel date < 3 months (High Risk)
 * - 30% rule is slightly breached for first-degree relatives
 */
export function classifyApplication(data) {
    const studentAge = calculateAge(data.student_birthdate);
    const entryPercent = parseFloat(data.entryPercent || data.entry_percent || 0.30);
    const country = (data.country || '').toLowerCase();
    const duration = data.duration || data.duration_choice || 'long';
    const guarantorComplete = isGuarantorComplete(data);
    const monthsUntilTravel = getMonthsUntilTravel(data.travel_date);

    // Incomes in EUR
    const studentIncomeEUR = parseFloat(data.student_income_eur_est || 0);
    const guarantorIncomeEUR = parseFloat(data.guarantor_income_eur_est || 0);
    const combinedIncomeEUR = studentIncomeEUR + guarantorIncomeEUR;

    const monthlyInstallment = parseFloat(data.monthlyInstallment || 0);

    // Relationship status
    const isFirstDegree = ['father', 'mother'].includes(data.guarantor_relationship);

    // 1. Hard Stoppers (OUT_OF_PROFILE)
    if (studentAge < 18) return 'OUT_OF_PROFILE';
    if (!ELIGIBLE_COUNTRIES.includes(country)) return 'OUT_OF_PROFILE';
    if (entryPercent < 0.29) return 'OUT_OF_PROFILE'; // Allow for slight rounding
    if (!guarantorComplete) return 'OUT_OF_PROFILE';

    // 2. High Risk: Travel Date < 3 Months
    // If travel is less than 3 months away, it's never pre-approved.
    if (monthsUntilTravel < 3) {
        return 'UNDER_ANALYSIS';
    }

    // 3. Income Ratio Rule (The 30% Rule)
    // If monthly installment is more than 30% of combined income
    const incomeRatio = combinedIncomeEUR > 0 ? (monthlyInstallment / combinedIncomeEUR) : 999;

    if (incomeRatio > 0.30) {
        // If it's a first degree relative, we move to UNDER_ANALYSIS instead of rejection
        if (isFirstDegree && incomeRatio <= 0.45) {
            return 'UNDER_ANALYSIS';
        }
        return 'OUT_OF_PROFILE';
    }

    // 4. Success Case
    if (combinedIncomeEUR > 0) {
        return 'PRE_APPROVED_UNDER_REVIEW';
    }

    return 'UNDER_ANALYSIS';
}
