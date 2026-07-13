const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres:SkyParking2025@127.0.0.1:5432/gacha_sistem'
});

client.connect()
  .then(() => {
    return client.query("SELECT pg_get_functiondef('gacha.execute_pull'::regproc) AS def");
  })
  .then(res => {
    console.log(res.rows[0].def);
    client.end();
  })
  .catch(err => {
    console.error(err);
    client.end();
  });
