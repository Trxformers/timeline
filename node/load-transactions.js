// een node js file om json stukjes met websockets te serveren

var Rx = require('rx');

var express = require('express');

var app = express();

var expressWs = require('express-ws')(app); //app = express app 

var json = require("../proefjes/simple-tx.json");

 // var newJson = json.transactions.map( function(tx){ 
 //         return [tx.verwerkingsDatum, tx.saldoNaBoeking];
 //      });

 var data = json.transactions;
    
var source = Rx.Observable.interval(1000).take(data.length)

app.ws('/', function(ws, req) {
  ws.on('message', function(msg) {
    console.log(msg);
  });
  console.log('socket', req.testing);
});    

// app.get('/', function(req, res){
//   res.send('jsonObj '+ json.transactions[0].saldoNaBoeking);
// });

app.ws('/echo', function(ws, req) {
	console.log("echo called");
	// ws.send("hi");
 //  ws.on('message', function(msg) {
 //  	ws.send(msg);
 //  	});

	streamPage(ws, req, 0);

})

function streamPage(ws, req, page) {
	var observer = createObserver(ws, req, page);

  	loadTransactions(page).subscribe(observer);
}

function createObserver(ws, req, page) {
	var observer = Rx.Observer.create(
		function (x) {
        	console.log(x);
        	//  hier zouden we het middels websocket moeten pushen

        	//ws.send(x.cnt + " | " + x.value.verwerkingsDatum + " | " + x.value.saldoNaBoeking);
        	console.log("Sending x.value");
        	console.log(x.value);
        	var msgToSend = JSON.stringify(x.value);
        	console.log(" >> sending: "+msgToSend);
        	ws.send(msgToSend);
      	},
      	function (err) {
      		console.log("Error: "+err);
      	},
      	function () {
      		console.log("Completed");
      		
      		streamPage(ws, req, page+1);
      	});

	return observer;
}

// page geeft aan welke file we inladen. Een rekening kent meerdere files, en wij streamen het als 1
function loadTransactions(page) {
	var filenumber = page % 3;
	var file = "../tx-met-bedrag."+filenumber+".json";

	console.log("loadTransactions("+page+") file="+file);
	var json = require(file);

	var data = json.transactions;
	var source = Rx.Observable.interval(1000).take(data.length)

	return source.map( function (v) {
      return { "cnt":v, "value":data[v] };
    })

		

}


app.listen(3000);
console.log('Server running at port 3000');
