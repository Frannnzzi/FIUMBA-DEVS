const express = require('express');

const app = express ();
app.use(express.json());

const PORT = process.env.PORT || 3000;

app.get('/api/health', (req, res) => {
    res.json({status: "Levantado"});
});

app.listen(PORT, () => {
    console.log("Server Listening on PORT:", PORT);
  });

  
