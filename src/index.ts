import { AtpAgent, AtpSessionEvent, AtpSessionData, AppBskyFeedDefs } from '@atproto/api';
import { inspect } from 'util';
import http from 'http';
import { IncomingMessage, ServerResponse } from 'http';

import * as logger from './logger';

let agent: AtpAgent;

async function main() {

  // configure connection to the server, without account authentication
  agent = new AtpAgent({
    service: 'https://at.arles.us',
    persistSession: (evt: AtpSessionEvent, sess?: AtpSessionData) => {
      logger.debug(`evt [${inspect(evt, { colors: true })}]`);
      logger.debug(`sess [${inspect(sess, { colors: true })}]`);
      // store the session-data for reuse
    },
  });

  // 2) if an existing session was securely stored previously,pr then reuse that to resume the session.
  //await agent.resumeSession(savedSessionData)

  // 3) if no old session was available, create a new one by logging in with password (App Password)
  if (process.env.ATRA_USERNAME === undefined || process.env.ATRA_PASSWORD === undefined) {
    logger.info("Error. ATRA_USERNAME and ATRA_PASSWORD must be set");
    process.exit(1);
  }

  await agent.login({
    identifier: process.env.ATRA_USERNAME,
    password: process.env.ATRA_PASSWORD
  })

  const server = http.createServer(handleRequest);

  // Listen on port 3000 by default
  const httpPort = process.env.ATRA_HTTP_PORT || 3000;
  server.listen(httpPort, () => {
    logger.info(`HTTP Server running at http://localhost:${httpPort}/`);
  });

}

async function getTimelineDisplay(): Promise<string> {
  const { data } = await agent.getTimeline({
    limit: 5,
  });
  const { feed: postsArray } = data;

  let timelineDisplay = '';
  postsArray.forEach((feedItem) => {
    let message = '';
    if (feedItem.reply?.parent?.uri) {
      message += `<div>Reply to message: ${feedItem.reply.parent.uri}</div>\n`;
    }
    if (feedItem.reply?.parent?.author) {
      message += `<div>Reply to author: ${feedItem.reply.parent.author}</div>\n`;
    }

    console.log(require('util').inspect(feedItem));
    // if (feedItem.post?.record?.reply){
    //   message += 'Reply: ';
    // }
    // if (feedItem.post.record.text) {
    //   message += feedItem.post.record.text;
    // }
    timelineDisplay += `\n<div>
      <div><span><img src="${feedItem.post.author.avatar}" style="max-width: 50px; max-height: 50px;"/></span>
      <span>HANDLE: ${feedItem.post.author.handle}</span>:</div>\n
      <div><span>MESSAGE: ${message}</span></div>\n
      <div><span><pre>DEBUG: ${require('util').inspect(feedItem.post.record)}</pre></span></div>\n
    </div>\n`;
  });
  return timelineDisplay;
}

// Simple route handler
async function handleRequest(req: IncomingMessage, res: ServerResponse) {
  const url = req.url;
  // Use switch case to handle routes
  switch (url) {
    case '/':
      const timelineDisplay = await getTimelineDisplay();
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(`<html><body>atra\n${timelineDisplay}</body></html>`);
      break;

    case '/message':
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end('This is the /message route!\n');
      break;

    default:
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404: Route Not Found\n');
      break;
  }
}
// Create the HTTP server

main();
