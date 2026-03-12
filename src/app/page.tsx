export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-4">Claude + Figma</h1>
      <p className="text-lg text-gray-600 max-w-xl text-center">
        This project is wired up with the Figma MCP server. Select a frame in
        Figma and ask Claude Code to implement it, or build something here and
        send it back to Figma.
      </p>
    </main>
  );
}
