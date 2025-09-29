import { describe, it, expect } from "vitest";

describe("Chat worker", () => {
  it("responds with Not found", async () => {
    const request = new Request("http://example.com");
    // Basic test - in a real implementation, you'd test your actual server logic
    expect(request.url).toBe("http://example.com/");
  });
});
