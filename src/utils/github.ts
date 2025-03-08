import { Octokit } from "@octokit/rest";
import { Base64 } from "js-base64";
import fs from "fs";
import path from "path";

function getGithubToken(): string {
  return process.env.GITHUB_TOKEN || "";
}

function createOctokit() {
  const token = getGithubToken(); // This will throw if no token is found
  return new Octokit({ auth: token });
}

export async function fetchBranches() {
  let octokit;
  try {
    octokit = createOctokit();
  } catch (error) {
    throw error; // Re-throw the token error with the helpful message
  }

  const owner = "NowShip";
  const repo = "cli-boilerplate";

  try {
    const { data } = await octokit.repos.listBranches({
      owner,
      repo,
    });

    const templateBranches = data.map((branch) => ({
      value: branch.name,
      label:
        branch.name.charAt(0).toUpperCase() +
        branch.name.slice(1).replace(/-/g, " "),
    }));

    // Ensure we have at least one branch
    if (templateBranches.length === 0) {
      throw new Error("No template branches found in the repository");
    }

    return templateBranches;
  } catch (error) {
    console.error("Error details:", error);
    throw new Error(`Failed to fetch templates: ${error}`);
  }
}

async function fetchTemplateFromGithub(branch: string) {
  const octokit = createOctokit();
  const owner = "NowShip";
  const repo = "cli-boilerplate";

  try {
    // Fetch all files from the branch recursively
    const { data: tree } = await octokit.git.getTree({
      owner,
      repo,
      tree_sha: branch,
      recursive: "1",
    });

    const files: { [key: string]: string } = {};

    // Fetch content for each file
    for (const file of tree.tree) {
      if (file.type === "blob" && file.path) {
        const { data } = await octokit.git.getBlob({
          owner,
          repo,
          file_sha: file.sha as string,
        });

        files[file.path] = Base64.decode(data.content);
      }
    }

    return files;
  } catch (error) {
    throw error;
  }
}

export async function generateFiles(projectName: string, branch: string) {
  try {
    // Fetch template files from GitHub
    const templateFiles = await fetchTemplateFromGithub(branch);

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
      if (
        excludeFiles.some((excludedFile) => filePath.includes(excludedFile))
      ) {
        continue;
      }

      const fullPath = path.join(process.cwd(), projectName, filePath);
      await fs.promises.mkdir(path.dirname(fullPath), { recursive: true });
      await fs.promises.writeFile(
        fullPath,
        content.replace(/\{\{projectName\}\}/g, projectName)
      );
    }
  } catch (error) {
    throw error;
  }
}

// Now fetch all the files from the selected branch and generate the files
