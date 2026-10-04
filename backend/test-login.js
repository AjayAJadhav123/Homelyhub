async function testLogin() {
    try {
        const res = await fetch('http://localhost:3000/api/v1/rent/user/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'proptest1791111094970@example.com', password: 'Password1!' })
        });
        const data = await res.json();
        console.log('Login result:', res.status, data);
    } catch (error) {
        console.error('Login error:', error);
    }
}
testLogin();
