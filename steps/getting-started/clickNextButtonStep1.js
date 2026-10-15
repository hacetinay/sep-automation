import { Given, Then, When } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import {
  paymentPlanPage,
  startApplicationPage,
} from "../../globalPagesSetup.js";

const requiredPersonalDetails = {
  firstName: "Test",
  lastName: "Customer",
  email: "test.customer@example.com",
  phoneNumber: "5555555555",
};

async function completeRequiredPersonalDetails() {
  await startApplicationPage.enterFirstName(requiredPersonalDetails.firstName);
  await startApplicationPage.enterLastName(requiredPersonalDetails.lastName);
  await startApplicationPage.enterEmail(requiredPersonalDetails.email);
  await startApplicationPage.enterPhoneNumber(requiredPersonalDetails.phoneNumber);
}

When("user completes all personal details on step 1", async function () {
  await completeRequiredPersonalDetails();
  await startApplicationPage.selectHowDidYouHearAboutUs("email");
});

When("user completes the required personal details on step 1", async function () {
  await completeRequiredPersonalDetails();
});

When("user clicks the next button on step 1", async function () {
  await startApplicationPage.clickNextButton();
});

Then("the payment plan options are displayed on step 2", async function () {
  await expect(paymentPlanPage.chooseAPaymentPlanText).toBeVisible();
});
