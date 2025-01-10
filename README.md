# Crane Cloud

Automated application deployment, management, and scaling.

Crane Cloud is an open source multi-cloud software platform for cloud-native application deployment and management.

[![Staging deployment](https://github.com/crane-cloud/frontend/actions/workflows/staging.yml/badge.svg)](https://github.com/crane-cloud/frontend/actions/workflows/staging.yml)
[![Maintainability](https://api.codeclimate.com/v1/badges/afca0db82a7d7ced4a39/maintainability)](https://codeclimate.com/github/crane-cloud/frontend/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/afca0db82a7d7ced4a39/test_coverage)](https://codeclimate.com/github/crane-cloud/frontend/test_coverage)
## Setup

1.  `git clone https://github.com/crane-cloud/frontend.git`.
2.  `yarn`
3.  Create a `.env` file in your root directory based off of the `.env.example` file and added all required enviroment variables.
4.  Run the `source .env` command
5.  Run `yarn start` to start the application

## Tools

1. `Prettier` for formatting/style. Configure your editor with plugin.
2. `ESLint` for linting. No need for any config files. Only configure your editor with plugin. **Don't use ESLint for formatting.** Repo is configured with `react-app` so no other sharable-configs/extensions are necessary at this point.

## Pull requests

1. Push and open PR against `staging`.
2. PR will be reviewed before changes are merged.

**Contribution guide to be published some time in the future.**
