import {OVERFLOW_CONTAINER_CLASS} from '@theme/Layout';

export const toTitleCase = str =>
  str.split(' ').map(w => `${w[0].toUpperCase()}${w.substring(1)}`).join('');

export const scrollToTop = () => {
  document.querySelector(`.${OVERFLOW_CONTAINER_CLASS}`).scrollTo(0, 0);
}
