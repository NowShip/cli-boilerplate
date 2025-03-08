#!/usr/bin/env node
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import "dotenv/config";
import chalk from "chalk";
import { existsSync } from "fs";
import fs from "fs";
import path from "path";
import { input } from "@inquirer/prompts";
import { select } from "@inquirer/prompts";
import { confirm } from "@inquirer/prompts";
import ora from "ora";
import boxen from "boxen";
import { welcomeMessage } from "./utils/messages.js";
import { fetchBranches, generateFiles } from "./utils/github.js";
import { exec } from "child_process";
welcomeMessage();
function getProjectConfig() {
    return __awaiter(this, void 0, void 0, function* () {
        // Get project name
        let projectName;
        let projectPath;
        while (true) {
            projectName = yield input({
                message: "What is the name of your project?",
                default: "my-project",
            });
            projectPath = path.join(process.cwd(), projectName);
            if (!existsSync(projectPath)) {
                break;
            }
            const shouldDelete = yield confirm({
                message: "A folder with this name already exists. Do you want to delete it?",
                default: false,
            });
            if (shouldDelete) {
                try {
                    yield fs.promises.rm(projectPath, { recursive: true, force: true });
                    break;
                }
                catch (error) {
                    console.log(chalk.red(`Failed to delete the folder: ${error.message}`));
                    continue;
                }
            }
            console.log(chalk.yellow("Please choose a different name."));
        }
        const spinner = ora({
            text: chalk.blue("🚀 Preparing your awesome project..."),
            spinner: "dots",
            color: "blue",
        }).start();
        let templateChoices;
        try {
            spinner.text = chalk.cyan("📦 Fetching template files...");
            templateChoices = yield fetchBranches();
            spinner.succeed("Templates loaded successfully!");
        }
        catch (error) {
            spinner.fail("Failed to load templates");
            throw error;
        }
        const selectedTemplate = yield select({
            message: "What type of project do you want to create?",
            choices: templateChoices,
        });
        const answers = {
            projectName,
            branch: selectedTemplate,
        };
        return answers;
    });
}
// Main execution
getProjectConfig()
    .then((answers) => __awaiter(void 0, void 0, void 0, function* () {
    const spinner = ora({
        text: chalk.blue("🚀 Preparing your awesome project..."),
        spinner: "dots",
        color: "blue",
    }).start();
    try {
        spinner.text = chalk.cyan("📦 Fetching template files...");
        yield generateFiles(answers.projectName, answers.branch);
        // Add git init
        exec(`git init ${answers.projectName}`);
        exec(`git add .`);
        exec(`git commit -m "Ready to ship!"`);
        spinner.succeed();
        // Project Created header with consistent spacing
        console.log(boxen(chalk.green.bold("Project Created! 🎉"), {
            padding: { top: 0, bottom: 0, left: 2, right: 2 },
            margin: { top: 1, bottom: 0, left: 3, right: 3 },
            borderStyle: "round",
            borderColor: "green",
            dimBorder: true,
        }));
        // Project info box
        console.log(boxen(`${chalk.cyan("📁 Location:")} ${chalk.gray(path.join(process.cwd(), answers.projectName))}
${chalk.cyan("🎯 Template:")} ${chalk.gray(answers.branch)}`, {
            padding: 1,
            margin: { top: 1, bottom: 1, left: 3, right: 3 },
            borderStyle: "round",
            borderColor: "cyan",
            dimBorder: true,
        }));
        // Next steps box
        console.log(boxen(chalk.bold("🚀 Next Steps:\n\n") +
            chalk.yellow(`  1. ${chalk.bold(`cd ${answers.projectName}`)}\n`) +
            chalk.yellow(`  2. ${chalk.bold("npm install")}\n`) +
            chalk.yellow(`  3. ${chalk.bold("npm run dev")}`), {
            padding: 1,
            margin: { top: 0, bottom: 1, left: 3, right: 3 },
            borderStyle: "round",
            borderColor: "yellow",
            dimBorder: true,
        }));
    }
    catch (error) {
        spinner.fail(chalk.red("❌ Oops! Something went wrong while creating your project"));
        throw error;
    }
}))
    .catch((error) => {
    if (error.isTtyError) {
        console.log(chalk.yellow("\nPrompt couldn't be rendered in the current environment."));
    }
    else {
        console.log(chalk.red("\nAn error occurred:"));
        console.log(chalk.red(error.message || error));
        console.log(chalk.yellow("\nProcess cancelled. Have a great day! 👋"));
    }
    process.exit(1);
});
