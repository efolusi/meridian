# Auth — starter journey

Copyable authentication journey: sign in → sign up → onboarding, plus password reset. Copy this whole folder to start your own auth flow; `ds-base.js` has a single `base` line pointing at the design-system root — edit that one line and every page works.

- `AuthPage.dc.html` — sign in (password + magic link)
- `SignUp.dc.html` — account creation
- `ForgotPassword.dc.html` — reset request
- `Onboarding.dc.html` — first-run workspace setup

Showcase twin: `apps/www/registry/kits/auth/` covers the same category as plain JSX screens you can lift into a React app. When a screen changes in one, update the other.
