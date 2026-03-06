import { invoiceTools } from "./invoices";
import { paymentTools } from "./payments";
import { productTools } from "./products";
import { checkoutTools } from "./checkout";
import { polarTools } from "./polar";
import { settingsTools } from "./settings";
import { transactionTools } from "./transactions";
import { accountTools } from "./accounts";
import { reportTools } from "./reports";
import { budgetTools } from "./budget";
import { analyticsTools } from "./analytics";
import { spaceTools } from "./spaces";

export const allTools = {
  ...invoiceTools,
  ...paymentTools,
  ...productTools,
  ...checkoutTools,
  ...polarTools,
  ...settingsTools,
  ...transactionTools,
  ...accountTools,
  ...reportTools,
  ...budgetTools,
  ...analyticsTools,
  ...spaceTools,
};
