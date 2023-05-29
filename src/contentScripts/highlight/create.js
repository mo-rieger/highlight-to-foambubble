import highlight from './highlight/index.js';

import { store } from '../utils/storageManager.js';
import { commit } from '../utils/gitHubManager.js';

async function create(color, selection = window.getSelection()) {
  const selectionString = selection.toString();
  if (!selectionString) return;

  let container = selection.getRangeAt(0).commonAncestorContainer;

  // Sometimes the element will only be text. Get the parent in that case
  // TODO: Is this really necessary?
  while (!container.innerHTML) {
      container = container.parentNode;
  }

  const highlightIndex = await store(selection, container, location.hostname + location.pathname, location.href, color.color, color.textColor);
  // TODO: implement tags from popup
  await commit(getMarkdown(selection), location.hostname, location.pathname, []);
  highlight(selectionString, container, selection, color.color, color.textColor, highlightIndex);
}
function getMarkdown(sel = window.getSelection()) {
  // https://stackoverflow.com/questions/5222814/window-getselection-return-html
  var html = "";
  if (sel.rangeCount) {
    var container = document.createElement("div");
    for (var i = 0, len = sel.rangeCount; i < len; ++i) {
      container.appendChild(sel.getRangeAt(i).cloneContents());
    }
    html = container.innerHTML;
  }
  var turndownService = new TurndownService()
  var markdown = turndownService.turndown(html)
  return markdown;
}

export default create;
