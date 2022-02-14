import {
  randomParcels,
  randomRobot,
  routeRobot,
  pathFindingRobot,
} from "../logic.mjs";
import { move } from "../graph.mjs";

function runRobot({ robot, place, parcels }) {
  let to, memory;
  let turn = 0;
  while (parcels.length) {
    turn++;
    ({ to, memory } = robot({ place, parcels, memory }));
    ({ place, parcels } = move({ from: place, to, parcels }));
  }
  return turn;
}

const parcelsInitialList = [];

for (let i = 0; i < 100; i++) {
  parcelsInitialList.push(randomParcels());
}

function benchRobot(robot) {
  let sumTurns = 0;
  for (let parcels of parcelsInitialList) {
    sumTurns += runRobot({ robot, place: "Post Office", parcels });
  }
  return sumTurns / parcelsInitialList.length;
}

console.log({
  randomRobot: benchRobot(randomRobot),
  routeRobot: benchRobot(routeRobot),
  pathFindingRobot: benchRobot(pathFindingRobot),
});
