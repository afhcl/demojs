const express = require('express');
const bodyParser = require('body-parser');
const { getLastMeeting } = require('./googleCalendar');
const { createOpportunity } = require('./dynamics365');

const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.use(express.static('public'));

app.post('/preview', async (req, res) => {
  const meeting = await getLastMeeting();
  if (!meeting) return res.status(404).json({ error: 'No meeting found' });

  const participants = (meeting.attendees || [])
    .map(a => a.email)
    .filter(email => !email.includes('@hcl-software.com'));

  if (!participants.length) return res.status(400).json({ error: 'No valid participants' });

  res.json({
    name: 'Opportunity from Calendar Meeting',
    estimatedvalue: 100000,
    estimatedclosedate: '2025-12-31',
    participant: participants[0],
  });
});

app.post('/submit', async (req, res) => {
  const { participant } = req.body;
  try {
    const success = await createOpportunity(participant);
    if (success) {
      res.json({ message: 'Opportunity created successfully' });
    } else {
      res.status(500).json({ error: 'Failed to create opportunity' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

