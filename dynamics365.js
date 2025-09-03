const axios = require('axios');

const DYNAMICS_URL = 'https://your-dynamics-365-instance.api.crm.dynamics.com/api/data/v9.1';
const DYNAMICS_TOKEN = 'your-access-token'; // Replace with your actual token

async function createOpportunity(participantEmail) {
  const headers = {
    Authorization: `Bearer ${DYNAMICS_TOKEN}`,
    'Content-Type': 'application/json',
  };

  const opportunity = {
    name: 'Opportunity from Calendar Meeting',
    estimatedvalue: 100000,
    estimatedclosedate: '2025-12-31',
    'customerid_account@odata.bind': `/accounts(${participantEmail})`, // Replace with actual account lookup logic
  };

  const response = await axios.post(`${DYNAMICS_URL}/opportunities`, opportunity, { headers });
  return response.status === 201;
}

module.exports = { createOpportunity };

