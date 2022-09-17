export const vh = (n) => {
  // const h = Math.max(
  //   document.documentElement.clientHeight,
  //   window.innerHeight || 0
  // );
  const h = Math.max(
    document.documentElement.clientHeight,
    window.innerHeight || 0
  );
  return (n * h) / 100;
};
export const vw = (n) => {
  // const w = Math.max(
  //   document.documentElement.clientWidth,
  //   window.innerWidth || 0
  // );
  const w = Math.max(
    document.documentElement.clientWidth,
    window.innerWidth || 0
  );
  return (n * w) / 100;
};
export const vmin = (n) => Math.min(vh(n), vw(n));
export const vmax = (n) => Math.max(vh(n), vw(n));

//get four adjacent tiles except any that are in array tail
export const getNeighbors = ([x, y], boardSize, tail = []) => {
  const neighs = [
    y === 0 ? null : [x, y - 1], //up
    y === boardSize - 1 ? null : [x, y + 1], //down
    x === 0 ? null : [x - 1, y], //left
    x === boardSize - 1 ? null : [x + 1, y], //right
  ].filter((e) => e && !isCoordInList(e, tail));

  return neighs;
};

export const isCoordInList = (targetCoord, list) => {
  for (const coord of list) {
    if (coord[0] === targetCoord[0] && coord[1] === targetCoord[1]) return true;
  }
  return false;
};

export const toggleFullscreen = () => {
  if (document.fullscreenElement) document.exitFullscreen();
  else
    document.querySelector("body").requestFullscreen({ navigationUI: "hide" });
};
