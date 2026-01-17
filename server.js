const express = require('express');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const execPromise = promisify(exec);
const app = express();

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'nomo-ingest',
    version: '2.0.0',
    timestamp: new Date().toISOString()
  });
});

// Main PDF generation endpoint
app.post('/generate-pdf', async (req, res) => {
  const tempDir = path.join('/tmp', `pdf-${Date.now()}`);
  const htmlFile = path.join(tempDir, 'input.html');
  const pdfFile = path.join(tempDir, 'output.pdf');

  try {
    const { html, options = {} } = req.body;

    if (!html) {
      return res.status(400).json({ error: 'HTML content is required' });
    }

    // Create temp directory
    await fs.promises.mkdir(tempDir, { recursive: true });

    // Write HTML to file
    await fs.promises.writeFile(htmlFile, html, 'utf8');

    // Build wkhtmltopdf command with proper options
    const pdfOptions = {
      'page-size': options.pageSize || 'A4',
      'margin-top': options.marginTop || '10mm',
      'margin-right': options.marginRight || '10mm',
      'margin-bottom': options.marginBottom || '10mm',
      'margin-left': options.marginLeft || '10mm',
      'encoding': 'UTF-8',
      'dpi': options.dpi || 300,
      'image-quality': options.imageQuality || 94
    };

    // Build options string
    const optionsStr = Object.entries(pdfOptions)
      .map(([key, value]) => `--${key} ${value}`)
      .join(' ');

    // Add enable-local-file-access flag (no value)
    const command = `wkhtmltopdf ${optionsStr} --enable-local-file-access ${htmlFile} ${pdfFile}`;

    console.log('Executing:', command);

    // Execute wkhtmltopdf
    await execPromise(command);

    // Read PDF and send response
    const pdfBuffer = await fs.promises.readFile(pdfFile);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=output.pdf');
    res.send(pdfBuffer);

  } catch (error) {
    console.error('PDF Generation Error:', error);
    res.status(500).json({ 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  } finally {
    // Cleanup temp files
    try {
      if (fs.existsSync(tempDir)) {
        await fs.promises.rm(tempDir, { recursive: true, force: true });
      }
    } catch (cleanupError) {
      console.error('Cleanup error:', cleanupError);
    }
  }
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`✅ NOMO-INGEST running on port ${PORT}`);
  console.log(`📄 Health check: http://localhost:${PORT}/health`);
});
