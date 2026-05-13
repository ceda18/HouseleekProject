import random
import json
import uuid
from datetime import datetime, timedelta, timezone

random.seed(42)
out = []

def sql(s): out.append(s)
def nl(): out.append("")

def insert(table, cols, rows):
    if not rows:
        return
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

# ─────────────────────────────────────────────────────────────────────────────
# HEADER
# ─────────────────────────────────────────────────────────────────────────────

sql("SET search_path TO houseleek;")
sql("TRUNCATE TABLE action_log, automation_trigger, smart_action, automation, scene, smart_workflow, item_state, item, action_definition, item_property, item_model, unit, room, abstract_user, unit_type, room_type, item_category RESTART IDENTITY CASCADE;")
nl()

# ─────────────────────────────────────────────────────────────────────────────
# LOOKUP TABLES
# ─────────────────────────────────────────────────────────────────────────────

unit_types = ['Apartment', 'House', 'Office', 'Studio', 'Villa']
room_types = ['Living Room', 'Bedroom', 'Kitchen', 'Bathroom', 'Garage', 'Office Room', 'Hallway', 'Basement']
item_cats  = ['Lighting', 'Climate Control', 'Security', 'Entertainment', 'Appliances']

insert("unit_type",     ["name"], [[x] for x in unit_types])
insert("room_type",     ["name"], [[x] for x in room_types])
insert("item_category", ["name"], [[x] for x in item_cats])

ut_id  = {name: i+1 for i, name in enumerate(unit_types)}
rt_id  = {name: i+1 for i, name in enumerate(room_types)}
cat_id = {name: i+1 for i, name in enumerate(item_cats)}

# ─────────────────────────────────────────────────────────────────────────────
# USERS
# ─────────────────────────────────────────────────────────────────────────────

HASHED_PW = "jUPY60RIRBTWGhhlm0Q/v+UjmVENpGidU1K9ljHGxRs="

admin_data = [
    ("admin.john@houseleek.io", "John", "Doe"),
    ("admin.sara@houseleek.io", "Sara", "Mitchell"),
]
vendor_data = [
    ("vendor.philips@philips.com", "Philips Smart",    "PhilipsHue"),
    ("vendor.nest@google.com",     "Nest Labs",         "NestHome"),
    ("vendor.arlo@arlo.com",       "Arlo Tech",         "ArloSecurity"),
    ("vendor.samsung@samsung.com", "Samsung SmartHome", "SamsungConnect"),
    ("vendor.bosch@bosch.com",     "Bosch Home",        "BoschSmart"),
]
user_data = [
    ("Luka",       "Petrović",   "luka.petrovic@gmail.com"),
    ("Ana",        "Jovanović",  "ana.jovanovic@gmail.com"),
    ("Marko",      "Nikolić",    "marko.nikolic@gmail.com"),
    ("Jelena",     "Stojanović", "jelena.stojanovic@gmail.com"),
    ("Stefan",     "Ilić",       "stefan.ilic@gmail.com"),
    ("Maja",       "Đorđević",   "maja.djordjevic@gmail.com"),
    ("Nikola",     "Pavlović",   "nikola.pavlovic@gmail.com"),
    ("Milica",     "Simić",      "milica.simic@gmail.com"),
    ("Ivan",       "Popović",    "ivan.popovic@gmail.com"),
    ("Tamara",     "Vuković",    "tamara.vukovic@gmail.com"),
    ("Aleksandar", "Ristić",     "aleksandar.ristic@gmail.com"),
    ("Katarina",   "Lazić",      "katarina.lazic@gmail.com"),
    ("Vladimir",   "Marković",   "vladimir.markovic@gmail.com"),
    ("Bojana",     "Andrić",     "bojana.andric@gmail.com"),
    ("Nemanja",    "Todorović",  "nemanja.todorovic@gmail.com"),
    ("Vesna",      "Milošević",  "vesna.milosevic@gmail.com"),
    ("Dragan",     "Kovačević",  "dragan.kovacevic@gmail.com"),
    ("Ivana",      "Stanković",  "ivana.stankovic@gmail.com"),
    ("Zoran",      "Filipović",  "zoran.filipovic@gmail.com"),
    ("Sanja",      "Perić",      "sanja.peric@gmail.com"),
    # ── Test user — always available, login: pera.peric@gmail.com / lozinka123
    ("Pera",       "Perić",      "pera.peric@gmail.com"),
]

au_rows = []
for email, _, __ in admin_data:
    au_rows.append([email, HASHED_PW])
for email, _, __ in vendor_data:
    au_rows.append([email, HASHED_PW])
for _, __, email in user_data:
    au_rows.append([email, HASHED_PW])
insert("abstract_user", ["email", "password"], au_rows)

admin_ids  = list(range(1, len(admin_data) + 1))
vendor_ids = list(range(len(admin_data) + 1, len(admin_data) + len(vendor_data) + 1))
user_ids   = list(range(len(admin_data) + len(vendor_data) + 1,
                        len(admin_data) + len(vendor_data) + len(user_data) + 1))

insert("admin",   ["user_id", "name", "surname"],
       [[admin_ids[i], admin_data[i][1], admin_data[i][2]] for i in range(len(admin_data))])
insert("vendor",  ["user_id", "name", "pseudonym"],
       [[vendor_ids[i], vendor_data[i][1], vendor_data[i][2]] for i in range(len(vendor_data))])
insert('"user"',  ["user_id", "name", "surname"],
       [[user_ids[i], user_data[i][0], user_data[i][1]] for i in range(len(user_data))])

# ─────────────────────────────────────────────────────────────────────────────
# ITEM MODELS
# vendor indices: 0=Philips, 1=Nest, 2=Arlo, 3=Samsung, 4=Bosch
# ─────────────────────────────────────────────────────────────────────────────

models = [
    # (name, published, vendor_idx, category_name)
    ("Philips Hue White",       True, 0, "Lighting"),          # 1
    ("Philips Hue Color",       True, 0, "Lighting"),          # 2
    ("Philips Hue Dimmer",      True, 0, "Lighting"),          # 3
    ("Nest Thermostat",         True, 1, "Climate Control"),   # 4
    ("Nest Temperature Sensor", True, 1, "Climate Control"),   # 5
    ("Arlo Pro Camera",         True, 2, "Security"),          # 6
    ("Arlo Doorbell",           True, 2, "Security"),          # 7
    ("Arlo Motion Sensor",      True, 2, "Security"),          # 8
    ("Samsung Smart TV",        True, 3, "Entertainment"),     # 9
    ("Samsung Soundbar",        True, 3, "Entertainment"),     # 10
    ("Samsung Smart Speaker",   True, 3, "Entertainment"),     # 11
    ("Bosch Washing Machine",   True, 4, "Appliances"),        # 12
    ("Bosch Dishwasher",        True, 4, "Appliances"),        # 13
]
insert("item_model", ["name", "published", "vendor_id", "item_category_id"],
       [[m[0], m[1], vendor_ids[m[2]], cat_id[m[3]]] for m in models])

M_HUE_WHITE  = 1
M_HUE_COLOR  = 2
M_DIMMER     = 3
M_THERMOSTAT = 4
M_TEMP_SENS  = 5
M_CAMERA     = 6
M_DOORBELL   = 7
M_MOTION     = 8
M_TV         = 9
M_SOUNDBAR   = 10
M_SPEAKER    = 11
M_WASHER     = 12
M_DISHWASHER = 13

model_name_lut = {i + 1: m[0] for i, m in enumerate(models)}
model_cat_lut  = {i + 1: m[3] for i, m in enumerate(models)}

# ─────────────────────────────────────────────────────────────────────────────
# ITEM PROPERTIES  (including power_consumption on every model)
# ─────────────────────────────────────────────────────────────────────────────

props = [
    # Philips Hue White
    (M_HUE_WHITE,  "power_consumption", "9W"),
    (M_HUE_WHITE,  "color_temperature", "2700K"),
    (M_HUE_WHITE,  "wattage",           "9W"),
    # Philips Hue Color
    (M_HUE_COLOR,  "power_consumption", "10W"),
    (M_HUE_COLOR,  "color_range",       "16M colors"),
    (M_HUE_COLOR,  "wattage",           "10W"),
    # Philips Hue Dimmer
    (M_DIMMER,     "power_consumption", "0.5W"),
    (M_DIMMER,     "battery_type",      "CR2032"),
    # Nest Thermostat
    (M_THERMOSTAT, "power_consumption", "3W"),
    (M_THERMOSTAT, "display_type",      "LCD"),
    (M_THERMOSTAT, "connectivity",      "WiFi + Bluetooth"),
    # Nest Temperature Sensor
    (M_TEMP_SENS,  "power_consumption", "0.1W"),
    (M_TEMP_SENS,  "battery_life",      "2 years"),
    # Arlo Pro Camera
    (M_CAMERA,     "power_consumption", "4W"),
    (M_CAMERA,     "resolution",        "1080p"),
    (M_CAMERA,     "field_of_view",     "130 degrees"),
    # Arlo Doorbell
    (M_DOORBELL,   "power_consumption", "2W"),
    (M_DOORBELL,   "resolution",        "1536p"),
    (M_DOORBELL,   "night_vision",      "true"),
    # Arlo Motion Sensor
    (M_MOTION,     "power_consumption", "0.5W"),
    (M_MOTION,     "detection_range",   "15m"),
    (M_MOTION,     "battery_life",      "6 months"),
    # Samsung Smart TV
    (M_TV,         "power_consumption", "120W"),
    (M_TV,         "screen_size",       "55 inch"),
    (M_TV,         "resolution",        "4K UHD"),
    # Samsung Soundbar
    (M_SOUNDBAR,   "power_consumption", "45W"),
    (M_SOUNDBAR,   "channels",          "2.1"),
    (M_SOUNDBAR,   "connectivity",      "Bluetooth + HDMI ARC"),
    # Samsung Smart Speaker
    (M_SPEAKER,    "power_consumption", "15W"),
    (M_SPEAKER,    "connectivity",      "WiFi + Bluetooth"),
    (M_SPEAKER,    "voice_assistant",   "Bixby"),
    # Bosch Washing Machine
    (M_WASHER,     "power_consumption", "2000W"),
    (M_WASHER,     "capacity",          "8kg"),
    (M_WASHER,     "spin_speed",        "1400rpm"),
    # Bosch Dishwasher
    (M_DISHWASHER, "power_consumption", "1800W"),
    (M_DISHWASHER, "capacity",          "12 place settings"),
    (M_DISHWASHER, "energy_class",      "A+++"),
]
insert("item_property", ["item_model_id", "name", "value"], props)

# ─────────────────────────────────────────────────────────────────────────────
# ACTION DEFINITIONS
# (model_id, name, controllable, value_type, default_value, min_value, max_value)
# ─────────────────────────────────────────────────────────────────────────────

action_defs_raw = [
    # Philips Hue White
    (M_HUE_WHITE,  "power",        True,  "bool",   "false",  None, None),
    (M_HUE_WHITE,  "brightness",   True,  "int",    "50",     0,    100),
    # Philips Hue Color
    (M_HUE_COLOR,  "power",        True,  "bool",   "false",  None, None),
    (M_HUE_COLOR,  "brightness",   True,  "int",    "50",     0,    100),
    (M_HUE_COLOR,  "color",        True,  "string", "white",  None, None),
    # Philips Hue Dimmer
    (M_DIMMER,     "last_press",   False, "string", "none",   None, None),
    # Nest Thermostat
    (M_THERMOSTAT, "power",        True,  "bool",   "false",  None, None),
    (M_THERMOSTAT, "temperature",  True,  "int",    "20",     5,    35),
    (M_THERMOSTAT, "mode",         True,  "string", "heat",   None, None),
    # Nest Temperature Sensor
    (M_TEMP_SENS,  "temperature",  False, "int",    "20",     -20,  60),
    (M_TEMP_SENS,  "humidity",     False, "int",    "45",     0,    100),
    # Arlo Pro Camera
    (M_CAMERA,     "power",        True,  "bool",   "true",   None, None),
    (M_CAMERA,     "recording",    True,  "bool",   "false",  None, None),
    (M_CAMERA,     "motion",       False, "bool",   "false",  None, None),
    # Arlo Doorbell
    (M_DOORBELL,   "power",        True,  "bool",   "true",   None, None),
    (M_DOORBELL,   "motion",       False, "bool",   "false",  None, None),
    # Arlo Motion Sensor
    (M_MOTION,     "active",       True,  "bool",   "true",   None, None),
    (M_MOTION,     "detected",     False, "bool",   "false",  None, None),
    # Samsung Smart TV
    (M_TV,         "power",        True,  "bool",   "false",  None, None),
    (M_TV,         "volume",       True,  "int",    "30",     0,    100),
    (M_TV,         "channel",      True,  "int",    "1",      1,    999),
    (M_TV,         "input_source", True,  "string", "hdmi1",  None, None),
    # Samsung Soundbar
    (M_SOUNDBAR,   "power",        True,  "bool",   "false",  None, None),
    (M_SOUNDBAR,   "volume",       True,  "int",    "20",     0,    100),
    (M_SOUNDBAR,   "mode",         True,  "string", "stereo", None, None),
    # Samsung Smart Speaker
    (M_SPEAKER,    "power",        True,  "bool",   "false",  None, None),
    (M_SPEAKER,    "volume",       True,  "int",    "50",     0,    100),
    # Bosch Washing Machine
    (M_WASHER,     "power",        True,  "bool",   "false",  None, None),
    (M_WASHER,     "program",      True,  "string", "cotton", None, None),
    (M_WASHER,     "running",      False, "bool",   "false",  None, None),
    (M_WASHER,     "door_locked",  False, "bool",   "false",  None, None),
    # Bosch Dishwasher
    (M_DISHWASHER, "power",        True,  "bool",   "false",  None, None),
    (M_DISHWASHER, "program",      True,  "string", "normal", None, None),
    (M_DISHWASHER, "running",      False, "bool",   "false",  None, None),
]

insert("action_definition",
       ["item_model_id", "name", "controllable", "value_type", "default_value", "min_value", "max_value"],
       action_defs_raw)

# Build model -> action_definitions lookup
# entry: (ad_id, name, controllable, vtype, defval, minv, maxv)
model_to_ads = {}
for i, (mid, name, ctrl, vtype, defval, minv, maxv) in enumerate(action_defs_raw):
    model_to_ads.setdefault(mid, []).append((i + 1, name, ctrl, vtype, defval, minv, maxv))

# ad_id -> full context dict (for trigger_source building)
ad_context_lut = {}
for i, (mid, name, ctrl, vtype, defval, minv, maxv) in enumerate(action_defs_raw):
    ad_id = i + 1
    ad_context_lut[ad_id] = {
        "actionDefinitionId": ad_id,
        "name":               name,
        "valueType":          vtype,
        "controllable":       ctrl,
    }

# ─────────────────────────────────────────────────────────────────────────────
# UNITS
# ─────────────────────────────────────────────────────────────────────────────

unit_combos = {
    1: [["Apartment"], ["House"], ["Studio"]],
    2: [["Apartment", "Office"], ["House", "Office"], ["Apartment", "Studio"]],
    3: [["House", "Office", "Studio"], ["Villa", "Office", "Studio"], ["Apartment", "House", "Office"]],
}

unit_rows = []
unit_map  = []  # (unit_id, db_uid, uname, usurname, ut_name, unit_display_name)
uid_counter = 1

for i, (uname, usurname, email) in enumerate(user_data):
    db_uid = user_ids[i]
    count  = random.randint(1, 3)
    combo  = random.choice(unit_combos[count])
    for ut_name in combo:
        display = f"{uname}'s {ut_name}"
        unit_rows.append([display, db_uid, ut_id[ut_name]])
        unit_map.append((uid_counter, db_uid, uname, usurname, ut_name, display))
        uid_counter += 1

insert("unit", ["name", "user_id", "unit_type_id"], unit_rows)

# ─────────────────────────────────────────────────────────────────────────────
# ROOMS
# ─────────────────────────────────────────────────────────────────────────────

room_pools = {
    "Apartment": (["Living Room", "Bedroom", "Kitchen", "Bathroom", "Hallway"],          2, 4),
    "House":     (["Living Room", "Bedroom", "Kitchen", "Bathroom", "Garage", "Hallway", "Basement"], 3, 5),
    "Office":    (["Office Room", "Hallway"],                                             1, 2),
    "Studio":    (["Living Room", "Bathroom"],                                            1, 2),
    "Villa":     (["Living Room", "Bedroom", "Kitchen", "Bathroom", "Garage", "Hallway", "Basement"], 4, 6),
}

room_rows = []
room_map  = []  # (room_id, unit_id, db_uid, uname, usurname, unit_display, rt_name)
rid_counter = 1

for u_id, db_uid, uname, usurname, ut_name, unit_display in unit_map:
    pool, lo, hi = room_pools[ut_name]
    count  = random.randint(lo, min(hi, len(pool)))
    chosen = random.sample(pool, count)
    for rt_name in chosen:
        room_rows.append([rt_name, u_id, rt_id[rt_name]])
        room_map.append((rid_counter, u_id, db_uid, uname, usurname, unit_display, rt_name))
        rid_counter += 1

insert("room", ["name", "unit_id", "room_type_id"], room_rows)

# ─────────────────────────────────────────────────────────────────────────────
# ITEMS — Serbian IKEA-style names
# ─────────────────────────────────────────────────────────────────────────────

serbian_names = [
    "Branislav", "Ljubinka", "Svetozar", "Bogoljub",  "Radoslav",
    "Živorad",   "Milodrag", "Čedomir",  "Dragoslav", "Vladisav",
    "Milovan",   "Dobrosav", "Bratoljub","Vlastimir",  "Radovan",
    "Miroslav",  "Draginja", "Slavoljub","Budimir",    "Gostimir",
    "Tihomir",   "Vladeta",  "Miloljub", "Radomir",   "Dobroslav",
    "Vojislav",  "Zdravko",  "Zorislav", "Desimir",   "Dragoljub",
    "Velibor",   "Zlatomir", "Hranislav","Krstivoje",  "Ljubomir",
    "Milisav",   "Nedeljko", "Obradović","Prvoslav",   "Stojadin",
]
_name_pool = serbian_names[:]

def get_device_name():
    global _name_pool
    if not _name_pool:
        _name_pool = serbian_names[:]
    name = random.choice(_name_pool)
    _name_pool.remove(name)
    return name

room_model_pools = {
    "Living Room":  [M_HUE_WHITE, M_HUE_COLOR, M_THERMOSTAT, M_TEMP_SENS, M_TV, M_SOUNDBAR, M_SPEAKER],
    "Bedroom":      [M_HUE_WHITE, M_HUE_COLOR, M_TEMP_SENS, M_SPEAKER],
    "Kitchen":      [M_HUE_WHITE, M_TEMP_SENS, M_DISHWASHER],
    "Bathroom":     [M_HUE_WHITE, M_WASHER],
    "Garage":       [M_CAMERA, M_MOTION],
    "Office Room":  [M_HUE_WHITE, M_HUE_COLOR, M_CAMERA, M_SPEAKER],
    "Hallway":      [M_HUE_WHITE, M_MOTION, M_DOORBELL],
    "Basement":     [M_CAMERA, M_MOTION],
}

item_rows = []
# (item_id, model_id, room_id, db_uid, uname, usurname, unit_display, rt_name, dev_name, model_name, cat_name)
item_map  = []
iid_counter = 1

for rm_id, u_id, db_uid, uname, usurname, unit_display, rt_name in room_map:
    pool   = room_model_pools.get(rt_name, [M_HUE_WHITE])
    count  = random.randint(1, min(2, len(pool)))
    chosen = random.sample(pool, count)
    for mid in chosen:
        dev_name = get_device_name()
        item_rows.append([dev_name, mid, rm_id])
        item_map.append((iid_counter, mid, rm_id, db_uid, uname, usurname,
                         unit_display, rt_name, dev_name,
                         model_name_lut[mid], model_cat_lut[mid]))
        iid_counter += 1

insert("item", ["name", "item_model_id", "room_id"], item_rows)

# item context lookup: item_id -> dict (for trigger_source)
item_context_lut = {
    iid: {
        "itemId":       iid,
        "name":         dev_name,
        "itemModel":    model_name,
        "itemCategory": cat_name,
        "room":         rt_name,
        "unit":         unit_display,
    }
    for iid, mid, rm_id, db_uid, uname, usurname,
        unit_display, rt_name, dev_name, model_name, cat_name in item_map
}

# ─────────────────────────────────────────────────────────────────────────────
# ITEM STATES
# ─────────────────────────────────────────────────────────────────────────────

def rand_val(vtype, defval, minv=None, maxv=None):
    if vtype == "bool":
        return random.choice(["true", "false"])
    if vtype == "int":
        lo = int(minv) if minv is not None else 0
        hi = int(maxv) if maxv is not None else 100
        if minv is None and maxv is None:
            if defval == "50":  lo, hi = 10, 100
            elif defval == "30": lo, hi = 10, 80
            elif defval == "20": lo, hi = 10, 50
            elif defval == "45": lo, hi = 30, 70
            else:               lo, hi = 0, 100
        return str(random.randint(lo, hi))
    if vtype == "string":
        domains = {
            "white":  ["white", "warm white", "red", "blue", "green", "purple", "yellow"],
            "heat":   ["heat", "cool", "auto", "fan"],
            "none":   ["on", "off", "dim_up", "dim_down", "none"],
            "hdmi1":  ["hdmi1", "hdmi2", "hdmi3", "tv", "usb"],
            "stereo": ["stereo", "surround", "bass boost", "movie", "music"],
            "cotton": ["cotton", "synthetic", "wool", "quick wash", "delicate"],
            "normal": ["normal", "eco", "intensive", "quick", "glass"],
        }
        return random.choice(domains.get(defval, [defval]))
    return defval

state_rows  = []
state_map   = []  # (state_id, ad_id, ad_name, ctrl, vtype, item_id, model_id, value)
sid_counter = 1

for iid, mid, rm_id, db_uid, uname, usurname, unit_display, rt_name, dev_name, model_name, cat_name in item_map:
    for ad_id, ad_name, ctrl, vtype, defval, minv, maxv in model_to_ads[mid]:
        val = rand_val(vtype, defval, minv, maxv)
        state_rows.append([ad_id, iid, val])
        state_map.append((sid_counter, ad_id, ad_name, ctrl, vtype, iid, mid, val))
        sid_counter += 1

insert("item_state", ["action_definition_id", "item_id", "value"], state_rows)

# Mutable current value per state_id (updated during log simulation)
current_values = {s[0]: s[7] for s in state_map}

# state detail lookup: state_id -> {ad_id, vtype, defval, minv, maxv, item_id}
state_detail_lut = {}
for s in state_map:
    sid, ad_id, ad_name, ctrl, vtype, iid, mid, val = s
    raw = action_defs_raw[ad_id - 1]
    state_detail_lut[sid] = {
        "ad_id":   ad_id,
        "vtype":   vtype,
        "defval":  raw[4],
        "minv":    raw[5],
        "maxv":    raw[6],
        "item_id": iid,
    }

# Per-user state list: db_uid -> [state entries]
user_states_map = {}
for s in state_map:
    sid, ad_id, ad_name, ctrl, vtype, iid, mid, val = s
    for entry in item_map:
        if entry[0] == iid:
            db_uid = entry[3]
            user_states_map.setdefault(db_uid, []).append(s)
            break

# ─────────────────────────────────────────────────────────────────────────────
# SMART WORKFLOWS
# ─────────────────────────────────────────────────────────────────────────────

scene_name_pool = [
    "Dobro jutro", "Filmsko veče", "Odsutan", "Laku noć",
    "Žurka", "Radni mod", "Opuštanje", "Večera",
    "Romantika", "Budilnik", "Vikend jutro", "Energija",
]
auto_name_pool = [
    "Detekcija pokreta", "Kontrola temperature", "Noćna zaštita",
    "Štednja energije", "Jutarnja svetla", "Automatska bezbednost",
    "Pametno grejanje", "Automatski alarm",
]

wf_rows = []
wf_map  = []  # (wf_id, type, db_uid, wf_name)
wf_id_counter = 1

for i, (uname, usurname, email) in enumerate(user_data):
    db_uid = user_ids[i]
    count  = random.randint(2, 4)
    for _ in range(count):
        wtype = random.choice(["scene", "automation"])
        wname = random.choice(scene_name_pool if wtype == "scene" else auto_name_pool)
        wf_rows.append([wtype, wname, db_uid])
        wf_map.append((wf_id_counter, wtype, db_uid, wname))
        wf_id_counter += 1

insert("smart_workflow", ["type", "name", "user_id"], wf_rows)

scene_wfs = [(wid, uid, wname) for wid, wtype, uid, wname in wf_map if wtype == "scene"]
auto_wfs  = [(wid, uid, wname) for wid, wtype, uid, wname in wf_map if wtype == "automation"]

if scene_wfs:
    insert("scene",      ["scene_id"],      [[s[0]] for s in scene_wfs])
if auto_wfs:
    insert("automation", ["automation_id"], [[a[0]] for a in auto_wfs])

scene_ids_by_user = {}
for wid, uid, wname in scene_wfs:
    scene_ids_by_user.setdefault(uid, []).append(wid)

# ─────────────────────────────────────────────────────────────────────────────
# SMART ACTIONS
# Scenes: only item_state actions
# Automations: item_state OR target_scene
# ─────────────────────────────────────────────────────────────────────────────

sa_rows = []
# smart_actions_by_wf: wf_id -> [(sa_value_or_none, state_id_or_none, target_scene_id_or_none)]
smart_actions_by_wf = {}

# --- Scenes ---
for wid, uid, wname in scene_wfs:
    states = user_states_map.get(uid, [])
    if not states:
        continue
    count   = random.randint(2, 4)
    used    = set()
    actions = []
    for _ in range(count):
        candidates = [s for s in states if s[0] not in used]
        if not candidates:
            break
        s = random.choice(candidates)
        sid, ad_id, ad_name, ctrl, vtype, iid, mid, val = s
        used.add(sid)
        new_val = rand_val(vtype, val,
                           state_detail_lut[sid]["minv"],
                           state_detail_lut[sid]["maxv"])
        sa_rows.append([wid, new_val, sid, None])
        actions.append((new_val, sid, None))
    smart_actions_by_wf[wid] = actions

# --- Automations ---
for wid, uid, wname in auto_wfs:
    states      = user_states_map.get(uid, [])
    user_scenes = scene_ids_by_user.get(uid, [])
    if not states:
        continue
    count   = random.randint(1, 3)
    used    = set()
    actions = []
    for _ in range(count):
        if user_scenes and random.random() < 0.20:
            target = random.choice(user_scenes)
            sa_rows.append([wid, None, None, target])
            actions.append((None, None, target))
        else:
            candidates = [s for s in states if s[0] not in used]
            if not candidates:
                break
            s = random.choice(candidates)
            sid, ad_id, ad_name, ctrl, vtype, iid, mid, val = s
            used.add(sid)
            new_val = rand_val(vtype, val,
                               state_detail_lut[sid]["minv"],
                               state_detail_lut[sid]["maxv"])
            sa_rows.append([wid, new_val, sid, None])
            actions.append((new_val, sid, None))
    smart_actions_by_wf[wid] = actions

insert("smart_action",
       ["smart_workflow_id", "value", "item_state_id", "target_scene_id"],
       sa_rows)

# ─────────────────────────────────────────────────────────────────────────────
# AUTOMATION TRIGGERS
# trigger_type: 'state-driven' | 'time-driven'
# operand:      '<' | '>' | '=' | NULL (time-driven)
# ─────────────────────────────────────────────────────────────────────────────

at_rows = []

for wid, uid, wname in auto_wfs:
    states = user_states_map.get(uid, [])
    count  = random.randint(1, 2)
    for _ in range(count):
        ttype = random.choice(["state-driven", "time-driven"])
        if ttype == "state-driven" and states:
            s = random.choice(states)
            sid, ad_id, ad_name, ctrl, vtype, iid, mid, val = s
            operand = random.choice(["<", ">", "="])
            tval    = rand_val(vtype, val,
                               state_detail_lut[sid]["minv"],
                               state_detail_lut[sid]["maxv"])
            at_rows.append([wid, ttype, vtype, tval, operand, sid])
        else:
            hour = random.choice([6, 7, 8, 18, 19, 20, 22, 23])
            mins = random.choice([0, 15, 30, 45])
            tval = f"{hour:02d}:{mins:02d}"
            at_rows.append([wid, "time-driven", "string", tval, None, None])

insert("automation_trigger",
       ["automation_id", "trigger_type", "value_type", "value", "operand", "item_state_id"],
       at_rows)

# ─────────────────────────────────────────────────────────────────────────────
# ACTION LOGS — realistic per-user simulation
# Mirrors ActionService.BuildTriggerSource format exactly
# ─────────────────────────────────────────────────────────────────────────────

def build_trigger_source(trigger_type, user_ctx, item_ctx, ad_ctx, wf_ctx):
    return json.dumps({
        "triggerType":      trigger_type,
        "user":             user_ctx,
        "item":             item_ctx,
        "actionDefinition": ad_ctx,
        "workflow":         wf_ctx,
    }, ensure_ascii=False)

def next_val(vtype, current, minv=None, maxv=None):
    """Generate a new value that differs from current."""
    for _ in range(10):
        v = rand_val(vtype, current, minv, maxv)
        if v != current:
            return v
    # fallback: flip bool, increment int
    if vtype == "bool":
        return "false" if current == "true" else "true"
    return current

def collect_log_entries(wf_id, wf_type, wf_name, user_ctx, exec_id, ts, log_rows):
    """
    Recursively collect log entries for a workflow execution.
    Mirrors ExecuteSmartActions: each smart_action -> one log.
    target_scene actions are resolved recursively (same exec_id).
    """
    actions = smart_actions_by_wf.get(wf_id, [])
    wf_ctx  = {"smartWorkflowId": wf_id, "name": wf_name, "type": wf_type}

    for sa_val, sa_state_id, sa_target_scene in actions:
        if sa_state_id is not None:
            detail   = state_detail_lut[sa_state_id]
            iid      = detail["item_id"]
            ad_id    = detail["ad_id"]
            past_val = current_values[sa_state_id]
            new_val  = sa_val if sa_val is not None else next_val(
                detail["vtype"], past_val, detail["minv"], detail["maxv"])
            current_values[sa_state_id] = new_val

            trigger_src = build_trigger_source(
                wf_type,
                user_ctx,
                item_context_lut[iid],
                ad_context_lut[ad_id],
                wf_ctx,
            )
            log_rows.append([
                str(exec_id),
                ts.isoformat(),
                trigger_src,
                past_val,
                new_val,
                sa_state_id,
                wf_id,
            ])
        elif sa_target_scene is not None:
            # Resolve target scene — same exec_id, keep original wf_ctx
            target_actions = smart_actions_by_wf.get(sa_target_scene, [])
            for t_val, t_sid, _ in target_actions:
                if t_sid is None:
                    continue
                detail   = state_detail_lut[t_sid]
                iid      = detail["item_id"]
                ad_id    = detail["ad_id"]
                past_val = current_values[t_sid]
                new_val  = t_val if t_val is not None else next_val(
                    detail["vtype"], past_val, detail["minv"], detail["maxv"])
                current_values[t_sid] = new_val

                trigger_src = build_trigger_source(
                    wf_type,
                    user_ctx,
                    item_context_lut[iid],
                    ad_context_lut[ad_id],
                    wf_ctx,  # original workflow stays in context
                )
                log_rows.append([
                    str(exec_id),
                    ts.isoformat(),
                    trigger_src,
                    past_val,
                    new_val,
                    t_sid,
                    wf_id,  # original wf_id
                ])


# wf lookup: wf_id -> (type, uid, name)
wf_lookup = {wid: (wtype, uid, wname) for wid, wtype, uid, wname in wf_map}

NOW   = datetime.now(timezone.utc)
START = NOW - timedelta(days=90)

log_rows = []

for i, (uname, usurname, email) in enumerate(user_data):
    db_uid    = user_ids[i]
    user_ctx  = {"userId": db_uid, "name": uname, "surname": usurname}
    my_states = user_states_map.get(db_uid, [])
    my_wfs    = [(wid, wtype, wname) for wid, wtype, uid, wname in wf_map if uid == db_uid]

    if not my_states:
        continue

    for day_offset in range(90):
        day = START + timedelta(days=day_offset)

        # Morning cluster  06:00–09:00
        for _ in range(random.choices([0, 1, 2], weights=[20, 50, 30])[0]):
            ts      = day.replace(hour=random.randint(6, 9),
                                  minute=random.randint(0, 59),
                                  second=random.randint(0, 59))
            exec_id = uuid.uuid4()

            if my_wfs and random.random() < 0.70:
                wid, wtype, wname = random.choice(my_wfs)
                collect_log_entries(wid, wtype, wname, user_ctx, exec_id, ts, log_rows)
            else:
                s = random.choice(my_states)
                sid, ad_id, ad_name, ctrl, vtype, iid, mid, _ = s
                detail   = state_detail_lut[sid]
                past_val = current_values[sid]
                new_val  = next_val(vtype, past_val, detail["minv"], detail["maxv"])
                current_values[sid] = new_val
                trigger_src = build_trigger_source(
                    "manual", user_ctx, item_context_lut[iid], ad_context_lut[ad_id], None)
                log_rows.append([str(exec_id), ts.isoformat(), trigger_src,
                                  past_val, new_val, sid, None])

        # Midday cluster  11:00–14:00  (25% chance)
        if random.random() < 0.25:
            ts      = day.replace(hour=random.randint(11, 14),
                                  minute=random.randint(0, 59),
                                  second=random.randint(0, 59))
            exec_id = uuid.uuid4()
            if my_wfs and random.random() < 0.50:
                wid, wtype, wname = random.choice(my_wfs)
                collect_log_entries(wid, wtype, wname, user_ctx, exec_id, ts, log_rows)
            else:
                s = random.choice(my_states)
                sid, ad_id, ad_name, ctrl, vtype, iid, mid, _ = s
                detail   = state_detail_lut[sid]
                past_val = current_values[sid]
                new_val  = next_val(vtype, past_val, detail["minv"], detail["maxv"])
                current_values[sid] = new_val
                trigger_src = build_trigger_source(
                    "manual", user_ctx, item_context_lut[iid], ad_context_lut[ad_id], None)
                log_rows.append([str(exec_id), ts.isoformat(), trigger_src,
                                  past_val, new_val, sid, None])

        # Evening cluster  18:00–22:00
        for _ in range(random.choices([0, 1, 2, 3], weights=[10, 30, 40, 20])[0]):
            ts      = day.replace(hour=random.randint(18, 22),
                                  minute=random.randint(0, 59),
                                  second=random.randint(0, 59))
            exec_id = uuid.uuid4()

            if my_wfs and random.random() < 0.70:
                wid, wtype, wname = random.choice(my_wfs)
                collect_log_entries(wid, wtype, wname, user_ctx, exec_id, ts, log_rows)
            else:
                s = random.choice(my_states)
                sid, ad_id, ad_name, ctrl, vtype, iid, mid, _ = s
                detail   = state_detail_lut[sid]
                past_val = current_values[sid]
                new_val  = next_val(vtype, past_val, detail["minv"], detail["maxv"])
                current_values[sid] = new_val
                trigger_src = build_trigger_source(
                    "manual", user_ctx, item_context_lut[iid], ad_context_lut[ad_id], None)
                log_rows.append([str(exec_id), ts.isoformat(), trigger_src,
                                  past_val, new_val, sid, None])

insert("action_log",
       ["execution_id", "timestamp", "trigger_source", "past_value", "current_value",
        "item_state_id", "smart_workflow_id"],
       log_rows)

# ─────────────────────────────────────────────────────────────────────────────
# REFRESH ROLE PERMISSIONS
# ─────────────────────────────────────────────────────────────────────────────

# thesis_core_platform: full access
sql("GRANT USAGE ON SCHEMA houseleek TO thesis_core_platform;")
sql("GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA houseleek TO thesis_core_platform;")
sql("GRANT USAGE ON ALL SEQUENCES IN SCHEMA houseleek TO thesis_core_platform;")
nl()

# thesis_agent: read-only, no user tables
sql("GRANT USAGE ON SCHEMA houseleek TO thesis_agent;")
sql("GRANT SELECT ON ALL TABLES IN SCHEMA houseleek TO thesis_agent;")
sql("REVOKE ALL ON houseleek.abstract_user FROM thesis_agent;")
sql("REVOKE ALL ON houseleek.admin FROM thesis_agent;")
sql('REVOKE ALL ON houseleek."user" FROM thesis_agent;')
nl()

# ─────────────────────────────────────────────────────────────────────────────
# WRITE OUTPUT
# ─────────────────────────────────────────────────────────────────────────────

output_path = "seed.sql"
with open(output_path, "w", encoding="utf-8") as f:
    f.write("\n".join(out))

print(f"Done. SQL lines: {len(out)}, Action logs: {len(log_rows)}")
