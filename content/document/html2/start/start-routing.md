# Adding navigation

This guide builds on the first step of the Getting Started tutorial, Get started with a basic Angular app.

At this stage of development, the online store application has a basic product catalog.

In the following sections, you'll add the following features to the application:

*   Type a URL in the address bar to navigate to a corresponding product page
*   Click links on the page to navigate within your single-page application
*   Click the browser's back and forward buttons to navigate the browser history intuitively

## Associate a URL path with a component

The application already uses the Angular `Router` to navigate to the `ProductListComponent`.
This section shows you how to define a route to show individual product details.

1.  Generate a new component for product details.
    In the terminal generate a new `product-details` component by running the following command:

	```shell
    ng generate component product-details
	```

1.  In `app.module.ts`, add a route for product details, with a `path` of `products/:productId` and `ProductDetailsComponent` for the `component`.

