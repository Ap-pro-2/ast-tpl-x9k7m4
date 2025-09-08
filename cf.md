Embed the widget
Learn how to add the Turnstile widget to your webpage using implicit or explicit rendering methods.

Prerequisites
Before you begin, you must have:

A Cloudflare account
A Turnstile widget with a sitekey
Access to edit your website's HTML
Basic knowledge of HTML and JavaScript
Process
Page load: The Turnstile script loads and scans for elements or waits for programmatic calls.
Widget rendering: Widgets are created and begin running challenges.
Token generation: When a challenge is completed, a token is generated.
Form integration: The token is made available via callbacks or hidden form fields.
Server validation: Your server receives the token and validates it using the Siteverify API.
Implicit rendering
Implicit rendering automatically scans your HTML for elements with the cf-turnstile class and renders widgets when the page loads.

Use cases
Cloudflare recommends using implicit rendering on the following scenarios:

You have simple implementations and want a quick integration.
You have static websites with straightforward forms.
You want widgets to appear immediately on pageload.
You do not need programmatic control of the widget.
Implementation
1. Add the Turnstile script
Add the Turnstile JavaScript API to your HTML.

<script
  src="https://challenges.cloudflare.com/turnstile/v0/api.js"
  async
  defer
></script>

Warning

The api.js file must be fetched from the exact URL shown above. Proxying or caching this file will cause Turnstile to fail when future updates are released.

2. Add widget elements
Add widget containers where you want the challenges to appear on your website.

<div class="cf-turnstile" data-sitekey="<YOUR-SITE-KEY>"></div>

3. Configure with data attributes
Customize your widgets using data attributes.

<div
  class="cf-turnstile"
  data-sitekey="<YOUR-SITE-KEY>"
  data-theme="light"
  data-size="normal"
  data-callback="onSuccess"
></div>

Complete implicit rendering examples by use case
Basic login form
Example
<!DOCTYPE html>
<html>
<head>
    <title>Login Form</title>
    <script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>
</head>
<body>
    <form action="/login" method="POST">
        <input type="text" name="username" placeholder="Username" required />
        <input type="password" name="password" placeholder="Password" required />

        <!-- Turnstile widget with basic configuration -->
        <div class="cf-turnstile" data-sitekey="<YOUR-SITE-KEY>"></div>
        <button type="submit">Log in</button>
    </form>

</body>
</html>

Advanced form with callbacks
Example
<form action="/contact" method="POST" id="contact-form">
  <input type="email" name="email" placeholder="Email" required />
  <textarea name="message" placeholder="Message" required></textarea>
  <!-- Widget with callbacks and custom configuration -->
  <div
    class="cf-turnstile"
    data-sitekey="<YOUR-SITE-KEY>"
    data-theme="auto"
    data-size="flexible"
    data-callback="onTurnstileSuccess"
    data-error-callback="onTurnstileError"
    data-expired-callback="onTurnstileExpired"
  ></div>
  <button type="submit" id="submit-btn" disabled>Send Message</button>
</form>

<script>
  function onTurnstileSuccess(token) {
    console.log("Turnstile success:", token);
    document.getElementById("submit-btn").disabled = false;
  }
  function onTurnstileError(errorCode) {
    console.error("Turnstile error:", errorCode);
    document.getElementById("submit-btn").disabled = true;
  }
  function onTurnstileExpired() {
    console.warn("Turnstile token expired");
    document.getElementById("submit-btn").disabled = true;
  }
</script>

Multiple widgets with different configurations
Example
<!-- Compact widget for newsletter signup -->
<form action="/newsletter" method="POST">
  <input type="email" name="email" placeholder="Email" />
  <div
    class="cf-turnstile"
    data-sitekey="<YOUR-SITE-KEY>"
    data-size="compact"
    data-action="newsletter"
  ></div>
  <button type="submit">Subscribe</button>
</form>

<!-- Normal widget for contact form -->
<form action="/contact" method="POST">
  <input type="text" name="name" placeholder="Name" />
  <input type="email" name="email" placeholder="Email" />
  <textarea name="message" placeholder="Message"></textarea>
  <div
    class="cf-turnstile"
    data-sitekey="<YOUR-SITE-KEY>"
    data-action="contact"
    data-theme="dark"
  ></div>
  <button type="submit">Send</button>
</form>

Automatic form integration
When you embed a Turnstile widget inside a <form> element, an invisible input field with the name cf-turnstile-response is automatically created. This field contains the verification token and gets submitted with your other form data.

<form action="/submit" method="POST">
  <input type="text" name="data" />
  <div class="cf-turnstile" data-sitekey="<YOUR-SITE-KEY>"></div>
  <!-- Hidden field automatically added: -->
  <!-- <input type="hidden" name="cf-turnstile-response" value="TOKEN_VALUE" /> -->
  <button type="submit">Submit</button>
</form>

Explicit rendering
Explicit rendering gives you programmatic control over when and how widgets are created using JavaScript functions.

Use cases
Cloudflare recommends using explicit rendering on the following scenarios:

You have dynamic websites and single-page applications (SPAs).
You need to control the timing of widget creation.
You want to conditionally render the widget based on visitor interactions.
You want multiple widgets with different configurations.
You have complex applications requiring widget lifecycle management.
Implementation
1. Add the script to your website with explicit rendering
<script
  src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
  defer
></script>

2. Create container elements
Create containers without the cf-turnstile class.

<div id="turnstile-container"></div>

3. Render the widgets programmatically
Call turnstile.render() when you are ready to create the widget.

const widgetId = turnstile.render("#turnstile-container", {
  sitekey: "<YOUR-SITE-KEY>",
  callback: function (token) {
    console.log("Success:", token);
  },
});

Complete explicit rendering examples by use case
Basic explicit implementation
Example
<!DOCTYPE html>
<html>
  <head>
    <title>Explicit Rendering</title>
    <script
      src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
      defer
    ></script>
  </head>
  <body>
    <form id="login-form">
      <input type="text" name="username" placeholder="Username" />
      <input type="password" name="password" placeholder="Password" />
      <div id="turnstile-widget"></div>
      <button type="submit">Login</button>
    </form>

    <script>
      window.onload = function () {
        turnstile.render("#turnstile-widget", {
          sitekey: "<YOUR-SITE-KEY>",
          callback: function (token) {
            console.log("Turnstile token:", token);
            // Handle successful verification
          },
          "error-callback": function (errorCode) {
            console.error("Turnstile error:", errorCode);
          },
        });
      };
    </script>
  </body>
</html>

Using onload callback
Example
<script
  src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit&onload=onTurnstileLoad"
  defer
></script>
<div id="widget-container"></div>
<script>
  function onTurnstileLoad() {
    turnstile.render("#widget-container", {
      sitekey: "<YOUR-SITE-KEY>",
      theme: "light",
      callback: function (token) {
        console.log("Challenge completed:", token);
      },
    });
  }
</script>

Advanced SPA implementation
Example
<div id="dynamic-form-container"></div>

<script src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"></script>

<script>
  class TurnstileManager {
    constructor() {
      this.widgets = new Map();
    }
    createWidget(containerId, config) {
      // Wait for Turnstile to be ready
      turnstile.ready(() => {
        const widgetId = turnstile.render(containerId, {
          sitekey: config.sitekey,
          theme: config.theme || "auto",
          size: config.size || "normal",
          callback: (token) => {
            console.log(`Widget ${widgetId} completed:`, token);
            if (config.onSuccess) config.onSuccess(token, widgetId);
          },
          "error-callback": (error) => {
            console.error(`Widget ${widgetId} error:`, error);
            if (config.onError) config.onError(error, widgetId);
          },
        });

        this.widgets.set(containerId, widgetId);
        return widgetId;
      });
    }
    removeWidget(containerId) {
      const widgetId = this.widgets.get(containerId);
      if (widgetId) {
        turnstile.remove(widgetId);
        this.widgets.delete(containerId);
      }
    }
    resetWidget(containerId) {
      const widgetId = this.widgets.get(containerId);
      if (widgetId) {
        turnstile.reset(widgetId);
      }
    }
  }

  // Usage
  const manager = new TurnstileManager();

  // Create a widget when user clicks a button
  document.getElementById("show-form-btn").addEventListener("click", () => {
    document.getElementById("dynamic-form-container").innerHTML = `
        <form>
            <input type="email" placeholder="Email" />
            <div id="turnstile-widget"></div>
            <button type="submit">Submit</button>
        </form>
    `;
    manager.createWidget("#turnstile-widget", {
      sitekey: "<YOUR-SITE-KEY>",
      theme: "dark",
      onSuccess: (token) => {
        // Handle successful verification
        console.log("Form ready for submission");
      },
    });
  });
</script>

Widget lifecycle management
Explicit rendering provides full control over the widget lifecycle.

// Render a widget
const widgetId = turnstile.render("#container", {
  sitekey: "<YOUR-SITE-KEY>",
  callback: handleSuccess,
});

// Get the current token
const token = turnstile.getResponse(widgetId);

// Check if widget is expired
const isExpired = turnstile.isExpired(widgetId);

// Reset the widget (clears current state)
turnstile.reset(widgetId);

// Remove the widget completely
turnstile.remove(widgetId);

Execution mode
Control when challenges run with execution modes.

// Render widget but don't run challenge yet
const widgetId = turnstile.render("#container", {
  sitekey: "<YOUR-SITE-KEY>",
  execution: "execute", // Don't auto-execute
});

// Later, run the challenge when needed
turnstile.execute("#container");

Configuration options
Both implicit and explicit rendering methods support the same configuration options. Refer to the table below for the most commonly used configurations.

Option	Description	Values
sitekey	Your widget's sitekey	Required string
theme	Visual theme	auto, light, dark
size	Widget size	normal, flexible, compact
callback	Success callback	Function
error-callback	Error callback	Function
execution	When to run the challenge	render, execute
appearance	When the widget is visible	always, execute, interaction-only
For a complete list of configuration options, refer to Widget configurations.

Testing
You can test your Turnstile widget on your webpage without triggering an actual Cloudflare Challenge by using a testing sitekey.

Refer to Testing for more information.

Security requirements
Server-side validation is mandatory. It is critical to enforce Turnstile tokens with the Siteverify API. The Turnstile token could be invalid, expired, or already redeemed. Not verifying the token will leave major vulnerabilities in your implementation. You must call Siteverify to complete your Turnstile configuration. Otherwise, it is incomplete and will result in zeroes for token validation when viewing your metrics in Turnstile Analytics.

Tokens expire after 300 seconds (5 minutes). Each token can only be validated once. Expired or used tokens must be replaced with fresh challenges.

Edit page
Last updated: Aug 20, 2025

Previous
Terraform
Widget configurations
Configure your Turnstile widget's appearance, behavior, and functionality using data attributes or JavaScript render parameters.

Rendering methods
Turnstile widgets can be implemented using implicit or explicit rendering.

Implicit rendering
Explicit rendering
Implicit rendering automatically scans your HTML for elements with the cf-turnstile class and renders the widget when the page loads. It is best used for simple implementations, static websites, or when you want widgets to appear immediately on page load.

How it works

Add the Turnstile script to your page.
Include <div class="cf-turnstile" data-sitekey="your-key"></div> elements.
Widgets will render automatically when the page loads.
Configure the widget using data-* attributes on the HTML element.
Example
  <script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>
  <div class="cf-turnstile" data-sitekey="<YOUR-SITE-KEY>" data-theme="light"></div>

Widget sizes
The Turnstile widget can have two different fixed sizes or a flexible width size when using the Managed or Non-Interactive modes.

Size	Width	Height	Use case
Normal	300px	65px	Standard implementation
Flexible	100% (min: 300px)	65px	Responsive design
Compact	150px	140px	Space-constrained layouts
normal: The default size works well for most desktop and mobile layouts. Use this if you have adequate horizontal space on your website or form.
flexible: Automatically adapts to the container width while maintaining minimum usability. Use this for responsive designs that need to work across all screen sizes.
compact: Ideal for mobile interfaces, sidebars, or any space where horizontal space is limited. The compact widget is taller than normal to accommodate the smaller width.
Note

Widget size only applies to Managed and Non-Interactive modes. Invisible widgets have no visual footprint regardless of size configuration.

Implicit rendering
Explicit rendering
Normal size (default)
  <div class="cf-turnstile" data-sitekey="<YOUR-SITE-KEY>"></div>

Flexible size
  <div class="cf-turnstile" data-sitekey="<YOUR-SITE-KEY>" data-size="flexible"></div>

Compact size
  <div class="cf-turnstile" data-sitekey="<YOUR-SITE-KEY>" data-size="compact"></div>

Theme options
Customize the widget's visual appearance to match your website's design.

auto (default): Automatically matches the visitor's system theme preference. Auto is recommended for most implementations as it respects the visitor's preferences and provides the best accessibility experience.
light: Light theme with bright colors and clear contrast. Light theme works best on bright backgrounds and provides high contrast for readability.
dark: Dark theme optimized for dark interfaces. Dark theme is ideal for dark interfaces, gaming sites, or applications with dark color schemes.
Implicit rendering
Explicit rendering
Auto theme (default)
  <div class="cf-turnstile" data-sitekey="<YOUR-SITE-KEY>"></div>

Light theme
  <div class="cf-turnstile" data-sitekey="<YOUR-SITE-KEY>" data-theme="light"></div>

Dark theme
  <div class="cf-turnstile" data-sitekey="<YOUR-SITE-KEY>" data-theme="dark"></div>

Appearance modes
Control when the widget becomes visible to visitors using the appearance mode.

always (default): The widget is always visible from page load. This is the best option for most implementations where you want your visitors to see the widget immediately as it provides clear visual feedback that security verification is in place.
execute: The widget only becomes visible after the challenge begins. This is useful for when you need to control the timing of widget appearance, such as showing it only when a visitor starts filling out a form or selecting a submit button.
interaction-only: The widget becomes visible only when visitor interaction is required and provides the cleanest visitor experience. Most visitors will never see the widget, but suspected bots will encounter the interactive challenge.
Note

Appearance modes only affect visible widget types (Managed and Non-Interactive). Invisible widgets are never shown regardless of the appearance setting.

Implicit rendering
Explicit rendering
Always visible (default)
  <div class="cf-turnstile" data-sitekey="<YOUR-SITE-KEY>"></div>

Visible only after challenge begins
  <div class="cf-turnstile" data-sitekey="<YOUR-SITE-KEY>" data-appearance="execute"></div>

Visible only when interaction is needed
  <div class="cf-turnstile" data-sitekey="<YOUR-SITE-KEY>" data-appearance="interaction-only"></div>

Execution modes
Control when the challenge runs and a token is generated.

render (default): The challenge runs automatically after calling the render() function and provides immediate protection as soon as the widget loads. The challenge runs in the background while the page loads, ensuring the token is ready when the visitor submits data.

execute: The challenge runs after calling the turnstile.execute() function separately and gives you precise control over when verification occurs. This option is useful for multi-step forms, conditional verification, or when you want to defer the challenge until the visitor actually attempts to submit data. This can improve page load performance and visitor experience by only running verification when needed.

Common scenarios

Multi-step forms: Run verification only on the final step.
Conditional protection: Only verify visitors who meet certain criteria.
Performance optimization: Defer verification to reduce initial page load time.
User-triggered verification: Let visitors manually start the verification process.
Implicit rendering
Explicit rendering
Auto execution (default)
  <div class="cf-turnstile" data-sitekey="<YOUR-SITE-KEY>"></div>

Manual execution
  <div class="cf-turnstile" data-sitekey="<YOUR-SITE-KEY>" data-execution="execute"></div>

Language configuration
Set the language for the widget interface.

auto (default): Uses the visitor's browser language preference.
Specific language codes: ISO 639-1 two-letter codes, such as es, fr, de.
Language and region: Combined codes for regional variants, such as en-US, es-MX, pt-BR.
Notes

When set to auto, Turnstile automatically detects the visitor's preferred language from their browser settings.
If a requested language is not supported, Turnstile falls back to English.
Language affects all visitor-facing text including loading messages, error states, and accessibility labels.
Setting specific languages can improve visitor experience for international audiences.
Implicit rendering
Explicit rendering
Auto language (default)
  <div class="cf-turnstile" data-sitekey="<YOUR-SITE-KEY>"></div>

Specific language
  <div class="cf-turnstile" data-sitekey="<YOUR-SITE-KEY>" data-language="es"></div>

Language and country
  <div class="cf-turnstile" data-sitekey="<YOUR-SITE-KEY>" data-language="en-US"></div>

Callback configuration
Handle widget events with callbacks.

callback: Triggered when the challenge is successfully completed.
error-callback: Triggered when an error occurs during the challenge.
expired-callback: Triggered when a token expires (before timeout).
timeout-callback: Triggered when an interactive challenge times out.
The success callback receives a token that must be validated on your server using the Siteverify API. Tokens are single-use and expire after 300 seconds (five minutes).

Implicit rendering
Explicit rendering
  <div class="cf-turnstile"
    data-sitekey="<YOUR-SITE-KEY>"
    data-callback="onSuccess"
    data-error-callback="onError"
    data-expired-callback="onExpired"
    data-timeout-callback="onTimeout"></div>
  <script>
  function onSuccess(token) {
  console.log('Challenge Success:', token);
  }
  function onError(errorCode) {
  console.log('Challenge Error:', errorCode);
  }
  function onExpired() {
  console.log('Token expired');
  }
  function onTimeout() {
  console.log('Challenge timed out');
  }
  </script>

Best practices
Always implement the success callback to handle the token and proceed with form submission or next steps.
Use error callbacks for graceful error handling and visitor feedback.
Monitor expired tokens to refresh challenges before they become invalid.
Handle timeouts to guide visitors through challenge resolution.
Advanced configuration options
Retry behavior
Control how Turnstile handles failed challenges.

auto (default): Automatically retries failed challenges. Auto retry provides better visitor experience by automatically recovering from temporary network issues or processing errors.
never: Disables automatic retry. This requires manual intervention and gives you full control over error handling in applications that need custom retry logic.
retry-interval: Controls the time between retry attempts (default: 8000ms) and lets you balance between quick recovery and server load.
Auto retry (default)
<div class="cf-turnstile" data-sitekey="<YOUR-SITE-KEY>"></div>

Disable retry
<div class="cf-turnstile" data-sitekey="<YOUR-SITE-KEY>" data-retry="never"></div>

Custom retry interval (8000ms default)
<div class="cf-turnstile" data-sitekey="<YOUR-SITE-KEY>" data-retry-interval="0000"></div>

Refresh behavior
Control how Turnstile handles token expiration and interactive timeouts.

refresh-expired: Controls behavior when tokens expire (auto, manual, never).
refresh-timeout: Controls behavior when interactive challenges timeout (auto, manual, never).
Benefits
auto refresh provides seamless visitor experience but uses more resources.
manual refresh gives visitors control but requires them to take action.
never refresh requires your application to handle all refresh logic.
Different strategies can be used for token expiration versus interactive timeouts based on your visitor experience requirements.

Auto refresh expired tokens (default)
<div class="cf-turnstile" data-sitekey="<YOUR-SITE-KEY>"></div>

Manual refresh
<div class="cf-turnstile" data-sitekey="<YOUR-SITE-KEY>" data-refresh-expired="manual"></div>

Auto refresh timeouts (default for Managed mode)
<div class="cf-turnstile" data-sitekey="<YOUR-SITE-KEY>" data-refresh-timeout="auto"></div>

Custom data
Add custom identifiers and data to your challenges.

action: A custom identifier for analytics and differentiation (maximum 32 characters).
cData: Custom payload data returned during validation (maximum 255 characters).
Use cases
Action tracking: Differentiate between login, signup, contact forms, and more. in your analytics.
Visitor context: Pass visitor IDs, session information, or other contextual data.
A/B testing: Track different widget configurations or page variants.
Fraud detection: Include additional context for risk assessment.
Warning

Both action and cData fields only accept alphanumeric characters, underscores (_), and hyphens (-).

Add custom action identifier
<div class="cf-turnstile" data-sitekey="<YOUR-SITE-KEY>" data-action="login"></div>

Add custom data payload
<div class="cf-turnstile" data-sitekey="<YOUR-SITE-KEY>" data-cdata="user-cdata"></div>

Form integration
Configure how Turnstile integrates with HTML forms.

When enabled, Turnstile automatically creates a hidden <input> element with the verification token. This gets submitted along with your other form data, making server-side validation straightforward.

response-field: Determines whether to create a hidden form field with the token (default: true)
response-field-name: Custom name for the hidden form field (default: cf-turnstile-response)
Benefits
Automatic form integration means that the token is included when the form is submitted, requiring no additional JavaScript.
Custom field names helps avoid conflicts with existing form fields.
Disabled response fields give you full control over token handling for complex form scenarios.
Custom response field name
<div class="cf-turnstile" data-sitekey="<YOUR-SITE-KEY>" data-response-field-name="turnstile-token"></div>

Disable response field
<div class="cf-turnstile" data-sitekey="<YOUR-SITE-KEY>" data-response-field="false"></div>

Complete configuration reference
JavaScript Render Parameters	Data Attribute	Description
sitekey	data-sitekey	Every widget has a sitekey. This sitekey is associated with the corresponding widget configuration and is created upon the widget creation.
action	data-action	A customer value that can be used to differentiate widgets under the same sitekey in analytics and which is returned upon validation. This can only contain up to 32 alphanumeric characters including _ and -.
cData	data-cdata	A customer payload that can be used to attach customer data to the challenge throughout its issuance and which is returned upon validation. This can only contain up to 255 alphanumeric characters including _ and -.
callback	data-callback	A JavaScript callback invoked upon success of the challenge. The callback is passed a token that can be validated.
error-callback	data-error-callback	A JavaScript callback invoked when there is an error (e.g. network error or the challenge failed). Refer to Client-side errors.
execution	data-execution	Execution controls when to obtain the token of the widget and can be on render (default) or on execute. Refer to Execution Modes for more information.
expired-callback	data-expired-callback	A JavaScript callback invoked when the token expires and does not reset the widget.
before-interactive-callback	data-before-interactive-callback	A JavaScript callback invoked before the challenge enters interactive mode.
after-interactive-callback	data-after-interactive-callback	A JavaScript callback invoked when challenge has left interactive mode.
unsupported-callback	data-unsupported-callback	A JavaScript callback invoked when a given client/browser is not supported by Turnstile.
theme	data-theme	The widget theme. Can take the following values: light, dark, auto.

The default is auto, which respects the visitor preference. This can be forced to light or dark by setting the theme accordingly.
language	data-language	Language to display, must be either: auto (default) to use the language that the visitor has chosen, or an ISO 639-1 two-letter language code (e.g. en) or language and country code (e.g. en-US). Refer to the list of supported languages for more information.
tabindex	data-tabindex	The tabindex of Turnstile's iframe for accessibility purposes. The default value is 0.
timeout-callback	data-timeout-callback	A JavaScript callback invoked when the challenge presents an interactive challenge but was not solved within a given time. A callback will reset the widget to allow a visitor to solve the challenge again.
response-field	data-response-field	A boolean that controls if an input element with the response token is created, defaults to true.
response-field-name	data-response-field-name	Name of the input element, defaults to cf-turnstile-response.
size	data-size	The widget size. Can take the following values: normal, flexible, compact.
retry	 data-retry	Controls whether the widget should automatically retry to obtain a token if it did not succeed. The default is auto, which will retry automatically. This can be set to never to disable retry on failure.
retry-interval	 data-retry-interval	When retry is set to auto, retry-interval controls the time between retry attempts in milliseconds. Value must be a positive integer less than 900000, defaults to 8000.
refresh-expired	 data-refresh-expired	Automatically refreshes the token when it expires. Can take auto, manual, or never, defaults to auto.
refresh-timeout	data-refresh-timeout	Controls whether the widget should automatically refresh upon entering an interactive challenge and observing a timeout. Can take auto (automatically refreshes upon encountering an interactive timeout), manual (prompts the visitor to manually refresh) or never (will show a timeout), defaults to auto. Only applies to widgets of Managed mode.
appearance	data-appearance	Appearance controls when the widget is visible. It can be always (default), execute, or interaction-only. Refer to Appearance modes for more information.
feedback-enabled	data-feedback-enabled	Allows Cloudflare to gather visitor feedback upon widget failure. It can be true (default) or false.
Examples
Responsive design widget
<div style="max-width: 500px;">
  <div class="cf-turnstile" data-sitekey=<YOUR-SITE-KEY> data-size="flexible" data-theme="auto"></div>
</div>

Mobile-optimized compact widget
<div class="cf-turnstile" data-sitekey=<YOUR-SITE-KEY> data-size="compact" data-theme="light" data-language="en">
</div>



Validate the token
Learn how to securely validate Turnstile tokens on your server using the Siteverify API.

Mandatory server-side validation

You must call Siteverify API to complete your Turnstile configuration. The client-side widget alone does not provide protection.

You must validate tokens on your server because tokens can be forged by attackers, expire after 5 minutes (300 seconds), and are single-use and cannot be validated twice.

Client-side verification alone leaves major security vulnerabilities.

Process
Client generates token: Visitor completes Turnstile challenge on your webpage.
Token sent to server: Form submission includes the Turnstile token.
Server validates token: Your server calls Cloudflare's Siteverify API.
Cloudflare responds: Returns success or failure and additional data.
Server takes action: Allow or reject the original request based on validation.
Siteverify API overview
Endpoint
POST https://challenges.cloudflare.com/turnstile/v0/siteverify

Request format
The API accepts both application/x-www-form-urlencoded and application/json requests, but always returns JSON responses.

Required parameters
Parameter	Required	Description
secret	Yes	Your widget's secret key from the Cloudflare dashboard
response	Yes	The token from the client-side widget
remoteip	No	The visitor's IP address
idempotency_key	No	UUID for retry protection
Token characteristics
Maximum length: 2048 characters
Validity period: 300 seconds (5 minutes) from generation
Single use: Each token can only be validated once
Automatic expiry: Tokens automatically expire and cannot be reused
Basic validation examples
Form Data
JSON
PHP
Python
Java
C#
  const SECRET_KEY = 'your-secret-key';

async function validateTurnstile(token, remoteip) {
const formData = new FormData();
formData.append('secret', SECRET_KEY);
formData.append('response', token);
formData.append('remoteip', remoteip);

      try {
          const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
              method: 'POST',
              body: formData
          });

          const result = await response.json();
          return result;
      } catch (error) {
          console.error('Turnstile validation error:', error);
          return { success: false, 'error-codes': ['internal-error'] };
      }

}

// Usage in form handler
async function handleFormSubmission(request) {
const body = await request.formData();
const token = body.get('cf-turnstile-response');
const ip = request.headers.get('CF-Connecting-IP') ||
request.headers.get('X-Forwarded-For') ||
'unknown';

      const validation = await validateTurnstile(token, ip);

      if (validation.success) {
          // Token is valid - process the form
          console.log('Valid submission from:', validation.hostname);
          return processForm(body);
      } else {
          // Token is invalid - reject the submission
          console.log('Invalid token:', validation['error-codes']);
          return new Response('Invalid verification', { status: 400 });
      }

}

Advanced validation techniques
Idempotency keys for retry operation
const crypto = require("crypto");

async function validateWithRetry(token, remoteip, maxRetries = 3) {
  const idempotencyKey = crypto.randomUUID();

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const formData = new FormData();
      formData.append("secret", SECRET_KEY);
      formData.append("response", token);
      formData.append("remoteip", remoteip);
      formData.append("idempotency_key", idempotencyKey);

      const response = await fetch(
        "https://challenges.cloudflare.com/turnstile/v0/siteverify",
        {
          method: "POST",
          body: formData,
        },
      );

      const result = await response.json();

      if (response.ok) {
        return result;
      }

      // If this is the last attempt, return the error
      if (attempt === maxRetries) {
        return result;
      }

      // Wait before retrying (exponential backoff)
      await new Promise((resolve) =>
        setTimeout(resolve, Math.pow(2, attempt) * 1000),
      );
    } catch (error) {
      if (attempt === maxRetries) {
        return { success: false, "error-codes": ["internal-error"] };
      }
    }
  }
}

Enhanced validation with custom checks
async function validateTurnstileEnhanced(
  token,
  remoteip,
  expectedAction = null,
  expectedHostname = null,
) {
  const validation = await validateTurnstile(token, remoteip);

  if (!validation.success) {
    return {
      valid: false,
      reason: "turnstile_failed",
      errors: validation["error-codes"],
    };
  }

  // Check if action matches expected value (if specified)
  if (expectedAction && validation.action !== expectedAction) {
    return {
      valid: false,
      reason: "action_mismatch",
      expected: expectedAction,
      received: validation.action,
    };
  }

  // Check if hostname matches expected value (if specified)
  if (expectedHostname && validation.hostname !== expectedHostname) {
    return {
      valid: false,
      reason: "hostname_mismatch",
      expected: expectedHostname,
      received: validation.hostname,
    };
  }

  // Check token age (warn if older than 4 minutes)
  const challengeTime = new Date(validation.challenge_ts);
  const now = new Date();
  const ageMinutes = (now - challengeTime) / (1000 * 60);

  if (ageMinutes > 4) {
    console.warn(`Token is ${ageMinutes.toFixed(1)} minutes old`);
  }

  return {
    valid: true,
    data: validation,
    tokenAge: ageMinutes,
  };
}

// Usage
const result = await validateTurnstileEnhanced(
  token,
  remoteip,
  "login", // expected action
  "example.com", // expected hostname
);

if (result.valid) {
  // Process the request
  console.log("Validation successful:", result.data);
} else {
  // Handle validation failure
  console.log("Validation failed:", result.reason);
}

API response format
Successful response
Failed response
Example
{
  "success": true,
  "challenge_ts": "2022-02-28T15:14:30.096Z",
  "hostname": "example.com",
  "error-codes": [],
  "action": "login",
  "cdata": "sessionid-123456789",
  "metadata": {
    "ephemeral_id": "x:9f78e0ed210960d7693b167e"
  }
}

Response fields
Field	Description
success	Boolean indicating if validation was successful
challenge_ts	ISO timestamp when the challenge was solved
hostname	Hostname where the challenge was served
error-codes	Array of error codes (if validation failed)
action	Custom action identifier from client-side
cdata	Custom data payload from client-side
metadata.ephemeral_id	Device fingerprint ID (Enterprise only)
Error codes reference
Error code	Description	Action required
missing-input-secret	Secret parameter not provided	Ensure secret key is included
invalid-input-secret	Secret key is invalid or expired	Check your secret key in the Cloudflare dashboard
missing-input-response	Response parameter was not provided	Ensure token is included
invalid-input-response	Token is invalid, malformed, or expired	User should retry the challenge
bad-request	Request is malformed	Check request format and parameters
timeout-or-duplicate	Token has already been validated	Each token can only be used once
internal-error	Internal error occurred	Retry the request
Implementation
Example implementation
class TurnstileValidator {
  constructor(secretKey, timeout = 10000) {
    this.secretKey = secretKey;
    this.timeout = timeout;
  }

  async validate(token, remoteip, options = {}) {
    // Input validation
    if (!token || typeof token !== "string") {
      return { success: false, error: "Invalid token format" };
    }

    if (token.length > 2048) {
      return { success: false, error: "Token too long" };
    }

    // Prepare request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const formData = new FormData();
      formData.append("secret", this.secretKey);
      formData.append("response", token);

      if (remoteip) {
        formData.append("remoteip", remoteip);
      }

      if (options.idempotencyKey) {
        formData.append("idempotency_key", options.idempotencyKey);
      }

      const response = await fetch(
        "https://challenges.cloudflare.com/turnstile/v0/siteverify",
        {
          method: "POST",
          body: formData,
          signal: controller.signal,
        },
      );

      const result = await response.json();

      // Additional validation
      if (result.success) {
        if (
          options.expectedAction &&
          result.action !== options.expectedAction
        ) {
          return {
            success: false,
            error: "Action mismatch",
            expected: options.expectedAction,
            received: result.action,
          };
        }

        if (
          options.expectedHostname &&
          result.hostname !== options.expectedHostname
        ) {
          return {
            success: false,
            error: "Hostname mismatch",
            expected: options.expectedHostname,
            received: result.hostname,
          };
        }
      }

      return result;
    } catch (error) {
      if (error.name === "AbortError") {
        return { success: false, error: "Validation timeout" };
      }

      console.error("Turnstile validation error:", error);
      return { success: false, error: "Internal error" };
    } finally {
      clearTimeout(timeoutId);
    }
  }
}

// Usage
const validator = new TurnstileValidator(process.env.TURNSTILE_SECRET_KEY);

const result = await validator.validate(token, remoteip, {
  expectedAction: "login",
  expectedHostname: "example.com",
});

if (result.success) {
  // Process the request
} else {
  // Handle failure
  console.log("Validation failed:", result.error);
}

Testing
You can test the dummy token generated with testing sitekey via Siteverify API with the testing secret key. Your production secret keys will reject dummy tokens.

Refer to Testing for more information.

Best practices
Security
Store your secret keys securely. Use environment variables or secure key management.
Validate the token on every request. Never trust client-side validation alone.
Check additional fields. Validate the action and hostname when specified.
Monitor for abuse and log failed validations and unusual patterns.
Use HTTPS. Always validate over secure connections.
Performance
Set reasonable timeouts. Do not wait indefinitely for Siteverify responses.
Implement retry logic and handle temporary network issues.
Cache validation results for the same token, if it is needed for your flow.
Monitor your API latency. Track the Siteverify response time.
Error handling
Have fallback behavior for API failures.
Use user-friendly messaging. Do not expose internal error details to users.
Properly log errors for debugging without exposing secrets.
Rate limit to protect against validation flooding.
Edit page
Last updated: Aug 20, 2025

Previous
Widget configurationsHostname management
You can associate hostnames with your widget to control where it can be used using Hostname Management. Managing your hostnames ensures that Turnstile works seamlessly with your setup, whether you add standalone hostnames or leverage zones registered to your Cloudflare account.

Hostname limits
By default, a widget can have a maximum of 15 hostnames for Free users and 200 hostnames for Enterprise customers. Each widget requires at least one hostname to be entered. You will not be able to create the widget without a hostname configured.

Availability
Customers with Enterprise Bot Management or Enterprise Turnstile may create and use a widget without entering any hostnames, or have up to 200 hostnames associated with a widget. Contact your account team for access to this feature.

Add a custom hostname
You can add a hostname to your Turnstile widget even if it is not on the Cloudflare network or registered as a zone. There are no prerequisites for using Turnstile.

To add a custom hostname:

In the Cloudflare dashboard, go to the Turnstile page.

Go to
Turnstile
On an existing widget, select Settings.

Select Add Hostnames under Hostname Management.

Add a custom hostname or choose from an existing hostname.

Select Add.

Add hostnames with a registered zone
If you already have a zone registered with Cloudflare, you can add hostnames during the Turnstile widget setup. You will see all zones registered to your account, where you can select the relevant hostname from the list, and it will be added to your Turnstile widget seamlessly.

Hostname requirements
Warning

Customers enabling client-side rendering must validate their hostnames by looking at the hostname field in the Siteverify response.

When associating hostnames with a widget, follow these requirements:

Hostnames must be fully qualified domain names (FQDNs), such as example.com or subdomain.example.com.
Wildcards are not supported. Specify each hostname you want Turnstile to work on.
The hostname should not include:
A scheme (for example, http:// or https://)
A port (for example, 443)
A path (for example, /path)
Subdomain specification
Specifying a subdomain is optional, but it can be used to further restrict the widget. For example, adding www.example.com as a hostname will allow widgets to work on:

www.example.com
abc.www.example.com:8080
However, it will not work on the following hostnames:

example.com
dash.example.com
cloudflare.com
Note

If the widget is embedded on a hostname not listed, it will display an error message.

Optional hostname validation (Enterprise only)
Customers with Enterprise Bot Management or Enterprise Turnstile can have the optional any hostname validation entitlement.

By default, a widget requires at least one hostname to be entered. With this feature, you can create and use a widget without entering any hostnames for the widget.

Contact your account team to enable this feature.


Protect your forms
Last reviewed: 3 months ago
This tutorial will guide you through integrating Cloudflare Turnstile to protect your web forms, such as login, signup, or contact forms. Learn how to implement the Turnstile widget on the client side and verify the Turnstile token via the Siteverify API on the server side.

Before you begin
You must have a Cloudflare account.
You must have a web application with a form you want to protect.
You must have basic knowledge of HTML and your server-side language of choice, such as Node.js or Python.
Get Your Turnstile sitekey and secret key
In the Cloudflare dashboard, go to the Turnstile page.

Go to
Turnstile
Create a new Turnstile widget.

Copy the sitekey and the secret key to use in the next step.

Add the Turnstile widget to your HTML form
Add the Turnstile widget to your form.
Replace <YOUR-SITE-KEY> with the sitekey from Cloudflare.
Add a data-callback attribute to the Turnstile widget div. This JavaScript function will be called when the challenge is successful.
Ensure your submit button is initially disabled.
Example
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Contact Form</title>
    <script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>
    <script>
        function enableSubmit() {
            document.getElementById("submit-button").disabled = false;
        }
    </script>
</head>
<body>
    <form id="contact-form" action="/submit" method="POST">
        <input type="text" name="name" placeholder="Name" required>
        <input type="email" name="email" placeholder="Email" required>
        <textarea name="message" placeholder="Message" required></textarea>

        <!-- Turnstile widget -->
        <div class="cf-turnstile" data-sitekey="<YOUR-SITE-KEY>" data-callback="enableSubmit"></div>

        <button type="submit" id="submit-button" disabled>Submit</button>
    </form>
</body>
</html>

Verify the Turnstile token on the server side
You will need to verify the Turnstile token sent from the client side. Below is an example in Node.js.

Node.js example
const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));

app.post('/submit', async (req, res) => {
    const turnstileToken = req.body['cf-turnstile-response'];
    const secretKey = 'your-secret-key';

    try {
        const response = await axios.post('https://challenges.cloudflare.com/turnstile/v0/siteverify', null, {
            params: {
                secret: secretKey,
                response: turnstileToken
            }
        });

        if (response.data.success) {
            // Token is valid, proceed with form submission
            const name = req.body.name;
            const email = req.body.email;
            const message = req.body.message;
            // Your form processing logic here
            res.send('Form submission successful');
        } else {
            res.status(400).send('Turnstile verification failed');
        }
    } catch (error) {
        res.status(500).send('Error verifying Turnstile token');
    }
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});

Important considerations
It is crucial to handle the verification of the Turnstile token correctly. This section covers some key points to keep in mind.

Verify the token after form input
Ensure that you verify the Turnstile token after the user has filled out the form and selected submit.
If you verify the token before the user inputs their data, a malicious actor could potentially bypass the protection by manipulating the form submission after obtaining a valid token.
Proper flow implementation
When the user submits the form, send both the form data and the Turnstile token to your server.
On the server side, verify the Turnstile token first.
Based on the verification response, decide whether to proceed with processing the form data
