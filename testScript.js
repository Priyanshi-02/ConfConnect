fetch('http://localhost:5000/api/v1/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Test',
    email: 'test' + Date.now() + '@example.com',
    password: 'password123',
    department: 'IT',
    phone: '123'
  })
})
.then(async res => {
  const data = await res.json().catch(() => ({}));
  console.log('Status:', res.status);
  console.log('Response:', data);
})
.catch(err => console.error('Network Error:', err.message));
