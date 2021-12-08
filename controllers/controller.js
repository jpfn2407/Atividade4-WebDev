require("dotenv").config();

const axios = require('axios')
const cheerio = require('cheerio')

const db = require("../models/nedb"); // Define o MODEL que vamos usar
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const { response } = require("express");

function authenticateToken(req, res) {
    console.log("A autorizar...");
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (token == null) {
      console.log("Token nula");
      return res.sendStatus(401);
    }
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
      if (err) return res.sendStatus(403);
      req.email = user;
    });
}

// async..await não é permitido no contexto global
async function enviaEmail(recipients, URLconfirm) {
    // Gera uma conta do serviço SMTP de email do domínio ethereal.email
    // Somente necessário na fase de testes e se não tiver uma conta real para utilizar
    let testAccount = await nodemailer.createTestAccount();
  
    // Cria um objeto transporter reutilizável que é um transporter SMTP
    let transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false, // true para 465, false para outras portas
      auth: {
        user: testAccount.user, // utilizador ethereal gerado
        pass: testAccount.pass, // senha do utilizador ethereal
      },
    });
  
    // envia o email usando o objeto de transporte definido
    let info = await transporter.sendMail({
      from: '"Fred Foo 👻" <foo@example.com>', // endereço do originador
      to: recipients, // lista de destinatários
      subject: "Hello ✔", // assunto
      text: "Link to activate: " + URLconfirm, // corpo do email
      html: "<b>Link to activate: " + URLconfirm + "</b>", // corpo do email em html
    });
  
    console.log("Mensagem enviada: %s", info.messageId);
    // Mensagem enviada: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
  
    // A pré-visualização só estará disponível se usar uma conta Ethereal para envio
    console.log(
      "URL para visualização prévia: %s",
      nodemailer.getTestMessageUrl(info)
    );
    // URL para visualização prévia: https://ethereal.email/message/WaQKMgKddxQDoou...
  }


  exports.verifyUser = async (req, res) => {
    const confirmationCode = req.params.confirmationCode;
    db.crUd_ativar(confirmationCode);
    const resposta = { message: "O utilizador está ativo!" };
    console.log(resposta);
    return res.send(resposta);
  };
  
  // REGISTAR - cria um novo utilizador
  exports.register = async (req, res) => {
    console.log("Registar novo utilizador");
    if (!req.body) {
      return res.status(400).send({
        message: "O conteúdo não pode ser vazio!",
      });
    }
    try {
      const salt = await bcrypt.genSalt();
      const hashPassword = await bcrypt.hash(req.body.password, salt);
      const email = req.body.email;
      const password = hashPassword;
      const confirmationToken = jwt.sign(
        req.body.email,
        process.env.ACCESS_TOKEN_SECRET
      )
      const URLconfirm = `http://localhost:42080/api/auth/confirm/${confirmationToken}`
      db.Crud_registar(email, password, confirmationToken) // C: Create
        .then((dados) => {
          enviaEmail(email, URLconfirm).catch(console.error);
          res.status(201).send({
            message:
              "Utilizador criado com sucesso, confira sua caixa de correio para ativar!",
          });
          console.log("Controller - utilizador registado: ");
          console.log(JSON.stringify(dados)); // para debug
        });
    } catch {
      return res.status(400).send({ message: "Problemas ao criar utilizador" });
    }
  };
  
  // LOGIN - autentica um utilizador
  exports.login = async (req, res) => {
    console.log("Autenticação de um utilizador");
    if (!req.body) {
      return res.status(400).send({
        message: "O conteúdo não pode ser vazio!",
      });
    }
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(req.body.password, salt);
    const email = req.body.email;
    const password = hashPassword;
    db.cRud_login(email) //
      .then(async (dados) => {
        if (await bcrypt.compare(req.body.password, dados.password)) {
          const user = { name: email };
          const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET);
          res.json({ accessToken: accessToken }); // aqui temos de enviar a token de autorização
          console.log("Resposta da consulta à base de dados: ");
          console.log(JSON.stringify(dados)); // para debug
        } else {
          console.log("Password incorreta");
          return res.status(401).send({ erro: "A senha não está correta!" });
        }
      })
      .catch((response) => {
        console.log("controller:");
        console.log(response);
        return res.status(400).send(response);
      });
  };



// 
//
//
//
//    Atividade 3 daqui para baixo
//
//
//
//
exports.fetchWebsitesData = (req, res) => {
    var lista = []

    getData();

    async function getData(){
    
        //Continente 
        
        await axios.get('https://www.continente.pt/bebidas-e-garrafeira/cervejas-e-sidras/cerveja-branca/?start=0&srule=categories%20top-sellers&pmin=0.01&sz=10000',  {timeout: 1000})
        .then((response)=>{
            const html = response.data
            const $ = cheerio.load(html)
    
            const elemSelector = 'div.row:nth-child(4)'
    
            $(elemSelector).each((index, elem) => {
    
                $(elem).children().each((childIdx, childElem)=>{
                    
    
                    const superMercado = 'Continente'
    
                    const marca = $(childElem).find('div > div> div > p:nth-child(2)').text().toLowerCase().trim()
    
                    var tamanho = ''
                    if ($(childElem).find('div > div:nth-child(3)> div:nth-child(1) > p:nth-child(3)').text() != ''){
                        tamanho = $(childElem).find('div > div:nth-child(3)> div:nth-child(1) > p:nth-child(3)').text().trim()
                    } else {
                        tamanho = $(childElem).find('div > div:nth-child(2)> div:nth-child(1) > p:nth-child(3)').text().trim()
                    }
                    const preçoAtual = $(childElem).find('div:nth-child(2) > div:nth-child(1) > div:nth-child(1) > div:nth-child(1) > span:nth-child(1) > span:nth-child(1) > span:nth-child(1)').text().trim().replace('€','').replace(',','.').trim()
            
                    var preçoAntigo = ''  
                    if($(childElem).find('div:nth-child(2) > div:nth-child(1) > div:nth-child(1) > div:nth-child(1) > span:nth-child(2) > span:nth-child(1)').attr('content') != undefined){
                        preçoAntigo = $(childElem).find(' div:nth-child(2) > div:nth-child(1) > div:nth-child(1) > div:nth-child(1) > span:nth-child(2) > span:nth-child(1)').attr('content').replace(',','.').trim()
                    } else {
                        preçoAntigo = preçoAtual
                    }
    
                    var desconto = ((parseFloat(preçoAntigo) - parseFloat(preçoAtual))/parseFloat(preçoAntigo)) * 100
         
                    desconto = desconto.toFixed(0) + '%'
                    desconto.trim()
    
                    const preçoPorLitro = $(childElem).find('div:nth-child(2) > div:nth-child(1) > div:nth-child(1) > div:nth-child(2) > span:nth-child(1)').text().trim().replace('€', '').replace(',','.').trim()
                    
                    if (marca != ''){
                        lista.push({
                            superMercado,
                            marca,
                            tamanho,
                            preçoAtual,
                            preçoAntigo,
                            desconto,
                            preçoPorLitro
                        })
                    }
                    
                })
                
            })
        }).catch((error) => {
            
        });
        
    
        //Auchan
        await axios.get('https://www.auchan.pt/pt/bebidas-e-garrafeira/cervejas/cerveja-nacional/?prefn1=soldInStores&prefv1=000&sz=10000',  {timeout: 1000})
        .then((response)=>{
            const html = response.data
            const $ = cheerio.load(html)
    
            const elemSelector = '.justify-content-start'
    
            $(elemSelector).each((index, elem) => {
    
                $(elem).children().each((childIdx, childElem)=>{
                    
    
                    const superMercado = 'Auchan'
    
                    const marca = $(childElem).find('div:nth-child(2) > div:nth-child(2) > div:nth-child(1) > h3:nth-child(1) > a:nth-child(1)').text().split('cerveja ').pop().split( /[0-9]/)[0].trim()
    
                    const tamanho = $(childElem).find('div:nth-child(2) > div:nth-child(2) > div:nth-child(1) > h3:nth-child(1) > a:nth-child(1)').text().split(' ').pop().trim()
                    
                    var preçoAtual = ''
                    if($(childElem).find('div:nth-child(4) > div:nth-child(1) > span:nth-child(1) > span:nth-child(2) > span:nth-child(1)').text().trim() != ''){
                        preçoAtual = $(childElem).find('div:nth-child(4) > div:nth-child(1) > span:nth-child(1) > span:nth-child(2) > span:nth-child(1)').text().trim().replace(',','.').replace(' €', '').trim()
                    } else {
                        preçoAtual = $(childElem).find('div:nth-child(4) > div:nth-child(1) > span:nth-child(1) > span:nth-child(1) > span:nth-child(1)').text().trim().replace(',','.').replace(' €', '').trim()
                    }
            
                    var preçoAntigo = ''
                    if($(childElem).find('div:nth-child(4) > div:nth-child(1) > span:nth-child(1) > del:nth-child(1) > span:nth-child(1) > span:nth-child(1)').attr('content') != undefined){
                        preçoAntigo = $(childElem).find('div:nth-child(4) > div:nth-child(1) > span:nth-child(1) > del:nth-child(1) > span:nth-child(1) > span:nth-child(1)').attr('content').replace(',','.').replace(' €', '').trim()
                    } else {
                        preçoAntigo = preçoAtual
                    }
    
    
                    var desconto = ((parseFloat(preçoAntigo.replace(' €','')) - parseFloat(preçoAtual.replace(' €',''))) / parseFloat(preçoAntigo.replace(' €','')) ) * 100
                    desconto = desconto.toFixed(0) + '%'
                    desconto.trim()
    
                    const preçoPorLitro = $(childElem).find('div:nth-child(3) > div:nth-child(1) > span:nth-child(1)').text().trim().split(' ')[0].replace(',','.').trim()
                    
                    if (marca != ''){
                        lista.push({
                            superMercado,
                            marca,
                            tamanho,
                            preçoAtual,
                            preçoAntigo,
                            desconto,
                            preçoPorLitro
                        })
                    }
                    
                })
                
            })
     
        }).catch((error) => {          
        });
    
    
        //Intermache
        await axios.get('https://lojaonline.intermarche.pt/69-agualva---cacem/rayon/bebidas/cervejas/10340-cervejas-com-alcool', {timeout: 1000})
        .then((response)=>{
            const html = response.data
            const $ = cheerio.load(html)
    
            const elemSelector = 'li.vignette_produit_info'
    
            $(elemSelector).each((index, elem) => {
    
                const superMercado = 'Intermache'
                const marca = $(elem).find('li.vignette_produit_info > div:nth-child(1) > div:nth-child(3) > p:nth-child(1)').text().trim()
    
                const tamanho = $(elem).find('li.vignette_produit_info > div:nth-child(1) > div:nth-child(3) > div:nth-child(3) > span:nth-child(1)').text().trim()
    
                const preçoAtual = $(elem).find('li.vignette_produit_info > div:nth-child(1) > div:nth-child(5) > div:nth-child(1) > p:nth-child(2)').text().replace(',','.').replace(' €', '').trim()

                var preçoAntigo = ''
                    if($(elem).find('li.vignette_produit_info > div:nth-child(1) > div:nth-child(5) > div:nth-child(1) > del:nth-child(1)').text() != ''){
                        preçoAntigo = $(elem).find('li.vignette_produit_info > div:nth-child(1) > div:nth-child(5) > div:nth-child(1) > del:nth-child(1)').text().replace(',','.').replace(' €', '').trim()
                    } else {
                        preçoAntigo = preçoAtual
                    }
    
                var desconto = ((parseFloat(preçoAntigo.replace(' €','')) - parseFloat(preçoAtual.replace(' €',''))) / parseFloat(preçoAntigo.replace(' €','')) ) * 100
                desconto = desconto.toFixed(0) + '%'
                desconto.trim()
    

                const preçoPorLitro = $(elem).find('li.vignette_produit_info > div:nth-child(1) > div:nth-child(5) > div:nth-child(1) > p:nth-child(3)').text().trim().split(' ')[0].replace(',','.').trim()
    
                if (marca != ''){
                    lista.push({
                        superMercado,
                        marca,
                        tamanho,
                        preçoAtual,
                        preçoAntigo,
                        desconto,
                        preçoPorLitro
                        })        
                }
            })
        }).catch((error) => {
        });

        res.json(lista);
    }
        
        
  };