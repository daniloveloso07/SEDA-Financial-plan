// ═══════════════════════════════════════════════════════════
// RESULT PAGE HANDLER
// ═══════════════════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {
  const resultData = sessionStorage.getItem('seda_application_result');

  if (!resultData) {
    window.location.href = '/index.html';
    return;
  }

  const result = JSON.parse(resultData);

  // Display status badge
  const statusBadge = document.getElementById('status-badge');
  const statusMessage = document.getElementById('status-message');

  let statusClass = 'success';
  let statusText = '';
  let messageText = '';

  switch (result.status) {
    case 'PRE_APPROVED_UNDER_REVIEW':
      statusClass = 'success';
      statusText = i18n.t('result.status_pre_approved');
      messageText = i18n.t('result.message_pre_approved');
      break;
    case 'UNDER_ANALYSIS':
      statusClass = 'warning';
      statusText = i18n.t('result.status_under_analysis');
      messageText = i18n.t('result.message_under_analysis');
      break;
    case 'OUT_OF_PROFILE':
      statusClass = 'danger';
      statusText = i18n.t('result.status_out_of_profile');
      messageText = i18n.t('result.message_out_of_profile');
      break;
  }

  statusBadge.className = `status-badge ${statusClass}`;
  statusBadge.textContent = statusText;
  statusMessage.innerHTML = `<p>${messageText}</p>`;

  // Display financial summary
  const financialSummary = document.getElementById('financial-summary');
  const lang = i18n.currentLanguage;

  // Currency formatter
  const localeMap = {
    'en': 'en-IE',
    'pt': 'pt-BR',
    'es': 'es-ES'
  };
  const locale = localeMap[lang];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(parseFloat(amount));
  };

  financialSummary.innerHTML = `
    <div class="result-row">
      <span class="result-label" data-i18n="calculator.package_price">Package Price</span>
      <span class="result-value">${formatCurrency(result.priceBase)}</span>
    </div>
    <div class="result-row">
      <span class="result-label" data-i18n="calculator.entry_amount">Entry Payment</span>
      <span class="result-value">${formatCurrency(result.entryAmount)}</span>
    </div>
    <div class="result-row">
      <span class="result-label" data-i18n="calculator.financed_amount">Financed Amount</span>
      <span class="result-value">${formatCurrency(result.financedAmount)}</span>
    </div>
    <div class="result-row">
      <span class="result-label" data-i18n="calculator.installments">Installments</span>
      <span class="result-value">${result.installments} months</span>
    </div>
    <div class="result-row">
      <span class="result-label" data-i18n="calculator.monthly_installment">Monthly Installment</span>
      <span class="result-value">${formatCurrency(result.monthlyInstallment)}</span>
    </div>
  `;

  // Display reference number
  document.getElementById('reference-number').textContent = result.id || 'N/A';

  // Show contact CTA for OUT_OF_PROFILE status
  if (result.status === 'OUT_OF_PROFILE') {
    document.getElementById('contact-cta').style.display = 'block';
  }

  // Update translations
  i18n.updatePageLanguage();

  // Clear session storage
  sessionStorage.removeItem('seda_application_result');
});
