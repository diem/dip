const base = 'https://dip.diem.com';

let path = window.location.pathname.replace('lip', 'dip');

window.location.href = `${base}${path}`;
