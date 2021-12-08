module.exports = app => {
    const controller = require("../controllers/controller.js");

    var router = require("express").Router();

    router.get("/jola/", controller.fetchWebsitesData);

    // Cria um novo utilizador
    router.post("/registar", controller.register);
  
    // Rota para login - tem de ser POST para não vir user e pass na URL
    router.post("/login", controller.login);

    // Rota para verificar e ativar o utilizador
    router.get("/auth/confirm/:confirmationCode", controller.verifyUser)


    app.use('/api', router);

};