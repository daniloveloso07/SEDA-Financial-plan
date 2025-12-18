import dotenv from 'dotenv';

dotenv.config();

/**
 * Internal helper to send email via Resend API (HTTPS)
 * This bypasses SMTP port blocking on cloud providers like Railway.
 */
async function sendResendEmail({ from, to, subject, html }) {
  const apiKey = (process.env.SMTP_PASS || '').trim();

  if (!apiKey) {
    throw new Error('Missing RESEND_API_KEY (SMTP_PASS)');
  }

  // Robustly clean emails (handle newlines, spaces, etc.)
  const cleanFrom = (from || process.env.FROM_EMAIL || '').toString().trim().replace(/[\r\n\t]/g, '');
  const fromName = "SEDA College Finance";

  // Format recipients
  const recipients = (Array.isArray(to) ? to : [to])
    .map(email => email.toString().trim().replace(/[\r\n\t]/g, ''))
    .filter(email => email.includes('@'));

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: `${fromName} <${cleanFrom}>`,
      to: recipients,
      subject,
      html
    })
  });

  const data = await response.json();

  if (!response.ok) {
    console.error('❌ Resend API Error:', data);
    throw new Error(data.message || 'Failed to send email via Resend API');
  }

  return data;
}

// Translations for email templates
const EMAIL_TRANSLATIONS = {
  en: {
    subject_applicant: 'Your SEDA Finance Plan Application',
    greeting: 'Hello',
    confirmation: 'Thank you for submitting your finance plan application.',
    status_label: 'Application Status',
    reference_label: 'Reference Number',
    financial_summary: 'Financial Summary',
    package_price: 'Package Price',
    entry_payment: 'Entry Payment',
    financed_amount: 'Financed Amount',
    installments: 'Installments',
    monthly_payment: 'Monthly Payment',
    next_steps: 'Next Steps',
    contact_soon: 'A SEDA consultant will contact you within 2-3 business days.',
    regards: 'Best regards',
    team: 'SEDA College Finance Team'
  },
  pt: {
    subject_applicant: 'Sua Aplicação de Plano de Financiamento SEDA',
    greeting: 'Olá',
    confirmation: 'Obrigado por enviar sua aplicação de plano de financiamento.',
    status_label: 'Status da Aplicação',
    reference_label: 'Número de Referência',
    financial_summary: 'Resumo Financeiro',
    package_price: 'Preço do Pacote',
    entry_payment: 'Pagamento de Entrada',
    financed_amount: 'Valor Financiado',
    installments: 'Parcelas',
    monthly_payment: 'Pagamento Mensal',
    next_steps: 'Próximos Passos',
    contact_soon: 'Um consultor SEDA entrará em contato em 2-3 dias úteis.',
    regards: 'Atenciosamente',
    team: 'Equipe de Financiamento SEDA College'
  },
  es: {
    subject_applicant: 'Tu Solicitud de Plan de Financiamiento SEDA',
    greeting: 'Hola',
    confirmation: 'Gracias por enviar tu solicitud de plan de financiamiento.',
    status_label: 'Estado de la Solicitud',
    reference_label: 'Número de Referencia',
    financial_summary: 'Resumen Financiero',
    package_price: 'Precio del Paquete',
    entry_payment: 'Pago de Entrada',
    financed_amount: 'Monto Financiado',
    installments: 'Cuotas',
    monthly_payment: 'Pago Mensual',
    next_steps: 'Próximos Pasos',
    contact_soon: 'Un consultor de SEDA se comunicará contigo en 2-3 días hábiles.',
    regards: 'Saludos cordiales',
    team: 'Equipo de Financiamiento SEDA College'
  }
};

/**
 * Send email to applicant (localized)
 */
export async function sendApplicantEmail(application, language = 'en') {
  const t = EMAIL_TRANSLATIONS[language] || EMAIL_TRANSLATIONS.en;

  const statusColors = {
    'PRE_APPROVED_UNDER_REVIEW': '#023A49',  // SEDA Dark Blue
    'UNDER_ANALYSIS': '#E28E26',             // SEDA Secondary Yellow
    'OUT_OF_PROFILE': '#F8F9FA'              // Neutral (with dark text)
  };

  const statusColor = statusColors[application.status] || '#6C757D';
  const statusTextColor = application.status === 'OUT_OF_PROFILE' ? '#023A49' : '#FFFFFF';

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: 'Montserrat', Arial, sans-serif; line-height: 1.6; color: #212529; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #023A49; padding: 30px; text-align: center; }
        .logo { height: 70px; }
        .content { background-color: #ffffff; padding: 30px; }
        .status-badge { 
          display: inline-block; 
          padding: 10px 20px; 
          background-color: ${statusColor}; 
          color: white; 
          border-radius: 8px; 
          font-weight: bold; 
          margin: 20px 0;
        }
        .summary-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .summary-table td { padding: 10px; border-bottom: 1px solid #DEE2E6; }
        .summary-table td:first-child { font-weight: 600; }
        .summary-table td:last-child { text-align: right; color: #023A49; font-weight: 700; }
        .footer { background-color: #F8F9FA; padding: 20px; text-align: center; font-size: 14px; color: #6C757D; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="color: #FFCB05; margin: 0;">SEDA College</h1>
          <p style="color: white; margin: 10px 0 0 0;">Finance Plan Application</p>
        </div>
        
        <div class="content">
          <h2>${t.greeting} ${application.student_name},</h2>
          <p>${t.confirmation}</p>
          
          <p><strong>${t.status_label}:</strong></p>
          <div class="status-badge" style="background-color: ${statusColor}; color: ${statusTextColor}; border: ${application.status === 'OUT_OF_PROFILE' ? '2px solid #DEE2E6' : 'none'};">${application.status.replace(/_/g, ' ')}</div>
          
          <p><strong>${t.reference_label}:</strong> #${application.id}</p>
          
          <h3>${t.financial_summary}</h3>
          <table class="summary-table">
            <tr>
              <td>${t.package_price}</td>
              <td>€${application.priceBase}</td>
            </tr>
            <tr>
              <td>${t.entry_payment}</td>
              <td>€${application.entryAmount}</td>
            </tr>
            <tr>
              <td>${t.financed_amount}</td>
              <td>€${application.financedAmount}</td>
            </tr>
            <tr>
              <td>${t.installments}</td>
              <td>${application.installments} months</td>
            </tr>
            <tr>
              <td>${t.monthly_payment}</td>
              <td>€${application.monthlyInstallment}</td>
            </tr>
          </table>
          
          <h3>${t.next_steps}</h3>
          <p>${t.contact_soon}</p>
          <p style="font-size: 0.9rem; color: #6C757D;"><em>First financing installment starts 30 days after contract signing, allowing financial organization before arrival.</em></p>
          
          <p>${t.regards},<br><strong>${t.team}</strong></p>
        </div>
        
        <div class="footer">
          <p>© 2025 SEDA College. All rights reserved.</p>
          <p>Finance Plan powered by FDI</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const mailOptions = {
    from: process.env.FROM_EMAIL,
    to: application.student_email,
    subject: t.subject_applicant,
    html: htmlContent
  };

  try {
    const data = await sendResendEmail(mailOptions);
    console.log(`✅ Applicant email sent to ${application.student_email}`, data);
  } catch (error) {
    console.error('❌ Error sending applicant email:', error);
    throw error;
  }
}

/**
 * Send email to internal team (English only)
 */
export async function sendInternalEmail(application) {
  // Calculate internal priority (not visible to applicant)
  let priority = 'Medium';
  let priorityColor = '#E28E26'; // SEDA Secondary Yellow

  if (application.guarantor_income && parseFloat(application.guarantor_income) > 0) {
    priority = 'High';
    priorityColor = '#023A49'; // SEDA Dark Blue
  } else if (application.student_income && parseFloat(application.student_income) > 0) {
    priority = 'Medium';
    priorityColor = '#E28E26'; // SEDA Secondary Yellow
  } else {
    priority = 'Medium';
    priorityColor = '#E28E26';
  }

  const subject = `[SEDA FINANCE PLAN] ${application.status} — ${application.student_name} — ${application.country.toUpperCase()}`;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: 'Montserrat', Arial, sans-serif; line-height: 1.6; color: #212529; }
        .container { max-width: 800px; margin: 0 auto; padding: 20px; }
        .header { background-color: #023A49; padding: 20px; color: white; }
        .section { background-color: #F8F9FA; padding: 20px; margin: 20px 0; border-left: 4px solid #FFCB05; }
        .section h3 { margin-top: 0; color: #023A49; }
        table { width: 100%; border-collapse: collapse; }
        td { padding: 8px; border-bottom: 1px solid #DEE2E6; }
        td:first-child { font-weight: 600; width: 200px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>New Finance Plan Application</h2>
          <p><strong>Status:</strong> ${application.status}</p>
          <p><strong>Internal Priority:</strong> <span style="background-color: ${priorityColor}; color: white; padding: 4px 12px; border-radius: 4px; font-weight: bold;">${priority}</span></p>
          <p style="font-size: 0.85rem; color: #E0E0E0;"><em>Priority based on income data: High = guarantor income provided, Medium = student income only or no income</em></p>
          <p><strong>Reference:</strong> #${application.id}</p>
          <p><strong>Submitted:</strong> ${new Date(application.created_at).toLocaleString()}</p>
        </div>
        
        <div class="section">
          <h3>📊 Financial Summary</h3>
          <table>
            <tr><td>Campus</td><td>${application.campus.toUpperCase()}</td></tr>
            <tr><td>Shift</td><td>${application.shift.toUpperCase()}</td></tr>
            <tr><td>Package Price</td><td>€${application.priceBase}</td></tr>
            <tr><td>Entry Percentage</td><td>${(parseFloat(application.entryPercent) * 100).toFixed(0)}%</td></tr>
            <tr><td>Entry Amount</td><td>€${application.entryAmount}</td></tr>
            <tr><td>Financed Amount</td><td>€${application.financedAmount}</td></tr>
            <tr><td>Installments</td><td>${application.installments} months</td></tr>
            <tr><td>Interest Rate</td><td>${(parseFloat(application.interestPercent) * 100).toFixed(0)}%</td></tr>
            <tr><td>Monthly Installment</td><td>€${application.monthlyInstallment}</td></tr>
            <tr><td>Expected Travel Date</td><td>${application.travel_date}</td></tr>
          </table>
        </div>
        
        <div class="section">
          <h3>👤 Student Information</h3>
          <table>
            <tr><td>Full Name</td><td>${application.student_name}</td></tr>
            <tr><td>Email</td><td>${application.student_email}</td></tr>
            <tr><td>Phone</td><td>${application.student_phone}</td></tr>
            <tr><td>Date of Birth</td><td>${application.student_birthdate}</td></tr>
            <tr><td>Address</td><td>${application.student_address}</td></tr>
            <tr><td>Postal Code</td><td>${application.student_postal}</td></tr>
            <tr><td>Occupation</td><td>${application.student_occupation}</td></tr>
            <tr><td>Monthly Income</td><td>${application.student_income ? '€' + application.student_income : 'Not provided'}</td></tr>
            <tr><td>Country</td><td>${application.country.toUpperCase()}</td></tr>
            <tr><td>Program Duration</td><td>${application.duration_choice}</td></tr>
          </table>
        </div>
        
        <div class="section">
          <h3>🛡️ Guarantor Information</h3>
          <table>
            <tr><td>Full Name</td><td>${application.guarantor_name}</td></tr>
            <tr><td>Email</td><td>${application.guarantor_email}</td></tr>
            <tr><td>Phone</td><td>${application.guarantor_phone}</td></tr>
            <tr><td>Date of Birth</td><td>${application.guarantor_birthdate}</td></tr>
            <tr><td>Address</td><td>${application.guarantor_address}</td></tr>
            <tr><td>Postal Code</td><td>${application.guarantor_postal}</td></tr>
            <tr><td>Occupation</td><td>${application.guarantor_occupation}</td></tr>
            <tr><td>Relationship</td><td>${application.guarantor_relationship}</td></tr>
            <tr><td>Monthly Income</td><td>${application.guarantor_income ? '€' + application.guarantor_income : 'Not provided'}</td></tr>
          </table>
        </div>
      </div>
    </body>
    </html>
  `;

  const recipients = process.env.INTERNAL_NOTIFICATION_EMAILS?.split(',').map(e => e.trim()).filter(e => e) || [];

  console.log(`📧 Attempting to send internal notification to ${recipients.length} recipients:`, recipients);

  if (recipients.length === 0) {
    console.warn('⚠️ No internal notification emails configured in INTERNAL_NOTIFICATION_EMAILS');
    return;
  }

  const mailOptions = {
    from: process.env.FROM_EMAIL,
    to: recipients, // Pass the array directly
    subject: subject,
    html: htmlContent
  };

  try {
    const data = await sendResendEmail(mailOptions);
    console.log(`✅ Internal email sent successfully`, data);
  } catch (error) {
    console.error('❌ Error sending internal email:', error);
    throw error;
  }
}
