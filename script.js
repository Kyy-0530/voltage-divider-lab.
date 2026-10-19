'use strict';
const LIM = { vin: [0, 24], r: [100, 100000] };
const DEF = { vin: 12, r1: 1000, r2: 2000 };
const S = { ...DEF };
const U = { r1: 1, r2: 1 }; // pengali satuan tampilan (1 = Ω, 1000 = kΩ)
const PRESETS = [
  ['12 V, 1 kΩ, 2 kΩ (contoh)', 12, 1000, 2000], ['10 V, R1 = R2 = 1 kΩ', 10, 1000, 1000],
  ['5 V → ±3,3 V (1 kΩ, 2 kΩ)', 5, 1000, 2000], ['24 V, 10 kΩ, 1 kΩ (Vout kecil)', 24, 10000, 1000],
  ['9 V, 1 kΩ, 10 kΩ (Vout besar)', 9, 1000, 10000]
];
const $ = id => document.getElementById(id);
const nf = (x, d = 3) => x.toLocaleString('id-ID', { maximumFractionDigits: d });

/* ---------- Perhitungan (nilai penuh; pembulatan hanya saat tampil) ---------- */
function calc(vin, r1, r2) {
  const rt = r1 + r2, i = vin / rt, v1 = i * r1, v2 = i * r2;
  return { rt, i, v1, v2, vout: vin * r2 / rt, p1: i * i * r1, p2: i * i * r2,
    ratio: vin > 0 ? (vin * r2 / rt) / vin : 0, kvl: Math.abs(vin - (v1 + v2)) <= 1e-9 * Math.max(1, vin) };
}
if (typeof module !== 'undefined') module.exports = { calc };
if (typeof document === 'undefined') { /* dijalankan di Node untuk pengujian */ } else {

/* ---------- Format ---------- */
const pick = (x, t) => { if (!x) return '0 ' + t[0][1]; const a = Math.abs(x);
  for (const [f, u] of t) if (a >= f * 0.9995) return nf(x / f) + ' ' + u; const l = t[t.length - 1]; return nf(x / l[0]) + ' ' + l[1]; };
const fV = v => nf(v) + ' V';
const fI = i => pick(i, [[1, 'A'], [1e-3, 'mA'], [1e-6, 'µA']]);
const fP = p => pick(p, [[1, 'W'], [1e-3, 'mW'], [1e-6, 'µW']]);
const fR = r => r >= 1000 ? nf(r / 1000) + ' kΩ' : nf(r) + ' Ω';

/* ---------- Pemetaan slider logaritmik ---------- */
const posToR = p => 100 * Math.pow(10, 3 * p / 1000);
const rToPos = r => 1000 * Math.log10(r / 100) / 3;
const clamp = (x, a, b) => Math.min(b, Math.max(a, x));

function setVal(key, raw) {
  const x = parseFloat(raw);
  const [a, b] = key === 'vin' ? LIM.vin : LIM.r;
  if (!isFinite(x) || x < a || x > b) {
    $('msg').textContent = 'Nilai ' + key.toUpperCase() + ' harus angka antara ' + (key === 'vin' ? '0–24 V.' : '100 Ω–100 kΩ.') + ' Nilai dibatasi otomatis.';
    if (!isFinite(x)) { syncInputs(); return; }
  } else $('msg').textContent = '';
  S[key] = clamp(x, a, b);
  syncInputs(); update();
}
function syncInputs(skip) {
  if (skip !== 'vin-s') $('vin-s').value = S.vin;
  if (skip !== 'vin-n') $('vin-n').value = +S.vin.toFixed(2);
  ['r1', 'r2'].forEach(k => {
    if (skip !== k + '-s') $(k + '-s').value = rToPos(S[k]);
    if (skip !== k + '-n') $(k + '-n').value = +(S[k] / U[k]).toPrecision(6);
  });
}

/* ---------- Tampilan ---------- */
function update() {
  const c = calc(S.vin, S.r1, S.r2);
  $('o-vin').textContent = fV(S.vin); $('o-vout').textContent = fV(c.vout);
  $('o-v1').textContent = fV(c.v1); $('o-v2').textContent = fV(c.v2);
  $('o-i').textContent = fI(c.i); $('o-rt').textContent = fR(c.rt);
  $('o-p1').textContent = fP(c.p1); $('o-p2').textContent = fP(c.p2);
  $('o-pct').textContent = S.vin > 0 ? nf(c.ratio * 100, 2) + ' %' : '— (Vin = 0)';
  $('o-kvl').textContent = c.kvl ? '✔ ' + fV(S.vin) + ' = ' + fV(c.v1) + ' + ' + fV(c.v2) : '✘ tidak cocok';
  const w1 = S.vin > 0 ? c.v1 / S.vin * 100 : 0, w2 = S.vin > 0 ? c.v2 / S.vin * 100 : 0;
  $('b1').style.width = w1 + '%'; $('b2').style.width = w2 + '%';
  $('bp1').textContent = nf(w1, 1) + '%'; $('bp2').textContent = nf(w2, 1) + '%';
  $('t-vin').textContent = 'Vin ' + fV(S.vin); $('t-i').textContent = 'I = ' + fI(c.i);
  $('t-r1').textContent = 'R1 ' + fR(S.r1); $('t-vr1').textContent = 'VR1 = ' + fV(c.v1);
  $('t-r2').textContent = 'R2 ' + fR(S.r2); $('t-vr2').textContent = 'VR2 = ' + fV(c.v2);
  $('t-vout').textContent = 'Vout'; $('t-vm').textContent = fV(c.vout);
  const d = Math.max(0.4, Math.min(3, 3 - Math.log10(c.i * 1e6 + 1) * 0.6));
  $('flow').style.animationDuration = d + 's';
  $('flow').style.opacity = S.vin > 0 ? 1 : 0;
  let e;
  if (S.vin === 0) e = 'Vin = 0 V: tidak ada arus, sehingga semua tegangan dan daya bernilai 0.';
  else if (S.r1 === S.r2) e = 'R1 = R2, maka Vout = ½ Vin = ' + fV(c.vout) + '.';
  else if (S.r2 > S.r1) e = 'R2 > R1, maka Vout (' + fV(c.vout) + ') lebih besar dari ½ Vin (' + fV(S.vin / 2) + ').';
  else e = 'R2 < R1, maka Vout (' + fV(c.vout) + ') lebih kecil dari ½ Vin (' + fV(S.vin / 2) + ').';
  $('explain').textContent = e + ' Resistor yang lebih besar menerima jatuh tegangan yang lebih besar; arus sama di keduanya.';
  drawGraph();
}
function drawGraph() {
  const W = 400, H = 240, l = 48, r = 12, t = 14, b = 40, vmax = S.vin > 0 ? S.vin : 1;
  const X = R => l + (Math.log10(R / 100) / 3) * (W - l - r), Y = v => t + (1 - v / vmax) * (H - t - b);
  let p = '';
  for (let k = 0; k <= 80; k++) { const R = 100 * Math.pow(10, 3 * k / 80); p += (k ? 'L' : 'M') + X(R).toFixed(1) + ' ' + Y(S.vin * R / (S.r1 + R)).toFixed(1); }
  let g = '<g stroke="var(--bd)" stroke-width="1">';
  [100, 1000, 10000, 100000].forEach(R => g += '<line x1="' + X(R) + '" x2="' + X(R) + '" y1="' + t + '" y2="' + (H - b) + '"/>');
  [0, .5, 1].forEach(f => g += '<line x1="' + l + '" x2="' + (W - r) + '" y1="' + Y(f * vmax) + '" y2="' + Y(f * vmax) + '"/>');
  g += '</g><g style="font-size:11px;font-weight:400">';
  [[100, '100 Ω'], [1000, '1 kΩ'], [10000, '10 kΩ'], [100000, '100 kΩ']].forEach(a => g += '<text x="' + X(a[0]) + '" y="' + (H - b + 14) + '" text-anchor="middle">' + a[1] + '</text>');
  [0, .5, 1].forEach(f => g += '<text x="' + (l - 5) + '" y="' + (Y(f * vmax) + 4) + '" text-anchor="end">' + nf(f * vmax, 1) + '</text>');
  g += '<text x="' + (l + (W - l - r) / 2) + '" y="' + (H - 14) + '" text-anchor="middle">R2 (Ω, skala log)</text>';
  g += '<text transform="translate(12 ' + (t + (H - t - b) / 2) + ') rotate(-90)" text-anchor="middle">Vout (V)</text></g>';
  const c = calc(S.vin, S.r1, S.r2);
  g += '<path d="' + p + '" fill="none" stroke="var(--out)" stroke-width="3"/>';
  g += '<circle cx="' + X(S.r2) + '" cy="' + Y(c.vout) + '" r="6" fill="#e03131"/>';
  g += '<text x="' + (W - r) + '" y="' + (t + 12) + '" text-anchor="end" fill="var(--out)" style="font-size:11px">— Vout(R2), R1 = ' + fR(S.r1) + '</text>';
  $('graph').innerHTML = g;
}

/* ---------- Kontrol ---------- */
$('vin-s').addEventListener('input', e => { S.vin = parseFloat(e.target.value); $('msg').textContent = ''; syncInputs('vin-s'); update(); });
$('vin-n').addEventListener('change', e => setVal('vin', e.target.value));
['r1', 'r2'].forEach(k => {
  $(k + '-s').addEventListener('input', e => { S[k] = clamp(Math.round(posToR(+e.target.value)), 100, 100000); $('msg').textContent = ''; syncInputs(k + '-s'); update(); });
  $(k + '-n').addEventListener('change', e => setVal(k, parseFloat(e.target.value) * U[k]));
  $(k + '-u').addEventListener('change', e => { U[k] = +e.target.value; syncInputs(); });
});
function load(v, a, b) { S.vin = v; S.r1 = a; S.r2 = b; $('msg').textContent = ''; syncInputs(); update(); }
PRESETS.forEach((p, i) => $('preset').add(new Option(p[0], i)));
$('preset').addEventListener('change', e => { const p = PRESETS[e.target.value]; load(p[1], p[2], p[3]); });
$('btn-ex').onclick = () => { $('preset').value = 0; load(12, 1000, 2000); };
$('btn-reset').onclick = () => { $('preset').value = 0; load(DEF.vin, DEF.r1, DEF.r2); };
function toggle(btn, fn, onTxt, offTxt) {
  btn.onclick = () => { const on = btn.getAttribute('aria-pressed') !== 'true'; btn.setAttribute('aria-pressed', on); btn.textContent = on ? onTxt : offTxt; fn(on); };
}
toggle($('btn-anim'), on => $('circuit').classList.toggle('paused', !on), 'Jeda animasi', 'Mulai animasi');
toggle($('btn-i'), on => $('circuit').classList.toggle('hide-i', !on), 'Sembunyikan arus', 'Tampilkan arus');
toggle($('btn-v'), on => $('circuit').classList.toggle('hide-v', !on), 'Sembunyikan tegangan', 'Tampilkan tegangan');
toggle($('btn-f'), on => $('formula').classList.toggle('hidden', !on), 'Sembunyikan rumus', 'Tampilkan rumus');
$('btn-copy').onclick = () => {
  const c = calc(S.vin, S.r1, S.r2);
  const t = 'Vin=' + fV(S.vin) + ', R1=' + fR(S.r1) + ', R2=' + fR(S.r2) + '\nVout=' + fV(c.vout) + ', I=' + fI(c.i) + ', VR1=' + fV(c.v1) + ', VR2=' + fV(c.v2) + ', P1=' + fP(c.p1) + ', P2=' + fP(c.p2);
  (navigator.clipboard ? navigator.clipboard.writeText(t) : Promise.reject()).then(() => $('btn-copy').textContent = 'Tersalin ✔', () => { prompt('Salin teks ini:', t); });
  setTimeout(() => $('btn-copy').textContent = 'Salin hasil', 1500);
};
function setTheme(t) { document.documentElement.dataset.theme = t; $('btn-theme').textContent = t === 'dark' ? 'Mode terang' : 'Mode gelap'; try { localStorage.setItem('vdl-theme', t); } catch (e) {} }
$('btn-theme').onclick = () => setTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark');
let th = 'light'; try { th = localStorage.getItem('vdl-theme') || (matchMedia('(prefers-color-scheme:dark)').matches ? 'dark' : 'light'); } catch (e) {}
setTheme(th);

/* ---------- Laboratorium mini ---------- */
const EXP = [
  ];
$('lab').innerHTML = EXP.map((e, i) => '<div class="exp"><h3>' + e[0] + '</h3><p><b>Tujuan:</b> ' + e[1] + '</p><p><b>Instruksi:</b> ' + e[2] + '</p><p><b>Hasil diharapkan:</b> ' + e[3] + '</p><button class="btn" data-e="' + i + '">Muat konfigurasi</button><label class="small" for="obs' + i + '">Catatan pengamatan</label><textarea id="obs' + i + '"></textarea></div>').join('');
$('lab').addEventListener('click', ev => { const i = ev.target.dataset.e; if (i !== undefined) { const c = EXP[i][4]; load(c[0], c[1], c[2]); window.scrollTo({ top: 0, behavior: 'smooth' }); } });

/* ---------- Kuis ---------- */
const Q = [
 ];
let qi = 0, sc = 0;
function showQ() {
  const box = $('quiz');
  if (qi >= Q.length) { box.innerHTML = '<p class="note">Skor akhir: <b>' + sc + ' / ' + Q.length + '</b></p><button class="btn" id="qr">Ulangi kuis</button>'; $('qr').onclick = () => { qi = 0; sc = 0; showQ(); }; return; }
  const q = Q[qi];
  box.innerHTML = '<div class="q"><p class="small">Soal ' + (qi + 1) + ' dari ' + Q.length + ' — skor ' + sc + '</p><p><b>' + q[0] + '</b></p>' + q[1].map((o, i) => '<button class="btn opt" data-o="' + i + '">' + o + '</button>').join('') + '<p id="fb" role="status"></p></div>';
  box.querySelectorAll('.opt').forEach(b => b.onclick = () => {
    const a = +b.dataset.o, ok = a === q[2]; if (ok) sc++;
    box.querySelectorAll('.opt').forEach((x, i) => { x.disabled = true; if (i === q[2]) x.classList.add('ok'); else if (i === a) x.classList.add('bad'); });
    $('fb').innerHTML = (ok ? '<b>Benar!</b> ' : '<b>Kurang tepat.</b> ') + q[3] + '<br><button class="btn" id="qn">' + (qi + 1 < Q.length ? 'Soal berikutnya' : 'Lihat skor') + '</button>';
    $('qn').onclick = () => { qi++; showQ(); }; $('qn').focus();
  });
}
showQ(); syncInputs(); update();
}
