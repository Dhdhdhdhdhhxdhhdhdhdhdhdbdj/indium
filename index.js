import express from "express";
import http from "node:http";
import path from "node:path";
import fs from 'fs';
import ip from 'ip';
import { join } from "node:path";
import { hostname } from "node:os";
import { createBareServer } from "@tomphttp/bare-server-node";
import request from "@cypress/request";

const __dirname = path.resolve();
const server = http.createServer();
const app = express(server);
const bareServer = createBareServer("/bare/");

app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);

app.use(express.static(path.join(__dirname, "static")));
app.get('/app', (req, res) => {
  res.sendFile(path.join(__dirname, './static/index.html'));
});
app.get('/!', (req, res) => {
  res.sendFile(path.join(__dirname, './static/loader.html'));
});
app.get('/~', (req, res) => {
  res.sendFile(path.join(__dirname, './static/apps.html'));
});
app.get('/0', (req, res) => {
  res.sendFile(path.join(__dirname, './static/gms.html'));
});
app.get('/=', (req, res) => {
  res.sendFile(path.join(__dirname, './static/settings.html'));
});
app.get('/mobile-lock', (req, res) => {
  res.sendFile(path.join(__dirname, './static/mobile.html'));
});
// app.get('/lessons', (req, res) => {
//   res.sendFile(path.join(__dirname, './static/agloader.html'));
// });
// app.get('/credits', (req, res) => {
//   res.sendFile(path.join(__dirname, './static/credits.html'));
// });
// app.get('/partners', (req, res) => {
//   res.sendFile(path.join(__dirname, './static/partners.html'));
// });
app.get("/worker.js", (req, res) => {
//   request("https://cdn.surfdoge.pro/worker.js", (error, response, body) => {
//     if (!error && response.statusCode === 200) {
//       res.setHeader("Content-Type", "text/javascript");
//       res.send(body);
//     } else {
//       res.status(500).send("Error fetching worker script");
//     }
//   });
res.sendFile(path.join(__dirname, './static/worker.js'));
});
app.use((req, res) => {
  res.statusCode = 404;
  res.sendFile(path.join(__dirname, './static/404.html'))
});

server.on("request", (req, res) => {
  if (bareServer.shouldRoute(req)) {
    bareServer.routeRequest(req, res);
  } else {
    app(req, res);
  }
});

server.on("upgrade", (req, socket, head) => {
  if (bareServer.shouldRoute(req)) {
    bareServer.routeUpgrade(req, socket, head);
  } else {
    socket.end();
  }
});

let port = parseInt(process.env.PORT || "");

if (isNaN(port)) port = 8000;

server.on("listening", async () => {
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const localVersion = packageJson.version;
    const versionTxt = fs.readFileSync('./static/version.txt', 'utf8').trim();

    if (localVersion !== versionTxt) {
      console.log('\x1b[32m[Indium] Update is available ' + versionTxt + '. Check the GitHub for more info.\x1b[0m');
      startServer();
    } else {
      console.log('\x1b[32m[Indium] Your up to date!\x1b[0m');
      startServer();
    }
  } catch (error) {
    console.error('\x1b[31mError checking for updates:', error, '\x1b[0m');
    startServer();
  }
});

function startServer() { 
  const address = server.address();
  const ipAddress = ip.address();
  console.log("Indium is running on:");
  console.log(`\thttp://localhost:${address.port}`);
  console.log(`\thttp://${hostname()}:${address.port}`);
  if (address.family === "IPv4") {
    console.log(`\thttp://${ipAddress}:${address.port}`);
  } else {
    console.log(`\thttp://${ipAddress}:${address.port}`);
  }
}

server.listen({
  port,
});

// process.on("SIGINT", shutdown);
// process.on("SIGTERM", shutdown);

// function shutdown() {
//   console.log("SIGTERM signal received: closing HTTP server");
//   server.close();
//   bareServer.forEach((bare) => bare.close());
//   process.exit(0);
// }