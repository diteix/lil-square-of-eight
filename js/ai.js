window.GreatEight = (function GreatEight() {
    let  _boardProperties = null, _scoreProperties = null, notSelectedElements = [];

    let findElements = function(clickedPosition, difficulty) {
        let lineIndex = clickedPosition.lineIndex, elementIndex = clickedPosition.elementIndex;

        let arr = [];
        let clickElement = function(arr) {
            let newArr = arr.filter(function(element) { return !element.selected; });

            if (newArr.length == 1) {
                newArr[0].element.dispatchEvent(new Event('click'));

                if (difficulty && difficulty != 'easy') {
                    let splitId = newArr[0].element.id.split(':');
                    let lineIndex = parseInt(splitId[0]);
                    let elementIndex = parseInt(splitId[1]);

                    findElements({ lineIndex: lineIndex, elementIndex: elementIndex }, difficulty);
                }
            }
        };

        if (lineIndex % 2 == 0) {
            if (lineIndex > 0) {
                arr.push(_boardProperties.elementsMatrix[lineIndex - 1][elementIndex - 1]);
                arr.push(_boardProperties.elementsMatrix[lineIndex - 2][elementIndex]);
                arr.push(_boardProperties.elementsMatrix[lineIndex - 1][elementIndex + 1]);

                clickElement(arr);
                arr = [];
            }
            
            if (lineIndex < _boardProperties.elementsMatrix.length - 1) {
                arr.push(_boardProperties.elementsMatrix[lineIndex + 1][elementIndex - 1]);
                arr.push(_boardProperties.elementsMatrix[lineIndex + 2][elementIndex]);
                arr.push(_boardProperties.elementsMatrix[lineIndex + 1][elementIndex + 1]);
                
                clickElement(arr);
                arr = [];
            }
        } else {
            if (elementIndex > 0) {
                arr.push(_boardProperties.elementsMatrix[lineIndex - 1][elementIndex - 1]);
                arr.push(_boardProperties.elementsMatrix[lineIndex][elementIndex - 2]);
                arr.push(_boardProperties.elementsMatrix[lineIndex + 1][elementIndex - 1]);

                clickElement(arr);
                arr = [];
            }
            
            if (elementIndex < _boardProperties.elementsMatrix[lineIndex].length - 1) {
                arr.push(_boardProperties.elementsMatrix[lineIndex - 1][elementIndex + 1]);
                arr.push(_boardProperties.elementsMatrix[lineIndex][elementIndex + 2]);
                arr.push(_boardProperties.elementsMatrix[lineIndex + 1][elementIndex + 1]);

                clickElement(arr);
                arr = [];
            }
        }
    };

    let brain = {
        fn: {
            easy: function (clickedPosition) {
                findElements(clickedPosition);
                
                while (_scoreProperties.currentPlayer == _scoreProperties.playerTwo) {
                    var i = (Math.random() * (notSelectedElements.length - 1) | 0);

                    if (!notSelectedElements[i].selected) {
                        notSelectedElements[i].element.dispatchEvent(new Event('click'));
                    }
                }
            },
            normal: function (clickedPosition) {
                findElements(clickedPosition, 'normal');
                
                while (_scoreProperties.currentPlayer == _scoreProperties.playerTwo) {
                    var i = (Math.random() * (notSelectedElements.length - 1) | 0);

                    if (!notSelectedElements[i].selected) {
                        notSelectedElements[i].element.dispatchEvent(new Event('click'));
                    }
                }
            },
            hard: function (clickedPosition) {
                findElements(clickedPosition, 'hard');
                
                while (_scoreProperties.currentPlayer == _scoreProperties.playerTwo) {
                    let possibilities = notSelectedElements.filter(function(element) {
                        var splitId = element.element.id.split(':');
                        var lineIndex = parseInt(splitId[0]);
                        var elementIndex = parseInt(splitId[1]);

                        if (lineIndex % 2 == 0) {
                            var lineUpLeft, lineUp, lineUpRight, lineDownLeft, lineDown, lineDownRight;

                            if (lineIndex > 0) {
                                lineUpLeft = _boardProperties.elementsMatrix[lineIndex - 1][elementIndex - 1];
                                lineUp = _boardProperties.elementsMatrix[lineIndex - 2][elementIndex];
                                lineUpRight = _boardProperties.elementsMatrix[lineIndex - 1][elementIndex + 1];
                            }
                            
                            if (lineIndex < _boardProperties.elementsMatrix.length - 1) {
                                lineDownLeft = _boardProperties.elementsMatrix[lineIndex + 1][elementIndex - 1];
                                lineDown = _boardProperties.elementsMatrix[lineIndex + 2][elementIndex];
                                lineDownRight = _boardProperties.elementsMatrix[lineIndex + 1][elementIndex + 1];
                            }

                            if (((!lineUpLeft && !lineUpRight && !lineUp) ||
                                (!lineUpLeft.selected && !lineUpRight.selected && !lineUp.selected) ||
                                ((!lineUpLeft.selected || !lineUpRight.selected) && !lineUp.selected) ||
                                (!lineUpLeft.selected && !lineUpRight.selected && lineUp.selected)) &&
                                ((!lineDownLeft && !lineDownRight && !lineDown) ||
                                (!lineDownLeft.selected && !lineDownRight.selected && !lineDown.selected) ||
                                ((!lineDownLeft.selected || !lineDownRight.selected) && !lineDown.selected) ||
                                (!lineDownLeft.selected && !lineDownRight.selected && lineDown.selected))) {
                                return true;
                            }
                        } else {
                            var lineUpLeft, lineLeft, lineDownLeft, lineUpRight, lineRight, lineDownRight;

                            if (elementIndex > 0) {
                                lineUpLeft = _boardProperties.elementsMatrix[lineIndex - 1][elementIndex - 1];
						        lineLeft = _boardProperties.elementsMatrix[lineIndex][elementIndex - 2];
                                lineDownLeft = _boardProperties.elementsMatrix[lineIndex + 1][elementIndex - 1];
                            }
                            
                            if (elementIndex < _boardProperties.elementsMatrix[lineIndex].length - 1) {
                                lineUpRight = _boardProperties.elementsMatrix[lineIndex - 1][elementIndex + 1];
                                lineRight = _boardProperties.elementsMatrix[lineIndex][elementIndex + 2];
                                lineDownRight = _boardProperties.elementsMatrix[lineIndex + 1][elementIndex + 1];
                            }

                            if (((!lineUpLeft && !lineDownLeft && !lineLeft) ||
                                (!lineUpLeft.selected && !lineDownLeft.selected && !lineLeft.selected) ||
                                ((!lineUpLeft.selected || !lineDownLeft.selected) && !lineLeft.selected) ||
                                (!lineUpLeft.selected && !lineDownLeft.selected && lineLeft.selected)) &&
                                ((!lineUpRight && !lineDownRight && !lineRight) ||
                                (!lineUpRight.selected && !lineDownRight.selected && !lineRight.selected) ||
                                ((!lineUpRight.selected || !lineDownRight.selected) && !lineRight.selected) ||
                                (!lineUpRight.selected && !lineDownRight.selected && lineRight.selected))) {
                                return true;
                            }
                        }

                        return false;
                    });

                    let bestLines;

                    if (!possibilities.length) {
                        let countedRoutes = [];

                        let countRoute = function(element, counter, callers) {
                            var splitId = element.element.id.split(':');
                            var lineIndex = parseInt(splitId[0]);
                            var elementIndex = parseInt(splitId[1]);
                            var arr = [];
    
                            var click = function(arr) {
                                var newArr = arr.filter(function(element) { return !element.selected; });
    
                                if (newArr.length == 1 && (!callers || !callers.filter(function(element) { return newArr[0].element.id == element }).length)) {
                                    callers = callers || new Array();
                                    counter++;
                                    callers.push(element.element.id);
                                    counter = countRoute(newArr[0], counter, callers);
                                }
                            };
    
                            if (lineIndex % 2 == 0) {
                                if (lineIndex > 0) {
                                    arr.push(_boardProperties.elementsMatrix[lineIndex - 1][elementIndex - 1]);
                                    arr.push(_boardProperties.elementsMatrix[lineIndex - 2][elementIndex]);
                                    arr.push(_boardProperties.elementsMatrix[lineIndex - 1][elementIndex + 1]);
            
                                    click(arr);
                                    arr = [];
                                }
                                
                                if (lineIndex < _boardProperties.elementsMatrix.length - 1) {
                                    arr.push(_boardProperties.elementsMatrix[lineIndex + 1][elementIndex - 1]);
                                    arr.push(_boardProperties.elementsMatrix[lineIndex + 2][elementIndex]);
                                    arr.push(_boardProperties.elementsMatrix[lineIndex + 1][elementIndex + 1]);
                                    
                                    click(arr);
                                    arr = [];
                                }
                            } else {
                                if (elementIndex > 0) {
                                    arr.push(_boardProperties.elementsMatrix[lineIndex - 1][elementIndex - 1]);
                                    arr.push(_boardProperties.elementsMatrix[lineIndex][elementIndex - 2]);
                                    arr.push(_boardProperties.elementsMatrix[lineIndex + 1][elementIndex - 1]);
            
                                    click(arr);
                                    arr = [];
                                }
                                
                                if (elementIndex < _boardProperties.elementsMatrix[lineIndex].length - 1) {
                                    arr.push(_boardProperties.elementsMatrix[lineIndex - 1][elementIndex + 1]);
                                    arr.push(_boardProperties.elementsMatrix[lineIndex][elementIndex + 2]);
                                    arr.push(_boardProperties.elementsMatrix[lineIndex + 1][elementIndex + 1]);
            
                                    click(arr);
                                    arr = [];
                                }
                            }
    
                            return counter;
                        };
    
                        notSelectedElements.forEach(function c(element){
                            let counter = 0;
    
                            counter = countRoute(element, counter);
    
                            countedRoutes.push({ element: element, count: counter })
                        });

                        if (!countedRoutes.length) {
                            return;
                        }

                        let minCount = countedRoutes.reduce(function(prev, current) {
                            return prev < current.count ? prev : current.count;
                        });

                        bestLines = countedRoutes.filter(function(element) {
                            return element.count == minCount;
                        }).map(function(element) {
                            return element.element;
                        });
                    } else {
                        bestLines = possibilities;
                    }

                    let i = (Math.random() * (bestLines.length - 1) | 0);

                    if (bestLines.length && !bestLines[i].selected) {
                        bestLines[i].element.dispatchEvent(new Event('click'));
                    }
                }
            }
        }
    };

    return { 
        boardProperties: _boardProperties,
        scoreProperties: _scoreProperties,
        fn: {
            initialize: function(boardProperties, scoreProperties, difficulty) {
                _boardProperties = boardProperties;
                _scoreProperties = scoreProperties;
                this.doTurn = brain.fn[difficulty];

                for (let lineIndex = 1; lineIndex <= boardProperties.elementsMatrix.length; lineIndex++) {
                    const element = boardProperties.elementsMatrix[lineIndex - 1];

                    let offset = lineIndex % 2;
                    
                    for (let elementIndex = 0; elementIndex  + offset < element.length; elementIndex += 2) {
                        const line = element[elementIndex + offset];

                        notSelectedElements.push(line);

                        line.element.addEventListener('selected', function() {  
                            notSelectedElements = notSelectedElements.filter(function(element) { return element.element.id != this.id; }, this); 
                        });
                    }
                }
            },
            reinitialize: function(boardProperties, scoreProperties, difficulty) {
                _boardProperties = boardProperties;
                _scoreProperties = scoreProperties;
                this.doTurn = brain.fn[difficulty];

                notSelectedElements = [];

                for (let lineIndex = 1; lineIndex <= _boardProperties.elementsMatrix.length; lineIndex++) {
                    const element = _boardProperties.elementsMatrix[lineIndex - 1];

                    let offset = lineIndex % 2;
                    
                    for (let elementIndex = 0; elementIndex  + offset < element.length; elementIndex += 2) {
                        const line = element[elementIndex + offset];

                        notSelectedElements.push(line);

                        line.element.addEventListener('selected', function() {  
                            notSelectedElements = notSelectedElements.filter(function(element) { return element.element.id != this.id; }, this); 
                        });
                    }
                }
            },
            doTurn: brain.fn.easy
        }
    }
})();