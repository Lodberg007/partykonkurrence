# Partykonkurrence — Konkurrence Pointsystem
# In-memory data store

import uuid
import string
import random
from datetime import datetime

EVENTS = {}


def _generate_team_code():
    """Generer en unik 6-tegn kode til QR-links."""
    chars = string.ascii_lowercase + string.digits
    while True:
        code = ''.join(random.choices(chars, k=6))
        for evt in EVENTS.values():
            if any(t["code"] == code for t in evt.get("teams", [])):
                continue
        return code


def create_event(name, enable_finals=True, tiebreak_mode="all_comps"):
    """Opret et event. Returnerer event-dict."""
    event_id = f"evt-{uuid.uuid4().hex[:8]}"
    event = {
        "id": event_id,
        "name": name,
        "teams": [],
        "competitions": [],
        "status": "setup",
        "created_at": datetime.now().isoformat(),
        "enable_finals": enable_finals,
        "tiebreak_mode": tiebreak_mode,  # "all_comps" or "single"
        "phase": "group",                # "group" → "tiebreak" → "finished"
        "winners": [],                   # [{"place": 1, "team_id": "...", "team_name": "..."}]
        "tiebreak_matches": [],          # auto-genererede tiebreak-kampe
        "screen_message": "",            # besked vist på storskærm (tom = ingen)
        "festive_mode": True,            # festlige effekter på storskærm
    }
    EVENTS[event_id] = event
    return event


def get_event(event_id):
    return EVENTS.get(event_id)


def get_all_events():
    return list(EVENTS.values())


def delete_event(event_id):
    return EVENTS.pop(event_id, None) is not None


def add_team_to_event(event_id, team_name):
    event = EVENTS.get(event_id)
    if not event or event["status"] != "setup":
        return None
    if any(t["name"] == team_name for t in event["teams"]):
        return None
    team = {
        "id": f"hold-{uuid.uuid4().hex[:8]}",
        "name": team_name,
        "code": _generate_team_code(),
        "players": [],
    }
    event["teams"].append(team)
    return team


def remove_team_from_event(event_id, team_id):
    event = EVENTS.get(event_id)
    if not event or event["status"] != "setup":
        return False
    event["teams"] = [t for t in event["teams"] if t["id"] != team_id]
    return True


def add_competition_to_event(event_id, name, comp_type="round-robin",
                              matches_per_team=None, resources=1,
                              lowest_wins=False):
    event = EVENTS.get(event_id)
    if not event or event["status"] != "setup":
        return None
    resources = max(1, resources)
    resource_labels = [f"Bane {i+1}" for i in range(resources)]
    comp = {
        "id": f"comp-{uuid.uuid4().hex[:8]}",
        "name": name,
        "type": comp_type,
        "matches_per_team": matches_per_team,
        "resources": resources,
        "resource_labels": resource_labels,
        "points_for_win": 3,
        "points_for_draw": 1,
        "lowest_wins": lowest_wins,  # True = laveste score vinder (fx Dart 501)
        "rules": "",                 # Regler-tekst vist til deltagerne
        "matches": [],
        "results": {},
    }
    event["competitions"].append(comp)
    return comp


def remove_competition_from_event(event_id, comp_id):
    event = EVENTS.get(event_id)
    if not event or event["status"] != "setup":
        return False
    event["competitions"] = [c for c in event["competitions"] if c["id"] != comp_id]
    return True


def _generate_all_pairs(teams):
    """Generer alle mulige par via circle-metoden, shufflet for variation."""
    if len(teams) < 2:
        return []

    team_ids = [t["id"] for t in teams]
    random.shuffle(team_ids)
    n = len(team_ids)

    if n % 2 != 0:
        team_ids.append("BYE")
        n += 1

    pairs = []
    for round_num in range(1, n):
        for i in range(n // 2):
            a = team_ids[i]
            b = team_ids[n - 1 - i]
            if a == "BYE" or b == "BYE":
                continue
            pairs.append((a, b))
        team_ids = [team_ids[0]] + [team_ids[-1]] + team_ids[1:-1]

    return pairs


def _generate_limited_matches(teams, matches_per_team=None):
    """Generer kampe. Hvis matches_per_team er sat, spiller hvert hold maks N kampe."""
    all_pairs = _generate_all_pairs(teams)

    if matches_per_team is None:
        return all_pairs

    games_count = {t["id"]: 0 for t in teams}
    selected = []

    for a, b in all_pairs:
        if games_count[a] < matches_per_team and games_count[b] < matches_per_team:
            selected.append((a, b))
            games_count[a] += 1
            games_count[b] += 1

    return selected


def _build_queue(pairs, resources, resource_labels):
    """Fordel kampe i en kø per bane/bord.
    Returnerer liste af match-dicts med queue_pos og resource_label.
    Sikrer at et hold ikke spiller to kampe samtidigt (på tværs af baner)."""
    # queues[i] = liste af (team_a, team_b) for bane i
    queues = [[] for _ in range(resources)]

    for a, b in pairs:
        # Find banen med færrest kampe, hvor holdene ikke er i den sidst
        # tilføjede kamp (undgå at et hold spiller back-to-back på anden bane)
        best_q = None
        best_len = float('inf')
        for qi in range(resources):
            q_len = len(queues[qi])
            if q_len < best_len:
                # Check at holdene ikke allerede er i en kamp på position q_len
                # i nogen anden kø (dvs. de ville spille samtidigt)
                conflict = False
                for oqi in range(resources):
                    if oqi == qi:
                        continue
                    if q_len < len(queues[oqi]):
                        om = queues[oqi][q_len]
                        if a in om or b in om:
                            conflict = True
                            break
                if not conflict:
                    best_q = qi
                    best_len = q_len
        if best_q is None:
            # Fallback: find den kø med kortest længde
            # og tilføj i næste ledige position
            best_q = min(range(resources), key=lambda i: len(queues[i]))
        queues[best_q].append((a, b))

    matches = []
    for qi, queue in enumerate(queues):
        label = resource_labels[qi] if qi < len(resource_labels) else f"Bord {qi+1}"
        for pos, (a, b) in enumerate(queue):
            status = "active" if pos == 0 else "waiting"
            matches.append({
                "id": f"match-{uuid.uuid4().hex[:8]}",
                "queue_pos": pos,
                "resource_label": label,
                "team_a_id": a,
                "team_b_id": b,
                "score_a": None,
                "score_b": None,
                "status": status,
            })
    return matches


def _get_busy_teams(event):
    """Returnér set af hold-id'er der aktuelt spiller en aktiv kamp i nogen konkurrence."""
    busy = set()
    for comp in event["competitions"]:
        if comp["type"] != "round-robin":
            continue
        for m in comp["matches"]:
            if m["status"] == "active":
                busy.add(m["team_a_id"])
                busy.add(m["team_b_id"])
    return busy


def _global_activate(event):
    """Aktivér ventende kampe på tværs af alle konkurrencer,
    men kun hvis ingen af holdene allerede spiller."""
    changed = True
    while changed:
        changed = False
        busy = _get_busy_teams(event)
        for comp in event["competitions"]:
            if comp["type"] != "round-robin":
                continue
            # Find baner der ikke har en aktiv kamp
            active_resources = set()
            for m in comp["matches"]:
                if m["status"] == "active":
                    active_resources.add(m["resource_label"])

            for label in comp.get("resource_labels", ["Bord 1"]):
                if label in active_resources:
                    continue  # denne bane har allerede en aktiv kamp
                # Find næste ventende kamp på denne bane
                waiting = [m for m in comp["matches"]
                           if m["resource_label"] == label
                           and m["status"] == "waiting"]
                if not waiting:
                    continue
                waiting.sort(key=lambda m: m["queue_pos"])
                for m in waiting:
                    if m["team_a_id"] not in busy and m["team_b_id"] not in busy:
                        m["status"] = "active"
                        busy.add(m["team_a_id"])
                        busy.add(m["team_b_id"])
                        changed = True
                        break


def start_event(event_id):
    event = EVENTS.get(event_id)
    if not event or event["status"] != "setup":
        return False
    if len(event["teams"]) < 2:
        return False
    if not event["competitions"]:
        return False

    for comp in event["competitions"]:
        if comp["type"] == "round-robin":
            pairs = _generate_limited_matches(
                event["teams"], comp.get("matches_per_team"))
            resources = comp.get("resources", 1)
            labels = comp.get("resource_labels", [f"Bord {i+1}" for i in range(resources)])
            # Byg kø men sæt ALLE til waiting først
            comp["matches"] = _build_queue(pairs, resources, labels)
            for m in comp["matches"]:
                m["status"] = "waiting"
        elif comp["type"] == "points":
            comp["results"] = {t["id"]: 0 for t in event["teams"]}

    event["status"] = "active"
    # Global aktivering — sikrer at et hold kun spiller én kamp ad gangen
    _global_activate(event)
    return True


def register_match_result(event_id, comp_id, match_id, score_a, score_b):
    event = EVENTS.get(event_id)
    if not event or event["status"] != "active":
        return False
    for comp in event["competitions"]:
        if comp["id"] == comp_id:
            for match in comp["matches"]:
                if match["id"] == match_id:
                    match["score_a"] = score_a
                    match["score_b"] = score_b
                    match["status"] = "played"
                    # Global aktivering — fordel nye kampe korrekt
                    _global_activate(event)
                    return True
    return False


def set_competition_points(event_id, comp_id, team_id, points):
    event = EVENTS.get(event_id)
    if not event or event["status"] != "active":
        return False
    for comp in event["competitions"]:
        if comp["id"] == comp_id and comp["type"] == "points":
            comp["results"][team_id] = points
            return True
    return False


def set_ranking(event_id, comp_id, rankings):
    """Sæt placeringer for en ranking-konkurrence.
    rankings: {team_id: place (int), ...}
    Tillader tom ranking (nulstil) eller kun én vinder.
    """
    event = EVENTS.get(event_id)
    if not event or event["status"] != "active":
        return False
    for comp in event["competitions"]:
        if comp["id"] == comp_id and comp["type"] == "ranking":
            # Tom ranking = nulstil
            if not rankings:
                comp["results"] = {}
                return True
            # Validér at placeringer er unikke
            places = list(rankings.values())
            if len(places) != len(set(places)):
                return False
            comp["results"] = {tid: int(p) for tid, p in rankings.items()}
            return True
    return False


def calculate_standings(event_id):
    event = EVENTS.get(event_id)
    if not event:
        return []

    standings = {}
    for team in event["teams"]:
        standings[team["id"]] = {
            "team_id": team["id"],
            "team_name": team["name"],
            "total_points": 0,
            "played": 0,
            "won": 0,
            "drawn": 0,
            "lost": 0,
            "goals_for": 0,
            "goals_against": 0,
            "goal_diff": 0,
            "competition_points": {},
        }

    for comp in event["competitions"]:
        if comp["type"] == "round-robin":
            for match in comp["matches"]:
                if match["status"] != "played":
                    continue
                a_id = match["team_a_id"]
                b_id = match["team_b_id"]
                sa = match["score_a"] or 0
                sb = match["score_b"] or 0

                if a_id in standings:
                    standings[a_id]["played"] += 1
                    standings[a_id]["goals_for"] += sa
                    standings[a_id]["goals_against"] += sb
                if b_id in standings:
                    standings[b_id]["played"] += 1
                    standings[b_id]["goals_for"] += sb
                    standings[b_id]["goals_against"] += sa

                # Laveste score vinder? (fx Dart 501)
                lowest = comp.get("lowest_wins", False)
                a_wins = (sa < sb) if lowest else (sa > sb)
                b_wins = (sa > sb) if lowest else (sa < sb)

                if a_wins:
                    pts_a, pts_b = comp["points_for_win"], 0
                    if a_id in standings: standings[a_id]["won"] += 1
                    if b_id in standings: standings[b_id]["lost"] += 1
                elif b_wins:
                    pts_a, pts_b = 0, comp["points_for_win"]
                    if a_id in standings: standings[a_id]["lost"] += 1
                    if b_id in standings: standings[b_id]["won"] += 1
                else:
                    pts_a = pts_b = comp["points_for_draw"]
                    if a_id in standings: standings[a_id]["drawn"] += 1
                    if b_id in standings: standings[b_id]["drawn"] += 1

                if a_id in standings:
                    standings[a_id]["total_points"] += pts_a
                    standings[a_id]["competition_points"][comp["id"]] = \
                        standings[a_id]["competition_points"].get(comp["id"], 0) + pts_a
                if b_id in standings:
                    standings[b_id]["total_points"] += pts_b
                    standings[b_id]["competition_points"][comp["id"]] = \
                        standings[b_id]["competition_points"].get(comp["id"], 0) + pts_b

        elif comp["type"] == "points":
            for team_id, pts in comp.get("results", {}).items():
                if team_id in standings:
                    standings[team_id]["total_points"] += pts
                    standings[team_id]["competition_points"][comp["id"]] = pts

        elif comp["type"] == "ranking":
            # Kun 1. plads får point (= points_for_win)
            win_pts = comp.get("points_for_win", 3)
            for team_id, place in comp.get("results", {}).items():
                if team_id in standings:
                    pts = win_pts if place == 1 else 0
                    standings[team_id]["total_points"] += pts
                    standings[team_id]["competition_points"][comp["id"]] = pts

    for s in standings.values():
        s["goal_diff"] = s["goals_for"] - s["goals_against"]

    return sorted(standings.values(),
                  key=lambda x: (x["total_points"], x["goal_diff"], x["goals_for"]),
                  reverse=True)


def finish_event(event_id):
    event = EVENTS.get(event_id)
    if not event or event["status"] != "active":
        return False
    event["status"] = "finished"
    return True


def reset_event(event_id):
    event = EVENTS.get(event_id)
    if not event:
        return False
    for comp in event["competitions"]:
        comp["matches"] = []
        comp["results"] = {}
    event["status"] = "setup"
    event["phase"] = "group"
    event["winners"] = []
    event["tiebreak_matches"] = []
    return True


def generate_teams_from_participants(event_id, participants, num_teams):
    event = EVENTS.get(event_id)
    if not event or event["status"] != "setup":
        return False
    if len(participants) < num_teams or num_teams < 2:
        return False

    shuffled = list(participants)
    random.shuffle(shuffled)

    event["teams"] = []
    for i in range(num_teams):
        team = {
            "id": f"hold-{uuid.uuid4().hex[:8]}",
            "name": f"Hold {i + 1}",
            "code": _generate_team_code(),
            "players": [],
        }
        event["teams"].append(team)

    for idx, name in enumerate(shuffled):
        event["teams"][idx % num_teams]["players"].append(name)

    return True


def postpone_match(event_id, comp_id, match_id):
    """Udskyd en kamp: flyt den bagerst i køen på samme bane,
    og aktivér næste ventende kamp."""
    event = EVENTS.get(event_id)
    if not event or event["status"] != "active":
        return False

    for comp in event["competitions"]:
        if comp["id"] != comp_id:
            continue
        for match in comp["matches"]:
            if match["id"] != match_id:
                continue
            if match["status"] == "played":
                return False

            resource = match["resource_label"]
            # Find max queue_pos på denne bane
            max_pos = max(
                (m["queue_pos"] for m in comp["matches"]
                 if m["resource_label"] == resource), default=0)
            match["queue_pos"] = max_pos + 1
            match["status"] = "waiting"

            # Global aktivering — fordel nye kampe korrekt
            _global_activate(event)
            return True
    return False


def get_competition_progress(event_id):
    """Returnerer fremskridt per konkurrence."""
    event = EVENTS.get(event_id)
    if not event:
        return {}
    progress = {}
    for comp in event["competitions"]:
        if comp["type"] == "round-robin":
            total = len(comp["matches"])
            done = sum(1 for m in comp["matches"] if m["status"] == "played")
            progress[comp["id"]] = {
                "total_matches": total,
                "completed_matches": done,
                "pct": round(done / total * 100) if total > 0 else 0,
            }
        elif comp["type"] == "points":
            # Points-konkurrencer er altid "100%" — admin sætter point manuelt
            has_any = any(v != 0 for v in comp.get("results", {}).values())
            progress[comp["id"]] = {
                "total_matches": 0,
                "completed_matches": 0,
                "pct": 100 if has_any else 0,
            }
    return progress


def check_group_phase_complete(event_id):
    """Returnerer True hvis alle gruppekampe er spillet."""
    event = EVENTS.get(event_id)
    if not event or event["status"] != "active":
        return False
    for comp in event["competitions"]:
        if comp["type"] == "round-robin":
            if any(m["status"] != "played" for m in comp["matches"]):
                return False
    return True


def detect_ties(event_id):
    """Find pointligheder i top 3 af samlet stilling."""
    standings = calculate_standings(event_id)
    if len(standings) < 2:
        return []

    # Check top 3 for ties
    ties = []
    top = standings[:max(3, len(standings))]

    i = 0
    while i < len(top) and i < 3:
        group = [top[i]]
        j = i + 1
        while j < len(top) and top[j]["total_points"] == top[i]["total_points"]:
            group.append(top[j])
            j += 1
        if len(group) > 1:
            places = list(range(i + 1, j + 1))
            ties.append({
                "places": places,
                "team_ids": [s["team_id"] for s in group],
                "team_names": [s["team_name"] for s in group],
            })
        i = j

    return ties


def generate_tiebreak_matches(event_id):
    """Generér tiebreak-kampe baseret på event-indstillinger."""
    event = EVENTS.get(event_id)
    if not event or event["status"] != "active":
        return None

    mode = event.get("tiebreak_mode", "all_comps")

    if not event.get("enable_finals", True):
        # Finals disabled — brug eksisterende sortering (goal_diff etc.)
        determine_winners(event_id)
        return {"phase": "finished", "ties": [], "winners": event["winners"]}

    # "always" mode: generer finale for top 2 (og evt. semifinale for top 3)
    if mode == "always":
        standings = calculate_standings(event_id)
        if len(standings) < 2:
            determine_winners(event_id)
            return {"phase": "finished", "ties": [], "winners": event["winners"]}

        tiebreak_matches = []
        top2 = standings[:2]
        # Finale mellem #1 og #2
        for comp in event["competitions"]:
            if comp["type"] == "round-robin":
                tiebreak_matches.append({
                    "id": f"tb-{uuid.uuid4().hex[:8]}",
                    "type": "final",
                    "label": f"Finale — {comp['name']}",
                    "comp_ref": comp["id"],
                    "team_a_id": top2[0]["team_id"],
                    "team_b_id": top2[1]["team_id"],
                    "score_a": None,
                    "score_b": None,
                    "status": "active",
                    "for_places": [1, 2],
                })

        if not tiebreak_matches:
            # Ingen round-robin konkurrencer — lav én generel finale
            tiebreak_matches.append({
                "id": f"tb-{uuid.uuid4().hex[:8]}",
                "type": "final",
                "label": "Finale",
                "comp_ref": None,
                "team_a_id": top2[0]["team_id"],
                "team_b_id": top2[1]["team_id"],
                "score_a": None,
                "score_b": None,
                "status": "active",
                "for_places": [1, 2],
            })

        event["tiebreak_matches"] = tiebreak_matches
        event["phase"] = "tiebreak"
        return {"phase": "tiebreak", "ties": [], "winners": []}

    ties = detect_ties(event_id)
    if not ties:
        # Ingen ties — bestem vindere direkte
        determine_winners(event_id)
        return {"phase": "finished", "ties": [], "winners": event["winners"]}

    # Generér tiebreak-kampe
    tiebreak_matches = []
    mode = event.get("tiebreak_mode", "all_comps")

    for tie in ties:
        team_ids = tie["team_ids"]

        if len(team_ids) == 2:
            # To hold er lige — direkte finale
            if mode == "all_comps":
                for comp in event["competitions"]:
                    if comp["type"] == "round-robin":
                        tiebreak_matches.append({
                            "id": f"tb-{uuid.uuid4().hex[:8]}",
                            "type": "final",
                            "label": f"Finale — {comp['name']}",
                            "comp_ref": comp["id"],
                            "team_a_id": team_ids[0],
                            "team_b_id": team_ids[1],
                            "score_a": None,
                            "score_b": None,
                            "status": "active",
                            "for_places": tie["places"],
                        })
            else:
                tiebreak_matches.append({
                    "id": f"tb-{uuid.uuid4().hex[:8]}",
                    "type": "final",
                    "label": "Finale",
                    "comp_ref": None,
                    "team_a_id": team_ids[0],
                    "team_b_id": team_ids[1],
                    "score_a": None,
                    "score_b": None,
                    "status": "active",
                    "for_places": tie["places"],
                })

        elif len(team_ids) >= 3:
            # 3+ hold er lige — semifinaler + finale
            # Brug goal_diff til at seede
            standings = calculate_standings(event_id)
            tied_standings = [s for s in standings if s["team_id"] in team_ids]
            # Allerede sorteret by total_points, goal_diff, goals_for
            seed1 = tied_standings[0]["team_id"]
            seed2 = tied_standings[1]["team_id"]
            seed3 = tied_standings[2]["team_id"]

            if mode == "all_comps":
                for comp in event["competitions"]:
                    if comp["type"] == "round-robin":
                        # Semi 1: seed1 vs seed3
                        tiebreak_matches.append({
                            "id": f"tb-{uuid.uuid4().hex[:8]}",
                            "type": "semi",
                            "label": f"Semifinale 1 — {comp['name']}",
                            "comp_ref": comp["id"],
                            "team_a_id": seed1,
                            "team_b_id": seed3,
                            "score_a": None,
                            "score_b": None,
                            "status": "active",
                            "for_places": tie["places"],
                        })
                        # Semi 2: seed2 vs seed3 (taberen af semi1 spiller om 3.)
                        # Vi genererer finalen dynamisk når semi er afgjort
            else:
                tiebreak_matches.append({
                    "id": f"tb-{uuid.uuid4().hex[:8]}",
                    "type": "semi",
                    "label": "Semifinale 1",
                    "comp_ref": None,
                    "team_a_id": seed1,
                    "team_b_id": seed3,
                    "score_a": None,
                    "score_b": None,
                    "status": "active",
                    "for_places": tie["places"],
                })

    event["tiebreak_matches"] = tiebreak_matches
    event["phase"] = "tiebreak"
    return {"phase": "tiebreak", "ties": ties, "winners": []}


def register_tiebreak_result(event_id, match_id, score_a, score_b):
    """Registrér resultat for tiebreak-kamp. Uafgjort ikke tilladt."""
    event = EVENTS.get(event_id)
    if not event or event["phase"] != "tiebreak":
        return False, "Ikke i tiebreak-fase"
    if score_a == score_b:
        return False, "Uafgjort ikke tilladt i tiebreak"

    match = None
    for m in event["tiebreak_matches"]:
        if m["id"] == match_id:
            match = m
            break
    if not match:
        return False, "Kamp ikke fundet"

    match["score_a"] = score_a
    match["score_b"] = score_b
    match["status"] = "played"

    # Hvis det var en semifinale, generér finale + bronzekamp
    if match["type"] == "semi":
        winner_id = match["team_a_id"] if score_a > score_b else match["team_b_id"]
        loser_id = match["team_b_id"] if score_a > score_b else match["team_a_id"]

        # Find den tredje hold (seed2 der ikke spillede semi)
        places = match["for_places"]
        all_tied = set()
        for tb in event["tiebreak_matches"]:
            if tb["for_places"] == places:
                all_tied.add(tb["team_a_id"])
                all_tied.add(tb["team_b_id"])
        # Find hold der endnu ikke har spillet finale
        other_teams = all_tied - {match["team_a_id"], match["team_b_id"]}

        if other_teams:
            other_id = list(other_teams)[0]
            mode = event.get("tiebreak_mode", "all_comps")

            # Check om der allerede er genereret finaler for disse places
            existing_finals = [m for m in event["tiebreak_matches"]
                               if m["type"] == "final" and m["for_places"] == places]
            if not existing_finals:
                if mode == "all_comps":
                    for comp in event["competitions"]:
                        if comp["type"] == "round-robin":
                            # Finale: semi-vinder vs seed2
                            event["tiebreak_matches"].append({
                                "id": f"tb-{uuid.uuid4().hex[:8]}",
                                "type": "final",
                                "label": f"Finale — {comp['name']}",
                                "comp_ref": comp["id"],
                                "team_a_id": winner_id,
                                "team_b_id": other_id,
                                "score_a": None,
                                "score_b": None,
                                "status": "active",
                                "for_places": places,
                            })
                            # Bronzekamp: semi-taber vs seed2-taber (men her har seed2 ikke spillet)
                            # Bronzen er semi-taberen (3. plads)
                else:
                    event["tiebreak_matches"].append({
                        "id": f"tb-{uuid.uuid4().hex[:8]}",
                        "type": "final",
                        "label": "Finale",
                        "comp_ref": None,
                        "team_a_id": winner_id,
                        "team_b_id": other_id,
                        "score_a": None,
                        "score_b": None,
                        "status": "active",
                        "for_places": places,
                    })

                # Semi-taberen er automatisk 3. plads
                # (gemmes når finalen er afgjort)

    # Check om alle tiebreak-kampe er spillet
    all_played = all(m["status"] == "played" for m in event["tiebreak_matches"])
    if all_played:
        determine_winners(event_id)

    return True, "OK"


def determine_winners(event_id):
    """Bestem vindere baseret på stilling + tiebreak-resultater."""
    event = EVENTS.get(event_id)
    if not event:
        return False

    standings = calculate_standings(event_id)
    if not standings:
        return False

    winners = []

    # Hvis der er tiebreak-kampe, brug dem til at afgøre placeringer
    if event.get("tiebreak_matches"):
        # Start med standings-rækkefølgen
        placement = list(standings)

        # Find finale-kampe og justér rækkefølge
        finals = [m for m in event["tiebreak_matches"] if m["type"] == "final" and m["status"] == "played"]
        semis = [m for m in event["tiebreak_matches"] if m["type"] == "semi" and m["status"] == "played"]

        # Saml resultater: for hvert hold, tæl wins i tiebreak
        tb_wins = {}
        for m in finals:
            w = m["team_a_id"] if m["score_a"] > m["score_b"] else m["team_b_id"]
            l = m["team_b_id"] if m["score_a"] > m["score_b"] else m["team_a_id"]
            tb_wins[w] = tb_wins.get(w, 0) + 1
            tb_wins.setdefault(l, 0)

        semi_losers = set()
        for m in semis:
            loser = m["team_b_id"] if m["score_a"] > m["score_b"] else m["team_a_id"]
            semi_losers.add(loser)

        # Sortér tied teams baseret på tiebreak wins
        tied_team_ids = set()
        for m in event["tiebreak_matches"]:
            tied_team_ids.add(m["team_a_id"])
            tied_team_ids.add(m["team_b_id"])

        # Find den originale placering af de tied teams
        tied_positions = []
        for i, s in enumerate(placement):
            if s["team_id"] in tied_team_ids:
                tied_positions.append(i)

        # Sortér tied teams: mest tiebreak wins → finalist (ikke semi-taber) → standings
        tied_entries = [placement[i] for i in tied_positions]
        tied_entries.sort(key=lambda s: (
            tb_wins.get(s["team_id"], 0),
            0 if s["team_id"] in semi_losers else 1,
            s["total_points"],
            s["goal_diff"],
            s["goals_for"],
        ), reverse=True)

        for idx, pos in enumerate(tied_positions):
            placement[pos] = tied_entries[idx]

        for i, s in enumerate(placement[:3]):
            team = next((t for t in event["teams"] if t["id"] == s["team_id"]), None)
            winners.append({
                "place": i + 1,
                "team_id": s["team_id"],
                "team_name": team["name"] if team else s["team_name"],
            })
    else:
        # Ingen tiebreak — brug standings direkte
        for i, s in enumerate(standings[:3]):
            team = next((t for t in event["teams"] if t["id"] == s["team_id"]), None)
            winners.append({
                "place": i + 1,
                "team_id": s["team_id"],
                "team_name": team["name"] if team else s["team_name"],
            })

    event["winners"] = winners
    event["phase"] = "finished"
    return True


def get_team_by_code(event_id, code):
    event = EVENTS.get(event_id)
    if not event:
        return None
    for team in event["teams"]:
        if team["code"] == code:
            return team
    return None
