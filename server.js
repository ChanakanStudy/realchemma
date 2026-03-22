const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const PORT = 3000;
const DIR = __dirname;

const server = http.createServer((req, res) => {
  let filePath = path.join(DIR, req.url);
  
  // ถ้า request folder ให้ serve index.html
  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, 'index.html');
  }
  
  // ถ้าไม่ได้ specify file เสริม .html
  if (!filePath.includes('.')) {
    filePath += '.html';
  }
  
  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end('<h1>404 - File Not Found</h1>', 'utf-8');
      } else {
        res.writeHead(500);
        res.end(`Server Error: ${err}`, 'utf-8');
      }
    } else {
      // Set MIME types
      let contentType = 'text/html';
      if (filePath.endsWith('.js')) contentType = 'application/javascript';
      if (filePath.endsWith('.css')) contentType = 'text/css';
      if (filePath.endsWith('.json')) contentType = 'application/json';
      
      res.writeHead(200, { 
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': '*'
      });
      res.end(content, 'utf-8');
    }
  });
});

server.listen(PORT, () => {
  console.log(`🎮 CHEMMA Game Server running at http://localhost:${PORT}/frontend/`);
  console.log(`🧪 Backend running at http://localhost:8001/`);
  
  // Start the Python API backend automatically from node
  const backendPath = path.join(__dirname, 'backend');
  const pythonProcess = spawn('python3', ['-m', 'uvicorn', 'app.main:app', '--host', '0.0.0.0', '--port', '8001', '--reload'], {
    cwd: backendPath,
    stdio: 'inherit'
  });

  pythonProcess.on('error', (err) => {
    console.error('❌ Failed to start Python backend. Make sure python3, uvicorn are installed:', err);
  });
});
