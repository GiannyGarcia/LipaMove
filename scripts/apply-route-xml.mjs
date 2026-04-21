import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const inner = fs.readFileSync(path.join(root, "new-route.xml"), "utf8").trim();
const dataPath = path.join(root, "data.xml");
const data = fs.readFileSync(dataPath, "utf8");
const next = data.replace(/<route_path>[\s\S]*?<\/route_path>/g, `            <route_path>\n${inner}\n            </route_path>`);
fs.writeFileSync(dataPath, next);
console.log("route_path blocks:", (data.match(/<route_path>/g) || []).length);
