// Scroll the chat (its nearest scrolling ancestor) so ``el`` sits at the top. Never scrollIntoView: on phones it
// also scrolls the fixed-height page container, which shifts the whole Polly view up and leaves a blank band
// under the input.
export default function scrollChatTo(el, offset = 8) {
  if (!el) return;
  let box = el.parentElement;
  while (box && box !== document.body) {
    const oy = window.getComputedStyle(box).overflowY;
    if ((oy === 'auto' || oy === 'scroll') && box.scrollHeight > box.clientHeight) break;
    box = box.parentElement;
  }
  if (!box || box === document.body) return;
  box.scrollTop += el.getBoundingClientRect().top - box.getBoundingClientRect().top - offset;
}
