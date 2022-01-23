import { roadGraph } from "./graph.js";

function randomPick(options) {
  let idx = Math.floor(Math.random() * options.length);
  return options[idx];
}

export function randomRobot({ place }) {
  return { to: randomPick(roadGraph[place]) };
}

function randomPlace() {
  return randomPick(Object.keys(roadGraph));
}

export function randomParcels(numParcels = 5) {
  let parcels = [];
  while (parcels.length < numParcels) {
    let [place, address] = [randomPlace(), randomPlace()];
    if (place !== address) {
      parcels.push({ place, address });
    }
  }
  return parcels;
}

const mailRoute = [
  "Alice's House",
  "Cabin",
  "Alice's House",
  "Bob's House",
  "Town Hall",
  "Daria's House",
  "Ernie's House",
  "Grete's House",
  "Shop",
  "Grete's House",
  "Farm",
  "Marketplace",
  "Post Office",
];

export function routeRobot({ memory: routeIndex }) {
  if (!routeIndex) routeIndex = 0;
  return {
    to: mailRoute[routeIndex % mailRoute.length],
    memory: routeIndex + 1,
  };
}

function shortestPath({ from, to }) {
  for (let queue = [[]]; ; ) {
    let path = queue.shift();
    let place = path.at(-1) || from;
    for (let next of roadGraph[place]) {
      if (next === to) return [...path, next];
      if (!path.includes(next)) queue.push([...path, next]);
    }
  }
}

export function pathFindingRobot({ place, parcels, memory: currentPath }) {
  if (!currentPath || currentPath.length === 0) {
    currentPath = parcels
      .map((parcel) => (parcel.place === place ? parcel.address : parcel.place))
      .map((target) => shortestPath({ from: place, to: target }))
      .reduce((bestTarget, candidate) =>
        candidate.length < bestTarget.length ? candidate : bestTarget
      );
  }
  let to = currentPath.shift();
  return { to, memory: currentPath };
}
