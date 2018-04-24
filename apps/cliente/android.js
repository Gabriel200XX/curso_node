var http = require('http');

var opcoes = {
    hostname: 'localhost',
    port: 80,
    path: '/',
    method: 'get',
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    }
}

/*var html = 'nome=José';
var json = {
    nome: 'José'
};
*/
var buffer_corpo_response = [];

/*http.get(opcoes, function(res) {
    res.on('data', function(pedaco) {
        buffer_corpo_response.push(pedaco);
    });
    
    res.on('end', function() {
        var corpoResponse = Buffer.concat(buffer_corpo_response).toString();
        console.log(corpoResponse);
    });
});*/

var req = http.request(opcoes, function(res) {
    res.on('data', function(pedaco) {
        buffer_corpo_response.push(pedaco);
    });
    
    res.on('end', function() {
        var corpoResponse = Buffer.concat(buffer_corpo_response).toString();
        console.log(corpoResponse);
        console.log(res.statusCode);
    });
});

//req.write(JSON.stringify(json));

req.end();