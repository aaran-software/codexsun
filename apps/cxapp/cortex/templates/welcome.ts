import {Application} from "../core/application";

export function registerWelcomeRoute(app: Application) {
    app.router.register("GET", "/", (_req, res) => {
        res.statusCode = 200;
        res.setHeader("Content-Type", "text/html; charset=utf-8");
        res.end(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>CodexSun Dashboard</title>
  <style>
    body {
      font-family: system-ui, sans-serif;
      margin: 0;
      padding: 2rem;
      background: #f8fafc;
      color: #1e293b;
    }
    h1 {
      text-align: center;
      margin-bottom: 2rem;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 1.5rem;
      max-width: 900px;
      margin: 0 auto;
    }
    .card {
      background: white;
      border-radius: 1rem;
      padding: 1.5rem;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      text-align: center;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }
    .card:hover {
      transform: translateY(-4px);
      box-shadow: 0 6px 10px rgba(0, 0, 0, 0.15);
    }
    .card a {
      text-decoration: none;
      color: #2563eb;
      font-weight: bold;
      font-size: 1.1rem;
    }
    .emoji {
      font-size: 2rem;
      margin-bottom: 0.5rem;
    }
  </style>
</head>
<body>
  <h1>👋 Welcome to CodexSun</h1>
  <div class="grid">
    <div class="card">
      <div class="emoji">📜</div>
      <a href="/routes">Explore Routes</a>
    </div>
    <div class="card">
      <div class="emoji">❤️</div>
      <a href="/hz">Health Check</a>
    </div>
    <div class="card">
      <div class="emoji">ℹ️</div>
      <a href="/info">System Info</a>
    </div>
    <div class="card">
      <div class="emoji">🌞</div>
      <a href="/cxsun">Hello CxSun</a>
    </div>
  </div>
</body>
</html>`);
    });


}