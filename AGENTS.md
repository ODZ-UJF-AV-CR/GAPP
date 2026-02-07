# GAPP

this is ground application for managing stratospheric balloons flights.

It is written using angular and fasify in monorepo.

Currently it is in migration phase from nx monorepo to turborepo.

Repository uses pnpm workspaces.

## old packages from nx:
- apps/gapp-dashboard
- libs/*
No not consider this packages until mentioned specifically to do so.

## new packages are here:
- apps/dashboard
- apps/server
- packages/sondehub
- packages/ui

this are the main packages to look into

also do not consider global tsconfig.base.json

## cli commands
to install dependency to particullar module, use pnpm with filter for the package name from package.json. Example:
`pnpm --filter @gapp/dashboard add {package name}`

to run script from package use this:
`pnpm --filter @gapp/dashboard run {script name}`
