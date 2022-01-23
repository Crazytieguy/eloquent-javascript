import {
  randomParcels,
  idleRobot,
  randomRobot,
  routeRobot,
  pathFindingRobot,
} from "./logic.js";
import { runRobotAnimation } from "./animatevillage.js";

document.getElementById("run-robot").addEventListener("click", () => {
  let robot = {
    idleRobot,
    randomRobot,
    routeRobot,
    pathFindingRobot,
  }[document.getElementById("robot-select").value];

  runRobotAnimation({
    robot: robot,
    place: "Post Office",
    parcels: randomParcels(),
  });
});
