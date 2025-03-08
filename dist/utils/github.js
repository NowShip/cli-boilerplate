var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Octokit } from "@octokit/rest";
import { Base64 } from "js-base64";
import fs from "fs";
import path from "path";
function getGithubToken() {
    return process.env.GITHUB_TOKEN || "";
}
function createOctokit() {
    const token = getGithubToken(); // This will throw if no token is found
    return new Octokit({ auth: token });
}
export function fetchBranches() {
    return __awaiter(this, void 0, void 0, function* () {
        let octokit;
        try {
            octokit = createOctokit();
        }
        catch (error) {
            throw error; // Re-throw the token error with the helpful message
        }
        const owner = "NowShip";
        const repo = "cli-boilerplate";
        try {
            const { data } = yield octokit.repos.listBranches({
                owner,
                repo,
            });
            const templateBranches = data.map((branch) => ({
                value: branch.name,
                label: branch.name.charAt(0).toUpperCase() +
                    branch.name.slice(1).replace(/-/g, " "),
            }));
            // Ensure we have at least one branch
            if (templateBranches.length === 0) {
                throw new Error("No template branches found in the repository");
            }
            return templateBranches;
        }
        catch (error) {
            console.error("Error details:", error);
            throw new Error(`Failed to fetch templates: ${error}`);
        }
    });
}
function fetchTemplateFromGithub(branch) {
    return __awaiter(this, void 0, void 0, function* () {
        const octokit = createOctokit();
        const owner = "NowShip";
        const repo = "cli-boilerplate";
        try {
            // Fetch all files from the branch recursively
            const { data: tree } = yield octokit.git.getTree({
                owner,
                repo,
                tree_sha: branch,
                recursive: "1",
            });
            const files = {};
            // Fetch content for each file
            for (const file of tree.tree) {
                if (file.type === "blob" && file.path) {
                    const { data } = yield octokit.git.getBlob({
                        owner,
                        repo,
                        file_sha: file.sha,
                    });
                    files[file.path] = Base64.decode(data.content);
                }
            }
            return files;
        }
        catch (error) {
            throw error;
        }
    });
}
export function generateFiles(projectName, branch) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Fetch template files from GitHub
            const templateFiles = yield fetchTemplateFromGithub(branch);
            const excludeFiles = [
                // Lock files and package manager files
                "package-lock.json",
                "pnpm-lock.yaml",
                "yarn.lock",
                "bun.lockb",
                ".pnp.js",
                ".pnp.cjs",
                // Directories to exclude
                "node_modules/",
                ".yarn/",
                // Config files that might contain lock information
                ".npmrc",
                ".yarnrc",
                ".pnpmrc",
            ];
            // Generate files in the project directory
            for (const [filePath, content] of Object.entries(templateFiles)) {
                // Skip excluded files
                if (excludeFiles.some((excludedFile) => filePath.includes(excludedFile))) {
                    continue;
                }
                const fullPath = path.join(process.cwd(), projectName, filePath);
                yield fs.promises.mkdir(path.dirname(fullPath), { recursive: true });
                yield fs.promises.writeFile(fullPath, content.replace(/\{\{projectName\}\}/g, projectName));
            }
        }
        catch (error) {
            throw error;
        }
    });
}
// Now fetch all the files from the selected branch and generate the files
