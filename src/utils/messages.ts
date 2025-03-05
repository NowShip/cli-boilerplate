import chalk from "chalk";

export const welcomeMessage = () => {
  console.log(
    chalk.cyan(`
   _____ _      _____ 
  / ____| |    |_   _|
 | |    | |      | |  
 | |    | |      | |  
 | |____| |____ _| |_ 
  \\_____|______|_____|
`)
  );

  console.log(chalk.blue.bold("Welcome to the Modern Project CLI! 🚀"));
  console.log(
    chalk.dim("Your one-stop solution for creating awesome projects\n")
  );

  console.log(chalk.yellow("Available Templates:"));
  console.log(
    chalk.green("📦 npm-package  ") + chalk.dim("- Create a modern NPM package")
  );
  console.log(
    chalk.green("⚡️ Next.js     ") + chalk.dim("- Full-stack web application")
  );
  console.log(
    chalk.green("📚 Docs        ") + chalk.dim("- Documentation site\n")
  );

  console.log(chalk.yellow("Optional Features:"));
  console.log(
    chalk.magenta("🔐 BetterAuth  ") +
      chalk.dim("- Modern authentication solution")
  );
  console.log(
    chalk.magenta("💾 Database    ") + chalk.dim("- Drizzle ORM with Neon")
  );
  console.log(
    chalk.magenta("💰 Payments    ") + chalk.dim("- Lemonsqueezy integration")
  );
  console.log(
    chalk.magenta("📧 Email      ") + chalk.dim("- Resend email service\n")
  );

  console.log(chalk.dim("Let's create something amazing together! 🎨\n"));
};
