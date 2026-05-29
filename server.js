import express from 'express';
import { runLensFlowPipeline } from './pipelineManager.js';

const app = express();
const PORT = process.env.PORT || 10000;

app.use(express.json());

// This keeps Render happy and "Live" 24/7
app.get('/health', (req, res) => {
  res.status(200).send('LensFlow Backend is Live and Healthy! 🚀');
});

// This lets you trigger video creation anytime from your website front-end later!
app.post('/generate-video', async (req, res) => {
  const { url } = req.body;
  console.log(`📡 Front-end requested video for: ${url}`);
  
  const result = await runLensFlowPipeline(url);
  res.json(result);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});