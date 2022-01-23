const roads = [
  "Alice's House-Bob's House",
  "Alice's House-Cabin",
  "Alice's House-Post Office",
  "Bob's House-Town Hall",
  "Daria's House-Ernie's House",
  "Daria's House-Town Hall",
  "Ernie's House-Grete's House",
  "Grete's House-Farm",
  "Grete's House-Shop",
  "Marketplace-Farm",
  "Marketplace-Post Office",
  "Marketplace-Shop",
  "Marketplace-Town Hall",
  "Shop-Town Hall",
];

export const roadGraph = roads
  .map((r) => r.split("-"))
  .reduce((graph, [from, to]) => {
    (graph[from] = graph[from] || []).push(to);
    (graph[to] = graph[to] || []).push(from);
    return graph;
  }, {});

export function move({ from, to, parcels }) {
  if (!roadGraph[from] || !roadGraph[from].includes(to)) {
    return { place: from, parcels };
  }
  parcels = parcels
    .map((p) => {
      if (p.place === from) {
        return { place: to, address: p.address };
      } else {
        return p;
      }
    })
    .filter((p) => p.place !== p.address);
  return { place: to, parcels };
}
