# Using forms for user input

This guide builds on the Managing Data step of the Getting Started tutorial, Get started with a basic Angular app.

This section walks you through adding a form-based checkout feature to collect user information as part of checkout.

## Define the checkout form model

This step shows you how to set up the checkout form model in the component class.
The form model determines the status of the form.

1. Open `cart.component.ts`.

1. Import the `FormBuilder` service from the `@angular/forms` package.
  This service provides convenient methods for generating controls.
