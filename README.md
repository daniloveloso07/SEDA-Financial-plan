# SEDA Student Finance Plan by FDI

A production-ready MVP web application for SEDA College's internal student financing pre-approval platform. This application serves Latin American students seeking financing for long-duration English language programs at SEDA College campuses in Dublin and Cork, Ireland.

## 🌟 Features

- **Multi-language Support**: English (EN), Portuguese (PT-BR), Spanish (ES)
- **Real-time Finance Calculator**: Calculate payment plans with different campus, shift, entry, and installment options
- **Conversational Application Form**: Chat-style multi-step form for collecting student and guarantor information
- **Automatic Classification**: Smart classification logic (PRE-APPROVED, UNDER ANALYSIS, OUT OF PROFILE)
- **Email Notifications**: Automated emails to applicants (localized) and internal team (English)
- **Mobile-first Design**: Responsive layout optimized for all devices
- **SEDA Branding Compliance**: Official colors, logo, and Montserrat font family
- **Rate Limiting**: Protection against abuse (10 requests per hour per IP)
- **PostgreSQL Database**: Robust data storage with indexed queries

## 🛠️ Technology Stack

### Frontend
- HTML5, CSS3, Vanilla JavaScript
- Montserrat font family (Google Fonts)
- Mobile-first responsive design
- localStorage for language persistence

### Backend
- Node.js with Express.js
- PostgreSQL database
- Nodemailer for SMTP email delivery
- express-rate-limit for API protection

> **Architecture Note**: This MVP uses a vanilla HTML/CSS/JavaScript frontend with Express.js backend, which is ideal for rapid development and initial validation. For future scalability, dashboard features, and payment automation (e.g., Stripe integration), consider migrating to a framework-based architecture such as Next.js with React components. The current architecture provides a solid foundation and can be incrementally enhanced as requirements evolve.

## 📋 Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- SMTP email account (Gmail, SendGrid, AWS SES, etc.)

## 🚀 Installation & Setup

### 1. Clone or Extract the Project

```bash
cd seda-finance-plan
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/seda_finance

# SMTP Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FROM_EMAIL=noreply@sedacollege.com
INTERNAL_NOTIFICATION_EMAILS=finance@sedacollege.com,admin@sedacollege.com

# Server Configuration
PORT=3000
NODE_ENV=development
```

### 4. Set Up PostgreSQL Database

Create a new database:

```bash
createdb seda_finance
```

Or using psql:

```sql
CREATE DATABASE seda_finance;
```

### 5. Run Database Migrations

```bash
npm run db:migrate
```

This will create the `finance_applications` table with all required fields and indexes.

### 6. Start the Development Server

```bash
npm run dev
```

The application will be available at: **http://localhost:3000**

## 📧 Email Configuration

### Gmail Setup

1. Enable 2-Factor Authentication on your Google account
2. Generate an App Password: https://myaccount.google.com/apppasswords
3. Use the app password in your `.env` file:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-16-character-app-password
```

### SendGrid Setup

```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
```

### AWS SES Setup

```env
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_USER=your-aws-access-key-id
SMTP_PASS=your-aws-secret-access-key
```

## 🎨 Branding Guidelines

This application strictly follows SEDA College official branding:

### Colors
- **Primary Yellow**: `#FFCB05` (CTAs, highlights)
- **Secondary Yellow**: `#E28E26` (accents)
- **Primary Dark Blue**: `#023A49` (header, navigation)
- **White**: `#FFFFFF`
- **Black**: `#000000`

### Typography
- **Font Family**: Montserrat
- **Headings**: Montserrat Bold
- **Body**: Montserrat Regular

### Logo
- Minimum height: 70px
- Always use icon + wordmark together
- Never distort, recolor, or manipulate

## 💰 Finance Plan Pricing

### Base Prices (before €100 FDI fee)

**Dublin**
- Morning (AM): €2,850
- Afternoon (PM): €2,550

**Cork**
- Morning (AM): €2,550
- Afternoon (PM): €2,250

### Interest Rates (Fixed, One-time)
- 6 months: 4%
- 12 months: 5%
- 15 months: 6%
- 18 months: 7%

### Entry Payment Options
- 30% (minimum)
- 40%

## 🔍 Classification Logic

Applications are automatically classified as:

### OUT_OF_PROFILE
- Student age < 18
- Country not eligible
- Short duration selected
- Entry < 30%
- Missing mandatory guarantor data

### PRE_APPROVED_UNDER_REVIEW
- Age ≥ 18
- Eligible country
- Long duration
- Entry ≥ 30%
- Guarantor fully completed
- Student or guarantor income provided

### UNDER_ANALYSIS
- All other valid edge cases

## 🌍 Eligible Countries

- Brazil
- Paraguay
- Argentina
- Chile
- Uruguay
- Mexico
- Costa Rica
- El Salvador
- Guatemala

## 📊 Database Schema

The `finance_applications` table includes:

- Application metadata (id, created_at, language, status)
- Financial data (campus, shift, prices, installments, interest)
- Student information (name, email, phone, birthdate, address, occupation, income, travel date, country, duration)
- Guarantor information (name, email, phone, birthdate, address, occupation, relationship, income)

## 🚢 Deployment

### Vercel (Recommended for Frontend + Serverless)

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
vercel
```

3. Set environment variables in Vercel dashboard

### Railway (Recommended for Full-Stack)

1. Create account at https://railway.app
2. Create new project from GitHub
3. Add PostgreSQL database
4. Set environment variables
5. Deploy

### Render

1. Create account at https://render.com
2. Create new Web Service
3. Add PostgreSQL database
4. Set environment variables
5. Deploy

## 🧪 Testing

### Test Calculator
1. Go to homepage
2. Select different campus/shift/entry/installment combinations
3. Verify calculations match expected values

### Test Application Flow
1. Click "Start Your Application"
2. Complete all form fields
3. Submit application
4. Verify result screen displays correct status
5. Check email delivery (applicant + internal team)

### Test Multi-language
1. Switch between EN/PT/ES using language selector
2. Refresh page - language should persist
3. Verify all UI text is translated

## 📝 API Endpoints

### POST /api/applications

Submit a new finance plan application.

**Request Body:**
```json
{
  "language": "en",
  "campus": "dublin",
  "shift": "am",
  "entryPercent": 0.30,
  "installments": 12,
  "student_name": "John Doe",
  "student_email": "john@example.com",
  "student_phone": "+5511999999999",
  "student_birthdate": "1995-01-15",
  "student_address": "123 Main St",
  "student_postal": "12345",
  "student_occupation": "Engineer",
  "student_income": 3000,
  "travel_date": "2025-06-01",
  "country": "brazil",
  "duration": "long",
  "guarantor_name": "Jane Doe",
  "guarantor_email": "jane@example.com",
  "guarantor_phone": "+5511988888888",
  "guarantor_birthdate": "1970-05-20",
  "guarantor_address": "456 Oak Ave",
  "guarantor_postal": "54321",
  "guarantor_occupation": "Teacher",
  "guarantor_relationship": "mother",
  "guarantor_income": 2500
}
```

**Response:**
```json
{
  "success": true,
  "id": 1,
  "status": "PRE_APPROVED_UNDER_REVIEW",
  "priceBase": "2950.00",
  "entryAmount": "885.00",
  "financedAmount": "2065.00",
  "monthlyInstallment": "180.54",
  ...
}
```

## 🔒 Security Features

- Server-side validation for all inputs
- Rate limiting (10 requests/hour per IP)
  - **Note**: Current implementation uses in-memory storage suitable for MVP. For production scale with multiple servers, consider using Redis with `rate-limit-redis` package.
- Input sanitization
- HTTPS recommended for production
- Environment variables for sensitive data

## 🐛 Troubleshooting

### Database Connection Error
- Verify PostgreSQL is running
- Check DATABASE_URL in `.env`
- Ensure database exists

### Email Not Sending
- Verify SMTP credentials
- Check spam folder
- Enable "Less secure app access" for Gmail (or use App Password)
- Check SMTP_HOST and SMTP_PORT

### Port Already in Use
- Change PORT in `.env`
- Kill process using port 3000: `lsof -ti:3000 | xargs kill`

## 📄 License

UNLICENSED - Internal use only for SEDA College

## 👥 Support

For technical support or questions, contact the SEDA College IT team.

---

**© 2025 SEDA College. All rights reserved.**  
**Finance Plan powered by FDI**
