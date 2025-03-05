import fs from "fs";
import path from "path";
export const processFiles = (basePath, template) => {
    if (template.type === "file" && template.content) {
        // Create parent directories if they don't exist
        fs.mkdirSync(path.dirname(basePath), { recursive: true });
        fs.writeFileSync(basePath, template.content);
    }
    else if (template.type === "dir" && template.files) {
        // Create directory
        fs.mkdirSync(basePath, { recursive: true });
        // Process all nested files/directories recursively
        Object.entries(template.files).forEach(([name, config]) => {
            const newPath = path.join(basePath, name);
            processFiles(newPath, config);
        });
    }
};
export function processTemplate(folderName, templates) {
    fs.mkdirSync(folderName, { recursive: true });
    // Process each template using the recursive function
    Object.entries(templates).forEach(([name, config]) => {
        const currentPath = path.join(folderName, name);
        processFiles(currentPath, config);
    });
    // Check if package.json exists and install dependencies
    // const packageJsonPath = path.join(folderName, "package.json");
    // if (fs.existsSync(packageJsonPath)) {
    //   try {
    //     console.log("\nInstalling dependencies...");
    //     execSync("npm install", {
    //       cwd: folderName,
    //       stdio: "inherit",
    //     });
    //     console.log("Dependencies installed successfully!");
    //   } catch (error) {
    //     console.error("Failed to install dependencies:", error);
    //   }
    // }
}
