export async function POST(request: Request) {
    try {
        const { username, password } = await request.json();
        
        // Get credentials from environment variables
        const validUsername = process.env.UPLOAD_USERNAME;
        const validPassword = process.env.UPLOAD_PASSWORD;
        
        if (!validUsername || !validPassword) {
            console.error('Authentication credentials not configured');
            return new Response(JSON.stringify({ message: "Authentication not configured" }), { 
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        // Check if credentials match
        if (username === validUsername && password === validPassword) {
            return new Response(JSON.stringify({ message: "Authentication successful" }), { 
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });
        } else {
            return new Response(JSON.stringify({ message: "Invalid credentials" }), { 
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }
    } catch (error) {
        console.error('Authentication error:', error);
        return new Response(JSON.stringify({ message: "Authentication failed" }), { 
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
