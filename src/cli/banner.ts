import chalk from "chalk";

export const BANNER = `
${chalk.green(`  ███████╗██╗███╗   ██╗ █████╗ ███╗   ██╗ ██████╗███████╗`)}
${chalk.green(`  ██╔════╝██║████╗  ██║██╔══██╗████╗  ██║██╔════╝██╔════╝`)}
${chalk.green(`  █████╗  ██║██╔██╗ ██║███████║██╔██╗ ██║██║     █████╗  `)}
${chalk.green(`  ██╔══╝  ██║██║╚██╗██║██╔══██║██║╚██╗██║██║     ██╔══╝  `)}
${chalk.green(`  ██║     ██║██║ ╚████║██║  ██║██║ ╚████║╚██████╗███████╗`)}
${chalk.green(`  ╚═╝     ╚═╝╚═╝  ╚═══╝╚═╝  ╚═╝╚═╝  ╚═══╝ ╚═════╝╚══════╝`)}
${chalk.dim(`  ──────────────────────────────────────────────────────`)}
${chalk.white.bold(`  Invoices`)} ${chalk.dim(`·`)} ${chalk.green(`Payments`)} ${chalk.dim(`·`)} ${chalk.yellow(`Revenue`)} ${chalk.dim(`·`)} ${chalk.magenta(`Products`)}
${chalk.dim(`  ──────────────────────────────────────────────────────`)}
`;

export function printBanner(): void {
  console.log(BANNER);
}
