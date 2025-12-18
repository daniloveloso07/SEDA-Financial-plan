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
    { id: 'student_name', type: 'text', section: 'student', required: true, i18nKey: 'form.name_question' },
    { id: 'student_phone', type: 'tel', section: 'student', required: true, i18nKey: 'form.phone_question' },
    { id: 'student_email', type: 'email', section: 'student', required: true, i18nKey: 'form.email_question' },
    { id: 'student_birthdate', type: 'date', section: 'student', required: true, i18nKey: 'form.birthdate_question' },
    { id: 'student_id', type: 'text', section: 'student', required: true, i18nKey: 'form.id_question' },
    { id: 'country', type: 'select', section: 'student', required: true, i18nKey: 'form.country_question', options: ELIGIBLE_COUNTRIES },

    // Split Address Student
    { id: 'student_street', type: 'text', section: 'student', required: true, i18nKey: 'form.address_street_question' },
    { id: 'student_city', type: 'text', section: 'student', required: true, i18nKey: 'form.address_city_question' },
    { id: 'student_state', type: 'text', section: 'student', required: true, i18nKey: 'form.address_state_question' },
    { id: 'student_postal', type: 'text', section: 'student', required: true, i18nKey: 'form.address_postal_question' },

    { id: 'student_occupation', type: 'text', section: 'student', required: true, i18nKey: 'form.occupation_question' },
    { id: 'student_income', type: 'number', section: 'student', required: true, i18nKey: 'form.income_question' },
    { id: 'travel_date', type: 'date', section: 'student', required: true, i18nKey: 'form.travel_date_question' },

    // Duration hidden/skipped via logic or just removed if hardcoded 'long'. 
    // We will inject 'long' automatically in submission.

    // Guarantor Information
    { id: 'guarantor_name', type: 'text', section: 'guarantor', required: true, i18nKey: 'form.guarantor_name_question' },
    { id: 'guarantor_email', type: 'email', section: 'guarantor', required: true, i18nKey: 'form.guarantor_email_question' },
    { id: 'guarantor_phone', type: 'tel', section: 'guarantor', required: true, i18nKey: 'form.guarantor_phone_question' },
    { id: 'guarantor_birthdate', type: 'date', section: 'guarantor', required: true, i18nKey: 'form.guarantor_birthdate_question' },
    { id: 'guarantor_id', type: 'text', section: 'guarantor', required: true, i18nKey: 'form.guarantor_id_question' },

    // Split Address Guarantor
    { id: 'guarantor_street', type: 'text', section: 'guarantor', required: true, i18nKey: 'form.guarantor_street_question' },
    { id: 'guarantor_city', type: 'text', section: 'guarantor', required: true, i18nKey: 'form.guarantor_city_question' },
    { id: 'guarantor_state', type: 'text', section: 'guarantor', required: true, i18nKey: 'form.guarantor_state_question' },
    { id: 'guarantor_postal', type: 'text', section: 'guarantor', required: true, i18nKey: 'form.guarantor_postal_question' },

    { id: 'guarantor_occupation', type: 'text', section: 'guarantor', required: true, i18nKey: 'form.guarantor_occupation_question' },
    { id: 'guarantor_relationship', type: 'select', section: 'guarantor', required: true, i18nKey: 'form.guarantor_relationship_question', options: ['father', 'mother', 'grandfather', 'grandmother', 'brother', 'sister', 'uncle_aunt', 'spouse', 'other'] },
    { id: 'guarantor_income', type: 'number', section: 'guarantor', required: true, i18nKey: 'form.guarantor_income_question' }
];

class ConversationalForm {
    constructor() {
        this.currentStep = 0;
        this.formData = {};
        this.messagesContainer = document.getElementById('chat-messages');
        this.inputArea = document.getElementById('chat-input-area');
        this.progressBar = document.getElementById('progress-fill');
        this.guarantorIntroShown = false; // New flag for guarantor intro

        // Load calculator data
        const calcData = sessionStorage.getItem('seda_calculation');
        if (calcData) {
            this.calculatorData = JSON.parse(calcData);
        } else {
            // Fallback default for direct chat access (Dev/MVP mode)
            this.calculatorData = {
                campus: 'dublin',
                course_type: 'general_english',
                shift: 'am',
                installments: 12,
                entry_percent: 0.30,
                total_value_eur: 3000 // Dummy value just to pass checks
            };
        }

        this.init();
    }

    init() {
        // Start with the welcome story instead of the first question
        this.runWelcomeStory();
    }

    async runWelcomeStory() {
        // Sequence of welcome messages
        const messages = [
            'welcome_1',
            'welcome_2',
            'welcome_3',
            'welcome_4'
        ];

        // Slight delay between welcome messages
        for (const key of messages) {
            const text = i18n.t(`form.${key}`);
            // If the text contains newlines, we can format it? The CSS handles wrapping.
            // We'll leave it simple.
            await this.addBotMessageWithDelay(text, 1200);
        }

        // Show Start Button
        this.showStartButton();
    }

    showStartButton() {
        this.inputArea.innerHTML = '';
        const btn = document.createElement('button');
        btn.className = 'btn btn-primary';
        btn.textContent = i18n.t('form.start_btn');
        btn.style.width = '100%';
        btn.style.padding = '1rem';

        btn.onclick = () => {
            // User "says" Start
            this.addUserMessage(i18n.t('form.start_btn'));
            this.inputArea.innerHTML = '';
            // Proceed to first question (Name)
            this.askNextQuestion();
        };

        this.inputArea.appendChild(btn);
    }

    async askNextQuestion() {
        if (this.currentStep >= FORM_FLOW.length) {
            this.showPrivacyConsent();
            return;
        }

        const field = FORM_FLOW[this.currentStep];

        // Guarantor Intro Message Check
        if (field.id === 'guarantor_name' && !this.guarantorIntroShown) {
            await this.addBotMessageWithDelay(i18n.t('form.guarantor_intro'), 1000);
            this.guarantorIntroShown = true;
        }

        // determine the question text
        let questionText = i18n.t(field.i18nKey);

        // Dynamic overrides if needed
        if (field.id === 'student_name') {
            // ensure using the new conversational key if not already in FORM_FLOW
            // (It is in FORM_FLOW)
        }

        // Add delay for realism
        await this.addBotMessageWithDelay(questionText, 600);

        this.showInput(field);
        this.updateProgress();
    }

    // Helper for natural delays
    addBotMessageWithDelay(text, delay) {
        return new Promise(resolve => {
            // Show typing indicator? (Optional enhancement)
            this.showTyping();

            setTimeout(() => {
                this.hideTyping();
                this.addBotMessage(text);
                resolve();
            }, delay);
        });
    }

    showTyping() {
        // Simple typing indicator
        if (document.getElementById('typing-indicator')) return;

        const typingDiv = document.createElement('div');
        typingDiv.id = 'typing-indicator';
        typingDiv.className = 'chat-message bot typing';
        typingDiv.innerHTML = '<div class="message-bubble"></div>'; // CSS handles pseudo-element
        this.messagesContainer.appendChild(typingDiv);
        this.scrollToBottom();
    }

    hideTyping() {
        const typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator) typingIndicator.remove();
    }

    showInput(field) {
        this.inputArea.innerHTML = '';

        // Container for Input + Back Button
        const container = document.createElement('div');
        container.style.display = 'flex';
        container.style.gap = '10px';
        container.style.width = '100%';
        container.style.alignItems = 'flex-end';

        // Back button (if not first step)
        if (this.currentStep > 0) {
            const backBtn = document.createElement('button');
            backBtn.className = 'btn btn-outline back-btn';
            backBtn.innerHTML = '⬅️';
            backBtn.title = i18n.t('form.back') || 'Back';
            backBtn.onclick = () => this.goBack();
            container.appendChild(backBtn);
        }

        const inputWrapper = document.createElement('div');
        inputWrapper.style.flex = '1';

        if (field.type === 'select') {
            const optionsContainer = document.createElement('div');
            optionsContainer.className = 'options-container';

            field.options.forEach(option => {
                const btn = document.createElement('button');
                btn.className = 'btn btn-outline option-chip';

                let label = option;
                if (field.id === 'country') label = i18n.t(`countries.${option}`);
                else if (field.id === 'guarantor_relationship') label = i18n.t(`form.relationship_${option}`); // fixed key path

                btn.textContent = label;
                btn.onclick = () => this.handleAnswer(option, field);
                optionsContainer.appendChild(btn);
            });
            inputWrapper.appendChild(optionsContainer);
        } else {
            const input = document.createElement('input');
            input.type = field.type === 'number' ? 'text' : field.type; // Use text for number to allow formatting if needed
            if (field.type === 'number') input.inputMode = 'numeric';

            input.className = 'form-input';

            // Placeholder logic
            if (field.id === 'student_phone' || field.id === 'guarantor_phone') {
                input.placeholder = '+55 11 99999-9999';
            } else if (field.type === 'date') {
                input.placeholder = 'DD/MM/YYYY';
                // For layout purposes. Actual type=date handles format in browser usually.
            }

            if (field.type === 'date') {
                input.max = new Date().toISOString().split('T')[0];
            }

            const sendBtn = document.createElement('button');
            sendBtn.className = 'btn btn-primary';
            sendBtn.innerHTML = '➤'; // Send icon
            sendBtn.style.marginLeft = '0.5rem';
            sendBtn.style.padding = '0 1.5rem';

            const submit = () => this.handleAnswer(input.value, field);
            sendBtn.onclick = submit;
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') submit();
            });

            // Flex container for text input + send button
            const textGroup = document.createElement('div');
            textGroup.style.display = 'flex';
            textGroup.style.width = '100%';

            textGroup.appendChild(input);
            textGroup.appendChild(sendBtn);
            inputWrapper.appendChild(textGroup);

            setTimeout(() => input.focus(), 50);
        }

        container.appendChild(inputWrapper);
        this.inputArea.appendChild(container);
    }

    goBack() {
        if (this.currentStep === 0) return;

        // Remove last Q and A
        this.messagesContainer.lastChild?.remove();
        this.messagesContainer.lastChild?.remove();

        // If we just showed the guarantor intro, we might need to remove that too? 
        // Or cleaner: just re-ask the previous question.

        this.currentStep--;
        this.askNextQuestion();
    }

    async handleAnswer(value, field) {
        // Basic Validation
        const validation = this.validateField(value, field);
        if (!validation.valid) {
            this.showError(validation.message);
            return;
        }

        this.formData[field.id] = value;

        // FORMATTING FOR DISPLAY (Chat Bubbles)
        let displayValue = value;

        if (field.type === 'date') {
            // Convert YYYY-MM-DD to DD/MM/YYYY
            if (value && value.includes('-')) {
                const [y, m, d] = value.split('-');
                displayValue = `${d}/${m}/${y}`;
            }
        }
        else if (field.type === 'number' && (field.id.includes('income'))) {
            // Curreny Format
            displayValue = new Intl.NumberFormat(i18n.currentLanguage === 'pt' ? 'pt-BR' : 'en-IE', {
                style: 'currency',
                currency: i18n.currentLanguage === 'pt' ? 'BRL' : 'EUR'
            }).format(value);
        }
        else if (field.type === 'select') {
            field.options.forEach(opt => {
                if (opt === value) {
                    if (field.id === 'country') displayValue = i18n.t(`countries.${opt}`);
                    else if (field.id === 'guarantor_relationship') displayValue = i18n.t(`form.relationship_${opt}`); // fixed key path
                    else displayValue = opt;
                }
            });
        }

        this.addUserMessage(displayValue);

        // Transition Logic
        if (field.id === 'student_name') {
            const transitionMsg = i18n.t('form.lets_go').replace('{{name}}', value);
            await this.addBotMessageWithDelay(transitionMsg, 800);
        }

        this.currentStep++;
        this.askNextQuestion();
    }

    // ... validation methods (same as before) ...
    validateField(value, field) {
        if (field.required && !value) {
            return { valid: false, message: i18n.t('form.validation_required') };
        }
        // Specific validations removed as per instruction, keeping only required check.
        return { valid: true };
    }

    showError(message) {
        // ... same ...
        const errorDiv = document.createElement('div');
        errorDiv.className = 'form-error';
        errorDiv.textContent = message;
        this.inputArea.appendChild(errorDiv);
        setTimeout(() => errorDiv.remove(), 3000);
    }

    showPrivacyConsent() {
        const message = i18n.t('form.privacy_consent_question');
        this.addBotMessage(message);

        this.inputArea.innerHTML = '';
        const wrapper = document.createElement('div');
        wrapper.style.textAlign = 'center';
        wrapper.style.width = '100%';

        const btn = document.createElement('button');
        btn.className = 'btn btn-primary';
        btn.textContent = i18n.t('form.privacy_agree_btn');
        btn.style.width = '100%';
        btn.style.marginTop = '10px';
        btn.style.padding = '1rem';

        btn.onclick = () => this.submitApplication(btn);

        wrapper.appendChild(btn);
        this.inputArea.appendChild(wrapper);
    }

    async submitApplication(btn) {
        btn.disabled = true;
        btn.textContent = '...';

        // CONSTRUCT FINAL PAYLOAD

        // Student Address Concatenation
        const s_street = this.formData.student_street || '';
        const s_city = this.formData.student_city || '';
        const s_state = this.formData.student_state || '';
        this.formData.student_address = `${s_street}, ${s_city}, ${s_state}`.replace(/^, /, '').replace(/, $/, '');

        // Guarantor Address Concatenation
        const g_street = this.formData.guarantor_street || '';
        const g_city = this.formData.guarantor_city || '';
        const g_state = this.formData.guarantor_state || '';
        this.formData.guarantor_address = `${g_street}, ${g_city}, ${g_state}`.replace(/^, /, '').replace(/, $/, '');

        // Ensure duration is set
        this.formData.duration = 'long';

        try {
            const applicationData = {
                language: i18n.currentLanguage,
                ...this.formData,
                ...this.calculatorData // Includes fallback if null
            };

            // Debug check for console
            console.log('Submitting Application:', applicationData);

            const response = await fetch('/api/applications', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(applicationData)
            });
            const result = await response.json();
            if (response.ok) {
                sessionStorage.setItem('seda_application_result', JSON.stringify(result));
                window.location.href = '/result.html';
            } else {
                throw new Error(result.message);
            }
        } catch (error) {
            console.error(error);
            this.showError(error.message || 'Error');
            btn.disabled = false;
            btn.textContent = i18n.t('form.privacy_agree_btn');
        }
    }

    addBotMessage(text) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'chat-message bot';
        messageDiv.innerHTML = `<div class="message-bubble">${text}</div>`;
        this.messagesContainer.appendChild(messageDiv);
        this.scrollToBottom();
    }

    addUserMessage(text) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'chat-message user';
        messageDiv.innerHTML = `<div class="message-bubble">${text}</div>`;
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

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('chat-messages')) {
        new ConversationalForm();
    }
});
