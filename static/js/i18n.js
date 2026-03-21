// i18n — Dansk/English sprogunderstøttelse
// Standard: dansk (da)

const TRANSLATIONS = {
    da: {
        // === Generelt ===
        events: 'Events',
        create_manage: 'Opret og styr konkurrencer til festlige begivenheder',
        create_new_event: 'Opret nyt event',
        event_name_placeholder: 'Eventnavn (fx Julecup 2026)...',
        create: 'Opret',
        play_finals_on_tie: 'Spil finale ved pointlighed',
        format: 'Format:',
        tiebreak_always: 'Altid (top 2/3 spiller finale)',
        tiebreak_all_comps: 'Kun ved pointlighed — alle discipliner',
        tiebreak_single: 'Kun ved pointlighed — én kamp',
        no_events: 'Ingen events oprettet endnu',
        write_event_name: 'Skriv et eventnavn først',
        create_error: 'Fejl ved oprettelse',

        // === Status ===
        status_setup: 'Opsætning',
        status_active: 'I gang',
        status_finished: 'Afsluttet',
        teams_word: 'hold',
        competitions_word: 'konkurrencer',

        // === Admin knapper ===
        start_event: 'Start event',
        show_big_screen: 'Vis på storskærm',
        enter_results: 'Indskriv resultater',
        qr_codes: 'QR-koder',
        finish_event: 'Afslut event',
        reset_event: 'Nulstil event',
        delete_event: 'Slet event',

        // === Hold ===
        teams: 'Hold',
        team_name_placeholder: 'Holdnavn...',
        add: 'Tilføj',
        remove: 'Fjern',
        no_teams_yet: 'Ingen hold tilføjet endnu',
        generate_from_list: 'Eller: Generer hold fra deltagerliste',
        participant_names_placeholder: 'Skriv deltagernavne — ét per linje',
        num_teams: 'Antal hold:',
        generate_teams: 'Generer hold',
        participants: 'deltagere',
        confirm_generate: 'Fordel {0} deltagere på {1} hold?',
        teams_created: '{0} hold oprettet',
        team_added: '{0} tilføjet',
        team_removed: 'Hold fjernet',
        enter_participant_names: 'Indtast deltagernavne',
        only_n_participants: 'Kun {0} deltagere',
        remove_team_confirm: 'Fjern dette hold?',

        // === Storskærm-besked ===
        screen_message: 'Storskærm-besked',
        screen_msg_placeholder: 'Fx: Aftensmad, Pause, Velkommen...',
        show: 'Vis',
        clear: 'Fjern',
        showing_now: 'Vises nu: "{0}"',
        msg_shown: 'Besked vises på storskærm',
        msg_cleared: 'Besked fjernet',
        write_msg_first: 'Skriv en besked først',

        // === Festlig mode ===
        screen_effects: 'Storskærm-effekter',
        festive_effects: 'Festlige effekter (balloner, raketter, konfetti, bannere)',
        festive_enabled: 'Festlige effekter aktiveret',
        festive_disabled: 'Festlige effekter deaktiveret',

        // === Finale-indstillinger ===
        finals_settings: 'Finale-indstillinger',
        play_finals: 'Spil finale/semifinale',
        when: 'Hvornår:',
        only_changeable_setup: 'Kan kun ændres i opsætning',

        // === Konkurrencer ===
        competitions: 'Konkurrencer',
        comp_name_placeholder: 'Konkurrencenavn...',
        type_round_robin: 'Alle mod alle',
        type_ranking: 'Rangering/placering',
        type_points: 'Fri pointgivning',
        matches_per_team_placeholder: 'Kampe/hold (tom=alle)',
        num_courts: 'Antal baner',
        lowest_wins: 'Laveste score vinder (fx Dart 501)',
        no_comps_yet: 'Ingen konkurrencer tilføjet endnu',
        rules: 'Regler',
        add_rules: 'Tilføj regler',
        write_rules_placeholder: 'Skriv regler her...',
        save_rules: 'Gem regler',
        fetch_default_rules: 'Hent standardregler',
        rules_saved: 'Regler gemt!',
        default_rules_inserted: 'Standardregler indsat — rediger efter behov',
        searching_rules: 'Søger efter regler for "{0}"...',
        rules_found_online: 'Regler fundet online — rediger efter behov',
        no_rules_found: 'Ingen regler fundet for "{0}"',
        rules_search_error: 'Fejl ved søgning efter regler',
        comp_added: '{0} tilføjet',
        comp_added_with_rules: '{0} tilføjet med standardregler',
        comp_removed: 'Konkurrence fjernet',
        remove_comp_confirm: 'Fjern denne konkurrence?',
        type_label_ranking: 'Rangering',
        type_label_points: 'Pointgivning',
        full: 'fuld',
        matches_per_team: '{0} kampe/hold',
        court: 'bane',
        courts: 'baner',
        lowest_wins_label: 'laveste vinder',

        // === Stilling ===
        standings: 'Samlet stilling',
        start_to_see_standings: 'Start eventet for at se stilling',
        th_rank: '#',
        th_team: 'Hold',
        th_played: 'K',
        th_won: 'V',
        th_drawn: 'U',
        th_lost: 'T',
        th_gf: 'MF',
        th_ga: 'MM',
        th_gd: '+/-',
        th_points: 'Point',

        // === Kampe ===
        matches_results: 'Kampe & Resultater',
        start_to_see_matches: 'Start eventet for at se kampprogram',
        playing_now: 'Spilles nu',
        in_queue: 'I kø',
        finished_matches: 'Afsluttet',
        matches_played: '{0}/{1} kampe spillet',
        all_matches_played: 'Alle kampe spillet!',
        save: 'Gem',
        postpone: 'Udskyd',
        postpone_confirm: 'Udskyd denne kamp til senere?',
        result_saved: 'Resultat gemt — næste kamp startet',
        match_postponed: 'Kamp udskudt — næste kamp startet',
        enter_both_scores: 'Indtast begge scorer',
        invalid_points: 'Ugyldigt pointtal',
        points_saved: 'Point gemt',
        ranking_saved: 'Rangering gemt!',
        choose_at_least_one: 'Vælg mindst én placering',
        each_place_once: 'Hver placering må kun bruges én gang',
        save_ranking: 'Gem rangering',
        ranking_label: 'Rangering — kun 1. plads får 3 point',
        points_label: 'Pointgivning',

        // === Vindere / Tiebreak ===
        winners: 'Vindere',
        place: '{0}. plads',
        find_winner: 'Find vinder',
        all_group_matches_done: 'Alle gruppekampe er spillet!',
        winners_found: 'Vindere fundet!',
        tiebreak_created: 'Pointlighed! Tiebreak-kampe oprettet.',
        tiebreak_finals: 'Tiebreak — Finale',
        tiebreak_result_saved: 'Tiebreak-resultat gemt',
        no_draw_tiebreak: 'Uafgjort ikke tilladt i tiebreak!',

        // === Event handlinger ===
        start_event_confirm: 'Start eventet? Hold kan ikke ændres bagefter.',
        finish_event_confirm: 'Afslut eventet?',
        reset_confirm: 'Nulstil? Alle resultater slettes.',
        delete_confirm: 'Slet eventet permanent?',
        loading_error: 'Fejl ved indlæsning',
        network_error: 'Netværksfejl',

        // === Resultat-side ===
        resultat_loading: 'Indlæser...',
        resultat_not_started: 'Eventet er ikke startet endnu',
        resultat_next: 'Næste',
        resultat_last: 'Sidst',
        resultat_no_draw: 'Uafgjort ikke tilladt',
        resultat_no_comps: 'Ingen konkurrencer',
        resultat_save: 'Gem',
        resultat_postpone: 'Udskyd',
        resultat_postpone_confirm: 'Udskyd denne kamp?',
        resultat_played: '{0} af {1} kampe spillet ({2}%)',
        resultat_new_leader: 'Ny førerposition: {0}!',
        resultat_latest: 'Seneste',
        resultat_ranking_1st: 'Rangering — 1. plads = 3p',
        resultat_save_ranking: 'Gem rangering',
        hosted_by: 'Hosted by Lejpartytelt.dk',

        // === Hold-side ===
        hold_won: 'Vundet',
        hold_draw: 'Uafgjort',
        hold_lost: 'Tabt',
        hold_points: 'Point',
        hold_no_matches: 'Ingen kampe endnu',
        hold_playing_now: 'Spilles nu',
        hold_upcoming: 'Kommende kampe',
        hold_finished: 'Afsluttede kampe',
        hold_now: 'Nu',
        hold_next: 'Næste',
        hold_waiting: 'Venter',
        hold_played: 'Spillet',
        hold_won_tag: 'Vundet',
        hold_draw_tag: 'Uafgjort',
        hold_lost_tag: 'Tabt',
        hold_save_result: 'Gem resultat',
        hold_result_saved: 'Resultat gemt!',
        hold_tournament: 'Turnering: {0} af {1} kampe ({2}%)',
        hold_eta: 'Ca. {0} min',
        hold_eta_soon: 'snart!',
        hold_ranking: 'Rangering',
        hold_not_ranked: 'Ikke rangeret endnu',
        hold_place_points: '{0}. plads — 3 point!',
        hold_see_standings: 'Se samlet stilling og storskærm',
        hold_enter_scores: 'Indtast begge scorer',

        // === Storskærm ===
        screen_subtitle: '{0} hold — {1} konkurrencer',
        screen_previous: 'Forrige',
        screen_now: 'Spilles nu',
        screen_next: 'Næste op',
        screen_empty_prev: 'Ingen endnu',
        screen_empty_now: 'Ingen aktive kampe',
        screen_empty_next: 'Ingen ventende',
        screen_pos: 'Pladsskift!',
        screen_on_fire: 'is on fire!',
        screen_now_place: 'De er nu på {0}. pladsen',
        screen_finale: 'FINALE',

        // === QR-side ===
        qr_title: 'QR-koder',
        qr_subtitle: 'QR-koder til holdene — scan for at indskrive resultater',
        qr_print: 'Print QR-koder',
        qr_back: 'Tilbage',
        qr_no_teams: 'Ingen hold tilføjet endnu',
        qr_load_error: 'Kunne ikke indlæse QR-bibliotek. Tjek internetforbindelsen.',

        // === Sprog ===
        language: 'Sprog',
    },

    en: {
        // === General ===
        events: 'Events',
        create_manage: 'Create and manage competitions for festive events',
        create_new_event: 'Create new event',
        event_name_placeholder: 'Event name (e.g. Christmas Cup 2026)...',
        create: 'Create',
        play_finals_on_tie: 'Play finals on tie',
        format: 'Format:',
        tiebreak_always: 'Always (top 2/3 play finals)',
        tiebreak_all_comps: 'Only on tie — all disciplines',
        tiebreak_single: 'Only on tie — single match',
        no_events: 'No events created yet',
        write_event_name: 'Enter an event name first',
        create_error: 'Error creating event',

        // === Status ===
        status_setup: 'Setup',
        status_active: 'Active',
        status_finished: 'Finished',
        teams_word: 'teams',
        competitions_word: 'competitions',

        // === Admin buttons ===
        start_event: 'Start event',
        show_big_screen: 'Show on big screen',
        enter_results: 'Enter results',
        qr_codes: 'QR codes',
        finish_event: 'Finish event',
        reset_event: 'Reset event',
        delete_event: 'Delete event',

        // === Teams ===
        teams: 'Teams',
        team_name_placeholder: 'Team name...',
        add: 'Add',
        remove: 'Remove',
        no_teams_yet: 'No teams added yet',
        generate_from_list: 'Or: Generate teams from participant list',
        participant_names_placeholder: 'Enter participant names — one per line',
        num_teams: 'Number of teams:',
        generate_teams: 'Generate teams',
        participants: 'participants',
        confirm_generate: 'Distribute {0} participants across {1} teams?',
        teams_created: '{0} teams created',
        team_added: '{0} added',
        team_removed: 'Team removed',
        enter_participant_names: 'Enter participant names',
        only_n_participants: 'Only {0} participants',
        remove_team_confirm: 'Remove this team?',

        // === Screen message ===
        screen_message: 'Big screen message',
        screen_msg_placeholder: 'E.g.: Dinner, Break, Welcome...',
        show: 'Show',
        clear: 'Clear',
        showing_now: 'Showing now: "{0}"',
        msg_shown: 'Message shown on big screen',
        msg_cleared: 'Message cleared',
        write_msg_first: 'Write a message first',

        // === Festive mode ===
        screen_effects: 'Big screen effects',
        festive_effects: 'Festive effects (balloons, rockets, confetti, banners)',
        festive_enabled: 'Festive effects enabled',
        festive_disabled: 'Festive effects disabled',

        // === Finals settings ===
        finals_settings: 'Finals settings',
        play_finals: 'Play finals/semifinals',
        when: 'When:',
        only_changeable_setup: 'Can only be changed during setup',

        // === Competitions ===
        competitions: 'Competitions',
        comp_name_placeholder: 'Competition name...',
        type_round_robin: 'Round robin',
        type_ranking: 'Ranking/placement',
        type_points: 'Free points',
        matches_per_team_placeholder: 'Matches/team (empty=all)',
        num_courts: 'Number of courts',
        lowest_wins: 'Lowest score wins (e.g. Dart 501)',
        no_comps_yet: 'No competitions added yet',
        rules: 'Rules',
        add_rules: 'Add rules',
        write_rules_placeholder: 'Write rules here...',
        save_rules: 'Save rules',
        fetch_default_rules: 'Fetch default rules',
        rules_saved: 'Rules saved!',
        default_rules_inserted: 'Default rules inserted — edit as needed',
        searching_rules: 'Searching for rules for "{0}"...',
        rules_found_online: 'Rules found online — edit as needed',
        no_rules_found: 'No rules found for "{0}"',
        rules_search_error: 'Error searching for rules',
        comp_added: '{0} added',
        comp_added_with_rules: '{0} added with default rules',
        comp_removed: 'Competition removed',
        remove_comp_confirm: 'Remove this competition?',
        type_label_ranking: 'Ranking',
        type_label_points: 'Points',
        full: 'full',
        matches_per_team: '{0} matches/team',
        court: 'court',
        courts: 'courts',
        lowest_wins_label: 'lowest wins',

        // === Standings ===
        standings: 'Overall standings',
        start_to_see_standings: 'Start the event to see standings',
        th_rank: '#',
        th_team: 'Team',
        th_played: 'P',
        th_won: 'W',
        th_drawn: 'D',
        th_lost: 'L',
        th_gf: 'GF',
        th_ga: 'GA',
        th_gd: '+/-',
        th_points: 'Points',

        // === Matches ===
        matches_results: 'Matches & Results',
        start_to_see_matches: 'Start the event to see match schedule',
        playing_now: 'Playing now',
        in_queue: 'In queue',
        finished_matches: 'Finished',
        matches_played: '{0}/{1} matches played',
        all_matches_played: 'All matches played!',
        save: 'Save',
        postpone: 'Postpone',
        postpone_confirm: 'Postpone this match?',
        result_saved: 'Result saved — next match started',
        match_postponed: 'Match postponed — next match started',
        enter_both_scores: 'Enter both scores',
        invalid_points: 'Invalid point value',
        points_saved: 'Points saved',
        ranking_saved: 'Ranking saved!',
        choose_at_least_one: 'Choose at least one placement',
        each_place_once: 'Each placement can only be used once',
        save_ranking: 'Save ranking',
        ranking_label: 'Ranking — 1st place gets 3 points',
        points_label: 'Points',

        // === Winners / Tiebreak ===
        winners: 'Winners',
        place: '{0} place',
        find_winner: 'Find winner',
        all_group_matches_done: 'All group matches are played!',
        winners_found: 'Winners found!',
        tiebreak_created: 'Tie! Tiebreak matches created.',
        tiebreak_finals: 'Tiebreak — Finals',
        tiebreak_result_saved: 'Tiebreak result saved',
        no_draw_tiebreak: 'Draw not allowed in tiebreak!',

        // === Event actions ===
        start_event_confirm: 'Start the event? Teams cannot be changed afterwards.',
        finish_event_confirm: 'Finish the event?',
        reset_confirm: 'Reset? All results will be deleted.',
        delete_confirm: 'Delete the event permanently?',
        loading_error: 'Error loading',
        network_error: 'Network error',

        // === Result page ===
        resultat_loading: 'Loading...',
        resultat_not_started: 'The event has not started yet',
        resultat_next: 'Next',
        resultat_last: 'Last',
        resultat_no_draw: 'Draw not allowed',
        resultat_no_comps: 'No competitions',
        resultat_save: 'Save',
        resultat_postpone: 'Postpone',
        resultat_postpone_confirm: 'Postpone this match?',
        resultat_played: '{0} of {1} matches played ({2}%)',
        resultat_new_leader: 'New leader: {0}!',
        resultat_latest: 'Latest',
        resultat_ranking_1st: 'Ranking — 1st place = 3p',
        resultat_save_ranking: 'Save ranking',
        hosted_by: 'Hosted by Lejpartytelt.dk',

        // === Team page ===
        hold_won: 'Won',
        hold_draw: 'Drawn',
        hold_lost: 'Lost',
        hold_points: 'Points',
        hold_no_matches: 'No matches yet',
        hold_playing_now: 'Playing now',
        hold_upcoming: 'Upcoming matches',
        hold_finished: 'Finished matches',
        hold_now: 'Now',
        hold_next: 'Next',
        hold_waiting: 'Waiting',
        hold_played: 'Played',
        hold_won_tag: 'Won',
        hold_draw_tag: 'Draw',
        hold_lost_tag: 'Lost',
        hold_save_result: 'Save result',
        hold_result_saved: 'Result saved!',
        hold_tournament: 'Tournament: {0} of {1} matches ({2}%)',
        hold_eta: 'Approx. {0} min',
        hold_eta_soon: 'soon!',
        hold_ranking: 'Ranking',
        hold_not_ranked: 'Not ranked yet',
        hold_place_points: '{0} place — 3 points!',
        hold_see_standings: 'See overall standings and big screen',
        hold_enter_scores: 'Enter both scores',

        // === Big screen ===
        screen_subtitle: '{0} teams — {1} competitions',
        screen_previous: 'Previous',
        screen_now: 'Playing now',
        screen_next: 'Up next',
        screen_empty_prev: 'None yet',
        screen_empty_now: 'No active matches',
        screen_empty_next: 'None waiting',
        screen_pos: 'Position change!',
        screen_on_fire: 'is on fire!',
        screen_now_place: 'Now in {0} place',
        screen_finale: 'FINALS',

        // === QR page ===
        qr_title: 'QR codes',
        qr_subtitle: 'QR codes for teams — scan to enter results',
        qr_print: 'Print QR codes',
        qr_back: 'Back',
        qr_no_teams: 'No teams added yet',
        qr_load_error: 'Could not load QR library. Check internet connection.',

        // === Language ===
        language: 'Language',
    }
};

// Hent gemt sprog eller default til dansk
function getLang() {
    return localStorage.getItem('party_lang') || 'da';
}

function setLang(lang) {
    localStorage.setItem('party_lang', lang);
    location.reload();
}

// Oversættelsesfunktion med {0}, {1} placeholder-support
function t(key, ...args) {
    const lang = getLang();
    let str = (TRANSLATIONS[lang] && TRANSLATIONS[lang][key]) || TRANSLATIONS.da[key] || key;
    args.forEach((arg, i) => {
        str = str.replace(`{${i}}`, arg);
    });
    return str;
}

// Anvend oversættelser på elementer med data-i18n attribut
function applyI18n() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        const translated = t(key);
        if (el.tagName === 'INPUT' && el.type !== 'checkbox') {
            if (el.placeholder) el.placeholder = translated;
        } else if (el.tagName === 'OPTION') {
            el.textContent = translated;
        } else {
            el.textContent = translated;
        }
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        el.placeholder = t(el.getAttribute('data-i18n-placeholder'));
    });
    // Opdater html lang
    document.documentElement.lang = getLang() === 'en' ? 'en' : 'da';
}

// Opret sprogvælger-widget
function createLangSwitcher() {
    const current = getLang();
    const switcher = document.createElement('div');
    switcher.className = 'lang-switcher';
    switcher.innerHTML = `
        <button class="lang-btn ${current === 'da' ? 'active' : ''}" onclick="setLang('da')" title="Dansk">DA</button>
        <button class="lang-btn ${current === 'en' ? 'active' : ''}" onclick="setLang('en')" title="English">EN</button>
    `;
    return switcher;
}

// Auto-init
document.addEventListener('DOMContentLoaded', () => {
    applyI18n();
});
