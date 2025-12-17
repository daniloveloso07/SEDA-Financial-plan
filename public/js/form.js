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

class ConversationalForm {
    constructor() {
        this.currentStep = 0;
        this.formData = {};
        this.messagesContainer = document.getElementById('chat-messages');
        this.inputArea = document.getElementById('chat-input-area');
        this.progressBar = document.getElementById('progress-fill');

        // Load calculator data from sessionStorage
        const calcData = sessionStorage.getItem('seda_calculation');
        if (calcData) {
            this.calculatorData = JSON.parse(calcData);
        }

        this.init();
    }

    init() {
        this.showWelcomeMessage();
        this.askNextQuestion();
    }

    showWelcomeMessage() {
        const message = i18n.currentLanguage === 'en'
            ? "Welcome! I'll help you apply for the SEDA Finance Plan. Let's start with some basic information."
            : i18n.currentLanguage === 'pt'
                ? "Bem-vindo! Vou ajudá-lo a se candidatar ao Plano de Financiamento SEDA. Vamos começar com algumas informações básicas."
                : "¡Bienvenido! Te ayudaré a solicitar el Plan de Financiamiento SEDA. Comencemos con información básica.";

        this.addBotMessage(message);
    }

    askNextQuestion() {
        if (this.currentStep >= FORM_FLOW.length) {
            this.showPrivacyConsent();
            return;
        }

        const field = FORM_FLOW[this.currentStep];

        // Show section header if starting new section
        if (this.currentStep === 0 || (this.currentStep > 0 && FORM_FLOW[this.currentStep - 1].section !== field.section)) {
            const sectionKey = field.section === 'student' ? 'form.student_section' : 'form.guarantor_section';
            this.addBotMessage(`<strong>${i18n.t(sectionKey)}</strong>`);
        }

        const question = i18n.t(field.i18nKey);
        this.addBotMessage(question);
        this.showInput(field);
        this.updateProgress();
    }

    showInput(field) {
        this.inputArea.innerHTML = '';

        if (field.type === 'select') {
            const select = document.createElement('select');
            select.className = 'form-select';
            select.id = 'current-input';

            const placeholder = document.createElement('option');
            placeholder.value = '';
            placeholder.textContent = i18n.t('form.next');
            select.appendChild(placeholder);

            field.options.forEach(option => {
                const opt = document.createElement('option');
                opt.value = option;

                if (field.id === 'country') {
                    opt.textContent = i18n.t(`countries.${option}`);
                } else if (field.id === 'duration') {
                    opt.textContent = i18n.t(`form.duration_${option}`);
                } else if (field.id === 'guarantor_relationship') {
                    opt.textContent = i18n.t(`form.relationship_${option}`);
                }

                select.appendChild(opt);
            });

            select.addEventListener('change', () => {
                if (select.value) {
                    this.handleAnswer(select.value, field);
                }
            });

            this.inputArea.appendChild(select);
            select.focus();
        } else {
            const input = document.createElement('input');
            input.type = field.type;
            input.className = 'form-input';
            input.id = 'current-input';
            input.placeholder = i18n.t(field.i18nKey);

            if (field.type === 'date') {
                input.max = new Date().toISOString().split('T')[0];
            }

            const button = document.createElement('button');
            button.className = 'btn btn-primary';
            button.textContent = i18n.t('form.next');
            button.style.marginLeft = '1rem';

            button.addEventListener('click', () => {
                this.handleAnswer(input.value, field);
            });

            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.handleAnswer(input.value, field);
                }
            });

            this.inputArea.appendChild(input);
            this.inputArea.appendChild(button);
            input.focus();
        }
    }

    handleAnswer(value, field) {
        // Validate
        const validation = this.validateField(value, field);
        if (!validation.valid) {
            this.showError(validation.message);
            return;
        }

        // Store answer
        this.formData[field.id] = value;

        // Show user's answer
        let displayValue;
        if (field.type === 'select') {
            displayValue = document.querySelector(`#current-input option[value="${value}"]`).textContent;
        } else if (field.type === 'date') {
            // Format date as DD/MM/YYYY
            const date = new Date(value);
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = date.getFullYear();
            displayValue = `${day}/${month}/${year}`;
        } else if ((field.id === 'student_income' || field.id === 'guarantor_income') && value) {
            // Format income with local currency
            const country = this.formData.country;
            if (country && typeof formatIncome === 'function') {
                displayValue = formatIncome(value, country);
            } else {
                // Fallback formatting
                displayValue = value;
            }
        } else {
            displayValue = value;
        }
        this.addUserMessage(displayValue);

        // Move to next question
        this.currentStep++;
        this.askNextQuestion();
    }

    validateField(value, field) {
        if (field.required && !value) {
            return { valid: false, message: i18n.t('form.validation_required') };
        }

        if (field.type === 'email' && value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                return { valid: false, message: i18n.t('form.validation_email') };
            }
        }

        if (field.type === 'tel' && value) {
            const phoneRegex = /^\+?[1-9]\d{1,14}$/;
            if (!phoneRegex.test(value.replace(/[\s-]/g, ''))) {
                return { valid: false, message: i18n.t('form.validation_phone') };
            }
        }

        if (field.id === 'student_birthdate' && value) {
            const birthDate = new Date(value);
            const age = (new Date() - birthDate) / (1000 * 60 * 60 * 24 * 365);
            if (age < 18) {
                return { valid: false, message: i18n.t('form.validation_age') };
            }
        }

        // Validate guarantor is different from student
        if (field.id === 'guarantor_email' && value) {
            if (value.toLowerCase() === this.formData.student_email?.toLowerCase()) {
                const message = i18n.currentLanguage === 'en'
                    ? 'Guarantor email must be different from student email'
                    : i18n.currentLanguage === 'pt'
                        ? 'O email do fiador deve ser diferente do email do estudante'
                        : 'El correo del garante debe ser diferente del correo del estudiante';
                return { valid: false, message };
            }
        }

        if (field.id === 'guarantor_phone' && value) {
            const normalizedValue = value.replace(/[\s-]/g, '');
            const normalizedStudent = this.formData.student_phone?.replace(/[\s-]/g, '');
            if (normalizedValue === normalizedStudent) {
                const message = i18n.currentLanguage === 'en'
                    ? 'Guarantor phone must be different from student phone'
                    : i18n.currentLanguage === 'pt'
                        ? 'O telefone do fiador deve ser diferente do telefone do estudante'
                        : 'El teléfono del garante debe ser diferente del teléfono del estudiante';
                return { valid: false, message };
            }
        }

        if (field.id === 'guarantor_id' && value) {
            if (value === this.formData.student_id) {
                const message = i18n.currentLanguage === 'en'
                    ? 'Guarantor ID must be different from student ID'
                    : i18n.currentLanguage === 'pt'
                        ? 'O CPF/ID do fiador deve ser diferente do CPF/ID do estudante'
                        : 'El ID del garante debe ser diferente del ID del estudiante';
                return { valid: false, message };
            }
        }

        return { valid: true };
    }

    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'form-error';
        errorDiv.textContent = message;
        this.inputArea.appendChild(errorDiv);

        setTimeout(() => errorDiv.remove(), 3000);
    }

    showPrivacyConsent() {
        const message = i18n.t('form.privacy_notice');
        this.addBotMessage(message);

        this.inputArea.innerHTML = '';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = 'privacy-consent';
        checkbox.style.marginRight = '0.5rem';

        const label = document.createElement('label');
        label.htmlFor = 'privacy-consent';
        label.textContent = i18n.t('form.privacy_notice');
        label.style.cursor = 'pointer';

        const button = document.createElement('button');
        button.className = 'btn btn-primary btn-large btn-block mt-md';
        button.textContent = i18n.t('form.submit');
        button.disabled = true;

        checkbox.addEventListener('change', () => {
            button.disabled = !checkbox.checked;
        });

        button.addEventListener('click', () => {
            this.submitApplication();
        });

        const consentDiv = document.createElement('div');
        consentDiv.style.marginBottom = '1rem';
        consentDiv.appendChild(checkbox);
        consentDiv.appendChild(label);

        this.inputArea.appendChild(consentDiv);
        this.inputArea.appendChild(button);
    }

    async submitApplication() {
        const submitButton = this.inputArea.querySelector('button');
        submitButton.disabled = true;
        submitButton.textContent = 'Submitting...';
        submitButton.classList.add('loading');

        try {
            // Prepare application data
            const applicationData = {
                language: i18n.currentLanguage,
                ...this.formData,
                ...this.calculatorData
            };

            const response = await fetch('/api/applications', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(applicationData)
            });

            const result = await response.json();

            if (response.ok) {
                // Store result for result page
                sessionStorage.setItem('seda_application_result', JSON.stringify(result));
                window.location.href = '/result.html';
            } else {
                this.showError(result.message || 'An error occurred. Please try again.');
                submitButton.disabled = false;
                submitButton.textContent = i18n.t('form.submit');
                submitButton.classList.remove('loading');
            }
        } catch (error) {
            console.error('Submission error:', error);
            const errorMessage = i18n.currentLanguage === 'en'
                ? "We couldn't submit your application right now. Please try again in a few minutes or contact a SEDA consultant for assistance."
                : i18n.currentLanguage === 'pt'
                    ? "Não conseguimos enviar sua aplicação no momento. Por favor, tente novamente em alguns minutos ou entre em contato com um consultor SEDA."
                    : "No pudimos enviar tu solicitud en este momento. Por favor, inténtalo de nuevo en unos minutos o contacta a un consultor de SEDA.";

            this.showError(errorMessage);
            submitButton.disabled = false;
            submitButton.textContent = i18n.t('form.submit');
            submitButton.classList.remove('loading');
        }
    }

    addBotMessage(text) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'chat-message bot';

        const bubble = document.createElement('div');
        bubble.className = 'message-bubble';
        bubble.innerHTML = text;

        messageDiv.appendChild(bubble);
        this.messagesContainer.appendChild(messageDiv);
        this.scrollToBottom();
    }

    addUserMessage(text) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'chat-message user';

        const bubble = document.createElement('div');
        bubble.className = 'message-bubble';
        bubble.textContent = text;

        messageDiv.appendChild(bubble);
        this.messagesContainer.appendChild(messageDiv);
        this.scrollToBottom();
    }

    updateProgress() {
        const progress = (this.currentStep / FORM_FLOW.length) * 100;
        this.progressBar.style.width = `${progress}%`;
    }

    scrollToBottom() {
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }
}

// Initialize form on page load
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('chat-messages')) {
        new ConversationalForm();
    }
});
