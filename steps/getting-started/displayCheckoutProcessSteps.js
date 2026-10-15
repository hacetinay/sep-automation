import { Then } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import { startApplicationPage } from "../../globalPagesSetup.js";

const ACTIVE_STEP_BLUE = "rgb(1, 201, 255)";
const INACTIVE_STEP_GREY = "rgb(130, 154, 177)";

Then(
  "the checkout process displays Start Application, Payment plan, and Review steps in order",
  async function () {
    await expect(startApplicationPage.startApplicationStepCircle).toHaveText("1");
    await expect(startApplicationPage.startApplicationText).toHaveText(
      "Start Application"
    );
    await expect(startApplicationPage.paymentPlanStepCircle).toHaveText("2");
    await expect(startApplicationPage.paymentPlanText).toHaveText("Payment plan");
    await expect(startApplicationPage.reviewStepCircle).toHaveText("3");
    await expect(startApplicationPage.reviewText).toHaveText("Review");
  }
);


Then("the Start Application step is highlighted in blue", async function () {
  await expect(startApplicationPage.startApplicationStepCircle).toHaveCSS(
    "background-color",
    ACTIVE_STEP_BLUE
  );
});

Then(
  "the Payment plan and Review steps are displayed in grey",
  async function () {
    await expect(startApplicationPage.paymentPlanText).toHaveCSS(
      "color",
      INACTIVE_STEP_GREY
    );
    await expect(startApplicationPage.reviewText).toHaveCSS(
      "color",
      INACTIVE_STEP_GREY
    );
  }
);