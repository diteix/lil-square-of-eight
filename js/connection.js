var brokerSession = null;
var brokerUrl = 'wss://webrtc-p2p-broker.herokuapp.com/';
//var brokerUrl = 'ws://localhost:8080';
var hosting = true;
var options;

if (window.location.search) {
	var params = window.location.search.substring(1).split('&');
	for(var i = 0; i < params.length; ++ i) {
		if(params[i].match('^webrtc-session')) {
			brokerSession = params[i].split('=')[1];
			hosting = false;
		} else if(params[i].match('^webrtc-broker')) {
			brokerUrl = params[i].split('=')[1];
		}
	}
}

var peer = new Peer(brokerUrl, {video: false, audio: false});
window.currentConnection = null;

peer.onconnection = function(connection) {
	console.log('connected: ' + connection.id);
	
	if(currentConnection){
		console.log('closing extra connections');
		connection.close();
	}
	
	currentConnection = connection;
	
	connection.ondisconnect = function() {
		console.log('disconnected');
		currentConnection = null;
	};
  
	connection.onerror = function(error) {
		console.error(error);
	};

	connection.onmessage = function(label, msg) {
		console.log('message received');
		var receivedObject = JSON.parse(msg.data);
		
		doPlayerTurn(receivedObject);
	};
	
	if (!hosting) {
		changePlayerTurn();
	}
};

peer.onerror = function(error) {
	console.error(error);
};

if (hosting) {
	console.log('hosting');
	peer.listen({metadata:{name:'data-demo'}});
  
	peer.onroute = function(route) {
		console.log('route: ' + route);
		var url = window.location.toString().split('?');
		url[1] = url[1] || '';
		var params = url[1].split('&');
		params.push('webrtc-session=' + route);
		url[1] = params.join('&');

		var div = document.getElementById('host');
		div.innerHTML = '<a href="' + url.join('?') + '" onclick="copyLinkToClipboard(this, event)">Copy Link to Clipboard</a>';
	}
} else {
	peer.connect(brokerSession);
	changePlayerTurn();
}

window.onbeforeunload = function() {
	currentConnection.close();
	peer.close();
};

function sendMessage(obj) {
	if (currentConnection) {
		currentConnection.send('reliable', JSON.stringify(obj));
	}
};