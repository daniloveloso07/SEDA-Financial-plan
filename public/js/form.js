// ═══════════════════════════════════════════════════════════
// CONVERSATIONAL APPLICATION FORM
// ═══════════════════════════════════════════════════════════

// Eligible countries (no pre-visa required)
const ELIGIBLE_COUNTRIES = [
    'brazil', 'paraguay', 'argentina', 'chile', 'uruguay',
    'mexico', 'costa_rica', 'el_salvador', 'guatemala'
];

// Form flow configuration
const FORM_FLOW = [
    // Student Information
    { id: 'student_name', type: 'text', section: 'student', required: true, i18nKey: 'form.full_name' },
    { id: 'student_email', type: 'email', section: 'student', required: true, i18nKey: 'form.email' },
    { id: 'student_phone', type: 'tel', section: 'student', required: true, i18nKey: 'form.phone' },
    { id: 'student_birthdate', type: 'date', section: 'student', required: true, i18nKey: 'form.birthdate' },
    { id: 'student_id', type: 'text', section: 'student', required: true, i18nKey: 'form.id_number' },
    { id: 'country', type: 'select', section: 'student', required: true, i18nKey: 'form.country', options: ELIGIBLE_COUNTRIES },
    { id: 'student_address', type: 'text', section: 'student', required: true, i18nKey: 'form.address' },
    { id: 'student_postal', type: 'text', section: 'student', required: true, i18nKey: 'form.postal_code' },
    { id: 'student_occupation', type: 'text', section: 'student', required: true, i18nKey: 'form.occupation' },
    { id: 'student_income', type: 'number', section: 'student', required: true, i18nKey: 'form.income' },
    { id: 'travel_date', type: 'date', section: 'student', required: true, i18nKey: 'form.travel_date' },
    { id: 'duration', type: 'select', section: 'student', required: true, i18nKey: 'form.duration', options: ['long'] },

    // Guarantor Information
    { id: 'guarantor_name', type: 'text', section: 'guarantor', required: true, i18nKey: 'form.full_name' },
    { id: 'guarantor_email', type: 'email', section: 'guarantor', required: true, i18nKey: 'form.email' },
    { id: 'guarantor_phone', type: 'tel', section: 'guarantor', required: true, i18nKey: 'form.phone' },
    { id: 'guarantor_birthdate', type: 'date', section: 'guarantor', required: true, i18nKey: 'form.birthdate' },
    { id: 'guarantor_id', type: 'text', section: 'guarantor', required: true, i18nKey: 'form.id_number' },
    { id: 'guarantor_address', type: 'text', section: 'guarantor', required: true, i18nKey: 'form.address' },
    { id: 'guarantor_postal', type: 'text', section: 'guarantor', required: true, i18nKey: 'form.postal_code' },
    { id: 'guarantor_occupation', type: 'text', section: 'guarantor', required: true, i18nKey: 'form.occupation' },
    { id: 'guarantor_relationship', type: 'select', section: 'guarantor', required: true, i18nKey: 'form.relationship', options: ['father', 'mother', 'grandfather', 'grandmother', 'brother', 'sister', 'uncle_aunt', 'spouse', 'other'] },
    { id: 'guarantor_income', type: 'number', section: 'guarantor', required: true, i18nKey: 'form.income' }
];

class WizardForm {
    constructor() {
        this.currentStep = 0;
        this.formData = {};

        // UI Elements
        this.card = document.getElementById('wizard-card');
        this.questionContainer = document.getElementById('question-container');
        this.inputContainer = document.getElementById('input-container');
        this.progressBar = document.getElementById('progress-fill');
        this.stepIndicator = document.getElementById('step-indicator');
        this.backBtn = document.getElementById('back-btn');

        // Bind events
        this.backBtn.addEventListener('click', () => this.goBack());

        // Load calculator data logic (same as before)
        const calcData = sessionStorage.getItem('seda_calculation');
        if (calcData) {
            this.calculatorData = JSON.parse(calcData);
        }

        this.init();
    }

    init() {
        this.renderStep();
    }

    renderStep() {
        if (this.currentStep >= FORM_FLOW.length) {
            this.showPrivacyConsent();
            return;
        }

        const field = FORM_FLOW[this.currentStep];

        // 1. Update Progress
        this.updateProgress();

        // 2. Render Question (Header)
        // Check if we need to show section header? usually wizard just shows the question
        // We can create a compound title if needed, but simple is better.
        const questionText = i18n.t(field.i18nKey);
        this.questionContainer.innerHTML = `<h2>${questionText}</h2>`;

        // Show section name as subtitle?
        // const sectionKey = field.section === 'student' ? 'form.student_section' : 'form.guarantor_section';
        // this.stepIndicator.textContent = `${i18n.t(sectionKey)} • Step ${this.currentStep + 1}/${FORM_FLOW.length}`;
        this.stepIndicator.textContent = `${this.currentStep + 1} / ${FORM_FLOW.length}`;

        // 3. Render Input
        this.inputContainer.innerHTML = ''; // Clear previous input
        this.renderInputComponent(field);

        // 4. Update Back Button visibility
        this.backBtn.style.visibility = this.currentStep > 0 ? 'visible' : 'hidden';
    }

    renderInputComponent(field) {
        // Pre-fill value if exists
        const currentValue = this.formData[field.id] || '';

        if (field.type === 'select') {
            const optionsGroup = document.createElement('div');
            optionsGroup.className = 'options-grid';

            field.options.forEach(option => {
                const btn = document.createElement('button');
                btn.className = 'btn-option-large';

                // Localization logic
                let label = option;
                if (field.id === 'country') label = i18n.t(`countries.${option}`);
                else if (field.id === 'duration') label = i18n.t(`form.duration_${option}`);
                else if (field.id === 'guarantor_relationship') label = i18n.t(`form.relationship_${option}`);

                // Add text
                const textSpan = document.createElement('span');
                textSpan.textContent = label;
                btn.appendChild(textSpan);

                // Add arrow icon (→) for visual cue
                const arrow = document.createElement('span');
                arrow.innerHTML = 'Scan'; // Just a placeholder, CSS handles arrow if needed, or simple text
                arrow.textContent = '›';
                arrow.style.fontSize = '1.5rem';
                arrow.style.color = 'var(--text-light)';
                btn.appendChild(arrow);

                // Selection state
                if (currentValue === option) {
                    btn.classList.add('selected');
                }

                btn.onclick = () => this.handleAnswer(option, field);
                optionsGroup.appendChild(btn);
            });

            this.inputContainer.appendChild(optionsGroup);

        } else {
            // Text, Email, Date, Number
            const wrapper = document.createElement('div');
            wrapper.className = 'input-group-wizard';

            const input = document.createElement('input');
            input.type = field.type;
            input.className = 'form-input';
            input.placeholder = i18n.t(field.i18nKey); // Use placeholder as hint
            input.value = currentValue;

            if (field.type === 'date') {
                input.max = new Date().toISOString().split('T')[0];
            }

            // Next Button
            const nextBtn = document.createElement('button');
            nextBtn.className = 'btn btn-primary btn-next-large';
            nextBtn.textContent = i18n.t('form.next');

            // Logic to handle Enter key and Click
            const submit = () => this.handleAnswer(input.value, field);

            nextBtn.onclick = submit;
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') submit();
            });

            wrapper.appendChild(input);
            wrapper.appendChild(nextBtn);
            this.inputContainer.appendChild(wrapper);

            // Auto focus
            setTimeout(() => input.focus(), 50);
        }
    }

    handleAnswer(value, field) {
        // Validate
        const validation = this.validateField(value, field);
        if (!validation.valid) {
            this.showError(validation.message);
            return;
        }

        this.formData[field.id] = value;
        this.currentStep++;
        this.renderStep();
    }

    goBack() {
        if (this.currentStep > 0) {
            this.currentStep--;
            this.renderStep();
        }
    }

    // ... validateField and showError methods remain mostly same ...
    validateField(value, field) {
        if (field.required && !value) {
            return { valid: false, message: i18n.t('form.validation_required') };
        }
        if (field.type === 'email' && value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) return { valid: false, message: i18n.t('form.validation_email') };
        }
        if (field.type === 'tel' && value) {
            const phoneRegex = /^\+?[1-9]\d{1,14}$/;
            if (!phoneRegex.test(value.replace(/[\s-]/g, ''))) return { valid: false, message: i18n.t('form.validation_phone') };
        }
        if (field.id === 'student_birthdate' && value) {
            const birthDate = new Date(value);
            const age = (new Date() - birthDate) / (1000 * 60 * 60 * 24 * 365);
            if (age < 18) return { valid: false, message: i18n.t('form.validation_age') };
        }
        // Guarantor validations
        if (field.id === 'guarantor_email' && value && value.toLowerCase() === this.formData.student_email?.toLowerCase()) {
            return { valid: false, message: i18n.currentLanguage === 'pt' ? 'Email do fiador deve ser diferente' : 'Guarantor email must be different' };
        }
        if (field.id === 'guarantor_phone' && value) {
            const normalizedValue = value.replace(/[\s-]/g, '');
            const normalizedStudent = this.formData.student_phone?.replace(/[\s-]/g, '');
            if (normalizedValue === normalizedStudent) return { valid: false, message: i18n.currentLanguage === 'pt' ? 'Telefone do fiador deve ser diferente' : 'Guarantor phone must be different' };
        }
        if (field.id === 'guarantor_id' && value && value === this.formData.student_id) {
            return { valid: false, message: i18n.currentLanguage === 'pt' ? 'ID do fiador deve ser diferente' : 'Guarantor ID must be different' };
        }

        return { valid: true };
    }

    showError(message) {
        // Remove existing error
        const existingError = this.card.querySelector('.form-error');
        if (existingError) existingError.remove();

        const errorDiv = document.createElement('div');
        errorDiv.className = 'form-error';
        errorDiv.textContent = message;
        errorDiv.style.marginTop = '1rem';
        errorDiv.style.textAlign = 'center';
        this.inputContainer.appendChild(errorDiv);

        setTimeout(() => errorDiv.remove(), 3000);
    }

    updateProgress() {
        const progress = (this.currentStep / FORM_FLOW.length) * 100;
        this.progressBar.style.width = `${progress}%`;
    }

    showPrivacyConsent() {
        this.updateProgress();
        this.stepIndicator.textContent = 'Review';
        this.questionContainer.innerHTML = `<h2>${i18n.t('form.privacy_notice')}</h2>`;
        this.backBtn.style.visibility = 'visible';

        this.inputContainer.innerHTML = '';

        const wrapper = document.createElement('div');
        wrapper.className = 'input-group-wizard';
        wrapper.style.alignItems = 'center'; // Center checkbox

        const checkboxContainer = document.createElement('div');
        checkboxContainer.style.display = 'flex';
        checkboxContainer.style.gap = '10px';
        checkboxContainer.style.alignItems = 'center';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = 'privacy-consent';
        checkbox.style.width = '20px';
        checkbox.style.height = '20px';

        const label = document.createElement('label');
        label.htmlFor = 'privacy-consent';
        label.textContent = i18n.t('form.privacy_notice_short') || "I agree to the processing of my personal data";
        label.style.cursor = 'pointer';

        checkboxContainer.appendChild(checkbox);
        checkboxContainer.appendChild(label);

        const submitBtn = document.createElement('button');
        submitBtn.className = 'btn btn-primary btn-next-large';
        submitBtn.textContent = i18n.t('form.submit');
        submitBtn.disabled = true;
        submitBtn.style.width = '100%';

        checkbox.addEventListener('change', () => {
            submitBtn.disabled = !checkbox.checked;
        });

        submitBtn.addEventListener('click', () => this.submitApplication(submitBtn));

        wrapper.appendChild(checkboxContainer);
        wrapper.appendChild(submitBtn);
        this.inputContainer.appendChild(wrapper);
    }

    async submitApplication(btnElement) {
        btnElement.disabled = true;
        btnElement.textContent = 'Submitting...';

        // ... (submission logic similar to before) ...
        try {
            const applicationData = {
                language: i18n.currentLanguage,
                ...this.formData,
                ...this.calculatorData
            };

            const response = await fetch('/api/applications', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(applicationData)
            });

            const result = await response.json();

            if (response.ok) {
                sessionStorage.setItem('seda_application_result', JSON.stringify(result));
                window.location.href = '/result.html'; // Redirect
            } else {
                throw new Error(result.message);
            }
        } catch (error) {
            console.error('Submission error:', error);
            this.showError(error.message || 'Submission failed');
            btnElement.disabled = false;
            btnElement.textContent = i18n.t('form.submit');
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('wizard-card')) {
        new WizardForm();
    }
});
