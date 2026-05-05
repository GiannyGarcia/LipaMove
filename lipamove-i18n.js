/**
 * LipaMove UI strings — English default, Tagalog alternate.
 * Preference: localStorage lipamove_locale = "en" | "tl"
 */
(function (global) {
  "use strict";

  var STORAGE_KEY = "lipamove_locale";
  var DEFAULT_LOCALE = "en";

  var STRINGS = {
    en: {
      "map.headline": "Where's my ride?",
      "map.sub": "See where vehicles are so waiting feels simpler and calmer.",
      "pill.live_tracking": "Live vehicle tracking",
      "pill.server_feed": "Server live PUV feed",
      "pill.sim_paused": "Live tracking paused",
      "pill.preparing": "Preparing live route data…",
      "chip.live_updates": "Live updates",
      "chip.route_tooltip": "Ayala / J.P. Laurel (no bypass)",
      "chip.route_label": "Ayala / J.P. Laurel (no bypass)",
      "net.online": "Online",
      "net.offline": "Offline",
      "nearest.landmark":
        "You're ~{km} km from {name} (straight-line reference from your ETA point).",
      "feed.puv_socket":
        "PUV positions: real-time from LipaMove server (Socket.io). Tap Live tracking to return to local simulation.",
      "feed.socket_connecting":
        "Connecting to live PUV server… (without telemetry, simulation / data.xml continues.)",
      "feed.sim_guide":
        "Simulation — ETA is guidance only (★ your priority unit). Use Sort list for lighter occupancy first.",
      "feed.last_pull": "Last live feed pull: {ago} — auto every ~{poll}s (data saver: {ds}).",
      "notify.perm_granted_toast": "OK — we'll alert when the nearest ride is close.",
      "notify.unsupported_toast": "Notifications aren't supported here.",
      "notify.popup_title": "LipaMove — ride is close",
      "notify.popup_body": "{id}: about {upper} min (upper end of band).",
      "share.sms_fallback": "If SMS didn't open, use Copy message.",
      "plan.fleet_loading": "Fleet still loading or missing data.xml.",
      "plan.map_not_ready": "Map not ready.",
      "plan.any_unit": "Any unit / choose on map",
      "popup.crowd": "Crowd:",
      "surge.alert": "High demand near {name}. Expect longer waits and leave a bit earlier.",
      "extras.aria": "Walking and fare hints",
      "route.unavailable": "Route unavailable",
      "spot.header": "[LipaMove • Lipa City]",
      "spot.line_mode": "Spot (guide): ",
      "spot.line_coords": "Coords: ",
      "spot.line_map": "Map: ",
      "spot.footer": "(Not EMS — meetup/reference only; verify separately.)",
      "spot.memo_prefix": "\nReminder: ",
      "datasaver.on_toast": "Data saver: fewer live data pulls.",
      "datasaver.off_toast": "Back to more frequent live pulls.",
      "profile.label_email": "Email",
      "profile.label_phone": "Phone",
      "profile.label_id": "User ID",
      "guide.notify_15": "15 minutes",
      "guide.notify_10": "10 minutes",
      "guide.notify_7": "7 minutes",
      "guide.notify_5": "5 minutes",
      "guide.notify_3": "3 minutes",
      "weather.malinaw": "Clear skies",
      "weather.makulimlim": "Partly cloudy",
      "weather.fog": "Fog/mist",
      "weather.ulan_posible": "Possible rain",
      "weather.showers": "Rain showers",
      "weather.ulan_malakas": "Heavy rain",
      "weather.kulog": "Thunderstorms",
      "weather.default": "Weather guide only",
      "weather.fetch_fail": "Couldn't load weather.",
      "datasaver.short_on": "on",
      "datasaver.short_off": "off",
      "map.wait_pin_title": "Pinned waiting spot",
      "chip.refresh_title": "Refresh ETA or live positions",
      "chip.copy_spot": "Copy spot",
      "chip.copy_spot_title": "Copy your meeting / SOS spot location",
      "chip.lang_label": "Language",
      "lang.en": "English",
      "lang.tl": "Tagalog",
      "gps.toggle_title": "Live tracking of vehicles on the route.",
      "gps.no_units": "Live tracking: No units loaded",
      "gps.server": "Live tracking: Server",
      "gps.on": "Live tracking: On",
      "gps.paused": "Live tracking: Paused",
      "fleet.truth_live": "Positions: Live (server)",
      "fleet.truth_live_title": "Positions synced from database / Socket.io — not simulated.",
      "fleet.truth_sim": "Positions: Simulated demo",
      "fleet.truth_sim_title": "Markers move from a demo model — not real GPS.",
      "fleet.truth_xml": "Positions: data.xml",
      "fleet.truth_xml_title": "Locations from data.xml (polling). No live ingest.",
      "home.nearest_label": "Closest rides",
      "home.nearest_tagline": "Nearest rides from your chosen spot, with simple ETA bands.",
      "home.eta_basis": "ETA from",
      "home.opt_gps": "📍 My location (GPS)",
      "home.opt_map": "◎ Map center (drag map)",
      "home.opt_pin": "📌 Pinned waiting spot (long-press map)",
      "home.opt_stop_sm": "🏢 SM Lipa Grand Terminal",
      "home.opt_stop_bayan": "🏢 Bayan (T.M. Kalaw)",
      "home.opt_stop_ub": "🏢 Univ. of Batangas Lipa",
      "home.opt_stop_outlets": "🏢 The Outlets at Lipa",
      "home.show_vehicle": "Show vehicles",
      "home.filter_all": "All",
      "home.sort_label": "Sort list",
      "home.sort_distance": "Closest first (distance)",
      "home.sort_eta": "Soonest ETA first",
      "home.sort_crowd": "Comfort first (lower crowd)",
      "home.checklist_title": "Trip checklist (saved on device)",
      "home.prep_umbrella": "Umbrella / fan",
      "home.prep_fare": "Fare coins ready",
      "home.prep_phone": "Phone load / charged",
      "home.prep_water": "Water / small snack",
      "home.memo_label": "Notes / memo for this trip",
      "home.memo_placeholder": "e.g. HOME 5pm — SM Terminal lane …",
      "home.nearest_summary_title": "Closest",
      "home.plan_trip": "Plan Trip",
      "home.share_eta": "Share ETA",
      "home.copy_spot_btn_title": "Share location with companions",
      "home.lang_mini": "Language",
      "plan.intro": "Pick start and destination to open directions quickly.",
      "plan.track_unit": "Track unit (for destination)",
      "plan.loading": "Loading…",
      "plan.summary_default": "Select a ride on the map feed or choose a fixed stop above.",
      "plan.open_maps": "Open in Google Maps",
      "guide.title": "Commuter guide",
      "guide.intro": "Tips and tools for daily LipaMove — prediction, not booking.",
      "guide.traffic_now": "Traffic now",
      "guide.calculating": "Calculating…",
      "guide.major_stops": "Major stops (quick map)",
      "guide.major_stops_hint":
        "Jump the map to a terminal — you can also pick this under ETA from on Home.",
      "guide.reminders_title": "Near-me reminders",
      "guide.reminders_body":
        "Sends one browser notification when the closest listed ride's ETA band reaches your threshold (not perfect when the tab is closed).",
      "guide.notify_when": "When closest ETA is within",
      "guide.notify_off": "Off",
      "guide.notify_min": "{n} minutes",
      "guide.notify_allow": "Allow notifications",
      "guide.eta_expl_title": "How ETA works",
      "guide.eta_li1": "Uses distance from your chosen point (GPS, map center, or terminal) and a simple traffic model.",
      "guide.eta_li2": "The band (e.g. 5–8 min) is a guide, not a guarantee — especially if data is stale.",
      "guide.eta_li3": "With a live IoT feed it's tighter; simulation is best for demos.",
      "guide.weather_title": "Weather in Lipa (guide only)",
      "guide.weather_note": "From Open-Meteo, no API key — useful for rain / commute timing.",
      "guide.weather_loading": "Loading weather…",
      "guide.weather_refresh": "Refresh weather",
      "guide.map_key_title": "What you see on the map",
      "guide.map_li1": "Orange pin — jeepney; blue — Batrasco-style unit.",
      "guide.map_li2": "Orange / blue route lines — estimated path per unit from data.xml.",
      "guide.map_li3": "Cyan line with dots — core terminal loop reference.",
      "guide.map_li4": "Small blue dot — you after Locate me.",
      "guide.bring_title": "Commuter carry list",
      "guide.bring_li1": "Fan or umbrella — Lipa weather shifts quickly.",
      "guide.bring_li2": "Fare coins ready — faster than digging while queued.",
      "guide.bring_li3": "Use Priority unit (★ on the card) if you ride the same route often.",
      "guide.bring_li4": "If unsure about ETA, check crowd bars and the Confidence chip.",
      "guide.emergency_title": "Emergency & services",
      "guide.emergency_li1": "Philippines emergency hotline: 911 (where supported).",
      "guide.emergency_li2": "For urgent help at terminals, ask terminal guards / staff.",
      "guide.emergency_li3": "LipaMove is for ETA / tracking — not official operator dispatch.",
      "guide.access_title": "Accessibility — larger text",
      "guide.access_zoom": "Increase app font size (this device only)",
      "guide.datasaver_title": "Data saver (live feed)",
      "guide.datasaver_note":
        "Slower auto-refresh of data.xml to save mobile data. Simulation is unaffected.",
      "guide.datasaver-checkbox": "Fewer pulls (~22s) vs default (~7s)",
      "guide.peak_title": "Typical crowding (guide)",
      "guide.peak_note":
        "Not official operator schedules — Lipa corridor habits plus the app's traffic model.",
      "guide.peak_th_window": "Window",
      "guide.peak_th_expect": "What to expect",
      "guide.peak_r1": "6:00–9:00",
      "guide.peak_r1t": "Higher demand (morning commute / school)",
      "guide.peak_r2": "11:00–14:00",
      "guide.peak_r2t": "Moderate crowding (lunch)",
      "guide.peak_r3": "17:00–20:00",
      "guide.peak_r3t": "Peak evening — wider ETA bands",
      "guide.peak_r4": "Sun / holiday",
      "guide.peak_r4t": "Varies — watch live demand on cards",
      "guide.phrases_title": "Quick Filipino phrases",
      "guide.phrases_hint": "Tap to copy (fare / courtesy).",
      "share.title": "Share ETA",
      "share.intro": "Pick a vehicle and share an ETA band with family or friends.",
      "share.unit": "Unit",
      "share.copy": "Copy message",
      "share.native": "Share…",
      "share.sms": "Open in SMS",
      "auth.title": "Account",
      "auth.intro": "Sign up or log in for a personalized experience.",
      "auth.login_tab": "Log in",
      "auth.signup_tab": "Sign up",
      "auth.username": "Username",
      "auth.password": "Password",
      "auth.email": "Email",
      "auth.mobile": "Mobile number",
      "auth.login_submit": "Log in",
      "auth.signup_submit": "Create account",
      "profile.title": "Your profile",
      "profile.not_signed": "Not signed in. Open Account to log in.",
      "profile.logout": "Log out",
      "nav.back": "Back",
      "nav.map": "Map",
      "nav.plan": "Plan",
      "nav.guide": "Guide",
      "nav.share": "Share",
      "nav.account": "Account",
      "nav.profile": "Profile",
      "nav.acct_short": "Acct",
      "tracking.title": "Now tracking",
      "tracking.center": "Center",
      "tracking.share": "Share",
      "tracking.clear": "Clear",
      "basis.gps_ok": "Using your GPS for distance and ETA.",
      "basis.gps_missing":
        "No GPS — temporarily using map center. Tap Locate me or pick a terminal.",
      "basis.map_center": "Using map center: drag the map to where you're waiting.",
      "basis.pin_ok": "Pinned waiting spot is used for ETA. Long-press the map again to move.",
      "basis.pin_missing": "No pinned spot yet. Long-press the map to drop one.",
      "basis.waiting_stop": "As if waiting near {name}.",
      "notify.off": "Reminders off.",
      "notify.no_browser": "Notifications not supported in this browser.",
      "notify.granted": "Active: one alert when closest ETA ≤ {thr} min.",
      "notify.denied": "Notifications blocked — change in browser settings.",
      "notify.need_perm": "Tap the button above to allow.",
      "rush.weekend":
        "Weekend: crowds and rain often differ — watch demand on cards and weather. ",
      "rush.period_am": "morning rush",
      "rush.period_pm": "evening rush",
      "rush.period_lunch": "lunchtime",
      "rush.period_normal": "normal hours",
      "rush.note_wide": "Expect wider ETA bands; leave extra time.",
      "rush.note_slight": "Slightly slower averages; trust the ETA band on each card.",
      "rush.note_light": "Lighter traffic model; midpoint ETA is more reliable.",
      "confidence.sim_high": "Confidence: High (sim)",
      "confidence.server_high": "Confidence: High (server)",
      "confidence.server_med": "Confidence: Medium (server)",
      "confidence.server_low": "Confidence: Low (server stale)",
      "confidence.low": "Confidence: Low",
      "confidence.medium": "Confidence: Medium",
      "confidence.high": "Confidence: High",
      "fresh.live_sim": "Updated: live sim",
      "fresh.server": "Updated: server {s}s ago",
      "fresh.stale": "Updated: stale {s}s",
      "fresh.seconds": "Updated: {s}s ago",
      "nearest.none_filtered": "No vehicles match your filter. Choose All.",
      "nearest.straight_line": "(straight-line distance)",
      "card.density_high": "Higher occupancy",
      "card.density_low": "Lighter occupancy",
      "card.priority_on": "Priority: {id} ★",
      "card.priority_off": "Removed priority unit.",
      "fare.lt025": "Very close — keep fare coins handy.",
      "fare.lt12": "Rough fare guide (not LTFRB official): ~₱12–₱16.",
      "fare.lt3": "Rough guide: ~₱15–₱22 — ask the conductor.",
      "fare.lt6": "Rough guide: ~₱20–₱28+.",
      "fare.long": "Long straight-line gap — check terminal fare tables.",
      "walk.terminal":
        "Walk toward {name}: ~{mins} min (~{km} km straight-line — actual walking path may be longer).",
      "extras.walk_line":
        "From your spot: ~{wmins} min walk (~{km} km straight-line) before boarding. ",
      "tooltip.boarding": "Boarding stop",
      "tooltip.server_speed": "{id} · {sp} km/h (server)",
      "tooltip.live_speed": "{id} · {sp} km/h (live)",
      "tooltip.sim_speed": "{id} · {sp} km/h",
      "tooltip.paused": "{id} · Live feed paused",
      "share.msg.none": "No ride data.",
      "share.pick_unit": "No unit selected.",
      "share.copied": "Message copied.",
      "share.no_native": "No native share — copied to clipboard.",
      "plan.no_data": "No ride data.",
      "feed.pull_hint": "Live pull — tap Refresh or check connection / data.xml.",
      "weather.updated_toast": "Weather updated.",
      "weather.none": "No weather data.",
      "weather.offline": "Offline — can't fetch weather.",
      "weather.home_prefix": "☀ Weather: ",
      "phrase.copied": "Phrase copied.",
      "toast.spot_set": "Pinned waiting spot set.",
      "toast.spot_center": "Pinned waiting spot set at map center.",
      "toast.copy_spot": "Copied spotting point.",
      "toast.online": "Back online.",
      "toast.offline": "Offline — live updates limited.",
      "toast.refresh_eta": "Refreshed ETAs.",
      "toast.feed_updated": "Updated data.xml and live fleet.",
      "toast.feed_xml_fail": "Could not reload data.xml.",
      "toast.tracking_cleared": "Tracking cleared.",
      "toast.centered": "Centered on tracked unit.",
      "toast.nearest_mode": "Nearest ride focused.",
      "toast.map_eta": "Map + ETA: {name}",
      "locate.no_gps": "No GPS support",
      "locate.loading": "Locating…",
      "locate.no_map": "No map",
      "locate.done": "Nearest ride focused",
      "locate.me": "Locate me",
      "locate.blocked": "Location blocked",
      "fit.all": "Fit all rides",
      "star.title_off": "Priority unit ★",
      "star.title_on": "Remove priority unit",
      "share.build":
        "LipaMove: {id} ({type}) — {route}. ~{eta} min ETA, {km} km from my spot.",
      "jeepney": "Jeepney",
      "batra": "Batra jeepney",
      "eta_suffix": " min ETA",
      "plan.summary_tracking": "Tracking {id} — ETA ~{eta} min (from your spot).",
      "plan.summary_pick": "Pick a unit from the list or map.",
      "auth.fill_all": "Fill in all fields.",
      "auth.email_invalid": "Email must include @ and a domain (e.g. name@gmail.com).",
      "auth.user_short": "Username must be at least 3 characters.",
      "auth.register_fail": "Register failed",
      "auth.signup_ok": "Signed up successfully.",
      "auth.api_unreachable_register": "API unreachable. Run: cd server && npm install && npm start",
      "auth.need_credentials": "Enter username and password.",
      "auth.login_fail": "Login failed",
      "auth.logged_in": "Logged in.",
      "auth.api_unreachable_login": "API unreachable. Start the Node server from the server folder.",
      "profile.load_fail": "Could not load profile. Is the API running?",
      "map.no_leaflet":
        'Map did not start (Leaflet failed to load). Serve this app over HTTP (e.g. run start-server.bat or npm start in the server folder) so vendor/leaflet/leaflet.js loads. Navigation and Account still work.',
      "map.no_units_xml":
        'No units found in data.xml. Add fleet_management > unit entries with route points.',
      "map.feed_fail":
        "Could not load the live feed. Serve the project over HTTP and check data.xml.",
      "tracking.mini.none": "Select a ride from the map or list.",
      "tracking.mini_eta": "~{eta} min ETA band · {km} km",
    },
    tl: {
      "map.headline": "Saan na ang sakay?",
      "map.sub": "Madaling makita kung saan na ang masasakyan, para mas simple at panatag ang biyahe.",
      "pill.live_tracking": "Live vehicle tracking",
      "pill.server_feed": "Server live PUV feed",
      "pill.sim_paused": "Live tracking paused",
      "pill.preparing": "Inihahanda ang live route data…",
      "chip.live_updates": "Live updates",
      "chip.route_tooltip": "Ayala / J.P. Laurel (walang bypass)",
      "chip.route_label": "Ayala / J.P. Laurel (walang bypass)",
      "net.online": "Online",
      "net.offline": "Offline",
      "nearest.landmark":
        "Mga ~{km} km ka mula sa {name} (sanggunian sa tuwid na linya mula sa punto ng ETA).",
      "feed.puv_socket":
        "PUV positions: real-time mula sa LipaMove server (Socket.io). I-tap ang Live tracking para bumalik sa local simulation.",
      "feed.socket_connecting":
        "Kumokonekta sa live PUV server… (kung walang telemetry, mananatili ang simulation / data.xml.)",
      "feed.sim_guide":
        'Simulation — ang ETA ay gabay lamang (★ priority unit mo). Gamitin ang Ayusin listahan para sa mas magaan na sakay.',
      "feed.last_pull":
        "Huling pull ng live feed: {ago} — auto kada ~{poll}s (data saver: {ds}).",
      "notify.perm_granted_toast": "Sige — mag-aalerto kapag malapit na ang pinakamalapit na sasakyan.",
      "notify.unsupported_toast": "Hindi suportado ang notifications dito.",
      "notify.popup_title": "LipaMove — malapit na",
      "notify.popup_body": "{id}: humigit-kumulang {upper} min (pinakamataas sa hanay).",
      "share.sms_fallback": "Kung hindi bumukas ang SMS app, gamitin ang Copy message.",
      "plan.fleet_loading": "Naglo-load pa ang fleet o walang data.xml.",
      "plan.map_not_ready": "Hindi pa handa ang map.",
      "plan.any_unit": "Anumang unit / pumili sa map",
      "popup.crowd": "Siksikan:",
      "surge.alert":
        "Mataas ang demand malapit sa {name}. Asahan ang mas matagal na paghihintay at maglaan nang mas maaga.",
      "extras.aria": "Gabay sa lakad at pamasada",
      "route.unavailable": "Walang available na ruta",
      "spot.header": "[LipaMove • Lipa City]",
      "spot.line_mode": "Spot (gabay): ",
      "spot.line_coords": "Coords: ",
      "spot.line_map": "Map: ",
      "spot.footer": "(Hindi ito EMS — meetup/reference lamang; i-verify pa.)",
      "spot.memo_prefix": "\nAlalahanin: ",
      "datasaver.on_toast": "Data saver: mas kaunting data sa live pull.",
      "datasaver.off_toast": "Balik sa mas madalas na live pull.",
      "profile.label_email": "Email",
      "profile.label_phone": "Phone",
      "profile.label_id": "User ID",
      "guide.notify_15": "15 minuto",
      "guide.notify_10": "10 minuto",
      "guide.notify_7": "7 minuto",
      "guide.notify_5": "5 minuto",
      "guide.notify_3": "3 minuto",
      "weather.malinaw": "Malinaw ang langit",
      "weather.makulimlim": "Bahagyang makulimlim",
      "weather.fog": "Fog/mist",
      "weather.ulan_posible": "Posibleng ulan",
      "weather.showers": "Biglaang showers",
      "weather.ulan_malakas": "Malakas na ulan",
      "weather.kulog": "Kulog at ulan",
      "weather.default": "Gabay lamang na lagay ng panahon",
      "weather.fetch_fail": "Hindi makuha ang weather.",
      "datasaver.short_on": "on",
      "datasaver.short_off": "off",
      "map.wait_pin_title": "Pinned waiting spot",
      "chip.refresh_title": "I-refresh ang ETA o live positions",
      "chip.copy_spot": "Kopyahin spot",
      "chip.copy_spot_title": "Kopyahin ang lokasyon ng spot mo (meetup/SOS gabay)",
      "chip.lang_label": "Wika",
      "lang.en": "English",
      "lang.tl": "Tagalog",
      "gps.toggle_title": "Live tracking ng mga sasakyan sa ruta.",
      "gps.no_units": "Live tracking: Walang units na na-load",
      "gps.server": "Live tracking: Server",
      "gps.on": "Live tracking: On",
      "gps.paused": "Live tracking: Naka-pause",
      "fleet.truth_live": "Positions: Live (server)",
      "fleet.truth_live_title":
        "May naka-sync na posisyon mula sa database / Socket.io — hindi simulated.",
      "fleet.truth_sim": "Positions: Simulated demo",
      "fleet.truth_sim_title": "Gumagalaw ang mga marker batay sa modelo — hindi tunay na GPS.",
      "fleet.truth_xml": "Positions: data.xml",
      "fleet.truth_xml_title":
        "Naghuhugot ng lokasyon mula sa data.xml (poll). Walang live ingest.",
      "home.nearest_label": "Mga pinakamalapit na sakay",
      "home.nearest_tagline":
        "Pinaka-malalapit na sakay mula sa lokasyon mo, may simple ETA para madaling pumili.",
      "home.eta_basis": "ETA mula sa",
      "home.opt_gps": "📍 Lokasyon ko (GPS)",
      "home.opt_map": "◎ Gitna ng mapa (i-drag)",
      "home.opt_pin": "📌 Pinned waiting spot (long-press map)",
      "home.opt_stop_sm": "🏢 SM Lipa Grand Terminal",
      "home.opt_stop_bayan": "🏢 Bayan (T.M. Kalaw)",
      "home.opt_stop_ub": "🏢 Univ. ng Batangas Lipa",
      "home.opt_stop_outlets": "🏢 The Outlets at Lipa",
      "home.show_vehicle": "Ipakita ang sasakyan",
      "home.filter_all": "Lahat",
      "home.sort_label": "Ayusin ang listahan",
      "home.sort_distance": "Pinakamalapit muna (layo)",
      "home.sort_eta": "Maaga ang dating (ETA)",
      "home.sort_crowd": "Komportable muna (hindi overloaded)",
      "home.checklist_title": "Biyahe checklist (naka-save sa phone)",
      "home.prep_umbrella": "Payong / paypay",
      "home.prep_fare": "Barya (sakay)",
      "home.prep_phone": "Load / charged phone",
      "home.prep_water": "Tubig / maliit na snack",
      "home.memo_label": "Alalahanin / memo ngayong biyahe",
      "home.memo_placeholder": "Hal. UWIAN 5pm — SM Terminal hilera ng…",
      "home.nearest_summary_title": "Pinaka-malapit",
      "home.plan_trip": "Plan Trip",
      "home.share_eta": "Share ETA",
      "home.copy_spot_btn_title": "Lagyan ng lokasyon para sa mga kasama",
      "home.lang_mini": "Wika",
      "plan.intro": "Piliin ang simula at pupuntahan para mabilis mong makita ang direksyon.",
      "plan.track_unit": "Track unit (para sa destinasyon)",
      "plan.loading": "Naglo-load…",
      "plan.summary_default":
        "Pumili ng ride sa map feed o pumili ng fixed stop sa taas.",
      "plan.open_maps": "Buksan sa Google Maps",
      "guide.title": "Gabay sa commuter",
      "guide.intro":
        "Mga tip at tool para mas gamitin ang LipaMove araw-araw — prediksyon, hindi booking.",
      "guide.traffic_now": "Trapik ngayon",
      "guide.calculating": "Kinakalkula…",
      "guide.major_stops": "Major stops (mabilis na mapa)",
      "guide.major_stops_hint":
        "Ilipat ang mapa papunta sa terminal — maaari mo ring piliin ito sa ETA mula sa sa home.",
      "guide.reminders_title": "Paalala kapag malapit na",
      "guide.reminders_body":
        "Nagpapadala ng isang browser notification kapag ang pinakamalapit na sasakyan ay nasa iyong hanay ng minuto (hindi perpekto kapag nakasara ang tab).",
      "guide.notify_when": "Kapag pinakamalapit na ETA ay hanggang",
      "guide.notify_off": "Naka-off",
      "guide.notify_min": "{n} minuto",
      "guide.notify_allow": "Pahintulutan ang notifications",
      "guide.eta_expl_title": "Paliwanag ng ETA",
      "guide.eta_li1":
        "Ginagamit ang layo sa iyong punto (GPS, gitna ng mapa, o terminal) at modelo ng trapik.",
      "guide.eta_li2":
        "Ang hanay ay gabay lamang, hindi garantiya — lalo na kung luma na ang datos.",
      "guide.eta_li3":
        "Kapag may live IoT feed mas tumpak; ang simulation ay pinakamahusay para sa demo.",
      "guide.weather_title": "Weather sa Lipa (gabay lang)",
      "guide.weather_note":
        "Mula Open-Meteo, walang API key — maaari mong isaalang-alang kapag uwian o ulan.",
      "guide.weather_loading": "Sinisimulan ang weather…",
      "guide.weather_refresh": "I-refresh ang weather",
      "guide.map_key_title": "Ano ang makikita sa map",
      "guide.map_li1": "Orange icon — jeepney; asul — batrasco.",
      "guide.map_li2": "Orange o asul na linya — tinatayong ruta mula sa data.xml.",
      "guide.map_li3": "Cyan na linya — pangunahing loop terminals.",
      "guide.map_li4": "Maliit na asul na tuldok — ikaw pagkatapos ng Locate me.",
      "guide.bring_title": "Mga bitbit sa commuter",
      "guide.bring_li1": "Paypay o payong — mabilis lumipat ang panahon sa Lipa.",
      "guide.bring_li2": "Barya naka-hand para sa sakay.",
      "guide.bring_li3":
        "Gamitin ang Priority unit (★ sa card) kung lagi mong sinasakyang ruta.",
      "guide.bring_li4":
        "Kung hindi sigurado sa ETA, tingnan ang demand at ang Confidence chip.",
      "guide.emergency_title": "Emergency at serbisyo",
      "guide.emergency_li1":
        "National Emergency Hotline Philippines: 911 (kung gumagana sa iyong lugar/network).",
      "guide.emergency_li2":
        "Para medical/pulis: humingi ng lugar sa mga guwardiya sa terminal kapag urgent.",
      "guide.emergency_li3":
        "Ang LipaMove ay para sa ETA/tracking lamang — hindi official dispatch ng operator.",
      "guide.access_title": "Accessibility — mas malaking texto",
      "guide.access_zoom": "Dagdagan laki ng font ng buong app (sa device mo lang)",
      "guide.datasaver_title": "Data saver (live feed)",
      "guide.datasaver_note":
        "Mas mabagal ang auto-refresh ng data.xml para tipid sa mobile data.",
      "guide.datasaver-checkbox": "Mas kaunting pull (≈22s) kaysa default (≈7s)",
      "guide.peak_title": "Tipikal na siksikan (gabay lamang)",
      "guide.peak_note":
        "Hindi opisyal na oras ng operator — karaniwang Lipa corridor at modelo ng app.",
      "guide.peak_th_window": "Window",
      "guide.peak_th_expect": "Inaasahan",
      "guide.peak_r1": "6:00–9:00",
      "guide.peak_r1t": "Mataas ang demand (pasok / pa-eskwela)",
      "guide.peak_r2": "11:00–14:00",
      "guide.peak_r2t": "Banayad na siksikan (tanghalian)",
      "guide.peak_r3": "17:00–20:00",
      "guide.peak_r3t": "Peak uwian — mas malawak ang ETA",
      "guide.peak_r4": "Linggo / holiday",
      "guide.peak_r4t": "Mag-iba — tingnan ang live demand sa card",
      "guide.phrases_title": "Mabilis na sasakyan phrases",
      "guide.phrases_hint": "Tap para kopyahin (pakiusap / bayad).",
      "share.title": "Share ETA",
      "share.intro":
        "Piliin ang sasakyan at i-share ang estimated dating sa pamilya o kaibigan.",
      "share.unit": "Unit",
      "share.copy": "Copy message",
      "share.native": "Share…",
      "share.sms": "Buksan sa SMS (text)",
      "auth.title": "Account",
      "auth.intro": "Mag-sign up o mag-log in para sa personalized na experience.",
      "auth.login_tab": "Log in",
      "auth.signup_tab": "Sign up",
      "auth.username": "Username",
      "auth.password": "Password",
      "auth.email": "Email",
      "auth.mobile": "Mobile number",
      "auth.login_submit": "Log in",
      "auth.signup_submit": "Create account",
      "profile.title": "Your profile",
      "profile.not_signed": "Hindi naka-sign in. Buksan ang Account para mag-log in.",
      "profile.logout": "Log out",
      "nav.back": "Balik",
      "nav.map": "Mapa",
      "nav.plan": "Plano",
      "nav.guide": "Gabay",
      "nav.share": "I-share",
      "nav.account": "Account",
      "nav.profile": "Profile",
      "nav.acct_short": "Acct",
      "tracking.title": "Sinusundan",
      "tracking.center": "Center",
      "tracking.share": "Share",
      "tracking.clear": "Clear",
      "basis.gps_ok": "Ginagamit ang GPS mo para sa layo at ETA.",
      "basis.gps_missing":
        "Walang GPS — pansamantalang gumagamit ng gitna ng mapa. Pindutin ang Locate me o pumili ng terminal.",
      "basis.map_center": "Ginagamit ang gitna ng mapa: i-drag ang mapa kung saan ka nag-aabang.",
      "basis.pin_ok":
        "Pinned waiting spot ang gamit sa ETA. Long-press ulit sa map para ilipat.",
      "basis.pin_missing": "Wala pang pinned waiting spot. Long-press sa map para maglagay.",
      "basis.waiting_stop": "Parang nag-aantay ka sa {name}.",
      "notify.off": "Naka-off ang paalala.",
      "notify.no_browser": "Hindi suportado ang notifications sa browser na ito.",
      "notify.granted":
        "Active: isa-isang alert kapag pinaka-malapit na ETA ay ≤ {thr} min.",
      "notify.denied": "Blocked ang notifications — baguhin sa browser settings.",
      "notify.need_perm": "Pindutin ang button sa itaas para payagan.",
      "rush.weekend":
        "Linggo o Sabado: kadalasang iba ang ulan at daloy ng tao — basahin ang demand sa mga card at ang ulat ng panahon. ",
      "rush.period_am": "rush hour umaga",
      "rush.period_pm": "rush hour hapon/gabi",
      "rush.period_lunch": "tanghalian",
      "rush.period_normal": "karaniwang oras",
      "rush.note_wide": "Mas malawak dapat ang ETA range; maglaan ng ekstra panahon.",
      "rush.note_slight":
        "Bahagyang mas mabagal ang average; subukan ang hanay ng ETA sa listahan.",
      "rush.note_light":
        "Mas magagaan ang modelo ng trapik; mas maaasahan ang midpoint ng ETA.",
      "confidence.sim_high": "Confidence: High (sim)",
      "confidence.server_high": "Confidence: High (server)",
      "confidence.server_med": "Confidence: Medium (server)",
      "confidence.server_low": "Confidence: Low (server stale)",
      "confidence.low": "Confidence: Low",
      "confidence.medium": "Confidence: Medium",
      "confidence.high": "Confidence: High",
      "fresh.live_sim": "Updated: live sim",
      "fresh.server": "Updated: server {s}s ago",
      "fresh.stale": "Updated: stale {s}s",
      "fresh.seconds": "Updated: {s}s ago",
      "nearest.none_filtered":
        "Walang sasakyang tumutugma sa filter mo. Piliin ang Lahat.",
      "nearest.straight_line": "(tuwid na linya)",
      "card.density_high": "Mataas ang sakay",
      "card.density_low": "Magaan ang sakay",
      "card.priority_on": "Priority: {id} ★",
      "card.priority_off": "Tinanggal ang priority unit.",
      "fare.lt025": "Sobrang lapit na — handang barya.",
      "fare.lt12":
        "Tantiyang pamasada (hindi opisyal na LTFRB matrix): ~₱12–₱16.",
      "fare.lt3": "Tantiya lang: ~₱15–₱22 — magtanong sa kundoktor.",
      "fare.lt6": "Tantiya lang: ~₱20–₱28+.",
      "fare.long": "Mahaba ang tuwid na layo — kumunsulta sa taripa sa terminal.",
      "walk.terminal":
        "Kung lakad papunta sa {name}: ~{mins} min (\u2248{km} km tuwid — maaaring mas mahaba sa aktwal na daan).",
      "extras.walk_line":
        "Mula sa punto mo: ~{wmins} min lakad (\u2248{km} km tuwid) bago sumampa. ",
      "tooltip.boarding": "Boarding stop",
      "tooltip.server_speed": "{id} · {sp} km/h (server)",
      "tooltip.live_speed": "{id} · {sp} km/h (live)",
      "tooltip.sim_speed": "{id} · {sp} km/h",
      "tooltip.paused": "{id} · Live feed paused",
      "share.msg.none": "Walang ride data.",
      "share.pick_unit": "Walang napiling unit.",
      "share.copied": "Nakopya na ang mensahe.",
      "share.no_native": "Walang native share — nakopya sa clipboard.",
      "plan.no_data": "Walang ride data.",
      "feed.pull_hint":
        'Live pull — tap "Refresh" o i-check ang connection / data.xml.',
      "weather.updated_toast": "Weather na-update.",
      "weather.none": "Walang datos ng weather.",
      "weather.offline": "Offline — hindi makukuha ang weather.",
      "weather.home_prefix": "\u2638 Weather: ",
      "phrase.copied": "Nakopya ang phrase.",
      "toast.spot_set": "Pinned waiting spot set.",
      "toast.spot_center": "Pinned waiting spot set at gitna ng mapa.",
      "toast.copy_spot": "Na-copy ang spotting point.",
      "toast.online": "Online na muli.",
      "toast.offline": "Offline — limitado ang live update.",
      "toast.refresh_eta": "Na-refresh ang mga ETA.",
      "toast.feed_updated": "Na-update ang data.xml at live fleet.",
      "toast.feed_xml_fail": "Hindi makuhang muli ang data.xml.",
      "toast.tracking_cleared": "Tracking cleared.",
      "toast.centered": "Centered on tracked unit.",
      "toast.nearest_mode": "Nearest ride focused.",
      "toast.map_eta": "Mapa + ETA: {name}",
      "locate.no_gps": "Walang GPS support",
      "locate.loading": "Kinukuha ang lokasyon…",
      "locate.no_map": "Walang map",
      "locate.done": "Nahanap ang pinakamalapit",
      "locate.me": "Locate me",
      "locate.blocked": "Na-block ang lokasyon",
      "fit.all": "Fit all rides",
      "star.title_off": "Priority unit ★",
      "star.title_on": "Tanggalin sa priority unit",
      "share.build":
        "LipaMove: {id} ({type}) — {route}. ~{eta} min ETA, {km} km mula sa spot ko.",
      "jeepney": "Jeepney",
      "batra": "Batra jeepney",
      "eta_suffix": " min ETA",
      "plan.summary_tracking":
        "Sinusundan ang {id} — ETA ~{eta} min (mula sa spot mo).",
      "plan.summary_pick": "Pumili ng unit sa listahan o sa map.",
      "auth.fill_all": "Sagutan ang lahat ng field.",
      "auth.email_invalid":
        "Kailangan ng email na may @ at domain (hal. name@gmail.com).",
      "auth.user_short": "Username dapat hindi bababa sa 3 characters.",
      "auth.register_fail": "Hindi nag-register",
      "auth.signup_ok": "Matagumpay ang sign up.",
      "auth.api_unreachable_register":
        "Di makontak ang API. Takbo: cd server && npm install && npm start",
      "auth.need_credentials": "Ilagay ang username at password.",
      "auth.login_fail": "Hindi nag-log in",
      "auth.logged_in": "Naka-log in.",
      "auth.api_unreachable_login":
        "Di makontak ang API. Buksan ang Node server sa server folder.",
      "profile.load_fail":
        "Hindi ma-load ang profile. Gumagana ba ang API?",
      "map.no_leaflet":
        'Hindi nag-start ang map (Leaflet). I-serve ang app sa HTTP (hal. start-server.bat o npm start sa server folder) para mag-load ang vendor/leaflet/leaflet.js.',
      "map.no_units_xml":
        'Walang units sa data.xml. Magdagdag ng fleet_management > unit na may route points.',
      "map.feed_fail":
        "Hindi ma-load ang live feed. I-serve ang project sa HTTP at tingnan ang data.xml.",
      "tracking.mini.none": "Pumili ng ride sa map o listahan.",
      "tracking.mini_eta": "~{eta} min ETA band · {km} km",
    },
  };

  function getLocale() {
    var v = (global.localStorage && global.localStorage.getItem(STORAGE_KEY)) || DEFAULT_LOCALE;
    return v === "tl" ? "tl" : "en";
  }

  function setLocale(lang) {
    var L = lang === "tl" ? "tl" : "en";
    if (global.localStorage) {
      global.localStorage.setItem(STORAGE_KEY, L);
    }
    if (global.document && global.document.documentElement) {
      global.document.documentElement.lang = L === "tl" ? "tl" : "en";
    }
  }

  function t(key, vars) {
    var loc = getLocale();
    var s = (STRINGS[loc] && STRINGS[loc][key]) || STRINGS.en[key] || key;
    if (vars && typeof vars === "object") {
      Object.keys(vars).forEach(function (k) {
        s = s.split("{" + k + "}").join(String(vars[k]));
      });
    }
    return s;
  }

  function applyDom(root) {
    var scope = root || global.document;
    if (!scope || !scope.querySelectorAll) {
      return;
    }
    scope.querySelectorAll("[data-i18n]").forEach(function (el) {
      var key = el.getAttribute("data-i18n");
      if (!key) {
        return;
      }
      var val = t(key);
      if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") {
        /* skip text — use placeholder attr */
      } else {
        el.textContent = val;
      }
    });
    scope.querySelectorAll("[data-i18n-placeholder]").forEach(function (el) {
      var key = el.getAttribute("data-i18n-placeholder");
      if (key && (el.tagName === "INPUT" || el.tagName === "TEXTAREA")) {
        el.setAttribute("placeholder", t(key));
      }
    });
    scope.querySelectorAll("[data-i18n-title]").forEach(function (el) {
      var key = el.getAttribute("data-i18n-title");
      if (key) {
        el.setAttribute("title", t(key));
      }
    });
    scope.querySelectorAll("[data-i18n-aria]").forEach(function (el) {
      var key = el.getAttribute("data-i18n-aria");
      if (key) {
        el.setAttribute("aria-label", t(key));
      }
    });
    scope.querySelectorAll("option[data-i18n]").forEach(function (el) {
      var key = el.getAttribute("data-i18n");
      if (key) {
        el.textContent = t(key);
      }
    });
  }

  if (global.document && global.document.documentElement) {
    global.document.documentElement.lang = getLocale() === "tl" ? "tl" : "en";
  }

  global.LipaMoveI18n = {
    STORAGE_KEY: STORAGE_KEY,
    DEFAULT_LOCALE: DEFAULT_LOCALE,
    STRINGS: STRINGS,
    getLocale: getLocale,
    setLocale: setLocale,
    t: t,
    applyDom: applyDom,
  };
})(typeof window !== "undefined" ? window : globalThis);
