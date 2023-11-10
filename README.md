# Next.js Project - README

This is a Next.js project that uses a PostgreSQL database to manage to-do items. This README provides instructions on how to set up the project locally and connect it to a PostgreSQL database.

Available at https://todonextjs-six.vercel.app/
## Technical Audience

This README is intended for technical users who are familiar with Node.js, PostgreSQL, and the command line interface.

## Prerequisites

Before running this project, you will need the following installed on your system:

- Node.js
- npm or yarn
- PostgreSQL

## Getting Started

1. Clone the repository to your local machine.
2. Open a terminal and navigate to the project directory.
3. In the terminal, run `npm install` install the project dependencies.
4. Copy `.env.example` to `.env` and adjust the `DATABASE_URL` to match your local configuration
5. Run `npx prisma migrate deploy`
6. In the terminal, run `npm run dev` to start the development server.
7. Open a web browser and navigate to `http://localhost:3000` to view the running application.
8. To seed your database automatically via Snaplet run `npm run seed`

## Available Scripts

In the project directory, you can run the following commands:

### `npm run dev` or `yarn dev`

Runs the application in development mode. Open http://localhost:3000 to view it in the browser. The page will automatically reload if you make changes to the code.

### `npm run build` or `yarn build`

Builds the application for production usage.

### `npm start` or `yarn start`

Starts the application in production mode. The application must be built before running this command.

### `npm run lint` or `yarn lint`

Runs the linter to check for any syntax or code style issues.

### `npm run seed`

Run snaplet generate to generate the seed data for the application.

## Conclusion

This README provides an overview of how to set up this Next.js project locally and connect it to a PostgreSQL database. With these instructions, you should be able to get the project up and running on your own machine.