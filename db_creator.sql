  CREATE TABLE user 			(userId  INT AUTO_INCREMENT PRIMARY KEY, email VARCHAR(127)	, password VARCHAR(63) 		);
  CREATE TABLE orderrequest 	(orderId INT AUTO_INCREMENT PRIMARY KEY, userId INT 		, opTimestamp VARCHAR(23)	, amount FLOAT, USDperBTC FLOAT		 , opType BIT );
  CREATE TABLE price 			(priceId INT AUTO_INCREMENT PRIMARY KEY, currency VARCHAR(4), priceTimestamp VARCHAR(23), value FLOAT , exchange VARCHAR (63), diff FLOAT );