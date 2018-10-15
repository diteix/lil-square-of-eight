window.GreatEight = (function GreatEight() {
    var  _boardProperties = null, _scoreProperties = null, notSelectedElements = [];

    return { 
        boardProperties: _boardProperties,
        scoreProperties: _scoreProperties,
        fn: {
            initialize: function(boardProperties, scoreProperties) {
                _boardProperties = boardProperties;
                _scoreProperties = scoreProperties;

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
            reinitialize: function() {
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
            doTurn:  function(clickedPosition) {
                let lineIndex = clickedPosition.lineIndex, elementIndex = clickedPosition.elementIndex;

                var arr = [];
                var clickElement = function(arr) {
                    var newArr = arr.filter(function(element) { return !element.selected; });

                    if (newArr.length == 1) {
                        newArr[0].element.dispatchEvent(new Event('click'));
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
                
                while (_scoreProperties.currentPlayer == _scoreProperties.playerTwo) {
                    var i = (Math.random() * (notSelectedElements.length - 1) | 0);

                    if (!notSelectedElements[i].selected) {
                        notSelectedElements[i].element.dispatchEvent(new Event('click'));
                    }
                }
            }
        }
    }
})();