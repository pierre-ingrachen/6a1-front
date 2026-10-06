// Lance le back Spring Boot en chargeant le .env du back (compatible Windows / macOS / Linux)
const { spawn } = require("child_process")
const fs = require("fs")
const path = require("path")

const backDir = path.resolve(__dirname, "..", "..", "6a1-back")
const envFile = path.join(backDir, ".env")

if (!fs.existsSync(backDir)) {
  console.error(`Dossier du back introuvable : ${backDir}\nLes dépôts 6a1-front et 6a1-back doivent être côte à côte.`)
  process.exit(1)
}
if (!fs.existsSync(envFile)) {
  console.error(`Fichier .env manquant : ${envFile}\nCopiez .env.sample en .env et remplissez-le.`)
  process.exit(1)
}

const env = { ...process.env }
for (const line of fs.readFileSync(envFile, "utf8").split(/\r?\n/)) {
  const match = line.match(/^\s*([\w.]+)\s*=\s*(.*?)\s*$/)
  if (match && !line.trim().startsWith("#")) {
    env[match[1]] = match[2].replace(/^(['"])(.*)\1$/, "$2")
  }
}

const isWindows = process.platform === "win32"
const mvnw = isWindows ? "mvnw.cmd" : "./mvnw"
const child = spawn(mvnw, ["spring-boot:run"], { cwd: backDir, env, stdio: "inherit", shell: isWindows })
child.on("exit", (code) => process.exit(code ?? 0))
