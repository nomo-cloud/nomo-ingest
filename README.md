# NOMO-INGEST

HTML to PDF conversion microservice for NOMO educational platform.

## Features

- 🚀 Fast PDF generation using wkhtmltopdf
- 📄 A4 format with customizable margins
- 🎨 High-quality output (300 DPI)
- 🔒 Secure with temporary file cleanup
- 📊 Health check endpoint
- ☁️ Optimized for Google Cloud Run

## API Endpoints

### `GET /health`

Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "service": "nomo-ingest",
  "version": "2.0.0",
  "timestamp": "2025-01-16T18:30:00.000Z"
}
```

### `POST /generate-pdf`

Generate PDF from HTML content.

**Request:**
```json
{
  "html": "<html><body><h1>Hello NOMO</h1></body></html>",
  "options": {
    "pageSize": "A4",
    "marginTop": "10mm",
    "marginRight": "10mm",
    "marginBottom": "10mm",
    "marginLeft": "10mm",
    "dpi": 300,
    "imageQuality": 94
  }
}
```

**Response:**
Binary PDF file with `Content-Type: application/pdf`

## Local Development
```bash
# Install dependencies
npm install

# Run server
npm start

# Development mode with auto-reload
npm run dev
```

## Docker
```bash
# Build image
docker build -t nomo-ingest .

# Run container
docker run -p 8080:8080 nomo-ingest

# Test
curl http://localhost:8080/health
```

## Deployment

Automatically deployed to Google Cloud Run via GitHub Actions on push to `main`.

**Endpoint:** `https://nomo-ingest-XXXXX-ew.a.run.app`

## Environment Variables

- `PORT` - Server port (default: 8080)
- `NODE_ENV` - Environment mode (production/development)

## License

MIT © 2025 NOMO CommV - Jaume López
