import axios from 'axios';
import fs from 'fs/promises';

const GITHUB_TOKEN = process.env.GH_ENTERPRISE_TOKEN;
const GITHUB_API_BASE = process.env.GH_ENTERPRISE_API || 'https://github.company.com/api/v3';
const USERNAME = 'your-username'; // Replace with your username or use env

const headers = {
  Authorization: `token ${GITHUB_TOKEN}`,
  Accept: 'application/vnd.github.v3+json'
};

async function getCount(endpoint) {
  const res = await axios.get(`${GITHUB_API_BASE}/search/issues?q=author:${USERNAME}+type:${endpoint}`, { headers });
  return res.data.total_count;
}

async function updateReadme() {
  const prs = await getCount('pr');
  const issues = await getCount('issue');
  const readme = await fs.readFile('README.md', 'utf-8');

  const metrics = `
### 📊 Contribution Metrics

- 🔀 Pull Requests Raised: **${prs}**
- 🐛 Issues Opened: **${issues}**
- 🛠️ Commits: _Fetched separately (optional)_
`;

  const updated = readme.replace(
    /<!-- METRICS_START -->([\s\S]*?)<!-- METRICS_END -->/,
    `<!-- METRICS_START -->\n${metrics}\n<!-- METRICS_END -->`
  );

  await fs.writeFile('README.md', updated);
  console.log('README.md updated!');
}

updateReadme().catch(err => {
  console.error('Failed to update metrics:', err.message);
});
