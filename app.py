# Partykonkurrence
# Selvstændigt web-værktøj til festlige konkurrence-events

import os
import re
from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import HTMLResponse, JSONResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

import data_store

app = FastAPI(title="Partykonkurrence")

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
app.mount("/static", StaticFiles(directory=os.path.join(BASE_DIR, "static")), name="static")
templates = Jinja2Templates(directory=os.path.join(BASE_DIR, "templates"))


def get_network_ip():
    import socket
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return "localhost"


# ==================== SIDER ====================

@app.get("/", response_class=HTMLResponse)
async def index(request: Request):
    events = data_store.get_all_events()
    return templates.TemplateResponse("index.html", {
        "request": request,
        "events": events,
    })


@app.get("/event/{event_id}", response_class=HTMLResponse)
async def event_admin_page(request: Request, event_id: str):
    event = data_store.get_event(event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event ikke fundet")
    return templates.TemplateResponse("event_admin.html", {
        "request": request,
        "event": event,
    })


@app.get("/event/{event_id}/hold/{code}", response_class=HTMLResponse)
async def event_hold_page(request: Request, event_id: str, code: str):
    event = data_store.get_event(event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event ikke fundet")
    team = data_store.get_team_by_code(event_id, code)
    if not team:
        raise HTTPException(status_code=404, detail="Hold ikke fundet")
    return templates.TemplateResponse("event_hold.html", {
        "request": request,
        "event": event,
        "team": team,
    })


@app.get("/event/{event_id}/skaerm", response_class=HTMLResponse)
async def event_screen_page(request: Request, event_id: str):
    event = data_store.get_event(event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event ikke fundet")
    return templates.TemplateResponse("event_skaerm.html", {
        "request": request,
        "event": event,
    })


@app.get("/event/{event_id}/resultat", response_class=HTMLResponse)
async def event_resultat_page(request: Request, event_id: str):
    event = data_store.get_event(event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event ikke fundet")
    return templates.TemplateResponse("event_resultat.html", {
        "request": request,
        "event": event,
    })


@app.get("/event/{event_id}/qr", response_class=HTMLResponse)
async def event_qr_page(request: Request, event_id: str):
    event = data_store.get_event(event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event ikke fundet")
    host = request.headers.get("host", "localhost:8002")
    scheme = request.url.scheme
    base_url = f"{scheme}://{host}"
    return templates.TemplateResponse("event_qr.html", {
        "request": request,
        "event": event,
        "base_url": base_url,
    })


# ==================== API ====================

@app.post("/api/event/create")
async def api_create_event(request: Request):
    data = await request.json()
    name = data.get("name", "").strip()
    if not name:
        return JSONResponse({"success": False, "error": "Navn er påkrævet"}, status_code=400)
    enable_finals = data.get("enable_finals", True)
    tiebreak_mode = data.get("tiebreak_mode", "all_comps")
    if tiebreak_mode not in ("always", "all_comps", "single"):
        tiebreak_mode = "all_comps"
    event = data_store.create_event(name, enable_finals, tiebreak_mode)
    return JSONResponse({"success": True, "event": event})


@app.post("/api/event/{event_id}/add-team")
async def api_add_team(request: Request, event_id: str):
    data = await request.json()
    name = data.get("name", "").strip()
    if not name:
        return JSONResponse({"success": False, "error": "Holdnavn er påkrævet"}, status_code=400)
    team = data_store.add_team_to_event(event_id, name)
    if not team:
        return JSONResponse({"success": False, "error": "Kunne ikke tilføje hold"}, status_code=400)
    return JSONResponse({"success": True, "team": team})


@app.post("/api/event/{event_id}/remove-team")
async def api_remove_team(request: Request, event_id: str):
    data = await request.json()
    if data_store.remove_team_from_event(event_id, data.get("team_id")):
        return JSONResponse({"success": True})
    return JSONResponse({"success": False, "error": "Kunne ikke fjerne hold"}, status_code=400)


@app.post("/api/event/{event_id}/add-competition")
async def api_add_competition(request: Request, event_id: str):
    data = await request.json()
    name = data.get("name", "").strip()
    comp_type = data.get("type", "round-robin")
    matches_per_team = data.get("matches_per_team")
    resources = data.get("resources", 1)
    if not name:
        return JSONResponse({"success": False, "error": "Navn er påkrævet"}, status_code=400)
    if comp_type not in ("round-robin", "points", "ranking"):
        return JSONResponse({"success": False, "error": "Ugyldig type"}, status_code=400)
    if matches_per_team is not None:
        try:
            matches_per_team = int(matches_per_team)
            if matches_per_team < 1:
                matches_per_team = None
        except (ValueError, TypeError):
            matches_per_team = None
    try:
        resources = max(1, int(resources))
    except (ValueError, TypeError):
        resources = 1
    lowest_wins = bool(data.get("lowest_wins", False))
    comp = data_store.add_competition_to_event(
        event_id, name, comp_type, matches_per_team, resources, lowest_wins)
    if not comp:
        return JSONResponse({"success": False, "error": "Kunne ikke tilføje konkurrence"}, status_code=400)
    return JSONResponse({"success": True, "competition": comp})


@app.post("/api/event/{event_id}/update-rules")
async def api_update_rules(request: Request, event_id: str):
    event = data_store.get_event(event_id)
    if not event:
        return JSONResponse({"success": False, "error": "Event ikke fundet"}, status_code=404)
    data = await request.json()
    comp_id = data.get("comp_id")
    rules = data.get("rules", "")
    for comp in event["competitions"]:
        if comp["id"] == comp_id:
            comp["rules"] = rules
            return JSONResponse({"success": True})
    return JSONResponse({"success": False, "error": "Konkurrence ikke fundet"}, status_code=404)


@app.post("/api/event/{event_id}/remove-competition")
async def api_remove_competition(request: Request, event_id: str):
    data = await request.json()
    if data_store.remove_competition_from_event(event_id, data.get("comp_id")):
        return JSONResponse({"success": True})
    return JSONResponse({"success": False, "error": "Kunne ikke fjerne konkurrence"}, status_code=400)


@app.post("/api/event/{event_id}/generate-teams")
async def api_generate_teams(request: Request, event_id: str):
    data = await request.json()
    participants = data.get("participants", [])
    num_teams = data.get("num_teams", 2)
    if not participants or len(participants) < 2:
        return JSONResponse({"success": False, "error": "Mindst 2 deltagere krævet"}, status_code=400)
    if num_teams < 2 or num_teams > len(participants):
        return JSONResponse({"success": False, "error": "Ugyldigt antal hold"}, status_code=400)
    if data_store.generate_teams_from_participants(event_id, participants, num_teams):
        event = data_store.get_event(event_id)
        return JSONResponse({"success": True, "teams": event["teams"]})
    return JSONResponse({"success": False, "error": "Kunne ikke generere hold"}, status_code=400)


@app.post("/api/event/{event_id}/start")
async def api_start_event(request: Request, event_id: str):
    if data_store.start_event(event_id):
        return JSONResponse({"success": True})
    return JSONResponse({"success": False, "error": "Mindst 2 hold og 1 konkurrence krævet"}, status_code=400)


@app.post("/api/event/{event_id}/result")
async def api_register_result(request: Request, event_id: str):
    data = await request.json()
    comp_id = data.get("comp_id")
    match_id = data.get("match_id")
    try:
        score_a = int(data.get("score_a"))
        score_b = int(data.get("score_b"))
    except (ValueError, TypeError):
        return JSONResponse({"success": False, "error": "Ugyldige scorer"}, status_code=400)
    if data_store.register_match_result(event_id, comp_id, match_id, score_a, score_b):
        return JSONResponse({"success": True})
    return JSONResponse({"success": False, "error": "Kunne ikke registrere resultat"}, status_code=400)


@app.post("/api/event/{event_id}/points")
async def api_set_points(request: Request, event_id: str):
    data = await request.json()
    try:
        points = int(data.get("points"))
    except (ValueError, TypeError):
        return JSONResponse({"success": False, "error": "Ugyldige point"}, status_code=400)
    if data_store.set_competition_points(event_id, data.get("comp_id"), data.get("team_id"), points):
        return JSONResponse({"success": True})
    return JSONResponse({"success": False, "error": "Kunne ikke sætte point"}, status_code=400)


@app.post("/api/event/{event_id}/ranking")
async def api_set_ranking(request: Request, event_id: str):
    data = await request.json()
    comp_id = data.get("comp_id")
    rankings = data.get("rankings", {})
    if not comp_id:
        return JSONResponse({"success": False, "error": "Mangler comp_id"}, status_code=400)
    # Tom rankings = nulstil, ellers konvertér til int
    if rankings:
        try:
            rankings = {tid: int(p) for tid, p in rankings.items()}
        except (ValueError, TypeError):
            return JSONResponse({"success": False, "error": "Ugyldige placeringer"}, status_code=400)
    if data_store.set_ranking(event_id, comp_id, rankings):
        return JSONResponse({"success": True})
    return JSONResponse({"success": False, "error": "Kunne ikke gemme rangering"}, status_code=400)


@app.get("/api/event/{event_id}/standings")
async def api_event_standings(request: Request, event_id: str):
    event = data_store.get_event(event_id)
    if not event:
        return JSONResponse({"success": False, "error": "Event ikke fundet"}, status_code=404)
    standings = data_store.calculate_standings(event_id)
    progress = data_store.get_competition_progress(event_id)
    group_complete = data_store.check_group_phase_complete(event_id)
    return JSONResponse({
        "success": True,
        "event": event,
        "standings": standings,
        "progress": progress,
        "group_complete": group_complete,
    })


@app.post("/api/event/{event_id}/postpone")
async def api_postpone_match(request: Request, event_id: str):
    data = await request.json()
    comp_id = data.get("comp_id")
    match_id = data.get("match_id")
    if data_store.postpone_match(event_id, comp_id, match_id):
        return JSONResponse({"success": True})
    return JSONResponse({"success": False, "error": "Kunne ikke udskyde kamp"}, status_code=400)


@app.post("/api/event/{event_id}/finish")
async def api_finish_event(request: Request, event_id: str):
    if data_store.finish_event(event_id):
        return JSONResponse({"success": True})
    return JSONResponse({"success": False, "error": "Kunne ikke afslutte"}, status_code=400)


@app.post("/api/event/{event_id}/reset")
async def api_reset_event(request: Request, event_id: str):
    if data_store.reset_event(event_id):
        return JSONResponse({"success": True})
    return JSONResponse({"success": False, "error": "Kunne ikke nulstille"}, status_code=400)


@app.post("/api/event/{event_id}/check-winners")
async def api_check_winners(request: Request, event_id: str):
    event = data_store.get_event(event_id)
    if not event or event["status"] != "active":
        return JSONResponse({"success": False, "error": "Event ikke aktivt"}, status_code=400)
    if not data_store.check_group_phase_complete(event_id):
        return JSONResponse({"success": False, "error": "Ikke alle gruppekampe er spillet"}, status_code=400)
    result = data_store.generate_tiebreak_matches(event_id)
    if result is None:
        return JSONResponse({"success": False, "error": "Fejl ved vinder-tjek"}, status_code=400)
    return JSONResponse({"success": True, **result})


@app.post("/api/event/{event_id}/tiebreak-result")
async def api_tiebreak_result(request: Request, event_id: str):
    data = await request.json()
    match_id = data.get("match_id")
    try:
        score_a = int(data.get("score_a"))
        score_b = int(data.get("score_b"))
    except (ValueError, TypeError):
        return JSONResponse({"success": False, "error": "Ugyldige scorer"}, status_code=400)
    ok, msg = data_store.register_tiebreak_result(event_id, match_id, score_a, score_b)
    if ok:
        event = data_store.get_event(event_id)
        return JSONResponse({"success": True, "phase": event["phase"], "winners": event["winners"]})
    return JSONResponse({"success": False, "error": msg}, status_code=400)


@app.post("/api/event/{event_id}/screen-message")
async def api_screen_message(request: Request, event_id: str):
    event = data_store.get_event(event_id)
    if not event:
        return JSONResponse({"success": False, "error": "Event ikke fundet"}, status_code=404)
    data = await request.json()
    event["screen_message"] = data.get("message", "").strip()
    return JSONResponse({"success": True})


@app.post("/api/event/{event_id}/update-settings")
async def api_update_settings(request: Request, event_id: str):
    event = data_store.get_event(event_id)
    if not event or event["status"] != "setup":
        return JSONResponse({"success": False, "error": "Kan kun ændres i opsætning"}, status_code=400)
    data = await request.json()
    if "enable_finals" in data:
        event["enable_finals"] = bool(data["enable_finals"])
    if "tiebreak_mode" in data:
        if data["tiebreak_mode"] in ("always", "all_comps", "single"):
            event["tiebreak_mode"] = data["tiebreak_mode"]
    return JSONResponse({"success": True})


@app.post("/api/event/{event_id}/toggle-festive")
async def api_toggle_festive(request: Request, event_id: str):
    event = data_store.get_event(event_id)
    if not event:
        return JSONResponse({"success": False, "error": "Event ikke fundet"}, status_code=404)
    data = await request.json()
    event["festive_mode"] = bool(data.get("festive_mode", True))
    return JSONResponse({"success": True, "festive_mode": event["festive_mode"]})


@app.post("/api/event/{event_id}/delete")
async def api_delete_event(request: Request, event_id: str):
    if data_store.delete_event(event_id):
        return JSONResponse({"success": True})
    return JSONResponse({"success": False, "error": "Kunne ikke slette"}, status_code=400)


# ==================== REGELOPSLAG ====================

@app.get("/api/lookup-rules")
async def api_lookup_rules(name: str = ""):
    name = name.strip()
    if not name or len(name) < 2:
        return JSONResponse({"success": False, "error": "Navn for kort"}, status_code=400)

    import urllib.request
    import json as json_lib
    from urllib.parse import quote

    def format_rules(title, text):
        lines = text.split(". ")
        rules = f"{title.upper()}\n"
        for line in lines[:8]:
            line = line.strip().rstrip(".")
            if line and len(line) > 10:
                rules += f"• {line}\n"
        return rules.strip()

    def wiki_fetch(lang, title):
        url = f"https://{lang}.wikipedia.org/w/api.php?action=query&titles={quote(title)}&prop=extracts&exintro=1&explaintext=1&format=json"
        req = urllib.request.Request(url, headers={"User-Agent": "Partykonkurrence/1.0"})
        resp = urllib.request.urlopen(req, timeout=5)
        data = json_lib.loads(resp.read().decode("utf-8"))
        pages = data.get("query", {}).get("pages", {})
        for pid, page in pages.items():
            if pid != "-1":
                return page.get("title", title), page.get("extract", "")
        return None, ""

    try:
        # Dansk Wikipedia
        title, extract = wiki_fetch("da", name)
        if extract and len(extract) > 30:
            return JSONResponse({"success": True, "rules": format_rules(title, extract)})

        # Engelsk Wikipedia
        title, extract = wiki_fetch("en", name)
        if extract and len(extract) > 30:
            return JSONResponse({"success": True, "rules": format_rules(title, extract)})

        # DuckDuckGo instant answer
        ddg_url = f"https://api.duckduckgo.com/?q={quote(name)}+regler&format=json&no_html=1"
        req = urllib.request.Request(ddg_url, headers={"User-Agent": "Partykonkurrence/1.0"})
        resp = urllib.request.urlopen(req, timeout=5)
        data = json_lib.loads(resp.read().decode("utf-8"))
        abstract = data.get("AbstractText", "")
        if abstract and len(abstract) > 30:
            return JSONResponse({"success": True, "rules": format_rules(name, abstract)})

    except Exception:
        pass

    return JSONResponse({"success": False, "error": f"Kunne ikke finde regler for '{name}'"})


# ==================== START ====================

if __name__ == "__main__":
    import uvicorn
    ip = get_network_ip()

    print("\n" + "=" * 50)
    print("  Partykonkurrence")
    print(f"  PC:     http://localhost:8002")
    print(f"  Mobil:  http://{ip}:8002")
    print("=" * 50 + "\n")

    uvicorn.run(app, host="0.0.0.0", port=8002)
