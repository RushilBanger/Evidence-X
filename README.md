# SecureDoc - Legal & Investigation Document Management System
**Smart India Hackathon (SIH) Project • Problem Statement ID: SIH26190**

SecureDoc is an enterprise-grade, cryptographically secure Digital Document Management System designed specifically for law enforcement, judicial, and forensic investigation agencies.

---

## 🛡️ Key System Features

- **JWT Authentication & Role-Based Access Control**:
  - `ADMIN`: Full administrative control, user lookup & provisioning, case & evidence management.
  - `INVESTIGATOR`: Create investigation case files, ingest evidence documents, verify cryptographic signatures, OCR extraction, binary downloads.
  - `VIEWER`: Read-only access to inspect cases, verify SHA-256 hashes, extract OCR text, and download evidence streams.

- **Multipart Evidence Ingestion (`POST /api/documents`)**:
  - Secure upload supporting PDF, DOCX, TXT, and forensic image formats (PNG, JPG, TIFF).
  - Automatically computes 256-bit SHA-256 hash upon upload.
  - Triggers OCR text extraction and registers record into the PostgreSQL vault.

- **Cryptographic SHA-256 Integrity Verification (`GET /api/documents/{id}/verify`)**:
  - Performs live binary comparison between stored storage file bytes and database cryptographic signatures.
  - Visually flags **MATCH** (100% Intact / Verified) vs **MISMATCH** (Discrepancy detected).
  - Automatically logs every verification check into the audit trail.

- **OCR Text Extraction & Search (`GET /api/documents/{id}/ocr-test` & `/api/documents/search`)**:
  - Integrated with Tesseract OCR engine for text extraction.
  - In-modal search, word/character count, and text export (`.txt`).
  - Search engine querying titles and case reference numbers.

- **Immutable Audit Trail Ledger (`GET /api/audit/document/{id}`)**:
  - Chronological chain of custody tracking actions: `DOCUMENT_UPLOADED`, `DOCUMENT_VERIFIED`, `DOCUMENT_DOWNLOADED`.
  - Captures actor usernames, timestamps, case numbers, and verification logs.

---

## 🛠️ Technology Stack

- **Framework**: React 18 + Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS (Dark Cyber/Legal Enterprise Theme)
- **Icons**: Lucide React
- **HTTP Client**: Axios with Request & Response Interceptors
- **Routing**: React Router v6
- **Backend Communication**: REST APIs against Spring Boot (`http://localhost:8080`)

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- Node.js (v18 or newer)
- Spring Boot Backend running on `http://localhost:8080` (or configured port)

### 2. Installation
```bash
# Navigate to the frontend directory
cd securedoc-frontend

# Install dependencies
npm install
```

### 3. Environment Configuration
Create a `.env` file (or copy `.env.example`):
```env
VITE_API_BASE_URL=http://localhost:8080
```

### 4. Start Development Server
```bash
npm run dev
```
The frontend will start at `http://localhost:5173`.

### 5. Production Build
```bash
npm run build
```

---

## 🔐 Demo Credentials (Quick-Fill on Login)

| Role | Username | Password |
| :--- | :--- | :--- |
| **ADMIN** | `admin` | `admin123` |
| **INVESTIGATOR** | `investigator` | `investigator123` |
| **VIEWER** | `viewer` | `viewer123` |

*Note: New users can also be registered directly through the UI via the "Register new user credentials" link.*

---

## 📡 Backend API Endpoints Implemented

| Endpoint | Method | Role Restriction | Description |
| :--- | :--- | :--- | :--- |
| `/api/auth/login` | `POST` | Public | Authenticates user & returns JWT token |
| `/api/users` | `POST` | Public | Registers a new user account |
| `/api/users/username/{username}` | `GET` | `ADMIN` | Admin user directory lookup |
| `/api/cases` | `GET` | All Roles | Lists all registered cases |
| `/api/cases/{caseNumber}` | `GET` | All Roles | Retrieves specific case dossier |
| `/api/cases` | `POST` | `ADMIN`, `INVESTIGATOR` | Creates a new case file |
| `/api/documents` | `POST` | `ADMIN`, `INVESTIGATOR` | Multipart document upload |
| `/api/documents/case/{caseNumber}`| `GET` | All Roles | Lists documents linked to a case |
| `/api/documents/{id}` | `GET` | All Roles | Fetches single document metadata |
| `/api/documents/{id}/verify` | `GET` | All Roles | Verifies live SHA-256 hash |
| `/api/documents/{id}/download` | `GET` | All Roles | Streams binary file download |
| `/api/documents/{id}/ocr-test` | `GET` | All Roles | Returns OCR extracted text |
| `/api/documents/search?query=...` | `GET` | All Roles | Searches documents by title/case |
| `/api/audit/document/{documentId}` | `GET` | All Roles | Returns chronological audit logs |
