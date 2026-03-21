Deno.serve(async (req) => {
  return new Response(JSON.stringify({ hello: "world" }), {
    headers: { "Content-Type": "application/json" }
  });
});
