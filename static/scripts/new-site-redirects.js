const base = 'https://dip.diem.com';

let path = window.location.pathname.replace('lips', 'dips');

window.location.href = `${base}${path}`;
