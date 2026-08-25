# Contributing

Contributions are always welcome, no matter how large or small.

We want this community to be friendly and respectful to each other. Please follow it in all your interactions with the project. Before contributing, please read the [code of conduct](./CODE_OF_CONDUCT.md).

Useful background:

- [`docs/ROADMAP.md`](./docs/ROADMAP.md) — what's shipped and what's planned
- [`docs/IOS_ARCHITECTURE.md`](./docs/IOS_ARCHITECTURE.md) — how the native layer fits together, worth reading before touching iOS code
- [`.github/COMMIT_CONVENTION.md`](./.github/COMMIT_CONVENTION.md) — the commit format in detail

## Development workflow

This project is a monorepo managed using [Yarn workspaces](https://yarnpkg.com/features/workspaces). It contains the following packages:

- The library package in the root directory.
- An example app in the `example/` directory.

To get started with the project, run `yarn` in the root directory to install the required dependencies for each package:

```sh
yarn
```

> Since the project relies on Yarn workspaces, you cannot use [`npm`](https://github.com/npm/cli) for development.

The [example app](/example/) demonstrates usage of the library. You need to run it to test any changes you make.

It is configured to use the local version of the library, so any changes you make to the library's source code will be reflected in the example app. Changes to the library's JavaScript code will be reflected in the example app without a rebuild, but native code changes will require a rebuild of the example app.

Most of the work happens on iOS. To edit the Objective-C++ or Swift files, open
`example/ios/ObjectCaptureExample.xcworkspace` in Xcode and find the source files at
`Pods > Development Pods > react-native-object-capture`.

The Android side is a stub — there's no Android equivalent to Object Capture — but it still has to
compile. To edit it, open `example/android` in Android Studio and find the source files at
`react-native-object-capture` under `Android`.

**Testing capture changes requires a physical device** with LiDAR (iPhone 12 Pro or newer, iOS 17+).
The simulator can run the app, but not a capture session.

## What you can contribute without a LiDAR device

Most contributions do not require capture hardware. An issue labeled [`needs device`](https://github.com/tristanheilman/react-native-object-capture/labels/needs%20device) needs verification on a LiDAR-capable iPhone; if that label is absent, you can work on it without one.

Hardware-free contributions include:

- documentation and TypeScript types;
- Jest tests and mocks;
- JavaScript or TypeScript in the example app;
- the Expo config plugin tracked in [#29](https://github.com/tristanheilman/react-native-object-capture/issues/29);
- Android build compatibility, tooling, and CI.

Before reviewing or extending the native iOS layer, read [`docs/IOS_ARCHITECTURE.md`](./docs/IOS_ARCHITECTURE.md). It documents the ObjC++/Swift/SwiftUI boundaries, generated-code contracts, Fabric recycling behavior, and the device smoke test expected for native changes.

If you do have a compatible device, the most useful contribution is a detailed bug or compatibility report. Include the exact device model and iOS version, along with reproduction steps and relevant logs. See [#32](https://github.com/tristanheilman/react-native-object-capture/issues/32) for the current compatibility-report request.

You can use various commands from the root directory to work with the project.

To start the packager:

```sh
yarn example start
```

To run the example app on Android:

```sh
yarn example android
```

To run the example app on iOS:

```sh
yarn example ios
```

To confirm that the app is running with the new architecture, you can check the Metro logs for a message like this:

```sh
Running "ObjectCaptureExample" with {"fabric":true,"initialProps":{"concurrentRoot":true},"rootTag":1}
```

Note the `"fabric":true` and `"concurrentRoot":true` properties.

Make sure your code passes TypeScript and ESLint. Run the following to verify:

```sh
yarn typecheck
yarn lint
```

To fix formatting errors, run the following:

```sh
yarn lint --fix
```

Remember to add tests for your change if possible. Run the unit tests by:

```sh
yarn test
```

### Commit message convention

We follow the [conventional commits specification](https://www.conventionalcommits.org/en) for our commit messages:

- `fix`: bug fixes, e.g. fix crash due to deprecated method.
- `feat`: new features, e.g. add new method to the module.
- `refactor`: code refactor, e.g. migrate from class components to hooks.
- `docs`: changes into documentation, e.g. add usage example for the module..
- `test`: adding or updating tests, e.g. add integration tests using detox.
- `chore`: tooling changes, e.g. change CI config.

Our pre-commit hooks verify that your commit message matches this format when committing.

### Linting and tests

[ESLint](https://eslint.org/), [Prettier](https://prettier.io/), [TypeScript](https://www.typescriptlang.org/)

We use [TypeScript](https://www.typescriptlang.org/) for type checking, [ESLint](https://eslint.org/) with [Prettier](https://prettier.io/) for linting and formatting the code, and [Jest](https://jestjs.io/) for testing.

Our pre-commit hooks verify that the linter and tests pass when committing.

### Releases

Releases are automated with [release-please](https://github.com/googleapis/release-please). Merging
conventional commits to `main` opens (or updates) a release PR with the version bump and changelog
entry; merging that PR tags the release and publishes to npm. Contributors don't need to do
anything beyond writing well-formed commit messages.

### Scripts

The `package.json` file contains various scripts for common tasks:

- `yarn`: setup project by installing dependencies.
- `yarn typecheck`: type-check files with TypeScript.
- `yarn lint`: lint files with ESLint.
- `yarn test`: run unit tests with Jest.
- `yarn example start`: start the Metro server for the example app.
- `yarn example android`: run the example app on Android.
- `yarn example ios`: run the example app on iOS.

### Sending a pull request

> **Working on your first pull request?** You can learn how from this _free_ series: [How to Contribute to an Open Source Project on GitHub](https://app.egghead.io/playlists/how-to-contribute-to-an-open-source-project-on-github).

When you're sending a pull request:

- Prefer small pull requests focused on one change.
- Verify that linters and tests are passing.
- Review the documentation to make sure it looks good.
- Follow the pull request template when opening a pull request.
- For pull requests that change the API or implementation, discuss with maintainers first by opening an issue.
