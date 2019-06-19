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

    let ml = {
        states: [],
        qTable: {},
        explorationDecay: 0.001,
        // Taxa de exploracao 0 <= x <= 1
        explorationRate: 1,
        minExplorationRate: 0.05,
        fn: {
            boardTo1D: () => {
                const arr1D = [];

                for (let lineIndex = 1; lineIndex <= _boardProperties.elementsMatrix.length; lineIndex++) {
                    const element = _boardProperties.elementsMatrix[lineIndex - 1];

                    let offset = lineIndex % 2;
                    
                    for (let elementIndex = 0; elementIndex  + offset < element.length; elementIndex += 2) {
                        const line = element[elementIndex + offset];

                        const color = line.element.getAttribute('fill');

                        //blue = rgb(0, 0, 255)
                        //red = rgb(255, 0, 0)

                        arr1D.push(color == 'rgb(0, 0, 255)' ? 1 : color == 'rgb(255, 0, 0)' ? -1 : 0);
                    }
                }

                return arr1D;
            },
            play: () => {
                const func = () => {
                    let found = false;
                    let lineIndex, elementIndex;

                    while (!found) {
                        let i = (Math.random() * (notSelectedElements.length - 1) | 0);

                        if (!notSelectedElements[i].selected) {
                            let splitId = notSelectedElements[i].element.id.split(':');
                            lineIndex = parseInt(splitId[0]);
                            elementIndex = parseInt(splitId[1]);

                            notSelectedElements[i].element.dispatchEvent(new Event('click'));
                            
                            found = true;
                        }
                    }

                    return [lineIndex, elementIndex];
                };

                const formattedBoard = ml.fn.boardTo1D();
                const explore = Math.random() < ml.explorationRate;
                let action;

                if (explore) {
                    action = func();
                } else {
                    action = ml.fn.findBestAction(formattedBoard).action;

                    if (action === undefined) {
                        action = func();
                    }
                }

                ml.states.push({ current: formattedBoard, action: action, reward: 0 });

                if (ml.explorationRate > ml.minExplorationRate) {
                    ml.explorationRate -= ml.explorationDecay;
                }
            },
            rewardBack: (result) => {
                const baseReward = 100, discountFactor = 0.4;

                let reward = baseReward * result;

                const numstates = ml.states.length;

                for (let i = (numstates - 1); i >= 0; i--) {
                    ml.states[i].reward = reward;
                    reward = reward * discountFactor; // reduce reward for previous step
                }
            },
            addLearning: () => {
                for (const state of ml.states) {
                    let current = JSON.stringify(state.current),
                    action = JSON.stringify(state.action);

                    if (ml.qTable[current] === undefined) {
                        ml.qTable[current] = {};
                    }

                    if (ml.qTable[current][action] !== undefined) {
                        // update reward if action exists
                        ml.qTable[current][action].reward += state.reward;
                    } else {
                        // add action if not exists
                        ml.qTable[current][action] = {
                            reward: state.reward,
                            action: state.action
                        };
                    }
                }
            },
            findBestAction: (state) => {
                bestAction = {};

                if (ml.qTable[state] !== undefined) {
                    // loop through all known actions
                    for (let actionElement in qTable[state]) {
                        if (bestAction.reward === undefined || ml.qTable[state][actionElement].reward > bestAction.reward) {
                            bestAction = {
                                action: ml.qTable[state][actionElement].action,
                                reward: ml.qTable[state][actionElement].reward
                            }
                        }
                    }
                }
            
                return bestAction;
            },
            initialize: () => {

            },
            reinitialize: () => {
                ml.states = [];
            }
        }
    };

    let brain = {
        fn: {
            easy: function (clickedPosition) {
                findElements(clickedPosition);
                
                while (_scoreProperties.currentPlayer == _scoreProperties.playerTwo &&
                    _scoreProperties.playerOne.score + _scoreProperties.playerTwo.score != Math.pow(_boardProperties.matrixSize, 2)) {
                    var i = (Math.random() * (notSelectedElements.length - 1) | 0);

                    if (!notSelectedElements[i].selected) {
                        notSelectedElements[i].element.dispatchEvent(new Event('click'));
                    }
                }
            },
            normal: function (clickedPosition) {
                findElements(clickedPosition, 'normal');
                
                while (_scoreProperties.currentPlayer == _scoreProperties.playerTwo &&
                    _scoreProperties.playerOne.score + _scoreProperties.playerTwo.score != Math.pow(_boardProperties.matrixSize, 2)) {
                    var i = (Math.random() * (notSelectedElements.length - 1) | 0);

                    if (!notSelectedElements[i].selected) {
                        notSelectedElements[i].element.dispatchEvent(new Event('click'));
                    }
                }
            },
            hard: function (clickedPosition) {
                findElements(clickedPosition, 'hard');
                
                while (_scoreProperties.currentPlayer == _scoreProperties.playerTwo &&
                    _scoreProperties.playerOne.score + _scoreProperties.playerTwo.score != Math.pow(_boardProperties.matrixSize, 2)) {
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
        ml: ml,
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
    };
})();


/*tfvis.visor().surface({name: 'My First Surface', tab: 'Input Data'});
const metrics = ['loss', 'val_loss', 'acc', 'val_acc'];
const container = {
    name: 'show.fitCallbacks',
    tab: 'Training',
    styles: {
        height: '1000px'
    }
};
//const callbacks = tfvis.show.fitCallbacks(container, metrics);
const callbacks = null;

// Define a model for linear regression.
const model = tf.sequential();
model.add(tf.layers.dense({units: 1, inputShape: [1]}));
model.add(tf.layers.dense({units: 1, inputShape: [3]}));

model.compile({loss: 'meanSquaredError', optimizer: 'sgd'});

// Generate some synthetic data for training.
const xs = tf.tensor2d([1, 2, 3, 4], [4, 1]);
const ys = tf.tensor2d([1, 3, 5, 7], [4, 1]);

// Train the model using the data.
model.fit(xs, ys, {
    epochs: 10,
    //validationData: [tf.tensor2d([7], [1, 1]), tf.tensor2d([1], [1, 1])],
    epochs: 10,
    shuffle: true,
    callbacks: callbacks})
.then(() => {
    // Use the model to do inference on a data point the model hasn't seen before:
    model.predict(tf.tensor2d([5], [1, 1])).print();
    // Open the browser devtools to see the output
});

const game = (() => {
    let board = [0, 0, 0, 0];
    let boardSize = 4;

    return {
        board: () => [...board],
        reset: () => board = [0, 0, 0, 0],
        play: (cell) => {
            let reward = -1;

            if (board[cell] == 0) {
                board[cell] = 1;
                reward = 1;                
            }

            const isGameOver = board.reduce((p, c) => p + c) == 4;

            return [reward, isGameOver];
        },
        possibleStates: () => {
            const states = {};

            // 2 possible values for each cell
            const keys = [...Array(2).keys()];

            // 4 cells
            for (let i of keys) {
                for (let j of keys) {
                    for (let k of keys) {
                        for (let l of keys) {
                            states[JSON.stringify([i, j, k, l])] = [0, 0, 0, 0];
                            console.log(JSON.stringify([i, j, k, l]));
                        }
                    }
                }
            }

            return states;
        }
    };
})();

const numOfGames = 1; //2000;
const epsilon = 0.1;
const gamma = 0.99;
const batchSize = 10;
const memorySize = 2000;
const hiddenLayersSize = [20, 20];
const learningRate = 0.001;

const qTable = game.possibleStates();

const oldTrain = () => {
    for (let index = 0; index < numOfGames; index++) {
        let isGameOver = false;
        game.reset();
        let totalReward = 0;
        
        while (!isGameOver) {
            let state = game.board();
            let action;
    
            if (Math.random() < epsilon) {
                action = Math.floor(Math.random() * 3);
            } else {
                action = Math.max(...qTable[JSON.stringify(state)]);
            }
    
            const playedAction = game.play(action);
            totalReward += playedAction[0];
            isGameOver = playedAction[1];
    
            let nextStateMaxQValue;
            
            if (isGameOver) {
                nextStateMaxQValue = 0;
            } else {
                const nextState = game.board();
    
                nextStateMaxQValue = Math.max(...qTable[JSON.stringify(nextState)])
            }
    
            qTable[JSON.stringify(state)][action] = reward + gamma * nextStateMaxQValue;
        }
    }
};

const qNetwork = (hiddenLayersSize, gamma, learningRate, inputSize, outputSize, board) => {
    const qTarget = tf.tensor(board);
    const r = tf.tensor(board);
    const states = tf.tensor(board);
    const enumActions = tf.tensor([], [0, 2],'int32');

    let layer = states;

    for (let i of hiddenLayersSize) {
        layer = tf.layers.dense({
            units: i, 
            //inputShape: layer,
            activation: 'relu',
            kernelInitializer: 'glorotNormal'
        }).apply(layer);
    }

    const output = tf.layers.dense({
        units: outputSize, 
        //inputShape: layer, 
        kernelInitializer: 'glorotNormal'
    }).apply(layer);

    const predictions = tf.gatherND(output, enumActions);

    const labels = r + gamma * tf.max(qTarget, 1);
    const cost = tf.mean(tf.losses.meanSquaredError(labels, predictions));
    const optimizer = tf.train.sgd(learningRate).minimize(cost);

    return this;
};

const replayMemory = ((size) => {
    const memory = [];
    let counter = 0;

    return {
        append: (element) => {
            if (memory.length == size) {
                memory.shift();
            }

            memory.push(element);
            counter += 1;
        },
        sample: (n) => {
            return memory.map((a) => [a, Math.random()])
            .sort((a,b) => {
                return a[1] < b[1] ? -1 : 1;
            })
            .slice(0, n).map(a => a[0]);
        }
    }
})(memorySize);

const newTrain = () => {
    let counter = 0;

    for (let index = 0; index < numOfGames; index++) {
        let isGameOver = false;
        game.reset();
        let totalReward = 0;
        
        while (!isGameOver) {
            counter += 1;

            let state = game.board();
            let action;
    
            if (Math.random() < epsilon) {
                action = Math.floor(Math.random() * 3);
            } else {
                
                action = Math.max(...qTable[JSON.stringify(state)]);
            }

            return;
    
            const playedAction = game.play(action);
            totalReward += playedAction[0];
            isGameOver = playedAction[1];
    
            let nextStateMaxQValue;
            
            if (isGameOver) {
                nextStateMaxQValue = 0;
            } else {
                const nextState = game.board();
    
                nextStateMaxQValue = Math.max(...qTable[JSON.stringify(nextState)])
            }
    
            qTable[JSON.stringify(state)][action] = reward + gamma * nextStateMaxQValue;
        }
    }
};
*/
