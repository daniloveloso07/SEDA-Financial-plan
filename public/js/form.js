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

        // Load calculator data
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

        // Section Headers
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
                else if (field.id === 'duration') label = i18n.t(`form.duration_${option}`);
                else if (field.id === 'guarantor_relationship') label = i18n.t(`form.relationship_${option}`);

                btn.textContent = label;
                btn.onclick = () => this.handleAnswer(option, field);
                optionsContainer.appendChild(btn);
            });
            inputWrapper.appendChild(optionsContainer);
        } else {
            const input = document.createElement('input');
            input.type = field.type;
            input.className = 'form-input';
            input.id = 'current-input';
            input.placeholder = i18n.t(field.i18nKey) || 'Type your answer...';

            if (field.type === 'date') {
                input.max = new Date().toISOString().split('T')[0];
            }

            const sendBtn = document.createElement('button');
            sendBtn.className = 'btn btn-primary';
            sendBtn.innerHTML = '➤'; // Send icon
            sendBtn.style.marginLeft = '10px';
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

        // Visual feedback: remove last 2 messages (Bot question + User answer)
        // Note: Section headers are also messages, so we need be careful.
        // Simple heuristic: Remove last user message, and any bot messages after it.

        // Easier approach for now: Just remove the last 2 nodes.
        // 1. Remove the current question (bot)
        if (this.messagesContainer.lastChild) this.messagesContainer.lastChild.remove();

        // 2. Remove the previous answer (user)
        if (this.messagesContainer.lastChild && this.messagesContainer.lastChild.classList.contains('user')) {
            this.messagesContainer.lastChild.remove();
        }

        // 3. Did we remove a section header? If the step before had a section header, it's still there.
        // Actually, askNextQuestion adds the question. So removing the last node removes the question we just asked (that the user wants to leave).
        // Then we need to remove the interaction *before* that, which is the user's answer to the *previous* question.

        // Let's refine:
        // Current state: User is at Step N. Bot just asked Question N.
        // User clicks Back.
        // We want to be at Step N-1.
        // We need to remove: Question N (Bot) AND Answer N-1 (User).
        // Then we call askNextQuestion() which re-asks Question N-1.

        // Wait, if we just decrement and call askNextQuestion, it will add the question bubble AGAIN.
        // So we need to remove the *original* Question N-1 bubble too?
        // No, typically in chat, "Back" means "Undo last action". 
        // Action 1: Bot asks Q1.
        // Action 2: User answers A1.
        // Action 3: Bot asks Q2.
        // User clicks Back.
        // Result: Remove Q2. Remove A1. Bot asks Q1 again.

        // Implementation:
        this.messagesContainer.lastChild?.remove(); // Remove Q2
        this.messagesContainer.lastChild?.remove(); // Remove A1

        // Edge case: Section headers. If Q2 also added a section header, we need to remove that too.
        // We can check class list.
        while (this.messagesContainer.lastChild && this.messagesContainer.lastChild.innerHTML.includes('<strong>')) {
            this.messagesContainer.lastChild.remove();
        }

        this.currentStep--;
        this.askNextQuestion();
    }

    handleAnswer(value, field) {
        const validation = this.validateField(value, field);
        if (!validation.valid) {
            this.showError(validation.message);
            return;
        }

        this.formData[field.id] = value;

        // Logic for display value (currency, date, map selection to text)
        let displayValue = value;
        if (field.type === 'select') {
            // Find label
            field.options.forEach(opt => {
                if (opt === value) {
                    if (field.id === 'country') displayValue = i18n.t(`countries.${opt}`);
                    else if (field.id === 'duration') displayValue = i18n.t(`form.duration_${opt}`);
                    else if (field.id === 'guarantor_relationship') displayValue = i18n.t(`form.relationship_${opt}`);
                    else displayValue = opt;
                }
            });
        }

        this.addUserMessage(displayValue);
        this.currentStep++;
        this.askNextQuestion();
    }

    // ... validation methods (same as before) ...
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
        // ... same ...
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
        const wrapper = document.createElement('div');
        wrapper.style.textAlign = 'center';
        wrapper.style.width = '100%';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = 'privacy-consent';
        checkbox.style.marginRight = '10px';

        const label = document.createElement('label');
        label.htmlFor = 'privacy-consent';
        label.textContent = i18n.t('form.privacy_notice_short') || "I agree";

        const btn = document.createElement('button');
        btn.className = 'btn btn-primary';
        btn.textContent = i18n.t('form.submit');
        btn.disabled = true;
        btn.style.marginTop = '10px';
        btn.style.width = '100%';

        checkbox.addEventListener('change', () => btn.disabled = !checkbox.checked);
        btn.onclick = () => this.submitApplication(btn);

        wrapper.appendChild(checkbox);
        wrapper.appendChild(label);
        wrapper.appendChild(document.createElement('br'));
        wrapper.appendChild(btn);

        this.inputArea.appendChild(wrapper);
    }

    async submitApplication(btn) {
        btn.disabled = true;
        btn.textContent = 'Submitting...';

        // ... same submission logic ...
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
                window.location.href = '/result.html';
            } else {
                throw new Error(result.message);
            }
        } catch (error) {
            console.error(error);
            this.showError(error.message || 'Error');
            btn.disabled = false;
            btn.textContent = i18n.t('form.submit');
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
