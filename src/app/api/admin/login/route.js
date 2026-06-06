export async function POST(request) {
  const { username, password } = await request.json();

  const adminUsername = process.env.ADMINUSERNAME;
  const adminPassword = process.env.ADMINPASS;

  console.log(adminUsername, adminPassword);
  console.log(username, password);

  if (!adminUsername || !adminPassword) {
    return Response.json(
      { error: "Admin credentials are not configured on the server." },
      { status: 500 }
    );
  }

  if (username === adminUsername && password === adminPassword) {
    return Response.json({ success: true, role: "admin", username });
  }

  return Response.json({ error: "Invalid admin username or password." }, { status: 401 });
}
