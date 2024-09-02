import { AtpAgent, AtpSessionEvent, AtpSessionData } from '@atproto/api';
import { inspect } from 'util';

async function main() {
  // configure connection to the server, without account authentication
  const agent = new AtpAgent({
    service: 'https://bsky.com',
    persistSession: (evt: AtpSessionEvent, sess?: AtpSessionData) => {
      console.log(inspect(sess, { colors: true }))   // store the session-data for reuse
    },
  })


  // 2) if an existing session was securely stored previously, then reuse that to resume the session.
  //await agent.resumeSession(savedSessionData)

  // 3) if no old session was available, create a new one by logging in with password (App Password)
  await agent.login({
    identifier: process.env.ATRA_USERNAME,
    password: process.env.ATRA_PASSWORD
  })

  console.log(agent.did)
  console.log(agent.accountDid) // Throws if the user is not authenticated


  // Feeds and content
  await agent.getTimeline()


}

main();
