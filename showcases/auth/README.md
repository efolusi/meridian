# Auth — example app

Shared sign-in / create-account screens for a multi-app workspace. Split layout: brand panel (cocoa, owl, rotating customer quote) + form panel. Interactive: toggle between sign in and sign up, password reveal, fake submit with loading → success.

- `index.html` — interactive entry
- `AuthScreens.jsx` — BrandPanel, SignIn/SignUp, ForgotForm, MagicForm (+ sent confirmations)

Large (44px) controls; single-column form, 360px wide.

Starter twin: `starters/auth-page/` is the copyable multi-page journey for this category; this example app shows the screens as liftable plain JSX. When a screen changes in one, update the other.
