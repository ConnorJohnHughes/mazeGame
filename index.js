const { Engine, Render, Runner, World, Bodies, Body, Events } = Matter;
//Canvas size
const width = window.innerWidth;
const height = window.innerHeight;

// cells change the size and complexity of the maze
const cellsHorizontal = 3;
const cellsVertical = 3;

//this is so the maze cells fit to maze size 
const unitLengthX = width / cellsHorizontal;
const unitLengthY= height / cellsVertical; 


// maze walls and border walls
const wallWidth = 5;
const borderWidth = 20;



//Constructs for canvas(world)
const engine = Engine.create();
engine.world.gravity.y = 0;
const {world} = engine;
const render = Render.create({
    element: document.body,
    engine: engine,
    options: {
        wireframes: false,
        width,
        height
    }
});
Render.run(render);
Runner.run(Runner.create(), engine);

// Walls for border of whole maze
const walls = [
    Bodies.rectangle(width / 2, 0, width, borderWidth,       { isStatic: true, render: {fillStyle: 'white'} }),
    Bodies.rectangle(width / 2, height, width, borderWidth,  { isStatic: true,render: {fillStyle: 'white'}  }),
    Bodies.rectangle(0, height / 2, borderWidth, height,     { isStatic: true, render: {fillStyle: 'white'}  }),
    Bodies.rectangle(width, height / 2, borderWidth, height, { isStatic: true, render: {fillStyle: 'white'}  })
];
World.add(world, walls);

// Maze Generation

// shuffles an array
const shuffle = (arr) => {

    //gets length of array
    let counter = arr.length;


    while (counter > 0 ){
        // gets random index in array
        const index = Math.floor(Math.random() * counter);

        counter -- ;
        //swapping of elements to get randomize index
        const temp = arr[counter];
        arr[counter] = arr[index];
        arr[index] = temp;
    }

    return arr;
}

// starts with all arrays filled with false (walls)
const  grid = Array(cellsVertical).fill(null).map(() => Array(cellsHorizontal).fill(false));
const verticals = Array(cellsVertical).fill(null).map(() => Array(cellsHorizontal - 1).fill(false));
const horizontals = Array(cellsVertical - 1).fill(null).map(() => Array(cellsHorizontal).fill(false));

//randomizes start point to generate maze 
const startRow = Math.floor(Math.random() * cellsVertical);
const startColumn = Math.floor(Math.random() * cellsHorizontal);

// carves out maze 
const stepThroughCell = (row, column) => {
    // If i have visted the cell at [roll, column] then return
    if (grid [row] [column]){
        return;
    }

    // mark what cells have been visited
    grid[row] [column] = true;

    // Assemble random list of neighbors
    const neighbors = shuffle([
        [row - 1, column, 'up'],
        [row, column + 1, 'right'],
        [row + 1, column, 'down'],
        [row, column - 1, 'left' ]
    ]);
    // shows neighbors
    // console.log(neighbors)

    // for each neighbor....
    for (let neighbor of neighbors){
        const [nextRow, nextColumn, direction] = neighbor;

    
    // see if that neighbor is out of bounds 
        if (nextRow < 0 || nextRow >=  cellsVertical || nextColumn < 0 || nextColumn >= cellsHorizontal){
            continue;
        }
    // check to see if we have visited that neighbor, continue to next neighbor
        if (grid[nextRow][nextColumn]){
        continue;
        }
    // remove wall from vertical or horizontal
        if (direction === 'left'){
            verticals[row][column - 1] = true;
        }
        else if (direction === 'right'){
                verticals[row][column] = true;
        }
        else if (direction === 'up'){
            horizontals[row - 1][column] = true;
        }
        else if (direction === 'down'){
            horizontals[row][column] = true;
        }

        stepThroughCell(nextRow, nextColumn)
    };
    // visit that next cell



};

//start maze creation
stepThroughCell(startRow, startColumn);


//draws walls for the maze horizontal lines
horizontals.forEach((row, rowIndex) => {
    row.forEach((open, columnIndex) => {
        if (open){
            return;
        }

        const wall = Bodies.rectangle(
            columnIndex * unitLengthX + unitLengthX / 2,
            rowIndex * unitLengthY + unitLengthY,
            unitLengthX,
            wallWidth,
            {
                label: 'wall',
                isStatic: true,
                render: {
                    fillStyle: 'red'
                },
            }
        );
        World.add(world, wall);
    });
});


// draws walls in maze for vertical lines
verticals.forEach((row, rowIndex) => {
    row.forEach((open, columnIndex) => {
        if (open){
           return;
        }

        const wall = Bodies.rectangle(
            columnIndex * unitLengthX + unitLengthX,
            rowIndex * unitLengthY + unitLengthY / 2, 
            wallWidth,
            unitLengthY,
            {
                label: 'wall',
            
                isStatic: true,
                render: {
                    fillStyle: 'blue'
                }
            }
        );
        World.add(world, wall);
    });
}); 

// goal
const goal = Bodies.rectangle(
    width - unitLengthX / 2,
    height - unitLengthY /2,
    unitLengthX * .8,
    unitLengthY * .8, {
        label: 'goal',
        isStatic: true,
        render: {
            fillStyle: 'purple'
        }
    },
);

World.add(world, goal);

// ball
const ballRadius = Math.min(unitLengthX, unitLengthY) / 4;
const ball = Bodies.circle(
    unitLengthX / 2,
    unitLengthY / 2,
    ballRadius,
    {
        label: 'ball',
        render: {
            fillStyle: 'orange'
        }
    }
);

World.add(world, ball);

document.addEventListener('keydown', event => {
    const { x, y } = ball.velocity;

    if (event.keyCode == 87 ){
        Body.setVelocity (ball, { x, y: y -5});
    }
    if (event.keyCode == 68 ){
         Body.setVelocity (ball, { x: x + 5, y});   
    }
    if (event.keyCode == 83 ){
        Body.setVelocity (ball, { x, y: y + 5});
    }
    if (event.keyCode == 65 ){
        Body.setVelocity (ball, { x: x - 5, y});
    }
});

//win conditiond
Events.on(engine, 'collisionStart', event => {
    event.pairs.forEach(collision => {
        const labels = ['ball', 'goal'];

        if (labels.includes(collision.bodyA.label) && labels.includes(collision.bodyB.label)){
            document.querySelector('.winner').classList.remove('hidden');
            engine.world.gravity.y = .3;
            world.bodies.forEach(body => {
                if (body.label === 'wall') {
                    Body.setStatic(body, false);
                }
            });
        }
    });
});


//Shows random starting point
console.log( startRow, startColumn)


console.log('VR - HC', startRow, startColumn)


console.log('GRID', grid);
console.log('VERTICALS', verticals);
console.log('HORIZONTALS', horizontals);
