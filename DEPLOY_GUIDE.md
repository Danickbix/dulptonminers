# Blockchain Simulation Platform Deployment Guide

## Deployment on Netlify with Supabase

### Prerequisites
1. GitHub account (to host your code repository)
2. Netlify account (for deployment)
3. Supabase account (for database)

### Step 1: Set up Supabase Database
1. Go to the [Supabase dashboard](https://supabase.com/dashboard/projects)
2. Create a new project if you haven't already
3. Once in the project page, click the "SQL Editor" in the left sidebar
4. Run the migration script in the editor to create all the necessary tables:
   ```sql
   -- You can copy the migration SQL from your schema.ts file
   ```
5. Get the database connection string:
   - Click "Project Settings" in the left sidebar
   - Go to "Database" section
   - Find and copy the "Connection string" in the "Connection Pooling" section
   - Replace `[YOUR-PASSWORD]` with the database password you set for the project

### Step 2: Push Code to GitHub
1. Create a new repository on GitHub
2. Initialize Git in your local project (if not already done):
   ```
   git init
   git add .
   git commit -m "Initial commit"
   ```
3. Add your GitHub repository as a remote:
   ```
   git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPOSITORY-NAME.git
   ```
4. Push your code to GitHub:
   ```
   git push -u origin main
   ```

### Step 3: Deploy on Netlify
1. Log in to your Netlify account
2. Click "Add new site" > "Import an existing project"
3. Select GitHub as the Git provider
4. Authorize Netlify to access your GitHub account
5. Select the repository you just created
6. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `dist/public`
   - Functions directory: `netlify/functions`
7. Add environment variables:
   - Click "Advanced" > "New variable"
   - Add `DATABASE_URL` with the value of your Supabase connection string

### Step 4: Deploy your Site
1. Click "Deploy site"
2. Wait for the build and deployment to complete
3. Once deployed, you'll get a unique Netlify URL (e.g., `your-project.netlify.app`)

### Troubleshooting
If you encounter issues with the database connection:
1. Check your database connection string in the Netlify environment variables
2. Make sure all required tables are created in Supabase
3. Check Netlify's function logs for any errors

### Updating the Site
To update your site after making changes:
1. Commit your changes locally:
   ```
   git add .
   git commit -m "Description of changes"
   ```
2. Push to GitHub:
   ```
   git push
   ```
3. Netlify will automatically detect the changes and redeploy your site

### Custom Domain (Optional)
To use a custom domain with your Netlify site:
1. Go to your site in Netlify
2. Click "Domain settings"
3. Click "Add custom domain"
4. Follow the instructions to configure your DNS settings