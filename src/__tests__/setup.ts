module.exports = async () => {
    fetch('http://localhost:4001/update-schema', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ schema: 'type Query { hello: String }' }),
    });
  };
