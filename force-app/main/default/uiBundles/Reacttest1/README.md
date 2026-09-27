# React Internal App

An internal React template for the Salesforce platform. Includes an Agentforce conversation client and global search; intended for internal (non-Experience Cloud) deployment. Built with React, Vite, TypeScript, and Tailwind/shadcn.

For project-level details (metadata, deploy), see the [project README](../../../../../../README.md).

## Salesforce navigation and access

This is a `CustomApplication` UI Bundle. Salesforce does not populate the
Lightning app navigation bar with tabs for UI Bundle routes. The app's
navigation is rendered by the React layout; open the menu in the app header to
access the `Home`, `Search`, and `Properties` routes.

The deploying user must have the `Reacttest1_Access` permission set assigned.
Assign it with:

```bash
sf org assign permset --name Reacttest1_Access --target-org <alias>
```

After deployment, open **App Launcher** in the target org and launch
**Reacttest1**. If the app is not listed, assign the permission set and sign
out and back in to refresh app visibility.

## Prerequisites

```bash
npm install
```

## Run (development)

```bash
npm run dev
```

Starts the Vite dev server (default: http://localhost:5173).

## Build

```bash
npm run build
```

Writes the production bundle to `dist/` inside the UI Bundle folder.

## Test

```bash
npm test
```

Runs the unit test suite (Vitest).
