/*
 * Twitch Affiliate Progress Tracker - standalone version of
 * https://streamgearlab.com/tools/twitch-affiliate-tracker/
 * Part of StreamGearLab's free tools (https://streamgearlab.com). MIT License.
 * Your numbers are only stored if you tick "Remember on this device" (browser localStorage).
 */
(function () {
  'use strict';
  var KEY = 'sgl-affiliate-tracker-v1';
  var form = document.getElementById('aff-form');
  var out = document.getElementById('aff-results');
  var remember = document.getElementById('remember');
  var status = document.getElementById('save-status');
  var FIELDS = ['followers', 'days', 'minutes', 'vdays', 'avg', 'perweek', 'len'];
  var num = function (name) { var v = parseFloat(form.elements.namedItem(name).value); return isFinite(v) && v >= 0 ? v : NaN; };
  var fmtMin = function (m) { return m >= 60 ? Math.floor(m / 60) + ' h' + (m % 60 ? ' ' + (m % 60) + ' min' : '') : m + ' min'; };

  function bar(label, have, need, unit) {
    var pct = Math.min(100, Math.round((have / need) * 100));
    var done = have >= need;
    return '<div class="progress-row"><div class="top"><span>' + label + '</span><span>' + unit(have) + ' / ' + unit(need) + ' ' + (done ? '<span class="status full">Done</span>' : '<span class="status reduced">' + unit(need - have) + ' to go</span>') + '</span></div><div class="bar ' + (done ? 'done' : '') + '" role="progressbar" aria-label="' + label + '" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + pct + '"><span style="width:' + pct + '%"></span></div></div>';
  }

  function compute() {
    var f = Math.floor(num('followers')), d = Math.floor(num('days')), m = Math.floor(num('minutes')), vd = Math.floor(num('vdays'));
    var avg = num('avg'), perWeek = Math.max(1, Math.min(7, Math.floor(num('perweek')) || 3)), len = Math.max(15, Math.floor(num('len')) || 90);
    if ([f, d, m, vd].some(function (x) { return isNaN(x); })) { out.innerHTML = '<div class="result-summary"><p class="warn">Fill in followers, days streamed, minutes streamed and viewer days (use 0 if none).</p></div>'; return; }
    var warns = [];
    if (d > 31) warns.push('There are only 30 days in the window, so check the "unique days streamed" number.');
    if (vd > d) warns.push('You entered more viewer days than stream days. Every viewer day is also a stream day, so double-check both numbers.');
    if (m > 30 * 1440) warns.push('That is more minutes than exist in 30 days. Did you enter seconds?');
    var vdC = Math.min(vd, d);
    var needF = Math.max(0, 25 - f), needD = Math.max(0, 4 - d), needM = Math.max(0, 240 - m), needV = Math.max(0, 4 - vdC);
    var allDone = !needF && !needD && !needM && !needV;
    var html = '<div class="result-summary">';
    if (allDone) html += '<p class="big-number">You meet all four goals 🎉</p><p>Make sure two-factor authentication is on. Twitch says the invite usually arrives within 24–48 hours and can take up to 72; contact Twitch support if it has been longer.</p>';
    else {
      var done = [!needF, !needD, !needM, !needV].filter(Boolean).length;
      html += '<p class="small muted">Your progress</p><p class="big-number">' + done + ' of 4 goals met</p>';
      var missing = [];
      if (needF) missing.push(needF + ' more follower' + (needF > 1 ? 's' : ''));
      if (needD) missing.push(needD + ' more stream day' + (needD > 1 ? 's' : ''));
      if (needM) missing.push(fmtMin(needM) + ' more streaming time');
      if (needV) missing.push(needV + ' more day' + (needV > 1 ? 's' : '') + ' averaging 3+ viewers');
      html += '<p>Still missing: <strong>' + missing.join(', ') + '</strong>.</p>';
    }
    if (warns.length) html += '<ul class="plan-list warn">' + warns.map(function (w) { return '<li>' + w + '</li>'; }).join('') + '</ul>';
    html += '</div>';
    html += bar('Followers', f, 25, function (n) { return String(n); });
    html += bar('Time streamed', m, 240, function (n) { return fmtMin(n); });
    html += bar('Unique stream days', d, 4, function (n) { return String(n); });
    html += bar('Days with 3+ average viewers', vdC, 4, function (n) { return String(n); });

    if (!allDone) {
      var sessions = Math.max(needD, needV, needM > 0 ? 1 : 0);
      var plan = [];
      if (sessions > 0) {
        var perSession = needM > 0 ? Math.ceil(needM / sessions / 15) * 15 : 0;
        var weeks = sessions / perWeek;
        var calDays = Math.ceil(weeks * 7);
        plan.push('Stream on <strong>' + sessions + ' more day' + (sessions > 1 ? 's' : '') + '</strong>' + (perSession ? ' of at least <strong>' + fmtMin(perSession) + '</strong> each' : '') + (perSession && len >= perSession ? ' (your usual ' + fmtMin(len) + ' covers it)' : perSession ? '. Your usual ' + fmtMin(len) + ' is shorter, so add a bit of time or a day' : '') + '.');
        plan.push('At ' + perWeek + ' day' + (perWeek > 1 ? 's' : '') + " a week, that's about <strong>" + (calDays <= 7 ? '1 week' : Math.ceil(weeks) + ' weeks') + '</strong>.' + (calDays > 28 ? ' <span class="warn">That is close to the 30-day window, so streams from the start of your plan may drop off before you finish. Consider more days per week for a short burst.</span>' : ''));
      }
      if (needV) plan.push('Aim for ' + needV + " of those streams to average 3+ viewers. Keep them shorter (an average over 1.5–2 hours is easier to hold), announce them in advance, and invite friends or community members. Low days don't count against you.");
      if (needF) plan.push('Followers: ask once per stream (not constantly), post clips to short-form platforms, and network with streamers your size. Never buy followers; Twitch treats artificial engagement as a rules violation.');
      plan.push('Turn on two-factor authentication now. Twitch requires it before the invite.');
      plan.push('Twitch counts days in GMT, so late-night streams may land on the next day. Check Achievements → Path to Affiliate after each stream.');
      html += '<div class="result-summary" style="margin-top:6px"><p><strong>Suggested plan</strong></p><ol class="plan-list">' + plan.map(function (p) { return '<li>' + p + '</li>'; }).join('') + '</ol></div>';
    }
    if (isFinite(avg) && avg > 0) html += '<p class="small muted">Overall average of ' + avg + ': ' + (avg >= 3 && needV ? 'your overall average is 3+, but Twitch counts individual days. It looks like some days carry the average while others fall below 3.' : avg < 3 && vdC >= 4 ? 'below 3 overall, but that is fine: you already have 4 qualifying days.' : 'Twitch counts the days with a 3+ average, not this overall figure.') + '</p>';
    out.innerHTML = html;
    if (remember.checked) save();
  }
  function save() {
    try {
      var data = {};
      FIELDS.forEach(function (k) { data[k] = form.elements.namedItem(k).value; });
      data.savedAt = new Date().toISOString();
      localStorage.setItem(KEY, JSON.stringify(data));
      status.textContent = 'Saved on this device.';
    } catch (e) { status.textContent = 'Could not save (storage blocked).'; }
  }
  function load() {
    try {
      var raw = localStorage.getItem(KEY); if (!raw) return false;
      var data = JSON.parse(raw);
      FIELDS.forEach(function (k) { if (data[k] != null) form.elements.namedItem(k).value = data[k]; });
      remember.checked = true;
      status.textContent = 'Loaded your saved numbers' + (data.savedAt ? ' from ' + new Date(data.savedAt).toLocaleDateString() : '') + '.';
      return true;
    } catch (e) { return false; }
  }
  // Prefill from the URL, e.g. ?followers=20&days=3&minutes=200&vdays=2
  var qs = new URLSearchParams(location.search);
  var hasQs = false;
  qs.forEach(function (v, k) { if (FIELDS.indexOf(k) !== -1) { hasQs = true; form.elements.namedItem(k).value = v; } });
  if (!hasQs) load();
  remember.addEventListener('change', function () { if (remember.checked) save(); else { try { localStorage.removeItem(KEY); } catch (e) {} status.textContent = 'Not saved. Removed from this device.'; } });
  document.getElementById('clear').addEventListener('click', function () {
    FIELDS.forEach(function (k) { form.elements.namedItem(k).value = k === 'perweek' ? '3' : k === 'len' ? '90' : k === 'avg' ? '' : '0'; });
    try { localStorage.removeItem(KEY); } catch (e) {}
    remember.checked = false; status.textContent = 'Cleared.'; compute();
  });
  form.addEventListener('submit', function (e) { e.preventDefault(); compute(); });
  form.addEventListener('input', compute);
  form.addEventListener('change', compute);
  compute();
})();
