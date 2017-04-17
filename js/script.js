var svg = document.getElementById('svg');
var matrixSize = 10;
var dotsCount = matrixSize + 1;
var elementsPerLineCount = matrixSize + dotsCount;
var dotsGapSize = (svg.width.baseVal.value - 8) / matrixSize;
var initialPosition = { x : 4, y : 4 };
var player1 = { element: document.getElementById('p1'), color: 'blue', score: 0 };
var player2 = { element: document.getElementById('p2'), color: 'red', score: 0 };
var currentPlayer = player1;

for(var i = 0; i < elementsPerLineCount; i++){
	createLine(i % 2 == 0, i);
}

function createLine(horizontal, lineIndex){
	for(var i = 0; i < elementsPerLineCount; i++){
		svg.appendChild(createLineElement(horizontal, i % 2 == 0, lineIndex, i));
	}
}

function createLineElement(horizontal, par, lineIndex, elementIndex){
	var element = new Object();
	
	if(horizontal && par){
		element = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
		element.setAttribute('id', 'c:' + lineIndex + ':' + elementIndex);
		element.setAttribute('cx', initialPosition.x + (elementIndex / 2) * dotsGapSize);
		element.setAttribute('cy', initialPosition.y + (lineIndex / 2) * dotsGapSize);
		element.setAttribute('r', '3');
		element.setAttribute('stroke', 'black');
		element.setAttribute('stroke-width', '1');
		element.setAttribute('fill', 'black');
	}else if(horizontal && !par){
		element = document.createElementNS('http://www.w3.org/2000/svg', 'line');
		element.setAttribute('id', 'h:' + lineIndex  + ':' +  elementIndex);
		element.setAttribute('x1', (initialPosition.x + ((elementIndex - 1) / 2) * dotsGapSize) + 3);
		element.setAttribute('y1', initialPosition.y + (lineIndex / 2) * dotsGapSize);
		element.setAttribute ('x2', (initialPosition.x + ((elementIndex - 1) / 2) * dotsGapSize + dotsGapSize) - 3);
		element.setAttribute('y2', initialPosition.y + (lineIndex / 2) * dotsGapSize);
		element.setAttribute('stroke', 'white');
		element.setAttribute('stroke-width', '4');
		
		element.onclick = lineClick;
	}else if(!horizontal && par){
		element = document.createElementNS('http://www.w3.org/2000/svg', 'line');
		element.setAttribute('id', 'v:' + lineIndex  + ':' +  elementIndex);
		element.setAttribute('x1', initialPosition.x + (elementIndex / 2) * dotsGapSize);
		element.setAttribute('y1', (initialPosition.y + ((lineIndex - 1) / 2) * dotsGapSize) + 3);
		element.setAttribute('x2', initialPosition.x + (elementIndex / 2) * dotsGapSize);
		element.setAttribute('y2', (initialPosition.y + ((lineIndex - 1) / 2) * dotsGapSize + dotsGapSize) - 3);
		element.setAttribute('stroke', 'white');
		element.setAttribute('stroke-width', '4');
		
		element.onclick = lineClick;
	}else if(!horizontal && !par){
		element = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
		element.setAttribute('id', 'r:' + lineIndex  + ':' +  elementIndex);
		element.setAttribute('x', initialPosition.x + (((elementIndex - 1) / 2) * dotsGapSize) + 5);
		element.setAttribute('y', initialPosition.y + (((lineIndex - 1) / 2) * dotsGapSize) + 5);
		element.setAttribute('width', dotsGapSize - 10);
		element.setAttribute('height', dotsGapSize - 10);
		element.setAttribute('fill', 'white');
	}
	
	return element;
}

function lineClick(event){
	this.setAttribute('stroke', currentPlayer.color);
	this.className.baseVal += "clicked"
	
	var changePlayer = true;
	var splitId = this.id.split(':');
	var lineIndex = parseInt(splitId[1]);
	var elementIndex = parseInt(splitId[2]);
	
	if(splitId[0] === 'h'){
		var lineUpLeft = document.getElementById('v:' + (lineIndex - 1) + ':' + (elementIndex - 1));
		var lineUp = document.getElementById('h:' + (lineIndex - 2) + ':' + elementIndex);
		var lineUpRight = document.getElementById('v:' + (lineIndex - 1) + ':' + (elementIndex + 1));
		var lineDownLeft = document.getElementById('v:' + (lineIndex + 1) + ':' + (elementIndex - 1));
		var lineDown = document.getElementById('h:' + (lineIndex + 2) + ':' + elementIndex);
		var lineDownRight = document.getElementById('v:' + (lineIndex + 1) + ':' + (elementIndex + 1));
		
		if(lineUpLeft && lineUpLeft.getAttribute('stroke') != 'white' &&
			lineUp && lineUp.getAttribute('stroke') != 'white' &&
			lineUpRight && lineUpRight.getAttribute('stroke') != 'white'){
			changePlayer = false;
			addScore(currentPlayer);
			document.getElementById('r:' + (lineIndex - 1) + ':' + elementIndex).setAttribute('fill', currentPlayer.color);
		}
		
		if(lineDownLeft && lineDownLeft.getAttribute('stroke') != 'white' &&
			lineDown && lineDown.getAttribute('stroke') != 'white' &&
			lineDownRight && lineDownRight.getAttribute('stroke') != 'white'){
			changePlayer = false;
			addScore(currentPlayer);
			document.getElementById('r:' + (lineIndex + 1) + ':' + elementIndex).setAttribute('fill', currentPlayer.color);
		}
		
	}else if(splitId[0] === 'v'){
		var leftUp = document.getElementById('h:' + (lineIndex - 1) + ':' + (elementIndex - 1));
		var left = document.getElementById('v:' + lineIndex + ':' + (elementIndex - 2));
		var leftDown = document.getElementById('h:' + (lineIndex + 1) + ':' + (elementIndex - 1));
		var rightUp = document.getElementById('h:' + (lineIndex - 1) + ':' + (elementIndex + 1));
		var right = document.getElementById('v:' + lineIndex + ':' + (elementIndex + 2));
		var rightDown = document.getElementById('h:' + (lineIndex + 1) + ':' + (elementIndex + 1));
		
		if(leftUp && leftUp.getAttribute('stroke') != 'white' &&
			left && left.getAttribute('stroke') != 'white' &&
			leftDown && leftDown.getAttribute('stroke') != 'white'){
			changePlayer = false;
			addScore(currentPlayer);
			document.getElementById('r:' + lineIndex + ':' + (elementIndex - 1)).setAttribute('fill', currentPlayer.color);
		}
		
		if(rightUp && rightUp.getAttribute('stroke') != 'white' &&
			right && right.getAttribute('stroke') != 'white' &&
			rightDown && rightDown.getAttribute('stroke') != 'white'){
			changePlayer = false;
			addScore(currentPlayer);
			document.getElementById('r:' + lineIndex + ':' + (elementIndex + 1)).setAttribute('fill', currentPlayer.color);
		}
	}
	
	if(changePlayer){
		currentPlayer = currentPlayer == player1 ? player2 : player1;
		player1.element.classList.toggle('activePlayer');
		player2.element.classList.toggle('activePlayer');
	}
};

function addScore(player){
	player.score++;
	player.element.firstElementChild.innerText = player.score;
}