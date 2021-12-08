const PORT = process.env.PORT || 42080
const express = require('express')

const { response } = require('express')

const app = express()

app.use(express.json()); // Faz o parse (validação e interpretação) de solicitações do tipo application/json
app.use(express.urlencoded({ extended: true })); // Faz o parse do conteúdo tipo application/x-www-form-urlencoded

require("./routs/router")(app);

app.use(express.static('public'));

app.listen(PORT, () => {
    console.log(`O servidor está a ouvir a porta ${PORT}`);
});


