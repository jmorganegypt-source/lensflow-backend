export async function generatePresenter(script) {
  console.log("🎥 Generating presenter video...");
  return "https://example.com/presenter.mp4";
}

// Adding this exact name stops the pipelineManager SyntaxError!
export async function triggerPresenterVideo(script) {
  console.log("🎥 Triggering presenter video...");
  return "https://example.com/presenter.mp4";
}
