# API para aplicação em estágio

Nesse projeto foi implementada uma API de acordo com os requisitos solicitados na documentação, com excessão de um modelo de autenticação e o uso de um Dockerfile.
Ambas as outras partes optativas foram realizadas, ou seja, o projeto foi construído utilizando GraphQL, e o modelo da cotação possui o float diff, que envia o percentual de diferença entre uma cotação e a sua anterior.

## Requisitos

Além dos pacotes obrigatórios e recomendados (express, graphql, express-graphql, mysql, cron e node-coinmarketcap), foi também utilizado o pacote "time-stamp", com o intuito único de simplificar a criação da data, que é uma das variáveis que deve estar presente em alguns dos objetos definidos.
Para instalá-lo com o npm, basta utilizar o comando:

```
npm install time-stamp
```

### Pré-requisitos

Além dos pacotes citados acima, nada mais deve ser instalado além dos programas que foram solicitados o uso, como o MySQL e o NodeJS.


### Configurando

Para o banco de dados ser acessado corretamente, deve-se preencher as configurações, que se encontram bem no início do código, no formato:

```
const DBHOST = "localhost";                         
const DBUSER = "root";
const DBPASSWORD = "admin";
const DB = "mydb";
```

Ou, pode-se apenas gerar um banco de dados com essas configurações.
Suas tabelas são criadas através de três queries em SQL, que se encontram no arquivo db_creator.sql:

```
  CREATE TABLE user (userId  INT AUTO_INCREMENT PRIMARY KEY, email VARCHAR(127) , password VARCHAR(63));
  CREATE TABLE orderrequest (orderId INT AUTO_INCREMENT PRIMARY KEY, userId INT , opTimestamp VARCHAR(23), amount FLOAT, USDperBTC FLOAT, opType BIT);
  CREATE TABLE price (priceId INT AUTO_INCREMENT PRIMARY KEY, currency VARCHAR(4), priceTimestamp VARCHAR(23), value FLOAT , exchange VARCHAR (63), diff FLOAT);
```

### Testes
Para efeito de teste, foi utilizada a ferramenta GraphiQL. Para acessar a sua interface, basta executar o programa e digitar no navegador:

```
localhost:4000/main
```

Nessa interface, as quatro funcionalidades implementadas (registro de novo usuário, registro de nova ordem, Checagem da cotação atual do BTC (em USD), e Checagem das ordens já registradas) podem ser testadas. Nota-se que, por autenticação não ter sido implementada, todas essas funções acabaram sendo públicas.
Por exemplo, para se registrar um novo usuário, se pode utilizar a seguinte mutation:

```
mutation {
  register(input: {email: "joao@hotmail.com", password: "p4ssw0rd"})}
```
Que retornará a seguinte mensagem, quando executado pela primeira vez:


```
{
  "data": {
    "register": "Usuário registrado com sucesso"
  }
}
```
Caso se tente a mesma mutation novamente, será identificado que tal email já está na base de dados e será retornada a mensagem:

```
{
  "data": {
    "register": "Email já cadastrado"
  }
}
```
Para as queries (checkPrice e checkOrders), é utilizado o parâmetro limit, que define quantos dos últimos valores serão retornados. Por exemplo:

``` 
query {
  checkPrice(limit: 3){
    timestamp
    value
    diff
  }}

```
Pelo parâmetro limit ter sido escolhido como 3, iremos obter esses três resultados:

```
{
  "data": {
    "checkPrice": [
      {
        "timestamp": "00:36:01.213 06/03/2018",
        "value": 11277.8,
        "diff": -0.0000797964
      },
      {
        "timestamp": "00:35:01.036 06/03/2018",
        "value": 11278.7,
        "diff": 0
      },
      {
        "timestamp": "00:34:01.126 06/03/2018",
        "value": 11278.7,
        "diff": 0
      }
    ]
  }
}
```


## Notas
Por questão de simplicidade, é consultada apenas a exchange coinmarketcap, e se utilizou o valor padrão em USD.
Uma nova cotação é obtida a cada minuto, exatamente quando o valor dos segundos vale 0.

A autenticação não foi implementada por uma mera questão de prazo de entrega. Como essa era a parte que eu considerava a mais difícil (afinal, nunca tive contato com essa área), deixei para implementar ela por último. Por mais que a implementação tenha sido inicializada, percebi que não haveria tempo suficiente e resolvi removê-la e fazer a entrega da API sem essa funcionalidade.
