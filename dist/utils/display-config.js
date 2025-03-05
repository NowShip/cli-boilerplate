import chalk from "chalk";
export function displayProjectConfig(answers) {
    console.log(chalk.bold.green("\n📋 Your Project Configuration"));
    console.log(chalk.dim("━━━━━━━━━━━━━━━━━━━━━━━━━━━"));
    console.log(chalk.cyan("💾 Database: ") +
        (answers.DB
            ? chalk.green("✓ Drizzle ORM & Neon")
            : chalk.red("✗ No database")));
    console.log(chalk.cyan("🔐 Authentication: ") +
        (answers["better-auth"]
            ? chalk.green("✓ BetterAuth enabled")
            : chalk.red("✗ No authentication")));
    console.log(chalk.cyan("💳 Payments: ") +
        (answers.lemonsqueezy
            ? chalk.green("✓ Lemonsqueezy integrated")
            : chalk.red("✗ No payment system")));
    console.log(chalk.cyan("📧 Email Service: ") +
        (answers.resend
            ? chalk.green("✓ Resend configured")
            : chalk.red("✗ No email service")));
    console.log(chalk.dim("━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"));
}
