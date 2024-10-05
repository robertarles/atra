import { OAuth2Client } from '@proto/api';
import { promises as fs } from 'fs';
import { createServer } from 'http';
import open from 'open';
import dotenv from 'dotenv';

dotenv.config();

let CLIENT_ID = process.env.ATRA_CLIENT_ID;
let CLIENT_SECRET = process.env.ATRA_CLIENT_SECRET;
const REDIRECT_URI = 'http://localhost:3000/callback';
const SCOPES = ['openid', 'profile', 'email'];

async function setupOAuthCredentials() {
  if (!CLIENT_ID || !CLIENT_SECRET) {
    console.log('ATRA_CLIENT_ID or ATRA_CLIENT_SECRET not found in environment variables.');
    console.log('Please follow these steps to obtain OAuth credentials from at.arles.us:');
    console.log('1. Go to https://at.arles.us and sign in or create an account');
    console.log('2. Navigate to the developer settings or OAuth application section');
    console.log('3. Create a new OAuth application');
    console.log('4. Set the redirect URI to: http://localhost:3000/callback');
    console.log('5. Copy the provided Client ID and Client Secret');
    console.log('6. Set the following environment variables:');
    console.log('   ATRA_CLIENT_ID=<your_client_id>');
    console.log('   ATRA_CLIENT_SECRET=<your_client_secret>');
    console.log('7. Restart this script after setting the environment variables');
    process.exit(1);
  }
}

async function getAccessToken(): Promise<string> {
  const oauth2Client = new OAuth2Client({
    clientId: CLIENT_ID!,
    clientSecret: CLIENT_SECRET!,
    redirectUri: REDIRECT_URI,
  });

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });

  console.log('Please visit this URL to authorize the application:', authUrl);
  await open(authUrl);

  return new Promise((resolve, reject) => {
    const server = createServer(async (req, res) => {
      if (!req.url?.startsWith('/callback')) return;

      const url = new URL(req.url, `http://${req.headers.host}`);
      const code = url.searchParams.get('code');

      if (code) {
        try {
          const { tokens } = await oauth2Client.getToken(code);
          oauth2Client.setCredentials(tokens);
          res.end('Authentication successful! You can close this window.');
          server.close();
          resolve(tokens.access_token as string);
        } catch (error) {
          reject(error);
        }
      } else {
        reject(new Error('No code found in the callback URL'));
      }
    }).listen(3000);
  });
}

async function loginToArles(accessToken: string) {
  console.log('Logging in to at.arles.us with access token:', accessToken);
  // Implement the actual login process here
}

async function main() {
  try {
    await setupOAuthCredentials();
    const accessToken = await getAccessToken();
    await loginToArles(accessToken);
  } catch (error) {
    console.error('An error occurred:', error);
  }
}

main();

