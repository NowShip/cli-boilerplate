var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { processTemplate } from "../utils/config.js";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Get the source directory by going up from dist to src
const sourceDir = path.join(__dirname, "..", "..", "src");
function createTemplateObject(dirPath) {
    const templates = {};
    const items = fs.readdirSync(dirPath);
    items.forEach((item) => {
        const fullPath = path.join(dirPath, item);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            templates[item] = {
                type: "dir",
                files: createTemplateObject(fullPath),
            };
        }
        else {
            templates[item] = {
                type: "file",
                content: fs.readFileSync(fullPath, "utf8"),
            };
        }
    });
    return templates;
}
// Replace the hardcoded template directory with folderName
export const generateFiles = (folderName, type) => __awaiter(void 0, void 0, void 0, function* () {
    yield new Promise((resolve) => setTimeout(resolve, 1000));
    try {
        const templateDir = path.join(sourceDir, `templates/${type}`);
        const output = createTemplateObject(templateDir);
        processTemplate(folderName, output);
    }
    catch (error) {
        console.error("❌ Error generating files:", error);
        throw error;
    }
});
