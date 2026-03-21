// Partykonkurrence — Event JavaScript
// Admin-side + hold-side interaktion

document.addEventListener('DOMContentLoaded', () => {
    const eventId = document.body.dataset.eventId;
    if (!eventId) return;

    const isAdminPage = document.getElementById('event-admin');
    const isHoldPage = document.getElementById('hold-page');

    if (isAdminPage) loadEventAdmin(eventId);
    if (isHoldPage) loadHoldPage(eventId);
});

// ==================== REGELBIBLIOTEK ====================

const RULES_DATABASE = {
    "dart 501": "DART 501\n• Start på 501 point — træk fra ved hvert kast\n• 3 pile per tur, holdene skiftes\n• Målet er at nå præcis 0\n• Kaster du for mange, beholder du din score fra før turen (bust)\n• Bullseye = 50 point, outer bull = 25 point\n• Triple 20 = 60 point (højeste enkelt-kast)",
    "dart": "DART 501\n• Start på 501 point — træk fra ved hvert kast\n• 3 pile per tur, holdene skiftes\n• Målet er at nå præcis 0\n• Kaster du for mange, beholder du din score fra før turen (bust)\n• Bullseye = 50, triple 20 = 60 (højeste enkelt-kast)",
    "beer pong": "BEER PONG\n• 10 kopper i trekant i hver ende af bordet, fyldt ⅓ med øl\n• Hold skiftes til at kaste bordtennisbold mod modstanderens kopper\n• Rammer du en kop → modstanderen drikker den og fjerner den\n• Albuen skal være bag bordkanten ved kast\n• Rammer begge spillere i samme tur (double) → 2 ekstra kast\n• Første hold der fjerner alle modstanderens kopper vinder",
    "beerpong": "BEER PONG\n• 10 kopper i trekant i hver ende af bordet, fyldt ⅓ med øl\n• Hold skiftes til at kaste bordtennisbold mod modstanderens kopper\n• Rammer du en kop → modstanderen drikker den og fjerner den\n• Albuen skal være bag bordkanten ved kast\n• Første hold der fjerner alle modstanderens kopper vinder",
    "flip cup": "FLIP CUP\n• Holdene står på hver sin side af bordet, hver spiller har en kop med øl\n• Stafet: første spiller drikker sin kop, sætter den på bordkanten med bunden op og flipper den med et fingertip\n• Når koppen lander med bunden opad, må næste spiller starte\n• Første hold hvor alle spillere har flippet deres kop vinder\n• Kun én hånd — ingen pust på koppen!",
    "ølstafet": "ØLSTAFET\n• Holdene stiller op i to rækker\n• Første spiller løber hen til sin øl, bunder den, drejer 10 omgange rundt om øllen (finger på øllen hele tiden)\n• Løb tilbage og klap næste spiller af\n• Første hold hvor alle er i mål vinder\n• Snyd (manglende omgange, ikke bundet) = straf-øl",
    "sømslåning": "SØMSLÅNING\n• Hver deltager får et søm i en træstub\n• Man skiftes til at slå ét slag med hammeren\n• Hammeren skal vendes i luften (kastes op og gribes) inden slaget\n• Rammer man ved siden af, mister man sin tur\n• Første person der slår sit søm helt i bund vinder\n• Hammeren holdes i den tynde ende",
    "kubb": "KUBB (Vikingespil)\n• 5 kubber på hver baglinje, kongen i midten\n• Hold skiftes til at kaste 6 kastepinde underhånds mod modstanderens kubber\n• Væltede kubber kastes over på modstanderens halvdel som 'feltkubber'\n• Feltkubber skal væltes FØR baglinje-kubber\n• Vælter du kongen for tidligt = du TABER\n• Vinder: vælter alle kubber og til sidst kongen",
    "stack cup": "STACK CUP / RAGE CAGE\n• Kopper i cirkel på bordet, fyldt ¼ med øl, midterkoppen ¾ fuld\n• To spillere starter med at bounce bordtennisbold i en tom kop\n• Lander bolden på 1. forsøg → send koppen til hvem som helst\n• Flere forsøg → send koppen til venstre\n• Indhenter du den anden spiller → stak din kop oven på deres\n• Den stakede spiller drikker en kop fra midten og fortsætter",
    "rage cage": "RAGE CAGE / STACK CUP\n• Kopper i cirkel på bordet, fyldt ¼ med øl, midterkoppen ¾ fuld\n• To spillere starter med at bounce bordtennisbold i en tom kop\n• Lander bolden på 1. forsøg → send koppen til hvem som helst\n• Indhenter du den anden spiller → stak din kop oven på deres\n• Den stakede spiller drikker en kop fra midten",
    "armlægning": "ARMLÆGNING\n• Albuerne på bordet, grib modstanderens hånd\n• Skuldrene skal være parallelle med bordkanten\n• Ved startsignal: pres modstanderens hånd ned mod bordet\n• Albuen skal holde kontakt med bordet hele tiden\n• Vinder: den der presser modstanderens hånd ned\n• Falsk start = advarsel, to advarsler = tab",
    "bordtennis": "BORDTENNIS\n• Spil til 11 point, skift serv hver 2. point\n• Serv: bold bag bordkanten, kast op, slå så den rammer egen side først\n• Bolden skal ramme hver side af nettet én gang\n• Point scores når modstanderen misser bolden eller slår den i nettet/ud\n• Ved 10-10: spil videre til 2 points forskel",
    "ølbowling": "ØLBOWLING\n• Stil 10 øldåser/flasker op som bowling-kegler\n• Rul en bold mod dåserne fra aftalt afstand\n• 2 kast per tur (som rigtig bowling)\n• Point = antal væltede dåser\n• Strike (alle 10 på første kast) = bonuspoint",
    "beer bowling": "ØLBOWLING\n• Stil 10 øldåser/flasker op som bowling-kegler\n• Rul en bold mod dåserne fra aftalt afstand\n• 2 kast per tur\n• Point = antal væltede dåser",
    "tippy cup": "FLIP CUP / TIPPY CUP\n• Holdene står på hver sin side af bordet, hver spiller har en kop\n• Stafet: drik, sæt koppen på kanten, flip den med fingeren\n• Næste spiller starter når koppen lander med bunden op\n• Første hold færdigt vinder",
};

// Forslag til konkurrencenavne
const COMPETITION_SUGGESTIONS = [
    "Dart 501", "Beer Pong", "Flip Cup", "Ølstafet", "Sømslåning",
    "Kubb", "Stack Cup", "Armlægning", "Bordtennis", "Ølbowling",
    "Ølchug", "Kroket", "Petanque", "Vikingespil", "Stafet",
    "Limbo", "Tug of War", "Æggeløb", "Sækkeløb", "Skattejagt",
];

function lookupRules(compName) {
    const key = compName.toLowerCase().trim();
    // Exact match
    if (RULES_DATABASE[key]) return RULES_DATABASE[key];
    // Partial match
    for (const [k, v] of Object.entries(RULES_DATABASE)) {
        if (key.includes(k) || k.includes(key)) return v;
    }
    return null;
}

// ==================== HELPERS ====================

function showToast(msg, isError) {
    const toast = document.createElement('div');
    toast.className = 'toast-msg';
    toast.style.background = isError ? 'var(--red)' : 'var(--green)';
    toast.textContent = msg;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2500);
}

function escapeHtml(str) {
    const d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
}

function teamName(teams, teamId) {
    const t = teams.find(x => x.id === teamId);
    return t ? t.name : teamId;
}

// ==================== ADMIN: LOAD ====================

async function loadEventAdmin(eventId) {
    try {
        const res = await fetch(`/api/event/${eventId}/standings`);
        const data = await res.json();
        if (!data.success) { showToast(data.error, true); return; }
        const evt = data.event;
        renderAdminStatus(evt);
        renderTeams(evt);
        renderCompetitions(evt, data.progress);
        renderEventSettings(evt);
        renderStandings(data.standings, evt);
        renderMatches(evt);
        renderWinnerSection(evt, data.standings, data.group_complete);
        // Update screen message status
        const msgStatus = document.getElementById('screen-message-status');
        if (msgStatus && evt.screen_message) {
            msgStatus.textContent = `Vises nu: "${evt.screen_message}"`;
        }
    } catch (e) {
        showToast('Fejl ved indlæsning', true);
    }
}

function renderAdminStatus(evt) {
    const el = document.getElementById('event-status');
    if (!el) return;
    const labels = { setup: 'Opsætning', active: 'I gang', finished: 'Afsluttet' };
    el.innerHTML = `
        <span class="event-status ${evt.status}">${labels[evt.status]}</span>
        <span style="margin-left: 12px; color: var(--subtext);">${evt.teams.length} hold — ${evt.competitions.length} konkurrencer</span>
    `;
}

function renderTeams(evt) {
    const container = document.getElementById('teams-container');
    if (!container) return;

    if (evt.status === 'setup') {
        container.innerHTML = `
            <div style="display: flex; gap: 8px; margin-bottom: 12px;">
                <input type="text" id="new-team-name" class="form-input" placeholder="Holdnavn..." style="flex:1;">
                <button class="btn btn-primary btn-sm" onclick="window._addTeam()">Tilføj</button>
            </div>
            <div id="team-chips">
                ${evt.teams.map(t => `
                    <span class="team-chip">
                        <strong>${escapeHtml(t.name)}</strong>
                        ${t.players && t.players.length > 0
                            ? `<span style="color: var(--subtext); font-size: 11px;">(${t.players.map(p => escapeHtml(p)).join(', ')})</span>`
                            : ''}
                        <button class="remove-btn" onclick="window._removeTeam('${t.id}')" title="Fjern">&times;</button>
                    </span>
                `).join('')}
                ${evt.teams.length === 0 ? '<p class="muted" style="font-size: 13px;">Ingen hold tilføjet endnu</p>' : ''}
            </div>
        `;
        const input = document.getElementById('new-team-name');
        if (input) input.addEventListener('keydown', (e) => { if (e.key === 'Enter') window._addTeam(); });
    } else {
        container.innerHTML = `<div id="team-chips">
            ${evt.teams.map(t => `
                <span class="team-chip">
                    ${escapeHtml(t.name)}
                    ${t.players && t.players.length > 0
                        ? `<span style="color: var(--subtext); font-size: 11px; margin-left: 4px;">(${t.players.map(p => escapeHtml(p)).join(', ')})</span>`
                        : ''}
                </span>
            `).join('')}
        </div>`;
    }
}

function renderCompetitions(evt, progress) {
    const container = document.getElementById('competitions-container');
    if (!container) return;

    if (evt.status === 'setup') {
        container.innerHTML = `
            <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 12px;">
                <input type="text" id="new-comp-name" class="form-input" placeholder="Konkurrencenavn..." style="flex:1; min-width: 150px;" list="comp-suggestions">
                <datalist id="comp-suggestions">${COMPETITION_SUGGESTIONS.map(s => `<option value="${s}">`).join('')}</datalist>
                <select id="new-comp-type" class="form-input" style="width: auto;" onchange="window._toggleCompFields()">
                    <option value="round-robin">Alle mod alle</option>
                    <option value="ranking">Vælg vinder</option>
                    <option value="points">Fri pointgivning</option>
                </select>
                <div id="comp-type-help" style="width:100%;font-size:12px;color:var(--subtext);padding:4px 0;line-height:1.4;"></div>
                <div id="comp-rr-fields" style="display: flex; gap: 8px; width: 100%; flex-wrap: wrap;">
                    <input type="number" id="new-comp-mpt" class="form-input" placeholder="Kampe/hold (tom=alle)" min="1" style="width: 160px;" title="Antal kampe per hold">
                    <input type="number" id="new-comp-resources" class="form-input" placeholder="Antal baner" min="1" value="1" style="width: 120px;" title="Antal baner (parallelle kampe)">
                    <label style="display:flex;align-items:center;gap:6px;cursor:pointer;font-size:13px;color:var(--subtext);width:100%;">
                        <input type="checkbox" id="new-comp-lowest" style="width:16px;height:16px;">
                        Laveste score vinder (fx Dart 501)
                    </label>
                </div>
                <button class="btn btn-primary btn-sm" onclick="window._addCompetition()">Tilføj</button>
            </div>
            <div id="comp-list">
                ${evt.competitions.map(c => {
                    const typeLabels = { 'round-robin': 'Alle mod alle', 'ranking': 'Vælg vinder', 'points': 'Pointgivning' };
                    const typeLabel = typeLabels[c.type] || c.type;
                    const extra = c.type === 'round-robin'
                        ? ` — ${c.matches_per_team ? c.matches_per_team + ' kampe/hold' : 'fuld'}, ${c.resources || 1} bane${(c.resources || 1) > 1 ? 'r' : ''}${c.lowest_wins ? ', laveste vinder' : ''}`
                        : '';
                    const hasRules = c.rules && c.rules.trim().length > 0;
                    return `<div style="border: 1px solid var(--surface1); border-radius: 8px; padding: 8px 10px; margin-bottom: 6px;">
                        <div class="match-row">
                            <span style="flex:1; font-weight: 500;">${escapeHtml(c.name)}</span>
                            <span class="event-status" style="background: var(--surface2); color: var(--text); font-size: 10px;">
                                ${typeLabel}${extra}
                            </span>
                            <button class="btn btn-sm" style="font-size:11px;" onclick="document.getElementById('rules-${c.id}').style.display = document.getElementById('rules-${c.id}').style.display === 'none' ? 'block' : 'none'">
                                ${hasRules ? '📋 Regler' : '📝 Tilføj regler'}
                            </button>
                            <button class="btn btn-danger btn-sm" onclick="window._removeCompetition('${c.id}')">&times;</button>
                        </div>
                        <div id="rules-${c.id}" style="display: none; margin-top: 8px;">
                            <textarea id="rules-text-${c.id}" class="form-input" rows="5" style="width:100%;resize:vertical;font-size:12px;"
                                placeholder="Skriv regler her...">${escapeHtml(c.rules || '')}</textarea>
                            <div style="display:flex;gap:6px;margin-top:4px;">
                                <button class="btn btn-success btn-sm" onclick="window._saveRules('${c.id}')">Gem regler</button>
                                <button class="btn btn-secondary btn-sm" onclick="window._autoRules('${c.id}','${escapeHtml(c.name)}')">🔍 Hent standardregler</button>
                            </div>
                        </div>
                    </div>`;
                }).join('')}
                ${evt.competitions.length === 0 ? '<p class="muted" style="font-size: 13px;">Ingen konkurrencer tilføjet endnu</p>' : ''}
            </div>
        `;
        const input = document.getElementById('new-comp-name');
        if (input) input.addEventListener('keydown', (e) => { if (e.key === 'Enter') window._addCompetition(); });
    } else {
        container.innerHTML = evt.competitions.map(c => {
            const typeLabel = c.type === 'round-robin' ? 'Alle mod alle' : 'Pointgivning';
            const extra = c.type === 'round-robin'
                ? ` — ${c.matches_per_team ? c.matches_per_team + ' kampe/hold' : 'fuld'}, ${c.resources || 1} bane${(c.resources || 1) > 1 ? 'r' : ''}`
                : '';
            const p = progress && progress[c.id];
            let progressHtml = '';
            if (p && c.type === 'round-robin') {
                const pct = p.pct;
                const done = p.completed_matches;
                const total = p.total_matches;
                const color = pct >= 100 ? 'var(--green)' : 'var(--blue)';
                progressHtml = `
                    <div style="margin-top: 6px;">
                        <div style="display:flex;justify-content:space-between;font-size:11px;color:var(--subtext);margin-bottom:2px;">
                            <span>${done}/${total} kampe</span>
                            <span>${pct >= 100 ? '✓ Færdig' : pct + '%'}</span>
                        </div>
                        <div style="background:var(--surface2);border-radius:4px;height:6px;overflow:hidden;">
                            <div style="background:${color};height:100%;width:${pct}%;border-radius:4px;transition:width 0.3s;"></div>
                        </div>
                    </div>`;
            }
            return `<div class="match-row" style="flex-direction:column;align-items:stretch;">
                <div style="display:flex;align-items:center;gap:8px;">
                    <span style="flex:1; font-weight: 500;">${escapeHtml(c.name)}</span>
                    <span class="event-status" style="background: var(--surface2); color: var(--text); font-size: 10px;">
                        ${typeLabel}${extra}
                    </span>
                </div>
                ${progressHtml}
            </div>`;
        }).join('');
    }
}

window._toggleCompFields = function () {
    const type = document.getElementById('new-comp-type').value;
    const fields = document.getElementById('comp-rr-fields');
    const help = document.getElementById('comp-type-help');
    if (fields) fields.style.display = type === 'round-robin' ? 'flex' : 'none';
    if (help) {
        const helpTexts = {
            'round-robin': 'Hold spiller mod hinanden i kampe. Point tildeles for sejr (3p), uafgjort (1p), tab (0p).',
            'ranking': 'Ingen kampe — fx sømslåning, ølstafet. Alle hold deltager og du vælger vinderen. Vinderen får 3 point.',
            'points': 'Admin skriver frie point per hold. Brug til konkurrencer med eget pointsystem.',
        };
        help.textContent = helpTexts[type] || '';
    }
};
// Init hjælpetekst ved load
setTimeout(() => { const el = document.getElementById('new-comp-type'); if (el) window._toggleCompFields(); }, 100);

function renderStandings(standings, evt) {
    const container = document.getElementById('standings-container');
    if (!container) return;
    if (!standings || standings.length === 0) {
        container.innerHTML = '<p class="muted">Start eventet for at se stilling</p>';
        return;
    }
    let html = `<table class="standings-table">
        <thead><tr><th>#</th><th>Hold</th><th>K</th><th>V</th><th>U</th><th>T</th><th>MF</th><th>MM</th><th>+/-</th><th>Point</th></tr></thead><tbody>`;
    standings.forEach((s, i) => {
        const rc = i < 3 ? `rank-${i + 1}` : '';
        html += `<tr class="${rc}">
            <td>${i + 1}</td><td>${escapeHtml(s.team_name)}</td>
            <td>${s.played}</td><td>${s.won}</td><td>${s.drawn}</td><td>${s.lost}</td>
            <td>${s.goals_for}</td><td>${s.goals_against}</td>
            <td>${s.goal_diff > 0 ? '+' : ''}${s.goal_diff}</td>
            <td style="font-weight: 700; color: var(--green);">${s.total_points}</td>
        </tr>`;
    });
    container.innerHTML = html + '</tbody></table>';
}

function renderMatches(evt) {
    const container = document.getElementById('matches-container');
    if (!container) return;
    if (evt.status === 'setup') {
        container.innerHTML = '<p class="muted">Start eventet for at se kampprogram</p>';
        return;
    }
    let html = '';

    for (const comp of evt.competitions) {
        if (comp.type === 'round-robin') {
            const active = comp.matches.filter(m => m.status === 'active');
            const waiting = comp.matches.filter(m => m.status === 'waiting').sort((a, b) => a.queue_pos - b.queue_pos);
            const played = comp.matches.filter(m => m.status === 'played');
            const total = comp.matches.length;
            const doneCount = played.length;

            html += `<div class="comp-section"><h3>${escapeHtml(comp.name)}
                <span style="font-size:12px;color:var(--subtext);font-weight:400;">
                    ${doneCount}/${total} kampe spillet
                </span></h3>`;

            // Active matches — fremhævet
            if (active.length > 0) {
                html += `<div style="margin-bottom:8px;font-size:13px;color:var(--green);font-weight:600;">Spilles nu</div>`;
                for (const m of active) {
                    const aName = teamName(evt.teams, m.team_a_id);
                    const bName = teamName(evt.teams, m.team_b_id);
                    const label = m.resource_label || '';
                    html += `<div class="match-row" style="border-left: 3px solid var(--green); padding-left: 8px; background: var(--surface1);">
                        <span style="font-size:10px;color:var(--green);font-weight:600;margin-right:4px;">${escapeHtml(label)}</span>
                        <span class="match-team">${escapeHtml(aName)}</span>
                        <div class="match-score">
                            <input type="number" min="0" class="score-input" id="sa-${m.id}" value="${m.score_a !== null ? m.score_a : ''}" placeholder="-">
                            <span class="match-vs">—</span>
                            <input type="number" min="0" class="score-input" id="sb-${m.id}" value="${m.score_b !== null ? m.score_b : ''}" placeholder="-">
                        </div>
                        <span class="match-team">${escapeHtml(bName)}</span>
                        <button class="btn btn-sm btn-success" onclick="window._saveResult('${comp.id}', '${m.id}')">Gem</button>
                        <button class="btn btn-sm btn-secondary" style="font-size:10px;padding:2px 6px;" onclick="window._postponeMatch('${comp.id}','${m.id}')" title="Udskyd">Udskyd</button>
                    </div>`;
                }
            }

            // Waiting — venter i kø
            if (waiting.length > 0) {
                html += `<div style="margin:12px 0 4px;font-size:13px;color:var(--subtext);">I kø (${waiting.length})</div>`;
                for (const m of waiting) {
                    const aName = teamName(evt.teams, m.team_a_id);
                    const bName = teamName(evt.teams, m.team_b_id);
                    const label = m.resource_label || '';
                    html += `<div class="match-row" style="opacity: 0.5;">
                        <span style="font-size:10px;color:var(--overlay);margin-right:4px;">${escapeHtml(label)}</span>
                        <span class="match-team">${escapeHtml(aName)}</span>
                        <span class="match-vs" style="margin:0 8px;">vs</span>
                        <span class="match-team">${escapeHtml(bName)}</span>
                    </div>`;
                }
            }

            // Played — afsluttede
            if (played.length > 0) {
                html += `<div style="margin:12px 0 4px;font-size:13px;color:var(--subtext);">Afsluttet (${played.length})</div>`;
                for (const m of played) {
                    const aName = teamName(evt.teams, m.team_a_id);
                    const bName = teamName(evt.teams, m.team_b_id);
                    html += `<div class="match-row played" style="opacity: 0.5;">
                        <span class="match-team">${escapeHtml(aName)}</span>
                        <span style="font-weight:600;margin:0 8px;">${m.score_a} — ${m.score_b}</span>
                        <span class="match-team">${escapeHtml(bName)}</span>
                    </div>`;
                }
            }

            if (total > 0 && doneCount === total) {
                html += `<div style="text-align:center;padding:8px;color:var(--green);font-weight:600;">Alle kampe spillet!</div>`;
            }

            html += '</div>';

        } else if (comp.type === 'points') {
            html += `<div class="comp-section"><h3>${escapeHtml(comp.name)}
                <span style="font-size:12px;color:var(--subtext);font-weight:400;">Pointgivning</span></h3>`;
            html += '<div style="display: grid; gap: 6px;">';
            for (const team of evt.teams) {
                const pts = comp.results[team.id] || 0;
                html += `<div class="match-row">
                    <span style="flex:1; font-weight: 500;">${escapeHtml(team.name)}</span>
                    <input type="number" min="0" class="score-input" id="pts-${comp.id}-${team.id}" value="${pts}" style="width: 70px;">
                    <button class="btn btn-sm btn-success" onclick="window._setPoints('${comp.id}', '${team.id}')">Gem</button>
                </div>`;
            }
            html += '</div></div>';

        } else if (comp.type === 'ranking') {
            const winnerId = Object.entries(comp.results || {}).find(([k,v]) => v === 1)?.[0];
            const winnerName = winnerId ? teamName(evt.teams, winnerId) : null;
            html += `<div class="comp-section"><h3>${escapeHtml(comp.name)}
                <span style="font-size:12px;color:var(--subtext);font-weight:400;">Vælg vinder — 3 point</span></h3>`;
            if (winnerId) {
                html += `<div style="text-align:center;padding:12px;">
                    <span style="font-size:20px;">🏆</span>
                    <span style="font-size:16px;font-weight:700;color:var(--yellow);margin:0 8px;">${escapeHtml(winnerName)}</span>
                    <button class="btn btn-sm btn-secondary" onclick="window._resetRanking('${comp.id}')">Ændr</button>
                </div>`;
            } else {
                html += '<div style="display: grid; gap: 6px;">';
                for (const team of evt.teams) {
                    html += `<div class="match-row" style="cursor:pointer;" onclick="window._saveWinner('${comp.id}','${team.id}')">
                        <span style="flex:1; font-weight: 500;">${escapeHtml(teamName(evt.teams, team.id))}</span>
                        <span style="font-size:16px;">👑</span>
                    </div>`;
                }
                html += '</div>';
            }
            html += '</div>';
        }
    }

    container.innerHTML = html;
}

// ==================== EVENT SETTINGS ====================

function renderEventSettings(evt) {
    const container = document.getElementById('settings-container');
    if (!container) return;

    const isSetup = evt.status === 'setup';
    const enableFinals = evt.enable_finals !== false;
    const mode = evt.tiebreak_mode || 'all_comps';
    const disabled = isSetup ? '' : 'disabled';
    const opacity = isSetup ? '' : 'opacity:0.7;';

    container.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 10px; ${opacity}">
            <label style="display: flex; align-items: center; gap: 8px; cursor: ${isSetup ? 'pointer' : 'default'};">
                <input type="checkbox" id="set-enable-finals" ${enableFinals ? 'checked' : ''} ${disabled}
                    onchange="window._updateSettings()" style="width:18px;height:18px;">
                <span>Spil finale/semifinale</span>
            </label>
            <div id="tiebreak-mode-wrap" style="display:${enableFinals ? 'flex' : 'none'};align-items:center;gap:8px;margin-left:26px;">
                <label style="font-size:13px;color:var(--subtext);">Hvornår:</label>
                <select id="set-tiebreak-mode" class="form-input" style="width:auto;" onchange="window._updateSettings()" ${disabled}>
                    <option value="always" ${mode === 'always' ? 'selected' : ''}>Altid (top 2/3 spiller finale)</option>
                    <option value="all_comps" ${mode === 'all_comps' ? 'selected' : ''}>Kun ved pointlighed — spil i alle discipliner</option>
                    <option value="single" ${mode === 'single' ? 'selected' : ''}>Kun ved pointlighed — én afgørende kamp</option>
                </select>
            </div>
            ${!isSetup ? '<div style="font-size:11px;color:var(--overlay);margin-left:26px;">Kan kun ændres i opsætning</div>' : ''}
        </div>
    `;
}

window._updateSettings = async function () {
    const enableFinals = document.getElementById('set-enable-finals').checked;
    const modeWrap = document.getElementById('tiebreak-mode-wrap');
    if (modeWrap) modeWrap.style.display = enableFinals ? 'flex' : 'none';
    const mode = document.getElementById('set-tiebreak-mode')?.value || 'all_comps';
    const eventId = document.body.dataset.eventId;
    await fetch(`/api/event/${eventId}/update-settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enable_finals: enableFinals, tiebreak_mode: mode }),
    });
};

// ==================== WINNER SECTION ====================

function renderWinnerSection(evt, standings, groupComplete) {
    const container = document.getElementById('winner-container');
    if (!container) return;
    if (evt.status !== 'active' && evt.status !== 'finished') {
        container.style.display = 'none';
        return;
    }
    container.style.display = '';

    const phase = evt.phase || 'group';

    if (phase === 'finished' && evt.winners && evt.winners.length > 0) {
        // Vis vindere
        const medals = ['🏆', '🥈', '🥉'];
        let html = '<div style="text-align:center; padding: 16px;">';
        html += '<h3 style="color: var(--yellow); margin-bottom: 12px;">Vindere</h3>';
        for (const w of evt.winners) {
            const medal = medals[w.place - 1] || '';
            const style = w.place === 1
                ? 'font-size:22px;font-weight:700;color:var(--yellow);'
                : w.place === 2
                    ? 'font-size:18px;font-weight:600;color:var(--subtext);'
                    : 'font-size:16px;font-weight:500;color:var(--overlay);';
            html += `<div style="${style}margin:6px 0;">${medal} ${w.place}. plads: ${escapeHtml(w.team_name)}</div>`;
        }
        html += '</div>';
        container.innerHTML = html;
        return;
    }

    if (phase === 'tiebreak') {
        // Vis tiebreak-kampe
        let html = '<h3 style="color:var(--yellow);margin-bottom:12px;">Tiebreak — Finale</h3>';
        const teams = evt.teams;
        for (const m of evt.tiebreak_matches) {
            const aName = teamName(teams, m.team_a_id);
            const bName = teamName(teams, m.team_b_id);
            if (m.status === 'played') {
                html += `<div class="match-row" style="opacity:0.6;">
                    <span style="font-size:11px;color:var(--yellow);margin-right:8px;">${escapeHtml(m.label)}</span>
                    <span class="match-team">${escapeHtml(aName)}</span>
                    <span style="font-weight:600;margin:0 8px;">${m.score_a} — ${m.score_b}</span>
                    <span class="match-team">${escapeHtml(bName)}</span>
                    <span style="color:var(--green);font-size:11px;">✓</span>
                </div>`;
            } else {
                html += `<div class="match-row" style="border-left:3px solid var(--yellow);padding-left:8px;background:var(--surface1);">
                    <span style="font-size:11px;color:var(--yellow);font-weight:600;margin-right:8px;">${escapeHtml(m.label)}</span>
                    <span class="match-team">${escapeHtml(aName)}</span>
                    <div class="match-score">
                        <input type="number" min="0" class="score-input" id="tb-sa-${m.id}" placeholder="-">
                        <span class="match-vs">—</span>
                        <input type="number" min="0" class="score-input" id="tb-sb-${m.id}" placeholder="-">
                    </div>
                    <span class="match-team">${escapeHtml(bName)}</span>
                    <button class="btn btn-sm btn-success" onclick="window._saveTiebreakResult('${m.id}')">Gem</button>
                </div>`;
            }
        }
        container.innerHTML = html;
        return;
    }

    // group phase
    if (groupComplete && evt.status === 'active' && phase === 'group') {
        container.innerHTML = `
            <div style="text-align:center;padding:16px;">
                <p style="color:var(--green);font-weight:600;margin-bottom:12px;">Alle gruppekampe er spillet!</p>
                <button class="btn btn-primary" onclick="window._checkWinners()" style="font-size:16px;padding:10px 24px;">
                    Find vinder
                </button>
            </div>
        `;
    } else {
        container.innerHTML = '';
    }
}

window._checkWinners = async function () {
    const eventId = document.body.dataset.eventId;
    const res = await fetch(`/api/event/${eventId}/check-winners`, { method: 'POST' });
    const data = await res.json();
    if (data.success) {
        if (data.phase === 'finished') {
            showToast('Vindere fundet!');
        } else if (data.phase === 'tiebreak') {
            showToast('Pointlighed! Tiebreak-kampe oprettet.');
        }
        loadEventAdmin(eventId);
    } else {
        showToast(data.error, true);
    }
};

window._saveTiebreakResult = async function (matchId) {
    const sa = parseInt(document.getElementById(`tb-sa-${matchId}`).value);
    const sb = parseInt(document.getElementById(`tb-sb-${matchId}`).value);
    if (isNaN(sa) || isNaN(sb) || sa < 0 || sb < 0) { showToast('Indtast begge scorer', true); return; }
    if (sa === sb) { showToast('Uafgjort ikke tilladt i tiebreak!', true); return; }
    const eventId = document.body.dataset.eventId;
    const res = await fetch(`/api/event/${eventId}/tiebreak-result`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ match_id: matchId, score_a: sa, score_b: sb }),
    });
    const data = await res.json();
    if (data.success) {
        if (data.phase === 'finished') showToast('Vindere fundet!');
        else showToast('Tiebreak-resultat gemt');
        loadEventAdmin(eventId);
    } else {
        showToast(data.error, true);
    }
};

// ==================== ADMIN: ACTIONS ====================

window._addTeam = async function () {
    const input = document.getElementById('new-team-name');
    const name = input.value.trim();
    if (!name) return;
    const eventId = document.body.dataset.eventId;
    const res = await fetch(`/api/event/${eventId}/add-team`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name }) });
    const data = await res.json();
    if (data.success) { input.value = ''; loadEventAdmin(eventId); showToast(`${name} tilføjet`); }
    else showToast(data.error, true);
};

window._removeTeam = async function (teamId) {
    if (!confirm('Fjern dette hold?')) return;
    const eventId = document.body.dataset.eventId;
    const res = await fetch(`/api/event/${eventId}/remove-team`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ team_id: teamId }) });
    const data = await res.json();
    if (data.success) { loadEventAdmin(eventId); showToast('Hold fjernet'); }
    else showToast(data.error, true);
};

window._addCompetition = async function () {
    const name = document.getElementById('new-comp-name').value.trim();
    const type = document.getElementById('new-comp-type').value;
    if (!name) return;
    const body = { name, type };
    if (type === 'round-robin') {
        const mptEl = document.getElementById('new-comp-mpt');
        const resEl = document.getElementById('new-comp-resources');
        const lowestEl = document.getElementById('new-comp-lowest');
        if (mptEl && mptEl.value) body.matches_per_team = parseInt(mptEl.value);
        if (resEl && resEl.value) body.resources = parseInt(resEl.value);
        if (lowestEl && lowestEl.checked) body.lowest_wins = true;
    }
    const eventId = document.body.dataset.eventId;
    const res = await fetch(`/api/event/${eventId}/add-competition`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const data = await res.json();
    if (data.success) {
        // Auto-sæt standardregler hvis de findes
        const autoRules = lookupRules(name);
        if (autoRules && data.competition) {
            await fetch(`/api/event/${eventId}/update-rules`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ comp_id: data.competition.id, rules: autoRules })
            });
        }
        document.getElementById('new-comp-name').value = '';
        const mptEl = document.getElementById('new-comp-mpt');
        if (mptEl) mptEl.value = '';
        loadEventAdmin(eventId);
        showToast(autoRules ? `${name} tilføjet med standardregler` : `${name} tilføjet`);
    }
    else showToast(data.error, true);
};

window._removeCompetition = async function (compId) {
    if (!confirm('Fjern denne konkurrence?')) return;
    const eventId = document.body.dataset.eventId;
    const res = await fetch(`/api/event/${eventId}/remove-competition`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ comp_id: compId }) });
    const data = await res.json();
    if (data.success) { loadEventAdmin(eventId); showToast('Konkurrence fjernet'); }
    else showToast(data.error, true);
};

window._generateTeams = async function () {
    const text = document.getElementById('participants-input').value.trim();
    if (!text) { showToast('Indtast deltagernavne', true); return; }
    const participants = text.split('\n').map(s => s.trim()).filter(s => s.length > 0);
    const numTeams = parseInt(document.getElementById('num-teams-input').value) || 2;
    if (participants.length < numTeams) { showToast(`Kun ${participants.length} deltagere`, true); return; }
    if (!confirm(`Fordel ${participants.length} deltagere på ${numTeams} hold?`)) return;
    const eventId = document.body.dataset.eventId;
    const res = await fetch(`/api/event/${eventId}/generate-teams`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ participants, num_teams: numTeams }) });
    const data = await res.json();
    if (data.success) { document.getElementById('participants-input').value = ''; loadEventAdmin(eventId); showToast(`${numTeams} hold oprettet`); }
    else showToast(data.error, true);
};

document.addEventListener('input', (e) => {
    if (e.target.id === 'participants-input') {
        const count = e.target.value.split('\n').map(s => s.trim()).filter(s => s.length > 0).length;
        const el = document.getElementById('participant-count');
        if (el) el.textContent = count > 0 ? `${count} deltagere` : '';
    }
});

window._startEvent = async function () {
    if (!confirm('Start eventet? Hold kan ikke ændres bagefter.')) return;
    const eventId = document.body.dataset.eventId;
    const res = await fetch(`/api/event/${eventId}/start`, { method: 'POST' });
    const data = await res.json();
    if (data.success) { location.reload(); }
    else showToast(data.error, true);
};

window._saveResult = async function (compId, matchId) {
    const sa = parseInt(document.getElementById(`sa-${matchId}`).value);
    const sb = parseInt(document.getElementById(`sb-${matchId}`).value);
    if (isNaN(sa) || isNaN(sb) || sa < 0 || sb < 0) { showToast('Indtast begge scorer', true); return; }
    const eventId = document.body.dataset.eventId;
    const res = await fetch(`/api/event/${eventId}/result`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ comp_id: compId, match_id: matchId, score_a: sa, score_b: sb }) });
    const data = await res.json();
    if (data.success) { loadEventAdmin(eventId); showToast('Resultat gemt — næste kamp startet'); }
    else showToast(data.error, true);
};

window._setPoints = async function (compId, teamId) {
    const pts = parseInt(document.getElementById(`pts-${compId}-${teamId}`).value);
    if (isNaN(pts) || pts < 0) { showToast('Ugyldigt pointtal', true); return; }
    const eventId = document.body.dataset.eventId;
    const res = await fetch(`/api/event/${eventId}/points`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ comp_id: compId, team_id: teamId, points: pts }) });
    const data = await res.json();
    if (data.success) { loadEventAdmin(eventId); showToast('Point gemt'); }
    else showToast(data.error, true);
};

window._saveWinner = async function (compId, teamId) {
    const eventId = document.body.dataset.eventId;
    const res = await fetch(`/api/event/${eventId}/ranking`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ comp_id: compId, rankings: { [teamId]: 1 } }) });
    const data = await res.json();
    if (data.success) { loadEventAdmin(eventId); showToast('Vinder registreret!'); }
    else showToast(data.error, true);
};

window._resetRanking = async function (compId) {
    const eventId = document.body.dataset.eventId;
    const res = await fetch(`/api/event/${eventId}/ranking`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ comp_id: compId, rankings: {} }) });
    const data = await res.json();
    if (data.success) { loadEventAdmin(eventId); showToast('Vinder nulstillet'); }
    else showToast(data.error, true);
};

window._saveRules = async function (compId) {
    const rules = document.getElementById(`rules-text-${compId}`).value;
    const eventId = document.body.dataset.eventId;
    const res = await fetch(`/api/event/${eventId}/update-rules`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ comp_id: compId, rules }) });
    const data = await res.json();
    if (data.success) { showToast('Regler gemt!'); loadEventAdmin(eventId); }
    else showToast(data.error, true);
};

window._autoRules = async function (compId, compName) {
    const textarea = document.getElementById(`rules-text-${compId}`);
    // Tjek lokal database først
    const localRules = lookupRules(compName);
    if (localRules) {
        textarea.value = localRules;
        showToast('Standardregler indsat — rediger efter behov');
        return;
    }
    // Søg på internettet
    showToast('Søger efter regler for "' + compName + '"...');
    try {
        const res = await fetch(`/api/lookup-rules?name=${encodeURIComponent(compName)}`);
        const data = await res.json();
        if (data.success && data.rules) {
            textarea.value = data.rules;
            showToast('Regler fundet online — rediger efter behov');
        } else {
            showToast('Ingen regler fundet for "' + compName + '"', true);
        }
    } catch (e) {
        showToast('Fejl ved søgning efter regler', true);
    }
};

window._postponeMatch = async function (compId, matchId) {
    if (!confirm('Udskyd denne kamp til senere?')) return;
    const eventId = document.body.dataset.eventId;
    const res = await fetch(`/api/event/${eventId}/postpone`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ comp_id: compId, match_id: matchId }) });
    const data = await res.json();
    if (data.success) { loadEventAdmin(eventId); showToast('Kamp udskudt — næste kamp startet'); }
    else showToast(data.error, true);
};

window._finishEvent = async function () {
    if (!confirm('Afslut eventet?')) return;
    const eventId = document.body.dataset.eventId;
    const res = await fetch(`/api/event/${eventId}/finish`, { method: 'POST' });
    if ((await res.json()).success) location.reload();
};

window._resetEvent = async function () {
    if (!confirm('Nulstil? Alle resultater slettes.')) return;
    const eventId = document.body.dataset.eventId;
    const res = await fetch(`/api/event/${eventId}/reset`, { method: 'POST' });
    if ((await res.json()).success) location.reload();
};

window._deleteEvent = async function () {
    if (!confirm('Slet eventet permanent?')) return;
    const eventId = document.body.dataset.eventId;
    const res = await fetch(`/api/event/${eventId}/delete`, { method: 'POST' });
    if ((await res.json()).success) window.location.href = '/';
};

window._openScreen = function () {
    window.open(`/event/${document.body.dataset.eventId}/skaerm`, '_blank');
};

window._sendScreenMessage = async function () {
    const input = document.getElementById('screen-message-input');
    const msg = input.value.trim();
    if (!msg) { showToast('Skriv en besked først', true); return; }
    const eventId = document.body.dataset.eventId;
    const res = await fetch(`/api/event/${eventId}/screen-message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg }),
    });
    const data = await res.json();
    if (data.success) {
        showToast('Besked vises på storskærm');
        const status = document.getElementById('screen-message-status');
        if (status) status.textContent = `Vises nu: "${msg}"`;
    } else showToast(data.error, true);
};

window._clearScreenMessage = async function () {
    const eventId = document.body.dataset.eventId;
    const res = await fetch(`/api/event/${eventId}/screen-message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: '' }),
    });
    const data = await res.json();
    if (data.success) {
        showToast('Besked fjernet');
        const input = document.getElementById('screen-message-input');
        if (input) input.value = '';
        const status = document.getElementById('screen-message-status');
        if (status) status.textContent = '';
    }
};

window._toggleFestive = async function (enabled) {
    const eventId = document.body.dataset.eventId;
    const res = await fetch(`/api/event/${eventId}/toggle-festive`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ festive_mode: enabled }),
    });
    const data = await res.json();
    if (data.success) {
        showToast(enabled ? 'Festlige effekter aktiveret' : 'Festlige effekter deaktiveret');
    }
};

// ==================== HOLD-SIDE ====================

async function loadHoldPage(eventId) {
    const teamCode = document.body.dataset.teamCode;
    if (!teamCode) return;
    try {
        const res = await fetch(`/api/event/${eventId}/standings`);
        const data = await res.json();
        if (!data.success) return;
        const evt = data.event;
        const team = evt.teams.find(t => t.code === teamCode);
        if (!team) return;
        renderHoldMatches(evt, team);
    } catch (e) { showToast('Fejl', true); }
}

function renderHoldMatches(evt, team) {
    const container = document.getElementById('hold-matches');
    if (!container) return;
    let html = '';
    for (const comp of evt.competitions) {
        if (comp.type !== 'round-robin') continue;
        const myMatches = comp.matches.filter(m => m.team_a_id === team.id || m.team_b_id === team.id);
        if (!myMatches.length) continue;

        html += `<h3 style="margin:16px 0 8px;font-size:16px;color:var(--blue);">${escapeHtml(comp.name)}</h3>`;

        // Active match — highlighted
        const active = myMatches.filter(m => m.status === 'active');
        for (const m of active) {
            const isA = m.team_a_id === team.id;
            const oppName = teamName(evt.teams, isA ? m.team_b_id : m.team_a_id);
            const myScore = isA ? m.score_a : m.score_b;
            const theirScore = isA ? m.score_b : m.score_a;
            const label = m.resource_label || '';
            html += `<div class="hold-match" style="border: 2px solid var(--green); background: var(--surface1);">
                <div style="font-size:12px;color:var(--green);font-weight:600;margin-bottom:4px;">${escapeHtml(label)} — NU</div>
                <span class="opponent" style="font-size: 18px; font-weight: 700;">vs ${escapeHtml(oppName)}</span>
                <div class="score-inputs">
                    <input type="number" min="0" id="hold-sa-${m.id}" value="${myScore !== null ? myScore : ''}" placeholder="-">
                    <span class="score-sep">—</span>
                    <input type="number" min="0" id="hold-sb-${m.id}" value="${theirScore !== null ? theirScore : ''}" placeholder="-">
                </div>
                <button class="btn btn-sm btn-success"
                    onclick="window._holdSaveResult('${comp.id}','${m.id}',${isA})">Gem</button>
            </div>`;
        }

        // Next waiting match
        const waiting = myMatches.filter(m => m.status === 'waiting').sort((a, b) => a.queue_pos - b.queue_pos);
        if (waiting.length > 0) {
            const next = waiting[0];
            const isA = next.team_a_id === team.id;
            const oppName = teamName(evt.teams, isA ? next.team_b_id : next.team_a_id);
            const label = next.resource_label || '';
            html += `<div class="hold-match" style="opacity: 0.7; border-left: 3px solid var(--blue);">
                <span style="font-size:11px;color:var(--blue);font-weight:600;">Næste${label ? ' — ' + escapeHtml(label) : ''}</span>
                <span class="opponent">vs ${escapeHtml(oppName)}</span>
            </div>`;
        }

        // Played matches
        const played = myMatches.filter(m => m.status === 'played');
        for (const m of played) {
            const isA = m.team_a_id === team.id;
            const oppName = teamName(evt.teams, isA ? m.team_b_id : m.team_a_id);
            const myScore = isA ? m.score_a : m.score_b;
            const theirScore = isA ? m.score_b : m.score_a;
            html += `<div class="hold-match" style="opacity:0.5;">
                <span class="opponent">vs ${escapeHtml(oppName)}</span>
                <span style="font-size:13px;font-weight:600;">${myScore} — ${theirScore}</span>
                <span style="font-size:10px;color:var(--overlay);">Spillet ✓</span>
            </div>`;
        }
    }
    container.innerHTML = html || '<p class="muted">Ingen kampe</p>';
}

window._holdSaveResult = async function (compId, matchId, isTeamA) {
    let sa = parseInt(document.getElementById(`hold-sa-${matchId}`).value);
    let sb = parseInt(document.getElementById(`hold-sb-${matchId}`).value);
    if (isNaN(sa) || isNaN(sb) || sa < 0 || sb < 0) { showToast('Indtast begge scorer', true); return; }
    if (!isTeamA) [sa, sb] = [sb, sa];
    const eventId = document.body.dataset.eventId;
    const res = await fetch(`/api/event/${eventId}/result`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ comp_id: compId, match_id: matchId, score_a: sa, score_b: sb }) });
    const data = await res.json();
    if (data.success) { loadHoldPage(eventId); showToast('Resultat gemt!'); }
    else showToast(data.error, true);
};
