import { AtpAgent, AtpSessionEvent, AtpSessionData } from '@atproto/api';
import { inspect } from 'util';

async function main() {
  // configure connection to the server, without account authentication
  const agent = new AtpAgent({
    service: 'https://at.arles.us',
    persistSession: (evt: AtpSessionEvent, sess?: AtpSessionData) => {
      console.log(`[DEBUG] evt [${inspect(evt, { colors: true })}]`);
      console.log(`[DEBUG] sess [${inspect(sess, { colors: true })}]`);   // store the session-data for reuse
    },
  })

  // 2) if an existing session was securely stored previously,pr then reuse that to resume the session.
  //await agent.resumeSession(savedSessionData)

  // 3) if no old session was available, create a new one by logging in with password (App Password)
  if (process.env.ATRA_USERNAME === undefined || process.env.ATRA_PASSWORD === undefined) {
    console.log("ATRA_USERNAME and ATRA_PASSWORD must be set");
    process.exit(1);
  }

  await agent.login({
    identifier: process.env.ATRA_USERNAME,
    password: process.env.ATRA_PASSWORD
  })

  // Feeds and content
  await agent.getTimeline()


}

main();
