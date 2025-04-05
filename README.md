# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/89fdcefb-7647-4486-959a-21de76293d3c

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/89fdcefb-7647-4486-959a-21de76293d3c) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/89fdcefb-7647-4486-959a-21de76293d3c) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes it is!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)

# Crime Watch Database Populator

This script populates a Supabase database with mock crime data for the city of Surat, Gujarat.

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Supabase project with the following tables:
  - `crime_reports`
  - `users`

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory with your Supabase credentials:
```bash
cp .env.example .env
```

3. Edit the `.env` file and add your Supabase credentials:
- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key (not the anon key)

## Running the Script

To populate the database with mock data:

```bash
npm run populate
```

The script will:
1. Generate 20 mock users
2. Generate 100 mock crime reports
3. Insert all data into your Supabase database

## Data Details

### Users
- 20 mock users with Indian names
- All users are from Surat, Gujarat (pincode: 395007)
- Random points (0-500) and levels (1-5)
- Mix of languages (Gujarati, Hindi, English)

### Crime Reports
- 100 mock crime reports
- All reports are within ~3km of Surat city center
- Various incident types, severities, and statuses
- Random dates within the last 30 days
- Mix of citizen and police reports

## Notes

- The script uses the service role key to bypass RLS policies
- All data is generated with realistic Indian names and locations
- Crime reports are distributed around Surat city center
- Each crime report is randomly assigned to one of the generated users
