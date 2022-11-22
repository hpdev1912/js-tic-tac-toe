import { CELL_VALUE, GAME_STATUS, TURN } from "./constants.js";
import {
  getCellElementList,
  getCellElementAtIdx,
  getCurrentTurnElement,
  getGameStatusElement,
  getReplayButtonElement,
} from "./selectors.js";
import { checkGameStatus } from "./utils.js";

/**
 * Global variables
 */
let currentTurn = TURN.CROSS;
let gameStatus = GAME_STATUS.PLAYING;
let cellValues = new Array(9).fill("");

function toggleTurn() {
  currentTurn = currentTurn === TURN.CROSS ? TURN.CIRCLE : TURN.CROSS;

  //update turn on element
  updateTurnElement(currentTurn);
}

function updateTurnElement(turn) {
  const currentTurnElement = getCurrentTurnElement();
  if (currentTurnElement) {
    currentTurnElement.classList.remove(TURN.CIRCLE, TURN.CROSS);
    currentTurnElement.classList.add(turn);
  }
}

function showReplayButton() {
  const replayButton = getReplayButtonElement();
  if (!replayButton) return;
  replayButton.classList.add("show");
}
function hideReplayButton() {
  const replayButton = getReplayButtonElement();
  if (!replayButton) return;
  replayButton.classList.remove("show");
}

function updateGameStatus(status) {
  const gameStatusElement = getGameStatusElement();
  if (gameStatusElement) gameStatusElement.innerText = status;
}

function highlightWinCells(winPositions) {
  if (!Array.isArray(winPositions) || winPositions.length !== 3) {
    throw new Error("winPosition is invalid");
  }

  for (const position of winPositions) {
    const cellElement = getCellElementAtIdx(position);
    if (cellElement) cellElement.classList.add("win");
  }
}

function resetGame() {
  //reset temp global variable
  currentTurn = TURN.CROSS;
  gameStatus = GAME_STATUS.PLAYING;
  cellValues = cellValues.map(() => "");
  //reset game status
  updateGameStatus(GAME_STATUS.PLAYING);

  //reset current turn
  updateTurnElement(currentTurn);
  //reset game board
  const cellElementList = getCellElementList();
  for (const cellElement of cellElementList) {
    cellElement.className = "";
  }
  //hide replay button
  hideReplayButton();
}

function initReplayButton() {
  const replayButton = getReplayButtonElement();
  if (!replayButton) return;
  replayButton.addEventListener("click", resetGame);
}

function handleCellClick(cell, index) {
  const isClicked =
    cell.classList.contains(TURN.CIRCLE) || cell.classList.contains(TURN.CROSS);
  if (isClicked || gameStatus !== GAME_STATUS.PLAYING) return;
  //set selected cell
  cell.classList.add(currentTurn);
  //update cellValues
  cellValues[index] =
    currentTurn === TURN.CIRCLE ? CELL_VALUE.CIRCLE : CELL_VALUE.CROSS;

  //toggle turn
  toggleTurn();

  //checkGameStatus
  const statusGame = checkGameStatus(cellValues);
  gameStatus = statusGame.status;
  switch (gameStatus) {
    case GAME_STATUS.O_WIN:
    case GAME_STATUS.X_WIN: {
      updateGameStatus(gameStatus);
      showReplayButton();
      highlightWinCells(statusGame.winPositions);
      break;
    }
    case GAME_STATUS.ENDED:
      updateGameStatus(gameStatus);
      showReplayButton();
      highlightWinCells(statusGame.winPositions);
      break;
    default:
      break;
  }
}

function initCellElementList() {
  const cellElementList = getCellElementList();
  cellElementList.forEach((cell, index) => {
    cell.addEventListener("click", () => handleCellClick(cell, index));
  });
}

/**
 * TODOs
 *
 * 1. Bind click event for all cells
 * 2. On cell click, do the following:
 *    - Toggle current turn
 *    - Mark current turn to the selected cell
 *    - Check game state: win, ended or playing
 *    - If game is win, highlight win cells
 *    - Not allow to re-click the cell having value.
 *
 * 3. If game is win or ended --> show replay button.
 * 4. On replay button click --> reset game to play again.
 *
 */
(() => {
  //bind click event for all li element
  initCellElementList();
  //bind click event for replay button
  initReplayButton();
})();
