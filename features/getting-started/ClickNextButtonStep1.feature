@sep19
Feature: Click on the next button on step 1

    As a customer, I should be able to click on the next button on step 1 when I give valid information.

    #* AC1: The next button should take customers to step 2 when given valid information.
    #*              a. Test by providing all fields
    #*              b. Test by providing only the required fields
    

    Background:
        Given user is on the enrollment page

    @sep19-1
    Scenario: Continue to Step 2 after completing all personal details
        When user completes all personal details on step 1
        And user clicks the next button on step 1
        Then the payment plan options are displayed on step 2

    @sep19-2
    Scenario: Continue to Step 2 after completing only required personal details
        When user completes the required personal details on step 1
        And user clicks the next button on step 1
        Then the payment plan options are displayed on step 2
