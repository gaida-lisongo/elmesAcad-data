export async function verifyApp() {
  const baseUrl = process.env.BASE_URL || "http://localhost:3000/api";
  const uuid = process.env.UUID || "bf26724f-6d1d-4a35-bdfe-fa638c5f4a8e";

  const response = await fetch(`${baseUrl}/client/verify`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ uuid }),
  });

  return response.json();
}
