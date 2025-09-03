const { google } = require('googleapis');

const SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];
const KEYFILE = 'path/to/your-service-account.json'; // Replace with your actual path

async function getLastMeeting() {
  const auth = new google.auth.GoogleAuth({
    keyFile: KEYFILE,
    scopes: SCOPES,
  });

  const calendar = google.calendar({ version: 'v3', auth });
  const now = new Date().toISOString();

  const res = await calendar.events.list({
    calendarId: 'primary',
    timeMax: now,
    maxResults: 1,
    singleEvents: true,
    orderBy: 'startTime',
  });

  const events = res.data.items;
  return events.length ? events[0] : null;
}

module.exports = { getLastMeeting };

