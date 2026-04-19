import random
import uuid
from datetime import datetime, timedelta, timezone

random.seed(42)
out = []

def sql(s): out.append(s)
def nl(): out.append("")

def insert(table, cols, rows):
    col_str = ", ".join(cols)
    val_strs = []
    for row in rows:
        parts = []
        for v in row:
            if v is None:
                parts.append("NULL")
            elif isinstance(v, bool):
                parts.append("TRUE" if v else "FALSE")
            elif isinstance(v, int):
                parts.append(str(v))
            elif isinstance(v, float):
                parts.append(str(v))
            else:
                escaped = str(v).replace("'", "''")
                parts.append(f"'{escaped}'")
        val_strs.append("    (" + ", ".join(parts) + ")")
    sql(f"INSERT INTO {table} ({col_str}) VALUES")
    sql(",\n".join(val_strs) + ";")
    nl()

sql("SET search_path TO houseleek;")
sql("TRUNCATE TABLE action_log, automation_trigger, smart_action, automation, scene, smart_workflow, item_state, item, action_definition, item_property, item_model, unit, room, abstract_user, unit_type, room_type, item_category RESTART IDENTITY CASCADE;")
nl()

# ─────────────────────────────────────────────
# LOOKUP TABLES
# ─────────────────────────────────────────────

unit_types   = ['Apartment', 'House', 'Office', 'Studio', 'Villa']
room_types   = ['Living Room', 'Bedroom', 'Kitchen', 'Bathroom', 'Garage', 'Office Room', 'Hallway', 'Basement']
item_cats    = ['Lighting', 'Climate Control', 'Security', 'Entertainment', 'Appliances']

insert("unit_type",    ["name"], [[x] for x in unit_types])
insert("room_type",    ["name"], [[x] for x in room_types])
insert("item_category",["name"], [[x] for x in item_cats])

# IDs (1-based, GENERATED ALWAYS AS IDENTITY)
ut_id  = {name: i+1 for i, name in enumerate(unit_types)}
rt_id  = {name: i+1 for i, name in enumerate(room_types)}
cat_id = {name: i+1 for i, name in enumerate(item_cats)}

# ─────────────────────────────────────────────
# ABSTRACT USERS: 1-2 admins, 3 vendors, 20 users
# ─────────────────────────────────────────────

admin_data = [
    ("admin.john@houseleek.io",     "hashed_admin_001", "John",   "Doe"),
    ("admin.sara@houseleek.io",     "hashed_admin_002", "Sara",   "Mitchell"),
]
vendor_data = [
    ("vendor.philips@lighting.com", "hashed_vendor_001", "Philips Smart", "PhilipsHue"),
    ("vendor.nest@climate.com",     "hashed_vendor_002", "Nest Labs",     "NestHome"),
    ("vendor.arlo@security.com",    "hashed_vendor_003", "Arlo Tech",     "ArloSecurity"),
]
user_data = [
    ("Luka",        "Petrović",     "luka.petrovic@gmail.com"),
    ("Ana",         "Jovanović",    "ana.jovanovic@gmail.com"),
    ("Marko",       "Nikolić",      "marko.nikolic@gmail.com"),
    ("Jelena",      "Stojanović",   "jelena.stojanovic@gmail.com"),
    ("Stefan",      "Ilić",         "stefan.ilic@gmail.com"),
    ("Maja",        "Đorđević",     "maja.djordjevic@gmail.com"),
    ("Nikola",      "Pavlović",     "nikola.pavlovic@gmail.com"),
    ("Milica",      "Simić",        "milica.simic@gmail.com"),
    ("Ivan",        "Popović",      "ivan.popovic@gmail.com"),
    ("Tamara",      "Vuković",      "tamara.vukovic@gmail.com"),
    ("Aleksandar",  "Ristić",       "aleksandar.ristic@gmail.com"),
    ("Katarina",    "Lazić",        "katarina.lazic@gmail.com"),
    ("Vladimir",    "Marković",     "vladimir.markovic@gmail.com"),
    ("Bojana",      "Andrić",       "bojana.andric@gmail.com"),
    ("Nemanja",     "Todorović",    "nemanja.todorovic@gmail.com"),
    ("Vesna",       "Milošević",    "vesna.milosevic@gmail.com"),
    ("Dragan",      "Kovačević",    "dragan.kovacevic@gmail.com"),
    ("Ivana",       "Stanković",    "ivana.stankovic@gmail.com"),
    ("Zoran",       "Filipović",    "zoran.filipovic@gmail.com"),
    ("Sanja",       "Perić",        "sanja.peric@gmail.com"),
]

au_rows = []
for email, pw, *_ in admin_data:
    au_rows.append([email, pw])
for email, pw, *_ in vendor_data:
    au_rows.append([email, pw])
for name, surname, email in user_data:
    au_rows.append([email, f"hashed_{name.lower()}_pw"])

insert("abstract_user", ["email", "password"], au_rows)

# assign user_ids
admin_ids  = list(range(1, len(admin_data)+1))
vendor_ids = list(range(len(admin_data)+1, len(admin_data)+len(vendor_data)+1))
user_ids   = list(range(len(admin_data)+len(vendor_data)+1, len(admin_data)+len(vendor_data)+len(user_data)+1))

insert("admin",  ["user_id","name","surname"],
       [[admin_ids[i], admin_data[i][2], admin_data[i][3]] for i in range(len(admin_data))])

insert("vendor", ["user_id","name","pseudonym"],
       [[vendor_ids[i], vendor_data[i][2], vendor_data[i][3]] for i in range(len(vendor_data))])

insert('"user"', ["user_id","name","surname"],
       [[user_ids[i], user_data[i][0], user_data[i][1]] for i in range(len(user_data))])

# ─────────────────────────────────────────────
# ITEM MODELS
# vendor_ids: 0=Philips(cat Lighting), 1=Nest(Climate), 2=Arlo(Security)
# ─────────────────────────────────────────────

models = [
    # (name, published, vendor_idx, category_name)
    ("Philips Hue White",       True,  0, "Lighting"),
    ("Philips Hue Color",       True,  0, "Lighting"),
    ("Philips Hue Dimmer",      True,  0, "Lighting"),
    ("Nest Thermostat",         True,  1, "Climate Control"),
    ("Nest Temperature Sensor", True,  1, "Climate Control"),
    ("Arlo Pro Camera",         True,  2, "Security"),
    ("Arlo Doorbell",           True,  2, "Security"),
    ("Arlo Motion Sensor",      True,  2, "Security"),
]

insert("item_model", ["name","published","vendor_id","item_category_id"],
       [[m[0], m[1], vendor_ids[m[2]], cat_id[m[3]]] for m in models])

model_ids = {i+1: m[0] for i, m in enumerate(models)}  # 1-based
# shorthand
M_HUE_WHITE  = 1
M_HUE_COLOR  = 2
M_DIMMER     = 3
M_THERMOSTAT = 4
M_TEMP_SENS  = 5
M_CAMERA     = 6
M_DOORBELL   = 7
M_MOTION     = 8

# ─────────────────────────────────────────────
# ITEM PROPERTIES
# ─────────────────────────────────────────────

props = [
    (M_HUE_WHITE,  "color_temperature", "2700K"),
    (M_HUE_WHITE,  "wattage",           "9W"),
    (M_HUE_COLOR,  "color_range",       "16M colors"),
    (M_HUE_COLOR,  "wattage",           "10W"),
    (M_DIMMER,     "battery_type",      "CR2032"),
    (M_THERMOSTAT, "display_type",      "LCD"),
    (M_THERMOSTAT, "connectivity",      "WiFi + Bluetooth"),
    (M_TEMP_SENS,  "battery_life",      "2 years"),
    (M_CAMERA,     "resolution",        "1080p"),
    (M_CAMERA,     "field_of_view",     "130 degrees"),
    (M_DOORBELL,   "resolution",        "1536p"),
    (M_DOORBELL,   "night_vision",      "true"),
    (M_MOTION,     "detection_range",   "15m"),
    (M_MOTION,     "battery_life",      "6 months"),
]
insert("item_property", ["item_model_id","name","value"], props)

# ─────────────────────────────────────────────
# ACTION DEFINITIONS
# (model_id, name, controllable, value_type, default_value, min_value, max_value)
# ─────────────────────────────────────────────

action_defs_raw = [
    (M_HUE_WHITE,  "power",       True,  "bool",   "false", None, None),
    (M_HUE_WHITE,  "brightness",  True,  "int",    "50",    0,    100),
    (M_HUE_COLOR,  "power",       True,  "bool",   "false", None, None),
    (M_HUE_COLOR,  "brightness",  True,  "int",    "50",    0,    100),
    (M_HUE_COLOR,  "color",       True,  "string", "white", None, None),
    (M_DIMMER,     "last_press",  False, "string", "none",  None, None),
    (M_THERMOSTAT, "power",       True,  "bool",   "false", None, None),
    (M_THERMOSTAT, "temperature", True,  "int",    "20",    5,    35),
    (M_THERMOSTAT, "mode",        True,  "string", "heat",  None, None),
    (M_TEMP_SENS,  "temperature", False, "int",    "20",    -20,  60),
    (M_TEMP_SENS,  "humidity",    False, "int",    "45",    0,    100),
    (M_CAMERA,     "power",       True,  "bool",   "true",  None, None),
    (M_CAMERA,     "recording",   True,  "bool",   "false", None, None),
    (M_CAMERA,     "motion",      False, "bool",   "false", None, None),
    (M_DOORBELL,   "power",       True,  "bool",   "true",  None, None),
    (M_DOORBELL,   "motion",      False, "bool",   "false", None, None),
    (M_MOTION,     "active",      True,  "bool",   "true",  None, None),
    (M_MOTION,     "detected",    False, "bool",   "false", None, None),
]

insert("action_definition",
       ["item_model_id","name","controllable","value_type","default_value","min_value","max_value"],
       action_defs_raw)

# build lookup: model_id -> [(ad_id, name, value_type, default_value)]
model_to_ads = {}
for i, (mid, name, ctrl, vtype, defval, minv, maxv) in enumerate(action_defs_raw):
    ad_id = i + 1
    model_to_ads.setdefault(mid, []).append((ad_id, name, vtype, defval))

# ─────────────────────────────────────────────
# UNITS
# ─────────────────────────────────────────────

unit_type_pools = {
    "Apartment": ["Apartment"],
    "House":     ["House"],
    "Office":    ["Office"],
    "Studio":    ["Studio"],
    "Villa":     ["Villa"],
}
unit_combos_by_count = {
    1: [["Apartment"], ["House"], ["Studio"]],
    2: [["Apartment","Office"], ["House","Office"], ["Apartment","Studio"]],
    3: [["House","Office","Studio"], ["Villa","Office","Studio"], ["Apartment","House","Office"]],
}

unit_rows = []
unit_map  = []  # (unit_id, user_id, unit_type_name)
unit_id   = 1

for i, (name, surname, email) in enumerate(user_data):
    uid = user_ids[i]
    count = random.randint(1, 3)
    combo = random.choice(unit_combos_by_count[count])
    for ut_name in combo:
        unit_rows.append([f"{name}'s {ut_name}", uid, ut_id[ut_name]])
        unit_map.append((unit_id, uid, ut_name))
        unit_id += 1

insert("unit", ["name","user_id","unit_type_id"], unit_rows)

# ─────────────────────────────────────────────
# ROOMS
# ─────────────────────────────────────────────

room_pools = {
    "Apartment": (["Living Room","Bedroom","Kitchen","Bathroom","Hallway"], 2, 4),
    "House":     (["Living Room","Bedroom","Kitchen","Bathroom","Garage","Hallway","Basement"], 3, 5),
    "Office":    (["Office Room","Hallway"], 1, 2),
    "Studio":    (["Living Room","Bathroom"], 1, 2),
    "Villa":     (["Living Room","Bedroom","Kitchen","Bathroom","Garage","Hallway","Basement"], 4, 6),
}

room_rows = []
room_map  = []  # (room_id, unit_id, room_type_name)
room_id   = 1

for uid, user_id, ut_name in unit_map:
    pool, lo, hi = room_pools[ut_name]
    count = random.randint(lo, min(hi, len(pool)))
    chosen = random.sample(pool, count)
    for rt_name in chosen:
        room_rows.append([rt_name, uid, rt_id[rt_name]])
        room_map.append((room_id, uid, rt_name))
        room_id += 1

insert("room", ["name","unit_id","room_type_id"], room_rows)

# ─────────────────────────────────────────────
# ITEMS
# ─────────────────────────────────────────────

room_model_pools = {
    "Living Room": [M_HUE_WHITE, M_HUE_COLOR, M_THERMOSTAT, M_TEMP_SENS],
    "Bedroom":     [M_HUE_WHITE, M_HUE_COLOR, M_TEMP_SENS],
    "Kitchen":     [M_HUE_WHITE, M_TEMP_SENS],
    "Bathroom":    [M_HUE_WHITE],
    "Garage":      [M_CAMERA, M_MOTION],
    "Office Room": [M_HUE_WHITE, M_CAMERA],
    "Hallway":     [M_HUE_WHITE, M_MOTION, M_DOORBELL],
    "Basement":    [M_CAMERA, M_MOTION],
}
model_label = {
    M_HUE_WHITE:  "Hue White Bulb",
    M_HUE_COLOR:  "Hue Color Bulb",
    M_DIMMER:     "Dimmer Switch",
    M_THERMOSTAT: "Nest Thermostat",
    M_TEMP_SENS:  "Temp Sensor",
    M_CAMERA:     "Arlo Camera",
    M_DOORBELL:   "Arlo Doorbell",
    M_MOTION:     "Motion Sensor",
}

item_rows = []
item_map  = []  # (item_id, model_id, room_id)
item_id   = 1

for rid, uid, rt_name in room_map:
    pool = room_model_pools.get(rt_name, [M_HUE_WHITE])
    count = random.randint(1, min(2, len(pool)))
    chosen = random.sample(pool, count)
    for mid in chosen:
        item_rows.append([model_label[mid], mid, rid])
        item_map.append((item_id, mid, rid))
        item_id += 1

insert("item", ["name","item_model_id","room_id"], item_rows)

# ─────────────────────────────────────────────
# ITEM STATES
# ─────────────────────────────────────────────

def rand_val(vtype, defval):
    if vtype == "bool":
        return random.choice(["true","false"])
    if vtype == "int":
        if defval == "50":  return str(random.randint(10,100))
        if defval == "20":  return str(random.randint(15,30))
        if defval == "45":  return str(random.randint(30,70))
        return defval
    if vtype == "string":
        if defval == "white": return random.choice(["white","warm","red","blue","green"])
        if defval == "heat":  return random.choice(["heat","cool","auto"])
        if defval == "none":  return random.choice(["on","off","dim_up","dim_down","none"])
    return defval

state_rows = []
state_map  = []  # (state_id, ad_id, item_id, value)
state_id   = 1

for iid, mid, rid in item_map:
    for ad_id, ad_name, vtype, defval in model_to_ads[mid]:
        val = rand_val(vtype, defval)
        state_rows.append([ad_id, iid, val])
        state_map.append((state_id, ad_id, iid, val))
        state_id += 1

insert("item_state", ["action_definition_id","item_id","value"], state_rows)

# ─────────────────────────────────────────────
# SMART WORKFLOWS + SCENE + AUTOMATION
# ─────────────────────────────────────────────

scene_names = ["Good Morning","Movie Night","Away Mode","Bedtime","Party Mode","Work Mode","Relax","Dinner Time"]
auto_names  = ["Motion Alert","Temp Control","Night Security","Energy Saver","Wake Up Lights","Auto Lock"]

wf_rows = []
wf_map  = []  # (wf_id, type, user_id)
wf_id   = 1

for i, (name, surname, email) in enumerate(user_data):
    uid = user_ids[i]
    count = random.randint(1, 2)
    for _ in range(count):
        wtype = random.choice(["scene","automation"])
        wname = random.choice(scene_names if wtype == "scene" else auto_names)
        wf_rows.append([wtype, wname, uid])
        wf_map.append((wf_id, wtype, uid))
        wf_id += 1

insert("smart_workflow", ["type","name","user_id"], wf_rows)

scene_ids = [wid for wid, wtype, _ in wf_map if wtype == "scene"]
auto_ids  = [wid for wid, wtype, _ in wf_map if wtype == "automation"]

if scene_ids:
    insert("scene", ["scene_id"], [[sid] for sid in scene_ids])
if auto_ids:
    insert("automation", ["automation_id"], [[aid] for aid in auto_ids])

# ─────────────────────────────────────────────
# SMART ACTIONS (for scenes only)
# CHECK: exactly one of (item_state_id, target_scene_id) is NOT NULL
# ─────────────────────────────────────────────

sa_rows = []

for wid in scene_ids:
    count = random.randint(2, 4)
    used_states = set()
    for _ in range(count):
        # 15% chance to call another scene, else set item state
        if len(scene_ids) > 1 and random.random() < 0.15:
            other = [s for s in scene_ids if s != wid]
            target = random.choice(other)
            sa_rows.append([wid, None, None, target])
        else:
            candidates = [s for s in state_map if s[0] not in used_states]
            if not candidates:
                break
            chosen = random.choice(candidates)
            isid, ad_id, iid, val = chosen
            used_states.add(isid)
            sa_rows.append([wid, val, isid, None])

insert("smart_action", ["smart_workflow_id","value","item_state_id","target_scene_id"], sa_rows)

# ─────────────────────────────────────────────
# AUTOMATION TRIGGERS (for automations)
# CHECK: triggerType IN ('state-driven','time-driven')
# CHECK: valueType IN ('string','int','double','bool','DateTime')
# CHECK: operand IN ('<','>','=')
# ─────────────────────────────────────────────

at_rows = []

for aid in auto_ids:
    count = random.randint(1, 2)
    for _ in range(count):
        ttype = random.choice(["state-driven","time-driven"])
        if ttype == "state-driven":
            vtype   = random.choice(["bool","int","string"])
            operand = random.choice(["<",">","="])
            val     = rand_val(vtype, "false" if vtype=="bool" else "20" if vtype=="int" else "none")
            chosen_state = random.choice(state_map)
            isid = chosen_state[0]
            at_rows.append([aid, ttype, vtype, val, operand, isid])
        else:
            # time-driven: DateTime value, no operand, no item_state
            val = "07:00"
            at_rows.append([aid, ttype, "DateTime", val, None, None])

insert("automation_trigger",
       ["automation_id","trigger_type","value_type","value","operand","item_state_id"],
       at_rows)

# ─────────────────────────────────────────────
# ACTION LOG
# ─────────────────────────────────────────────

log_rows = []
base_time = datetime(2025, 1, 1, tzinfo=timezone.utc)

for _ in range(60):
    exec_id   = str(uuid.uuid4())
    ts        = base_time + timedelta(hours=random.randint(0, 8760))
    chosen    = random.choice(state_map)
    isid      = chosen[0]
    past_val  = rand_val("bool","false")
    curr_val  = "true" if past_val == "false" else "false"
    wf        = random.choice(wf_map) if random.random() < 0.7 else None
    wfid      = wf[0] if wf else None
    trigger_source = f'{{"source": "smart_workflow", "id": {wfid}}}' if wfid else '{"source": "manual"}'
    log_rows.append([exec_id, ts.isoformat(), trigger_source, past_val, curr_val, isid, wfid])

insert("action_log",
       ["execution_id","timestamp","trigger_source","past_value","current_value","item_state_id","smart_workflow_id"],
       log_rows)

# ─────────────────────────────────────────────
# WRITE OUTPUT
# ─────────────────────────────────────────────

with open("seed.sql", "w") as f:
    f.write("\n".join(out))

print("Done. Lines:", len(out))
