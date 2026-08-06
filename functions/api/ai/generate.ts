export const onRequestPost: PagesFunction = async (context) => {
  try {
    const { prompt } = await context.request.json();

    if (!prompt) {
      return new Response(
        JSON.stringify({ error: "Prompt is required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    // TODO: Gemini/OpenAI/Workers AI call yahan add karna

    return new Response(
      JSON.stringify({
        success: true,
        message: "AI endpoint working",
        prompt
      }),
      {
        headers: {
          "Content-Type": "application/json"
        }
      }
    );

  } catch (err) {
    return new Response(
      JSON.stringify({
        error: "Invalid request"
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json"
        }
      }
    );
  }
};
