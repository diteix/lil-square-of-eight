window.LilSquareOfEight = (function LilSquareOfEight() {
	var boardLengthDefault = 600;
	var matrixSizeDefault = 10;

	var dotRadiusDefault = 3;

	var useAI = false;
	var difficultyAI;
	
	var boardProperties = {
		boardContainer: null,
		svg: null,
		matrixSize: matrixSizeDefault,
		boardLength: boardLengthDefault,
		elementsMatrix: null,
		fn: {
			dotRadius: function() {
				var ratio;

				if (boardProperties.boardLength == boardLengthDefault && boardProperties.matrixSize == matrixSizeDefault) {
					return dotRadiusDefault;
				} else if (boardProperties.boardLength == boardLengthDefault) {
					ratio = matrixSizeDefault / boardProperties.matrixSize;
				} else if (boardProperties.matrixSize == matrixSizeDefault) {
					ratio = boardProperties.boardLength / boardLengthDefault;
				} else {
					var defaultBoardMatrixRatio = boardLengthDefault / matrixSizeDefault;
					var boardMatrixRatio = boardProperties.boardLength / boardProperties.matrixSize;

					ratio = boardMatrixRatio / defaultBoardMatrixRatio;
				}

				return parseInt(ratio * dotRadiusDefault) || 1;
			},
			elementsPerLineCount: function() {
				return 2 * boardProperties.matrixSize + 1;
			},
			svgLineLength: function(dotRadius) {
				var dotRadius = dotRadius || this.dotRadius();

				return parseInt((boardProperties.svg.width.baseVal.value - (2 * dotRadius * (boardProperties.matrixSize + 1))) / boardProperties.matrixSize);
			},
			createLine: function(lineIndex, elementsPerLineCount, svgLineLength, dotRadius, initialPosition, lineWidth) {
				for (var i = 0; i < elementsPerLineCount; i++) {
					var newElement = this.createLineElement(lineIndex, i, svgLineLength, dotRadius, initialPosition, lineWidth);
					boardProperties.elementsMatrix[lineIndex][i] = { element: newElement, selected: false };
					boardProperties.svg.appendChild(newElement);
				}
			},
			createLineElement: function(lineIndex, elementIndex, svgLineLength, dotRadius, initialPosition, lineWidth) {
				var element = new Object();
				var isLineEven = lineIndex % 2 == 0;
				var isElementEven = elementIndex % 2 == 0;
				
				if (isLineEven && isElementEven) {
					element = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
					element.setAttribute('id', lineIndex + ':' + elementIndex);
					element.setAttribute('cx', initialPosition.x + (2 * dotRadius * (elementIndex) / 2) + (svgLineLength * (elementIndex) / 2));
					element.setAttribute('cy', initialPosition.y + (2 * dotRadius * (lineIndex) / 2) + (svgLineLength * (lineIndex) / 2));
					element.setAttribute('r', dotRadius);
					element.setAttribute('fill', 'black');
				} else if (isLineEven && !isElementEven) {
					var x = (dotRadius * (elementIndex + 1))  + (svgLineLength * (elementIndex - 1) / 2);
					var y = (dotRadius * lineIndex) + (svgLineLength * (lineIndex) / 2);

					element = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
					element.setAttribute('id', lineIndex  + ':' +  elementIndex);
					element.setAttribute('x', x);
					element.setAttribute('y', y - lineWidth);
					element.setAttribute('width', svgLineLength);
					element.setAttribute('height', lineWidth * 3);
					element.setAttribute('fill', 'transparent');
					element.className.baseVal += "line";
					
					element.onclick = boardProperties.fn.resolveTurn;
				} else if (!isLineEven && isElementEven) {
					var x = (dotRadius * elementIndex) + (svgLineLength * (elementIndex) / 2);
					var y = (dotRadius * (lineIndex + 1))  + (svgLineLength * (lineIndex - 1) / 2);

					element = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
					element.setAttribute('id', lineIndex  + ':' +  elementIndex);
					element.setAttribute('x', x - lineWidth);
					element.setAttribute('y', y);
					element.setAttribute('width', lineWidth * 3);
					element.setAttribute('height', svgLineLength);
					element.setAttribute('fill', 'transparent');
					element.className.baseVal += "line";
					
					element.onclick = boardProperties.fn.resolveTurn;
				} else if (!isLineEven && !isElementEven) {
					element = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
					element.setAttribute('id', lineIndex  + ':' +  elementIndex);
					element.setAttribute('x', (dotRadius * (elementIndex + 1))  + (svgLineLength * (elementIndex - 1) / 2) + parseInt(lineWidth / 2));
					element.setAttribute('y', (dotRadius * (lineIndex + 1))  + (svgLineLength * (lineIndex - 1) / 2) + parseInt(lineWidth / 2));
					element.setAttribute('fill', 'transparent');
				}
				
				return element;
			},
			paintLine: function(lineIndex, elementIndex) {
				var that = boardProperties.elementsMatrix[lineIndex][elementIndex];
				var dotRadius = boardProperties.fn.dotRadius();
				var lineWidth = 2 * dotRadius;
				var svgLineLength = boardProperties.fn.svgLineLength(dotRadius);

				if (lineIndex % 2 == 0) {
					that.element.setAttribute('y', (dotRadius * lineIndex) + (svgLineLength * (lineIndex) / 2));
					that.element.setAttribute('height', lineWidth);
				} else {
					that.element.setAttribute('x', (dotRadius * elementIndex) + (svgLineLength * (elementIndex) / 2));
					that.element.setAttribute('width', lineWidth);
				}
				
				that.element.setAttribute('fill', scoreProperties.currentPlayer.configurableProperties.color);
				that.element.onclick = null;
				that.selected = true;
				that.element.dispatchEvent(new Event('selected'));
			},
			paintRectangle: function(rect, props) {
				scoreProperties.fn.addScore();
				rect.element.setAttribute('fill', scoreProperties.currentPlayer.configurableProperties.color);
				rect.element.setAttribute('width', props.svgLineLength - props.lineWidth);
				rect.element.setAttribute('height', props.svgLineLength - props.lineWidth);
				rect.selected = true;
			},
			resolveTurn: function() {
				var splitId = this.id.split(':');
				var lineIndex = parseInt(splitId[0]);
				var elementIndex = parseInt(splitId[1]);
				var rectArray = [];

				boardProperties.fn.paintLine(lineIndex, elementIndex);
				
				if (lineIndex % 2 == 0) {
					var lineUpLeft, lineUp, lineUpRight, lineDownLeft, lineDown, lineDownRight;
					
					if (lineIndex > 0) {
						lineUpLeft = boardProperties.elementsMatrix[lineIndex - 1][elementIndex - 1];
						lineUp = boardProperties.elementsMatrix[lineIndex - 2][elementIndex];
						lineUpRight = boardProperties.elementsMatrix[lineIndex - 1][elementIndex + 1];
					}
					
					if (lineIndex < boardProperties.elementsMatrix.length - 1) {
						lineDownLeft = boardProperties.elementsMatrix[lineIndex + 1][elementIndex - 1];
						lineDown = boardProperties.elementsMatrix[lineIndex + 2][elementIndex];
						lineDownRight = boardProperties.elementsMatrix[lineIndex + 1][elementIndex + 1];
					}
					
					if (lineUpLeft && lineUpLeft.selected &&
					lineUp && lineUp.selected &&
					lineUpRight && lineUpRight.selected) {
						changePlayer = false;
						rectArray.push(boardProperties.elementsMatrix[lineIndex - 1][elementIndex]);
					}
					
					if (lineDownLeft && lineDownLeft.selected &&
					lineDown && lineDown.selected &&
					lineDownRight && lineDownRight.selected) {
						changePlayer = false;
						rectArray.push(boardProperties.elementsMatrix[lineIndex + 1][elementIndex]);
					}
				} else {
					var lineUpLeft, lineLeft, lineDownLeft, lineUpRight, lineRight, lineDownRight;
					
					if (elementIndex > 0) {
						lineUpLeft = boardProperties.elementsMatrix[lineIndex - 1][elementIndex - 1];
						lineLeft = boardProperties.elementsMatrix[lineIndex][elementIndex - 2];
						lineDownLeft = boardProperties.elementsMatrix[lineIndex + 1][elementIndex - 1];
					}
	
					if (elementIndex < boardProperties.elementsMatrix[lineIndex].length - 1) {
						lineUpRight = boardProperties.elementsMatrix[lineIndex - 1][elementIndex + 1];
						lineRight = boardProperties.elementsMatrix[lineIndex][elementIndex + 2];
						lineDownRight = boardProperties.elementsMatrix[lineIndex + 1][elementIndex + 1];
					}
					
					if (lineUpLeft && lineUpLeft.selected &&
					lineLeft && lineLeft.selected &&
					lineDownLeft && lineDownLeft.selected) {
						changePlayer = false;
						rectArray.push(boardProperties.elementsMatrix[lineIndex][elementIndex - 1]);
					}
					
					if (lineUpRight && lineUpRight.selected &&
					lineRight && lineRight.selected &&
					lineDownRight && lineDownRight.selected) {
						changePlayer = false;
						rectArray.push(boardProperties.elementsMatrix[lineIndex][elementIndex + 1]);
					}
				}

				if (!rectArray.length) {
					scoreProperties.fn.changePlayerTurn();

					if (useAI && window.GreatEight && scoreProperties.currentPlayer == scoreProperties.playerTwo) {
						GreatEight.fn.doTurn({ lineIndex: lineIndex, elementIndex: elementIndex});
					}
				} else {
					var dotRadius = boardProperties.fn.dotRadius();
					var lineWidth = 2 * dotRadius;
					var svgLineLength = boardProperties.fn.svgLineLength(dotRadius);
	
					rectArray.forEach(function(rect) { boardProperties.fn.paintRectangle(rect, { lineWidth: lineWidth, svgLineLength: svgLineLength }); });
				}
			},
			create2DArray: function(rows) {
				var arr = [];
			
				for (var i = 0; i < rows; i++) {
					arr[i] = [];
				}
			
				return arr;
			},
			initialize: function() {
				if (boardProperties.boardContainer) {
					this.reinitialize();
				}

				boardProperties.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
				boardProperties.svg.id = 'svg';

				boardProperties.svg.setAttribute("height", boardProperties.boardLength);
				boardProperties.svg.setAttribute("width", boardProperties.boardLength);
	
				var elementsPerLineCount = this.elementsPerLineCount();
				boardProperties.elementsMatrix = this.create2DArray(elementsPerLineCount);
				var dotRadius = this.dotRadius();
				var svgLineLength = this.svgLineLength(dotRadius);
				var initialPosition = { x : dotRadius, y : dotRadius };
				var lineWidth = 2 * dotRadius;
				
				for (var i = 0; i < elementsPerLineCount; i++) {
					this.createLine(i, elementsPerLineCount, svgLineLength, dotRadius, initialPosition, lineWidth);
				}
	
				boardProperties.boardContainer = document.createElement('div');
				boardProperties.boardContainer.id = 'boardContainer';
				boardProperties.boardContainer.appendChild(boardProperties.svg);

				if (useAI && window.GreatEight) {
					GreatEight.fn.initialize(boardProperties, scoreProperties, difficultyAI);
				}
			},
			reinitialize: function() {
				if (!boardProperties.boardContainer) {
					this.initialize();
				}

				boardProperties.svg.innerHTML = '';
				boardProperties.svg.setAttribute("height", boardProperties.boardLength);
				boardProperties.svg.setAttribute("width", boardProperties.boardLength);
	
				var elementsPerLineCount = this.elementsPerLineCount();
				boardProperties.elementsMatrix = this.create2DArray(elementsPerLineCount);
				var dotRadius = this.dotRadius();
				var svgLineLength = this.svgLineLength(dotRadius);
				var initialPosition = { x : dotRadius, y : dotRadius };
				var lineWidth = 2 * dotRadius;
				
				for (var i = 0; i < elementsPerLineCount; i++) {
					this.createLine(i, elementsPerLineCount, svgLineLength, dotRadius, initialPosition, lineWidth);
				}

				if (useAI && window.GreatEight) {
					GreatEight.fn.reinitialize(boardProperties, scoreProperties, difficultyAI);
				}
			}
		}
	};

	var playerDefault = { element: null, score: 0, scoreElement: null, nameElement: null  };
	var playerOneDefault = { name: 'Player 1', color: 'blue' };
	var playerTwoDefault = { name: 'Player 2', color: 'red' };

	var scoreProperties = {
		scoreContainer: null,
		playerOne: Object.assign({ configurableProperties: Object.assign({}, playerOneDefault) }, playerDefault),
		playerTwo: Object.assign({ configurableProperties: Object.assign({}, playerTwoDefault) }, playerDefault),
		currentPlayer: null,
		fn: {
			changePlayerTurn: function() {
				//if (!currentConnection) {
					scoreProperties.currentPlayer = scoreProperties.currentPlayer == scoreProperties.playerOne ? scoreProperties.playerTwo : scoreProperties.playerOne;
					scoreProperties.playerOne.element.classList.toggle('activePlayer');
					scoreProperties.playerTwo.element.classList.toggle('activePlayer');
				//} else {
					//svg.classList.toggle('clicked');
				//}
			},
			addScore: function() {
				scoreProperties.currentPlayer.scoreElement.innerText = ++scoreProperties.currentPlayer.score;
			},
			initialize: function() {
				if (scoreProperties.scoreContainer) {
					this.reinitialize();
				}

				scoreProperties.currentPlayer = scoreProperties.playerOne;
	
				scoreProperties.playerOne.nameElement = document.createElement('label');
				scoreProperties.playerOne.nameElement.textContent = scoreProperties.playerOne.configurableProperties.name;
	
				scoreProperties.playerOne.scoreElement = document.createElement('span');
				scoreProperties.playerOne.scoreElement.textContent = scoreProperties.playerOne.score;
				scoreProperties.playerOne.scoreElement.id = 'pOneScore';
				
				scoreProperties.playerOne.element = document.createElement('div');
				scoreProperties.playerOne.element.id = 'pOne';
				scoreProperties.playerOne.element.classList.add('activePlayer');
				scoreProperties.playerOne.element.appendChild(scoreProperties.playerOne.nameElement);
				scoreProperties.playerOne.element.appendChild(scoreProperties.playerOne.scoreElement);
	
				var versusBox = document.createElement('span');
				versusBox.textContent = 'X';
	
				scoreProperties.playerTwo.scoreElement = document.createElement('span');
				scoreProperties.playerTwo.scoreElement.textContent = scoreProperties.playerTwo.score;
				scoreProperties.playerTwo.scoreElement.id = 'pTwoScore';
	
				scoreProperties.playerTwo.nameElement = document.createElement('label');
				scoreProperties.playerTwo.nameElement.textContent = scoreProperties.playerTwo.configurableProperties.name;
				
				scoreProperties.playerTwo.element = document.createElement('div');
				scoreProperties.playerTwo.element.id = 'pTwo';
				scoreProperties.playerTwo.element.appendChild(scoreProperties.playerTwo.scoreElement);
				scoreProperties.playerTwo.element.appendChild(scoreProperties.playerTwo.nameElement);
	
				scoreProperties.scoreContainer = document.createElement('div');
				scoreProperties.scoreContainer.id = 'scoreContainer';
	
				scoreProperties.scoreContainer.appendChild(scoreProperties.playerOne.element);
				scoreProperties.scoreContainer.appendChild(versusBox);
				scoreProperties.scoreContainer.appendChild(scoreProperties.playerTwo.element);
			},
			reinitialize: function() {
				if (!scoreProperties.scoreContainer) {
					this.initialize();
				}
				scoreProperties.playerOne.score = scoreProperties.playerTwo.score = 0;
	
				scoreProperties.currentPlayer = scoreProperties.playerOne;
	
				scoreProperties.playerOne.nameElement.textContent = scoreProperties.playerOne.configurableProperties.name;
				scoreProperties.playerOne.scoreElement.textContent = scoreProperties.playerOne.score;
				scoreProperties.playerOne.element.classList.add('activePlayer');
				
				scoreProperties.playerTwo.nameElement.textContent = scoreProperties.playerTwo.configurableProperties.name;
				scoreProperties.playerTwo.scoreElement.textContent = scoreProperties.playerTwo.score;
				scoreProperties.playerTwo.element.classList.remove('activePlayer');
			}
		}
	};

	var styleDefault = {
		"#gameContainer": {
			"width": "100%",
			"text-align": "center"
		},
		"#scoreContainer": {
			"display": "inline-block"
		},
		"#scoreContainer *": {
			"vertical-align": "middle",
			"padding": "5px 10px"
		},
		"#scoreContainer div": {
			"opacity": "0.5",
			"display": "initial"
		},
		"#scoreContainer div.activePlayer": {
			"opacity": "1", 
			"font-weight": "bold"
		},
		"#scoreContainer div span": {
			"width": "50px",
			"display": "inline-block",
			"color": "white",
			"font-size": "35px",
			"font-weight": "bold"
		},
		"#boardContainer": {
			"margin": "35px 0 0"
		},
		".line": {
			"cursor": "pointer"
		}
	};

	var styleProperties = {
		styleContainer: null,
		map: {},
		sheet: null,
		rules: null,
		fn: {
			configurableStyle: function() { 
				return {
					"#pOneScore": {
						"background-color": scoreProperties.playerOne.configurableProperties.color
					},
					"#pTwoScore": {
						"background-color": scoreProperties.playerTwo.configurableProperties.color
					},
				}
			},
			setRule: function(selector, property, value) {
				// Convert property from camelCase to snake-case
				property = property.replace(/([A-Z])/g, function ($1) {
				  	return "-" + $1.toLowerCase();
				});

				if (!styleProperties.map.hasOwnProperty(selector)) {
					// If the selector hasn't been used yet we want to insert the rule at the end of the CSSRuleList, so we use its length as the index value
					var index = styleProperties.rules.length;
					// Prepare the rule declaration text, since both insertRule and addRule take this format
					var declaration = property + ": " + value;
					// Insert the new rule into the stylesheet
					try {
						// Some browsers only support insertRule, others only support addRule, so we have to use both
						styleProperties.sheet.insertRule(selector + " {" + declaration + ";}", index);
					} catch (e) {
						styleProperties.sheet.addRule(selector, declaration, index);
					} finally {
						// Because safari is perhaps the worst browser in all of history, we have to remind it to keep the sheet rules up-to-date
						styleProperties.rules = styleProperties.sheet.rules || styleProperties.sheet.cssRules;
						// Add our newly inserted rule's CSSStyleDeclaration object to the internal map
						styleProperties.map[selector] = styleProperties.rules[index].style;
					}
				} else {
					styleProperties.map[selector].setProperty(property, value);
				}
			},
			applyRules: function(rulesToApply) {
				for (var selector in rulesToApply) {
					for (var prop in rulesToApply[selector]) {
					  	this.setRule(selector, prop, rulesToApply[selector][prop]);
					}
				}
			},
			initialize: function() {
				if (styleProperties.styleContainer) {
					this.reinitialize();
				}
				 
				styleProperties.styleContainer = document.createElement("style");
				document.head.appendChild(styleProperties.styleContainer);
				 
				styleProperties.styleContainer.appendChild(document.createTextNode(""));
				styleProperties.sheet = styleProperties.styleContainer.sheet;
				styleProperties.rules = styleProperties.sheet.rules || styleProperties.sheet.cssRules;
				 
				this.applyRules(styleDefault);
				this.applyRules(this.configurableStyle());
			},
			reinitialize: function() {
				if (!styleProperties.styleContainer) {
					this.initialize();
				}

				this.applyRules(this.configurableStyle());
			}
		}
	};

	return {
		gameContainer: null,
		boardSize: boardProperties.matrixSize,
		boardLength: boardProperties.boardLength,
		playerOne: scoreProperties.playerOne.configurableProperties,
		playerTwo: scoreProperties.playerTwo.configurableProperties,
		initialize: function(playWithComputer, difficulty, boardSize, boardLength) {
			if (this.gameContainer) {
				return this.reinitialize(playWithComputer, difficulty, boardSize, boardLength);
			}

			useAI = playWithComputer;
			difficultyAI = difficulty;

			if (boardSize && !isNaN(boardSize)) {
				boardProperties.matrixSize = parseInt(boardSize);
			}

			if (boardLength && !isNaN(boardLength)) {
				boardProperties.boardLength = parseInt(boardLength);
			}
			
			scoreProperties.fn.initialize();
			boardProperties.fn.initialize();

			this.gameContainer = document.createElement('div');
			this.gameContainer.id = 'gameContainer';
			this.gameContainer.appendChild(scoreProperties.scoreContainer);
			this.gameContainer.appendChild(boardProperties.boardContainer);

			document.body.appendChild(this.gameContainer);

			styleProperties.fn.initialize();
		},
		reinitialize: function(playWithComputer, difficulty, boardSize, boardLength) {
			if (!this.gameContainer) {
				return this.initialize(playWithComputer, difficulty, boardSize, boardLength);
			}

			useAI = playWithComputer;
			difficultyAI = difficulty;
			
			if (boardSize && !isNaN(boardSize)) {
				boardProperties.matrixSize = parseInt(boardSize);
			}

			if (boardLength && !isNaN(boardLength)) {
				boardProperties.boardLength = parseInt(boardLength);
			}
			
			scoreProperties.fn.reinitialize();
			boardProperties.fn.reinitialize();

			styleProperties.fn.reinitialize();
		}
	};
})();