/* Gabriel de Carvalho Tollini  */
/* gabrieltollini@gmail.com     */

const DBHOST = "localhost";                             // Configuração para conexão ao banco de dados
const DBUSER = "root";
const DBPASSWORD = "admin";
const DB = "mydb";

var express = require('express');
var { buildSchema } = require('graphql');
var graphqlHTTP = require('express-graphql');
var mysql = require('mysql');
var CronJob = require('cron').CronJob;  

var CoinMarketCap = require("node-coinmarketcap");
var coinmarketcap = new CoinMarketCap();								// Para obter a cotação do CoinMarketCap

var timestamp = require('time-stamp');                  // Para Timestamp
var lastvalue=1;                                        // Variável que será utilizada para calcular a variação do preço. Inicializada como 1, o que torna a primeira variação desconsiderável



function getPrice (){                                   // Obtém a cotação, em USD, do coinmarketcap. 
  coinmarketcap.get("bitcoin",  coin => {
  var value = coin.price_usd;
  var price= new Price (0, 'USD', timestamp('HH:mm:ss.ms DD/MM/YYYY') , value , 'coinmarketcap', (value-lastvalue)/lastvalue);
  lastvalue = value;
  var con = mysql.createConnection({ 
    host: DBHOST,                            
    user: DBUSER,
    password: DBPASSWORD,
    database: DB
});
  con.connect(function(err) {
    if (err) throw err;
    
    var priceQuery  = 'INSERT INTO price (currency,  priceTimestamp, value, exchange, diff) VALUES (\'' + price.currency + '\',\'' + price.timestamp + '\',' + price.value + ',\'' + price.exchange + '\',' + price.diff +')';
    con.query(priceQuery, function (err, result) {
      if (err) throw err;
      console.log("Cotação adicionada ao banco de dados...");
    });
  });
  });
  }

new CronJob('0 * * * * *', function() {                 // Executa a função getPrice a cada minuto. Imprime também na tela o horário em que é executada, apenas com a finalidade de melhor acompanhar o que está sendo feito
  getPrice();
  console.log(timestamp('HH:mm:ss.ms DD/MM/YYYY'));
}, null, true, 'America/Sao_Paulo');  

class User {                                            // Classe User, utilizada para modelar o usuário
  constructor(email, password){
	this.email=email;
	this.password=password;
}}

class Price {                                           // Classe Price, utilizada para modelar a cotação do BTC
  constructor (priceId,currency, timestamp, value, exchange, diff){
  this.priceId=priceId;
	this.currency=currency;
	this.timestamp=timestamp;
	this.value=value;
	this.exchange=exchange;
  this.diff=diff;
}}

class Order {                                           // Classe Order, utilizada para modelar uma ordem de transação
  constructor (orderId, userId, timestamp, amount, USDperBTC, opType){
  this.orderId=orderId;
  this.userId=userId;
  this.timestamp=timestamp;
  this.amount=amount;
  this.USDperBTC=USDperBTC;
  this.opType=opType;
}}
                                                        
                                                      // schema utilizado para comunicação entre o cliente e o servidor (utilizando GraphQL)
var schema = buildSchema(												
  `
  input userInput {
    email: String!
    password: String!
  }

  input NewOrderHeader{
    orderId: Int!
    userId: Int!
    timestamp: String
    amount: Float!
    USDperBTC: Float!
    opType: Boolean!
  }

  type Price {
    priceId: Int!
    currency: String!
    timestamp: String!
    value: Float!
    exchange: String!
    diff: Float}

  type Order {    
    orderId: Int!
    userId: Int!
    timestamp: String
    amount: Float!
    USDperBTC: Float!
    opType: Boolean!
  }
  

  type Mutation{                                
    register(input: userInput!) : String
    newOrderRequest (input: NewOrderHeader!) : String
    }

  type Query {
    checkPrice(limit: Int!) : [Price]
    checkOrders(limit: Int!) : [Order]
  }`

);

                                                  
var root = {                                        // conjunto de operações a ser realizadas, dependendo do que foi pedido via query ou mutation

  register: function ({input}) {                    // Faz o registro de um novo usuário, verificando se o email já não foi cadastrado préviamente
  var p1 = new Promise(
    function (resolve, reject){                                            
      var con = mysql.createConnection({ 
          host: DBHOST,                            
          user: DBUSER,
          password: DBPASSWORD,
          database: DB
        });
      con.connect(function(err) {
        if (err) throw err;

      var checkEmailQuery  = 'SELECT * FROM user WHERE email = \''+ input.email + '\'';
      con.query(checkEmailQuery, function (err, row) { // Checa se o email enviado para cadastro já está ou não no banco de dados
        if (err) throw err;
        if (Boolean(row[0])) resolve('Email já cadastrado');
        else resolve ('Usuário registrado com sucesso')})})});

  return p1.then(
    function(answer){
      if (answer == 'Email já cadastrado') return answer;
      newUser (input.email, input.password);      // Se esse for um novo usuário, adiciona-o ao banco de dados
      return answer;});
  },
  
  checkPrice: function ({limit})  {               // Retorna um número escolhido pelo cliente de cotações, salvas no banco de dados                              
  var price = new Array();

  var p1 = new Promise(
    function(resolve, reject) {
      var con = mysql.createConnection({ 
        host: DBHOST,                            
        user: DBUSER,
        password: DBPASSWORD,
        database: DB
      });
      con.connect(function(err) {
        if (err) throw err;

        var checkPriceQuery  = 'SELECT * FROM price ORDER BY priceId DESC LIMIT '+ limit; // Seleciona os últimos limit preços adicionados ao banco de dados.
        con.query(checkPriceQuery, function (err, rows) {
          if (err) throw err;
          for (var i=0; i<limit; i++) price[i] = new Price (rows[i].priceId, rows[i].currency, rows[i].priceTimestamp, rows[i].value, rows[i].exchange, rows[i].diff);
          resolve(price);       
        })})});

  return p1.then(
    function(price){
      return price;
      
    }
  );

},
  
  checkOrders: function ({limit})  {           // Retorna um número escolhido pelo cliente de ordens, salvas no banco de dados    
    var order = new Array();

    var p1 = new Promise(
      function(resolve, reject) {
        var con = mysql.createConnection({ 
          host: DBHOST,                            
          user: DBUSER,
          password: DBPASSWORD,
          database: DB
        });
        con.connect(function(err) {
          if (err) throw err;

          var checkOrdersQuery  = 'SELECT * FROM orderrequest ORDER BY orderId DESC LIMIT '+ limit;// Seleciona as últimas limit ordens adicionadas ao banco de dados.
          con.query(checkOrdersQuery, function (err, rows) {
            if (err) throw err;
            for (var i=0; i<limit; i++) order[i] = new Order (rows[i].orderId, rows[i].userId, rows[i].opTimestamp, rows[i].amount, rows[i].USDperBTC,  rows[i].opType);
            resolve (order);
            })})});

    return p1.then(
      function(order){
        return order;
      });
  },


  newOrderRequest: function ({input}) {      // Registra uma nova ordem
  newOrder (input.userId, input.timestamp, input.amount, input.USDperBTC, input.opType);
  return 'Nova ordem de transação registrada com sucesso';
  }
};

function newUser (email, password){         // Função que realiza uma query, com o banco de dados em MySQL, para cadastrar um novo usuário
  var user = new User (email, password);

	var con = mysql.createConnection({ 
  host: DBHOST,                            
  user: DBUSER,
  password: DBPASSWORD,
  database: DB
});
  con.connect(function(err) {
    if (err) throw err;
    var userQuery  = 'INSERT INTO user (email, password) VALUES (\'' + user.email + '\',\'' + user.password + '\')';
    con.query(userQuery, function (err, result) {
    if (err) throw err;
    console.log("Usuário adicionado ao banco de dados...");
    });
  });
}

                                            // Função que realiza uma query, com o banco de dados em MySQL, para cadastrar uma nova ordem
function newOrder (userId, timestamp, amount, USDperBTC, opType){
  var con = mysql.createConnection({      
  host: DBHOST,                            
  user: DBUSER,
  password: DBPASSWORD,
  database: DB
});
  con.connect(function(err) {
    if (err) throw err;
  var timestamp = require('time-stamp');
  var orderQuery  = 'INSERT INTO orderrequest (userId, opTimestamp , amount , USDperBTC , opType) VALUES (' + userId + ',\'' + timestamp('HH:mm:ss.ms DD/MM/YYYY') + '\',' + amount + ',' + USDperBTC + ',' + opType + ')';
      con.query(orderQuery, function (err, result) {
      if (err) throw err;
      console.log("Transação adicionada ao banco de dados...");
    });
  });
}

function server (){                         // Função que define as caracteristica do servidor
  var app = express();
  app.use('/main', graphqlHTTP({
    schema: schema,
    rootValue: root,
    graphiql: true,
  }));
  app.listen(4000);
  console.log('Interagindo em localhost:4000/main');}



server();                                   // Inicializa o servidor
