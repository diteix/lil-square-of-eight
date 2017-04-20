var svg = document.getElementById('svg');
			var matrixSize = 10;
			var dotsCount = matrixSize + 1;
			var dotRadius = 3;
			var elementsPerLineCount = matrixSize + dotsCount;
			var svgLineLength = (svg.width.baseVal.value - 8) / matrixSize;
			var initialPosition = { x : 4, y : 4 };
			var player1 = { element: document.getElementById('p1'), color: 'blue', score: 0 };
			var player2 = { element: document.getElementById('p2'), color: 'red', score: 0 };
			var currentPlayer = player1;
			var elementsMatrix = create2DArray(elementsPerLineCount);

			for(var i = 0; i < elementsPerLineCount; i++){
				createLine(i);
			}
			
			function restartMatch(event) {
				location.reload();
			}
			
			function createLine(lineIndex){
				for (var i = 0; i < elementsPerLineCount; i++) {
					var newElement = createLineElement(lineIndex, i);
					elementsMatrix[lineIndex][i] = newElement;
					svg.appendChild(newElement);
				}
			}
			
			function createLineElement(lineIndex, elementIndex){
				var element = new Object();
				
				var isLineEven = lineIndex % 2 == 0;
				var isElementEven = elementIndex % 2 == 0;
				
				if(isLineEven && isElementEven){
					element = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
					element.setAttribute('id', 'c:' + lineIndex + ':' + elementIndex);
					element.setAttribute('cx', initialPosition.x + (elementIndex / 2) * svgLineLength);
					element.setAttribute('cy', initialPosition.y + (lineIndex / 2) * svgLineLength);
					element.setAttribute('r', dotRadius);
					element.setAttribute('stroke', 'black');
					element.setAttribute('stroke-width', '1');
					element.setAttribute('fill', 'black');
				}else if(isLineEven && !isElementEven){
					element = document.createElementNS('http://www.w3.org/2000/svg', 'line');
					element.setAttribute('id', 'h:' + lineIndex  + ':' +  elementIndex);
					element.setAttribute('x1', (initialPosition.x + ((elementIndex - 1) / 2) * svgLineLength) + dotRadius);
					element.setAttribute('y1', initialPosition.y + (lineIndex / 2) * svgLineLength);
					element.setAttribute('x2', (initialPosition.x + ((elementIndex - 1) / 2) * svgLineLength + svgLineLength) - dotRadius);
					element.setAttribute('y2', initialPosition.y + (lineIndex / 2) * svgLineLength);
					element.setAttribute('stroke', 'white');
					element.setAttribute('stroke-width', '4');
					
					element.onclick = lineClick;
				}else if(!isLineEven && isElementEven){
					element = document.createElementNS('http://www.w3.org/2000/svg', 'line');
					element.setAttribute('id', 'v:' + lineIndex  + ':' +  elementIndex);
					element.setAttribute('x1', initialPosition.x + (elementIndex / 2) * svgLineLength);
					element.setAttribute('y1', (initialPosition.y + ((lineIndex - 1) / 2) * svgLineLength) + dotRadius);
					element.setAttribute('x2', initialPosition.x + (elementIndex / 2) * svgLineLength);
					element.setAttribute('y2', (initialPosition.y + ((lineIndex - 1) / 2) * svgLineLength + svgLineLength) - dotRadius);
					element.setAttribute('stroke', 'white');
					element.setAttribute('stroke-width', '4');
					
					element.onclick = lineClick;
				}else if(!isLineEven && !isElementEven){
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
		
			function lineClick(event){
				this.setAttribute('stroke', currentPlayer.color);
				this.className.baseVal += "clicked"
				
				var changePlayer = true;
				var splitId = this.id.split(':');
				var lineIndex = parseInt(splitId[1]);
				var elementIndex = parseInt(splitId[2]);
				
				if (lineIndex % 2 == 0) {
					var lineUpLeft, lineUp, lineUpRight, lineDownLeft, lineDown, lineDownRight;
					
					if (lineIndex > 0) {
						lineUpLeft = elementsMatrix[lineIndex - 1][elementIndex - 1];
						lineUp = elementsMatrix[lineIndex - 2][elementIndex];
						lineUpRight = elementsMatrix[lineIndex - 1][elementIndex + 1];
					}
					
					if (lineIndex < elementsMatrix.length - 1) {
						lineDownLeft = elementsMatrix[lineIndex + 1][elementIndex - 1];
						lineDown = elementsMatrix[lineIndex + 2][elementIndex];
						lineDownRight = elementsMatrix[lineIndex + 1][elementIndex + 1];
					}
					
					if(lineUpLeft && lineUpLeft.getAttribute('stroke') != 'white' &&
						lineUp && lineUp.getAttribute('stroke') != 'white' &&
						lineUpRight && lineUpRight.getAttribute('stroke') != 'white'){
						changePlayer = false;
						addScore(currentPlayer);
						elementsMatrix[lineIndex - 1][elementIndex].setAttribute('fill', currentPlayer.color);
					}
					
					if(lineDownLeft && lineDownLeft.getAttribute('stroke') != 'white' &&
						lineDown && lineDown.getAttribute('stroke') != 'white' &&
						lineDownRight && lineDownRight.getAttribute('stroke') != 'white'){
						changePlayer = false;
						addScore(currentPlayer);
						elementsMatrix[lineIndex + 1][elementIndex].setAttribute('fill', currentPlayer.color);
					}
					
				} else {
					var leftUp = elementsMatrix[lineIndex - 1][elementIndex - 1];
					var left = elementsMatrix[lineIndex][elementIndex - 2];
					var leftDown = elementsMatrix[lineIndex + 1][elementIndex - 1];
					var rightUp = elementsMatrix[lineIndex - 1][elementIndex + 1];
					var right = elementsMatrix[lineIndex][elementIndex];
					var rightDown = elementsMatrix[lineIndex + 1][elementIndex + 1];
					
					if(leftUp && leftUp.getAttribute('stroke') != 'white' &&
						left && left.getAttribute('stroke') != 'white' &&
						leftDown && leftDown.getAttribute('stroke') != 'white'){
						changePlayer = false;
						addScore(currentPlayer);
						elementsMatrix[lineIndex][elementIndex - 1].setAttribute('fill', currentPlayer.color);
					}
					
					if(rightUp && rightUp.getAttribute('stroke') != 'white' &&
						right && right.getAttribute('stroke') != 'white' &&
						rightDown && rightDown.getAttribute('stroke') != 'white'){
						changePlayer = false;
						addScore(currentPlayer);
						elementsMatrix[lineIndex][elementIndex + 1].setAttribute('fill', currentPlayer.color);
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
			
			function create2DArray(rows) {
				var arr = [];

				for (var i = 0; i < rows; i++) {
					arr[i] = [];
				}

				return arr;
			}