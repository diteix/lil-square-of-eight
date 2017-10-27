window.LilSquareOfEight = (function LilSquareOfEight() {
	var boardProperties = {
		svg: null,
		matrixSize: 10,
		dotsCount: function() {
			return this.matrixSize + 1;
		},
		dotRadius: 3,
		elementsPerLineCount: function() {
			return this.matrixSize + this.dotsCount();
		},
		svgLineLength: function() {
			return (this.svg.width.baseVal.value - 8) / this.matrixSize;
		},
		initialPosition: { x : 4, y : 4 },
		elementsMatrix: null,
		createLine: function (lineIndex) {
			for (var i = 0; i < this.elementsPerLineCount(); i++) {
				var newElement = this.createLineElement(lineIndex, i);
				this.elementsMatrix[lineIndex][i] = newElement;
				this.svg.appendChild(newElement);
			}
		},
		createLineElement: function (lineIndex, elementIndex) {
			var element = new Object();
			var isLineEven = lineIndex % 2 == 0;
			var isElementEven = elementIndex % 2 == 0;
			var svgLineLength = this.svgLineLength();
			
			if (isLineEven && isElementEven) {
				element = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
				element.setAttribute('id', lineIndex + ':' + elementIndex);
				element.setAttribute('cx', this.initialPosition.x + (elementIndex / 2) * svgLineLength);
				element.setAttribute('cy', this.initialPosition.y + (lineIndex / 2) * svgLineLength);
				element.setAttribute('r', this.dotRadius);
				element.setAttribute('stroke', 'black');
				element.setAttribute('stroke-width', '1');
				element.setAttribute('fill', 'black');
			} else if(isLineEven && !isElementEven) {
				element = document.createElementNS('http://www.w3.org/2000/svg', 'line');
				element.setAttribute('id', lineIndex  + ':' +  elementIndex);
				element.setAttribute('x1', (this.initialPosition.x + ((elementIndex - 1) / 2) * svgLineLength) + this.dotRadius);
				element.setAttribute('y1', this.initialPosition.y + (lineIndex / 2) * svgLineLength);
				element.setAttribute('x2', (this.initialPosition.x + ((elementIndex - 1) / 2) * svgLineLength + svgLineLength) - this.dotRadius);
				element.setAttribute('y2', this.initialPosition.y + (lineIndex / 2) * svgLineLength);
				element.setAttribute('stroke', 'white');
				element.setAttribute('stroke-width', '4');
				
				element.onclick = this.lineClick;
			} else if (!isLineEven && isElementEven) {
				element = document.createElementNS('http://www.w3.org/2000/svg', 'line');
				element.setAttribute('id', lineIndex  + ':' +  elementIndex);
				element.setAttribute('x1', this.initialPosition.x + (elementIndex / 2) * svgLineLength);
				element.setAttribute('y1', (this.initialPosition.y + ((lineIndex - 1) / 2) * svgLineLength) + this.dotRadius);
				element.setAttribute('x2', this.initialPosition.x + (elementIndex / 2) * svgLineLength);
				element.setAttribute('y2', (this.initialPosition.y + ((lineIndex - 1) / 2) * svgLineLength + svgLineLength) - this.dotRadius);
				element.setAttribute('stroke', 'white');
				element.setAttribute('stroke-width', '4');
				
				element.onclick = this.lineClick;
			} else if (!isLineEven && !isElementEven) {
				element = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
				element.setAttribute('id', lineIndex  + ':' +  elementIndex);
				element.setAttribute('x', this.initialPosition.x + (((elementIndex - 1) / 2) * svgLineLength) + 5);
				element.setAttribute('y', this.initialPosition.y + (((lineIndex - 1) / 2) * svgLineLength) + 5);
				element.setAttribute('width', svgLineLength - 10);
				element.setAttribute('height', svgLineLength - 10);
				element.setAttribute('fill', 'white');
			}
			
			return element;
		},
		lineClick: function () {
			var splitId = this.id.split(':');
			var lineIndex = parseInt(splitId[0]);
			var elementIndex = parseInt(splitId[1]);
			
			scoreProperties.resolveTurn({ lineIndex: lineIndex, elementIndex: elementIndex, player: scoreProperties.currentPlayer });
		},
		create2DArray: function (rows) {
			var arr = [];
		
			for (var i=0;i<rows;i++) {
				arr[i] = [];
			}
		
			return arr;
		},
		initialize: function() {
			this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
			this.svg.id = 'svg';
			this.svg.setAttribute("height", "700px");
			this.svg.setAttribute("width", "700px");

			this.elementsMatrix = this.create2DArray(this.elementsPerLineCount());
			
			for (var i = 0; i < this.elementsPerLineCount(); i++) {
				this.createLine(i);
			}

			var boardContainer = document.createElement('div');
			boardContainer.id = 'boardContainer';
			boardContainer.appendChild(this.svg);

			return boardContainer;
		}
	};

	var scoreProperties = {
		playerOne: null,
		playerTwo: null,
		currentPlayer: null,
		resolveTurn: function(turnInfo) {
			this.doPlayerTurn(turnInfo);
			//sendMessage(turnInfo);
		},
		doPlayerTurn: function(turnInfo) {
			var that = boardProperties.elementsMatrix[turnInfo.lineIndex][turnInfo.elementIndex]
			that.setAttribute('stroke', turnInfo.player.color);
			that.className.baseVal += "clicked"
			
			var changePlayer = true;
			
			if (turnInfo.lineIndex % 2 == 0) {
				var lineUpLeft, lineUp, lineUpRight, lineDownLeft, lineDown, lineDownRight;
				
				if (turnInfo.lineIndex > 0) {
					lineUpLeft = boardProperties.elementsMatrix[turnInfo.lineIndex - 1][turnInfo.elementIndex - 1];
					lineUp = boardProperties.elementsMatrix[turnInfo.lineIndex - 2][turnInfo.elementIndex];
					lineUpRight = boardProperties.elementsMatrix[turnInfo.lineIndex - 1][turnInfo.elementIndex + 1];
				}
				
				if (turnInfo.lineIndex < boardProperties.elementsMatrix.length - 1) {
					lineDownLeft = boardProperties.elementsMatrix[turnInfo.lineIndex + 1][turnInfo.elementIndex - 1];
					lineDown = boardProperties.elementsMatrix[turnInfo.lineIndex + 2][turnInfo.elementIndex];
					lineDownRight = boardProperties.elementsMatrix[turnInfo.lineIndex + 1][turnInfo.elementIndex + 1];
				}
				
				if (lineUpLeft && lineUpLeft.getAttribute('stroke') != 'white' &&
				lineUp && lineUp.getAttribute('stroke') != 'white' &&
				lineUpRight && lineUpRight.getAttribute('stroke') != 'white') {
					changePlayer = false;
					this.addScore(turnInfo.player);
					boardProperties.elementsMatrix[turnInfo.lineIndex - 1][turnInfo.elementIndex].setAttribute('fill', turnInfo.player.color);
				}
				
				if (lineDownLeft && lineDownLeft.getAttribute('stroke') != 'white' &&
				lineDown && lineDown.getAttribute('stroke') != 'white' &&
				lineDownRight && lineDownRight.getAttribute('stroke') != 'white') {
					changePlayer = false;
					this.addScore(turnInfo.player);
					boardProperties.elementsMatrix[turnInfo.lineIndex + 1][turnInfo.elementIndex].setAttribute('fill', turnInfo.player.color);
				}
				
			} else {
				var lineUpLeft, lineLeft, lineDownLeft, lineUpRight, lineRight, lineDownRight;
				
				if (turnInfo.elementIndex > 0) {
					lineUpLeft = boardProperties.elementsMatrix[turnInfo.lineIndex - 1][turnInfo.elementIndex - 1];
					lineLeft = boardProperties.elementsMatrix[turnInfo.lineIndex][turnInfo.elementIndex - 2];
					lineDownLeft = boardProperties.elementsMatrix[turnInfo.lineIndex + 1][turnInfo.elementIndex - 1];
				}

				if (turnInfo.elementIndex < boardProperties.elementsMatrix[turnInfo.lineIndex].length - 1) {
					lineUpRight = boardProperties.elementsMatrix[turnInfo.lineIndex - 1][turnInfo.elementIndex + 1];
					lineRight = boardProperties.elementsMatrix[turnInfo.lineIndex][turnInfo.elementIndex + 2];
					lineDownRight = boardProperties.elementsMatrix[turnInfo.lineIndex + 1][turnInfo.elementIndex + 1];
				}
				
				if (lineUpLeft && lineUpLeft.getAttribute('stroke') != 'white' &&
				lineLeft && lineLeft.getAttribute('stroke') != 'white' &&
				lineDownLeft && lineDownLeft.getAttribute('stroke') != 'white') {
					changePlayer = false;
					this.addScore(turnInfo.player);
					boardProperties.elementsMatrix[turnInfo.lineIndex][turnInfo.elementIndex - 1].setAttribute('fill', turnInfo.player.color);
				}
				
				if (lineUpRight && lineUpRight.getAttribute('stroke') != 'white' &&
				lineRight && lineRight.getAttribute('stroke') != 'white' &&
				lineDownRight && lineDownRight.getAttribute('stroke') != 'white') {
					changePlayer = false;
					this.addScore(turnInfo.player);
					boardProperties.elementsMatrix[turnInfo.lineIndex][turnInfo.elementIndex + 1].setAttribute('fill', turnInfo.player.color);
				}
			}
			
			turnInfo.changePlayer = changePlayer;
	
			if (changePlayer) {
				this.changePlayerTurn();
			}
			
			return changePlayer;
		},
		changePlayerTurn: function() {
			//if (!currentConnection) {
				this.currentPlayer = this.currentPlayer == this.playerOne ? this.playerTwo : this.playerOne;
				this.playerOne.element.classList.toggle('activePlayer');
				this.playerTwo.element.classList.toggle('activePlayer');
			//} else {
				//svg.classList.toggle('clicked');
			//}
		},
		addScore: function(player) {
			if (player == this.currentPlayer) {
				player.score++;
			}
			
			player.scoreElement.innerText = player.score;
		},
		initialize: function(playerOneConfig, playerTwoConfig) {
			this.playerOne = { name: 'Player 1', element: null, color: 'blue', score: 0, scoreElement: null };
			this.playerTwo = { name: 'Player 2', element: null, color: 'red', score: 0, scoreElement: null };

			if (playerOneConfig) {
				if (playerOneConfig.color) {
					this.playerOne.color = playerOneConfig.color;
				}
				
				if (playerOneConfig.name) {
					this.playerOne.name = playerOneConfig.name;
				}
			}

			if (playerTwoConfig) {
				if (playerTwoConfig.color) {
					this.playerTwo.color = playerTwoConfig.color;
				}
				
				if (playerTwoConfig.name) {
					this.playerTwo.name = playerTwoConfig.name;
				}
			}

			this.currentPlayer = this.playerOne;

			var playerOneNameBox = document.createElement('label');
			playerOneNameBox.textContent = this.playerOne.name;

			this.playerOne.scoreElement = document.createElement('span');
			this.playerOne.scoreElement.textContent = this.playerOne.score;
			this.playerOne.scoreElement.id = 'pOneScore';
			
			this.playerOne.element = document.createElement('div');
			this.playerOne.element.id = 'pOne';
			this.playerOne.element.classList.add('activePlayer');
			this.playerOne.element.appendChild(playerOneNameBox);
			this.playerOne.element.appendChild(this.playerOne.scoreElement);

			var versusBox = document.createElement('span');
			versusBox.textContent = 'X';

			this.playerTwo.scoreElement = document.createElement('span');
			this.playerTwo.scoreElement.textContent = this.playerTwo.score;
			this.playerTwo.scoreElement.id = 'pTwoScore';

			var playerTwoNameBox = document.createElement('label');
			playerTwoNameBox.textContent = this.playerTwo.name;
			
			this.playerTwo.element = document.createElement('div');
			this.playerTwo.element.id = 'pTwo';
			this.playerTwo.element.appendChild(this.playerTwo.scoreElement);
			this.playerTwo.element.appendChild(playerTwoNameBox);

			var scoreContainer = document.createElement('div');
			scoreContainer.id = 'scoreContainer';

			scoreContainer.appendChild(this.playerOne.element);
			scoreContainer.appendChild(versusBox);
			scoreContainer.appendChild(this.playerTwo.element);

			return scoreContainer;
		}
	};

	function copyClipboard() {
		var input = document.getElementById('urlToShare');
		input.select();
		
		try {
			var successful = document.execCommand('copy');
			var msg = successful ? 'successful' : 'unsuccessful';
			console.log('Copying text command was ' + msg);
		} catch (err) {
			console.log('Oops, unable to copy');
		}
	};
	
	function copyLinkToClipboard(element, event) {
		event.preventDefault();
		
		if (window.clipboardData && window.clipboardData.setData) {
			// IE specific code path to prevent textarea being shown while dialog is visible.
			return clipboardData.setData("Text", element.getAttribute('href')); 
	
		} else if (document.queryCommandSupported && document.queryCommandSupported("copy")) {
			var textarea = document.createElement("textarea");
			textarea.textContent = element.getAttribute('href');
			textarea.style.position = "fixed";  // Prevent scrolling to bottom of page in MS Edge.
			document.body.appendChild(textarea);
			textarea.select();
			try {
				return document.execCommand("copy");  // Security exception may be thrown by some browsers.
			} catch (ex) {
				console.warn("Copy to clipboard failed.", ex);
				return false;
			} finally {
				document.body.removeChild(textarea);
			}
		}
	};

	return {
		gameContainer: null,
		initialize: function(playerOneConfig, playerTwoConfig) {
			var scoreContainer = scoreProperties.initialize(playerOneConfig, playerTwoConfig);
			var boardContainer = boardProperties.initialize();

			this.gameContainer = document.createElement('div');
			this.gameContainer.id = 'gameContainer';
			this.gameContainer.appendChild(scoreContainer);
			this.gameContainer.appendChild(boardContainer);

			document.body.appendChild(this.gameContainer);

			var st = document.createElement('style');
			st.innerText = '#gameContainer{text-align:center}#scoreContainer{display:inline-block}#scoreContainer *{vertical-align:middle;padding:5px 10px}#scoreContainer div{opacity:.5;display:initial}#scoreContainer div.activePlayer{opacity:1;font-weight:700}#scoreContainer div span{width:50px;display:inline-block;color:#fff;font-size:35px;font-weight:700}#pOneScore{background-color:' + scoreProperties.playerOne.color + '}#pTwoScore{background-color:' + scoreProperties.playerTwo.color + '}#boardContainer{margin:35px 0 0}line{cursor:pointer}.clicked{pointer-events:none}';

			document.head.appendChild(st);
		},
		restartMatch: function() {
			this.gameContainer.outerHTML = '';
			this.gameContainer = null;
			this.initialize();
		}
	};
})();
LilSquareOfEight.initialize({color: 'green', name: 'Diego'});

/*var svg = document.getElementById('svg');
var matrixSize = 10;
var dotsCount = matrixSize + 1;
var dotRadius = 3;
var elementsPerLineCount = matrixSize + dotsCount;
var svgLineLength = (svg.width.baseVal.value - 8) / matrixSize;
var initialPosition = { x : 4, y : 4 };
var player1 = { elementId: 'p1', color: 'blue', score: 0 };
var player2 = { elementId: 'p2', color: 'red', score: 0 };
var currentPlayer = player1;
var elementsMatrix = create2DArray(elementsPerLineCount);

for (var i = 0; i < elementsPerLineCount; i++) {
	createLine(i);
}

function restartMatch(event) {
	location.reload();
}

function createLine(lineIndex) {
	for (var i = 0; i < elementsPerLineCount; i++) {
		var newElement = createLineElement(lineIndex, i);
		elementsMatrix[lineIndex][i] = newElement;
		svg.appendChild(newElement);
	}
}

function createLineElement(lineIndex, elementIndex) {
	var element = new Object();
	
	var isLineEven = lineIndex % 2 == 0;
	var isElementEven = elementIndex % 2 == 0;
	
	if (isLineEven && isElementEven) {
		element = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
		element.setAttribute('id', 'c:' + lineIndex + ':' + elementIndex);
		element.setAttribute('cx', initialPosition.x + (elementIndex / 2) * svgLineLength);
		element.setAttribute('cy', initialPosition.y + (lineIndex / 2) * svgLineLength);
		element.setAttribute('r', dotRadius);
		element.setAttribute('stroke', 'black');
		element.setAttribute('stroke-width', '1');
		element.setAttribute('fill', 'black');
	} else if(isLineEven && !isElementEven) {
		element = document.createElementNS('http://www.w3.org/2000/svg', 'line');
		element.setAttribute('id', 'h:' + lineIndex  + ':' +  elementIndex);
		element.setAttribute('x1', (initialPosition.x + ((elementIndex - 1) / 2) * svgLineLength) + dotRadius);
		element.setAttribute('y1', initialPosition.y + (lineIndex / 2) * svgLineLength);
		element.setAttribute('x2', (initialPosition.x + ((elementIndex - 1) / 2) * svgLineLength + svgLineLength) - dotRadius);
		element.setAttribute('y2', initialPosition.y + (lineIndex / 2) * svgLineLength);
		element.setAttribute('stroke', 'white');
		element.setAttribute('stroke-width', '4');
		
		element.onclick = lineClick;
	} else if (!isLineEven && isElementEven) {
		element = document.createElementNS('http://www.w3.org/2000/svg', 'line');
		element.setAttribute('id', 'v:' + lineIndex  + ':' +  elementIndex);
		element.setAttribute('x1', initialPosition.x + (elementIndex / 2) * svgLineLength);
		element.setAttribute('y1', (initialPosition.y + ((lineIndex - 1) / 2) * svgLineLength) + dotRadius);
		element.setAttribute('x2', initialPosition.x + (elementIndex / 2) * svgLineLength);
		element.setAttribute('y2', (initialPosition.y + ((lineIndex - 1) / 2) * svgLineLength + svgLineLength) - dotRadius);
		element.setAttribute('stroke', 'white');
		element.setAttribute('stroke-width', '4');
		
		element.onclick = lineClick;
	} else if (!isLineEven && !isElementEven) {
		element = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
		element.setAttribute('id', 'r:' + lineIndex  + ':' +  elementIndex);
		element.setAttribute('x', initialPosition.x + (((elementIndex - 1) / 2) * svgLineLength) + 5);
		element.setAttribute('y', initialPosition.y + (((lineIndex - 1) / 2) * svgLineLength) + 5);
		element.setAttribute('width', svgLineLength - 10);
		element.setAttribute('height', svgLineLength - 10);
		element.setAttribute('fill', 'white');
	}
	
	return element;
}

function lineClick(event) {
	var splitId = this.id.split(':');
	var lineIndex = parseInt(splitId[1]);
	var elementIndex = parseInt(splitId[2]);
	
	resolveTurn({ lineIndex: lineIndex, elementIndex: elementIndex, player: currentPlayer });
};

function resolveTurn(turnInfo){
	changePlayer = doPlayerTurn(turnInfo);
	sendMessage(turnInfo);
}

function doPlayerTurn(turnInfo){
	var that = elementsMatrix[turnInfo.lineIndex][turnInfo.elementIndex]
	that.setAttribute('stroke', turnInfo.player.color);
	that.className.baseVal += "clicked"
	
	var changePlayer = true;
	
	if (turnInfo.lineIndex % 2 == 0) {
		var lineUpLeft, lineUp, lineUpRight, lineDownLeft, lineDown, lineDownRight;
		
		if (turnInfo.lineIndex > 0) {
			lineUpLeft = elementsMatrix[turnInfo.lineIndex - 1][turnInfo.elementIndex - 1];
			lineUp = elementsMatrix[turnInfo.lineIndex - 2][turnInfo.elementIndex];
			lineUpRight = elementsMatrix[turnInfo.lineIndex - 1][turnInfo.elementIndex + 1];
		}
		
		if (turnInfo.lineIndex < elementsMatrix.length - 1) {
			lineDownLeft = elementsMatrix[turnInfo.lineIndex + 1][turnInfo.elementIndex - 1];
			lineDown = elementsMatrix[turnInfo.lineIndex + 2][turnInfo.elementIndex];
			lineDownRight = elementsMatrix[turnInfo.lineIndex + 1][turnInfo.elementIndex + 1];
		}
		
		if (lineUpLeft && lineUpLeft.getAttribute('stroke') != 'white' &&
			lineUp && lineUp.getAttribute('stroke') != 'white' &&
			lineUpRight && lineUpRight.getAttribute('stroke') != 'white') {
			changePlayer = false;
			addScore(turnInfo.player);
			elementsMatrix[turnInfo.lineIndex - 1][turnInfo.elementIndex].setAttribute('fill', turnInfo.player.color);
		}
		
		if (lineDownLeft && lineDownLeft.getAttribute('stroke') != 'white' &&
			lineDown && lineDown.getAttribute('stroke') != 'white' &&
			lineDownRight && lineDownRight.getAttribute('stroke') != 'white') {
			changePlayer = false;
			addScore(turnInfo.player);
			elementsMatrix[turnInfo.lineIndex + 1][turnInfo.elementIndex].setAttribute('fill', turnInfo.player.color);
		}
		
	} else {
		var leftUp = elementsMatrix[turnInfo.lineIndex - 1][turnInfo.elementIndex - 1];
		var left = elementsMatrix[turnInfo.lineIndex][turnInfo.elementIndex - 2];
		var leftDown = elementsMatrix[turnInfo.lineIndex + 1][turnInfo.elementIndex - 1];
		var rightUp = elementsMatrix[turnInfo.lineIndex - 1][turnInfo.elementIndex + 1];
		var right = elementsMatrix[turnInfo.lineIndex][turnInfo.elementIndex];
		var rightDown = elementsMatrix[turnInfo.lineIndex + 1][turnInfo.elementIndex + 1];
		
		if (leftUp && leftUp.getAttribute('stroke') != 'white' &&
			left && left.getAttribute('stroke') != 'white' &&
			leftDown && leftDown.getAttribute('stroke') != 'white') {
			changePlayer = false;
			addScore(turnInfo.player);
			elementsMatrix[turnInfo.lineIndex][turnInfo.elementIndex - 1].setAttribute('fill', turnInfo.player.color);
		}
		
		if (rightUp && rightUp.getAttribute('stroke') != 'white' &&
			right && right.getAttribute('stroke') != 'white' &&
			rightDown && rightDown.getAttribute('stroke') != 'white') {
			changePlayer = false;
			addScore(turnInfo.player);
			elementsMatrix[turnInfo.lineIndex][turnInfo.elementIndex + 1].setAttribute('fill', turnInfo.player.color);
		}
	}
	
	turnInfo.changePlayer = changePlayer;
	if (changePlayer) {
		changePlayerTurn();
	}
	
	return changePlayer;
}

function changePlayerTurn(){
	if (!currentConnection) {
		currentPlayer = currentPlayer == player1 ? player2 : player1;
		document.getElementById(player1.elementId).classList.toggle('activePlayer');
		document.getElementById(player2.elementId).classList.toggle('activePlayer');
	} else {
		svg.classList.toggle('clicked');
	}
}

function addScore(player) {
	if (player == currentPlayer) {
		player.score++;
	}
	
	document.getElementById(player.elementId).firstElementChild.innerText = player.score;
}

function create2DArray(rows) {
	var arr = [];

	for (var i=0;i<rows;i++) {
		arr[i] = [];
	}

	return arr;
}

function copyClipboard() {
	var input = document.getElementById('urlToShare');
	input.select();
	
	try {
		var successful = document.execCommand('copy');
		var msg = successful ? 'successful' : 'unsuccessful';
		console.log('Copying text command was ' + msg);
	} catch (err) {
		console.log('Oops, unable to copy');
	}
}

function copyLinkToClipboard(element, event) {
	event.preventDefault();
	
	if (window.clipboardData && window.clipboardData.setData) {
		// IE specific code path to prevent textarea being shown while dialog is visible.
		return clipboardData.setData("Text", element.getAttribute('href')); 

	} else if (document.queryCommandSupported && document.queryCommandSupported("copy")) {
		var textarea = document.createElement("textarea");
		textarea.textContent = element.getAttribute('href');
		textarea.style.position = "fixed";  // Prevent scrolling to bottom of page in MS Edge.
		document.body.appendChild(textarea);
		textarea.select();
		try {
			return document.execCommand("copy");  // Security exception may be thrown by some browsers.
		} catch (ex) {
			console.warn("Copy to clipboard failed.", ex);
			return false;
		} finally {
			document.body.removeChild(textarea);
		}
	}
}*/