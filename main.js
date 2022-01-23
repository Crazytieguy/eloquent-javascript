import {
  randomRobot,
  randomParcels,
  routeRobot,
  pathFindingRobot,
} from "./logic.js";
import { runRobotAnimation } from "./animatevillage.js";

runRobotAnimation({
  robot: pathFindingRobot,
  place: "Post Office",
  parcels: randomParcels(),
});
