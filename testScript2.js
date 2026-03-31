fetch('http://localhost:5000/')
.then(res => res.text())
.then(data => console.log('Status:', res.status, 'Response:', data))
.catch(err => console.error('Error:', err.message));
