<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1wEI9WU3pZuVQu2EGk-j6L8bBWyW66hc9

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `VITE_API_KEY` in `.env.local` to your Gemini API key (this is how the app reads it at runtime)
3. Run the app:
   `npm run dev`

## Firebase Hosting runtime config

If you are deploying or previewing via Firebase Hosting, make sure the same `VITE_API_KEY` is available to the client by applyi
ng your environment file:

```
firebase hosting:env:apply firebase-hosting.env
```

Copy `firebase-hosting.env.example` to `firebase-hosting.env` and populate it with `VITE_API_KEY=your-gemini-api-key` before ru
nning the command.
