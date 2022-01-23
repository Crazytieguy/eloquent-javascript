import { move } from "./graph.js";

let active = null;

const places = {
  "Alice's House": { x: 279, y: 100 },
  "Bob's House": { x: 295, y: 203 },
  Cabin: { x: 372, y: 67 },
  "Daria's House": { x: 183, y: 285 },
  "Ernie's House": { x: 50, y: 283 },
  Farm: { x: 36, y: 118 },
  "Grete's House": { x: 35, y: 187 },
  Marketplace: { x: 162, y: 110 },
  "Post Office": { x: 205, y: 57 },
  Shop: { x: 137, y: 212 },
  "Town Hall": { x: 202, y: 213 },
};
const placeKeys = Object.keys(places);

const speed = 2;

const robotElt = document.getElementById("robot-elt");
const robotPic = document.getElementById("robot-img");
const statusText = document.getElementById("status-text");
const startStopButton = document.getElementById("start-stop-button");
const world = document.getElementById("world");
const parcelNodes = [];

class Animation {
  constructor({ robot, place, parcels }) {
    this.place = place;
    this.parcels = parcels;
    this.robot = robot;
    this.turn = 0;

    robotElt.style.cssText = `position: absolute; transition: left ${
      0.8 / speed
    }s, top ${0.8 / speed}s;`;
    robotPic.src = "img/robot_moving2x.gif";
    startStopButton.hidden = false;
    startStopButton.textContent = "Stop";
    startStopButton.onclick = () => this.clicked();
    robotElt.ontransitionend = () => this.updateParcels();

    this.schedule();
    this.updateView();
    this.updateParcels();
  }

  updateView() {
    let pos = places[this.place];
    robotElt.style.top = pos.y - 38 + "px";
    robotElt.style.left = pos.x - 16 + "px";

    statusText.textContent = ` Turn ${this.turn} `;
  }

  updateParcels() {
    while (parcelNodes.length) parcelNodes.pop().remove();
    let heights = {};
    for (let { place, address } of this.parcels) {
      let height = heights[place] || (heights[place] = 0);
      heights[place] += 14;
      let node = document.createElement("div");
      let offset = placeKeys.indexOf(address) * 16;
      node.style.cssText =
        "position: absolute; height: 16px; width: 16px; background-image: url(img/parcel2x.png); background-position: 0 -" +
        offset +
        "px";
      if (place === this.place) {
        node.style.left = "25px";
        node.style.bottom = 20 + height + "px";
        robotElt.appendChild(node);
      } else {
        let pos = places[place];
        node.style.left = pos.x - 5 + "px";
        node.style.top = pos.y - 10 - height + "px";
        world.appendChild(node);
      }
      parcelNodes.push(node);
    }
  }

  tick() {
    let { to, memory } = this.robot(this);
    let { place, parcels } = move({
      from: this.place,
      to,
      parcels: this.parcels,
    });
    this.place = place;
    this.parcels = parcels;
    this.memory = memory;
    this.turn++;
    this.updateView();
    if (this.parcels.length == 0) {
      startStopButton.hidden = true;
      statusText.textContent = ` Finished after ${this.turn} turns`;
      robotPic.src = "img/robot_idle2x.png";
    } else {
      this.schedule();
    }
  }

  schedule() {
    this.timeout = setTimeout(() => this.tick(), 1000 / speed);
  }

  clicked() {
    if (this.timeout == null) {
      this.schedule();
      startStopButton.textContent = "Stop";
      robotPic.src = "img/robot_moving2x.gif";
    } else {
      clearTimeout(this.timeout);
      this.timeout = null;
      startStopButton.textContent = "Start";
      robotPic.src = "img/robot_idle2x.png";
    }
  }
}

export function runRobotAnimation({ robot, place, parcels }) {
  if (active && active.timeout != null) clearTimeout(active.timeout);
  active = new Animation({ robot, place, parcels });
}
