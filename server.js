const express = require('express');
const axios = require('axios');
const { google } = require('googleapis');
const app = express();
const PORT = 3000;

app.use(express.static('public'));
app.use(express.json());

let opportunityPreview = null;

// Replace with your OAuth2 credentials
const oAuth2Client = new google.auth.OAuth2(
  'YOUR_CLIENT_ID',
  'YOUR_CLIENT_SECRET',
  'YOUR_REDIRECT_URI'
);

// Assume tokens are already set
oAuth2Client.setCredentials({
  access_token: 'YOUR_ACCESS_TOKEN',
  refresh_token: 'YOUR_REFRESH_TOKEN'
});

app.get('/preview', async (req, res) => {
  try {
    const calendar = google.calendar({ version: 'v3', auth: oAuth2Client });
    const events = await calendar.events.list({
      calendarId: 'primary',
      maxResults: 1,
      orderBy: 'startTime',
      singleEvents: true,
      timeMin: new Date().toISOString()
    });

    const event = events.data.items[0];
    const attendees = event.attendees || [];

    const filteredEmails = attendees
      .map(a => a.email)
      .filter(email => !email.endsWith('@hcl-software.com'));

    // Simulate account lookup
    const accountId = await findAccountByEmails(filteredEmails);

    opportunityPreview = {
      name: `Opportunity from ${event.summary}`,
      amount: 100000,
      closeDate: '2025-12-31',
      accountId,
      participants: filteredEmails
    };

    res.json(opportunityPreview);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching calendar event');
  }
});

app.post('/submit', async (req, res) => {
  try {
    if (!opportunityPreview) return res.status(400).send('No preview available');

    const response = await axios.post(
      'https://YOUR_DYNAMICS_INSTANCE_URL/api/data/v9.1/opportunities',
      {
        name: opportunityPreview.name,
        estimatedvalue: opportunityPreview.amount,
        closeprobability: 100,
        estimatedclosedate: opportunityPreview.closeDate,
        customerid_account: {
          accountid: opportunityPreview.accountId
        }
      },
      {
        headers: {
          Authorization: `Bearer YOUR_DYNAMICS_ACCESS_TOKEN`,
          'Content-Type': 'application/json',
          'OData-MaxVersion': '4.0',
          'OData-Version': '4.0',
          Accept: 'application/json'
        }
      }
    );

    res.json({ success: true, data: response.data });
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).send('Error creating opportunity');
  }
});

async function findAccountByEmails(emails) {
  // Simulate account lookup logic
  return 'ACCOUNT_ID_FROM_DYNAMICS';
}

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

