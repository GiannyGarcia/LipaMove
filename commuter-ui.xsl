<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns="http://www.w3.org/1999/xhtml">
  <xsl:output method="xml" indent="yes" encoding="UTF-8"/>

  <xsl:template match="/">
    <html lang="en">
      <head>
        <title>LipaMove Commuter App</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <link rel="icon" href="Lipa Move log.png" type="image/png"/>
        <style>
          html, body {
            margin: 0;
            padding: 0;
            background: #020617;
            font-family: "Segoe UI", Arial, sans-serif;
            color: #e2e8f0;
          }
          body {
            min-height: 100vh;
            background:
              radial-gradient(circle at 20% 12%, rgba(14,165,233,.20), transparent 35%),
              radial-gradient(circle at 85% 90%, rgba(45,212,191,.18), transparent 35%),
              #020617;
          }
          .app {
            max-width: 440px;
            margin: 0 auto;
            min-height: 100vh;
            border-left: 1px solid rgba(255,255,255,.06);
            border-right: 1px solid rgba(255,255,255,.06);
            background: rgba(2, 6, 23, .68);
            box-shadow: 0 0 30px rgba(14,165,233,.18);
          }
          @media (min-width: 900px) {
            .app {
              max-width: none;
              display: grid;
              grid-template-columns: minmax(0, 1fr) min(400px, 36vw);
              align-items: stretch;
            }
            .map { min-height: 100vh; height: auto; border-bottom: none; border-right: 1px solid rgba(255,255,255,.08); }
            .cards { margin-top: 0; border-radius: 0; max-height: 100vh; overflow-y: auto; }
          }
          .map {
            position: relative;
            height: 56vh;
            min-height: 380px;
            border-bottom: 1px solid rgba(255,255,255,.08);
            overflow: hidden;
            background: #020617;
          }
          .map-frame {
            position: absolute;
            inset: 0;
            z-index: 0;
            border: 0;
            width: 100%;
            height: 100%;
          }
          .overlay {
            position: relative;
            z-index: 2;
          }
          .glass {
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            background: rgba(15, 23, 42, .56);
            border: 1px solid rgba(255,255,255,.14);
            border-radius: 26px;
          }
          .top {
            margin: 14px;
            padding: 12px 14px;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .brand-lockup { display: flex; flex-direction: column; align-items: flex-start; gap: 6px; min-width: 0; }
          .brand-logo { height: 40px; width: auto; max-width: min(200px, 50vw); object-fit: contain; object-position: left center; display: block; filter: drop-shadow(0 1px 2px rgba(0,0,0,.35)); }
          .headline { margin: 4px 0 0; font-size: 20px; font-weight: 700; }
          .pill {
            color: #2dd4bf;
            border: 1px solid rgba(45,212,191,.55);
            background: rgba(45,212,191,.12);
            border-radius: 999px;
            padding: 6px 10px;
            font-size: 12px;
          }
          .alert {
            margin: 8px 14px;
            padding: 10px 12px;
            border-radius: 16px;
            border: 1px solid rgba(251,113,133,.55);
            background: rgba(251,113,133,.12);
            color: #fb7185;
            animation: pulse 1.4s infinite;
            box-shadow: 0 0 22px rgba(251,113,133,.20);
            font-size: 13px;
          }
          .trend-row {
            margin: 0 14px;
            display: flex;
            gap: 8px;
            flex-wrap: wrap;
          }
          .trend-chip {
            border-radius: 999px;
            border: 1px solid rgba(14,165,233,.4);
            background: rgba(15,23,42,.65);
            color: #bae6fd;
            font-size: 11px;
            padding: 6px 9px;
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
          }
          .map-tint {
            position: absolute;
            inset: 0;
            z-index: 1;
            background:
              radial-gradient(circle at 10% 20%, rgba(14,165,233,.20), transparent 45%),
              radial-gradient(circle at 90% 90%, rgba(45,212,191,.18), transparent 38%),
              linear-gradient(180deg, rgba(2,6,23,.35), rgba(2,6,23,.62));
            pointer-events: none;
          }
          .marker {
            position: absolute;
            width: 10px;
            height: 10px;
            border-radius: 999px;
            animation: breathe 2.2s infinite;
            z-index: 3;
          }
          .marker::before {
            content: "";
            position: absolute;
            inset: -6px;
            border-radius: 999px;
            opacity: .45;
          }
          .high {
            background: #f59e0b;
            box-shadow: 0 0 0 1px rgba(245,158,11,.5), 0 0 24px rgba(245,158,11,.45);
          }
          .high::before { background: rgba(245,158,11,.45); }
          .low {
            background: #2dd4bf;
            box-shadow: 0 0 0 1px rgba(45,212,191,.5), 0 0 24px rgba(45,212,191,.45);
          }
          .low::before { background: rgba(45,212,191,.42); }
          .cards {
            margin-top: -18px;
            border-radius: 32px 32px 0 0;
            border-top: 1px solid rgba(255,255,255,.09);
            background: rgba(15, 23, 42, .45);
            padding: 14px;
          }
          .section-label {
            margin: 2px 0 10px;
            color: #94a3b8;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: .15em;
          }
          .local-copy {
            margin: -4px 0 10px;
            color: #67e8f9;
            font-size: 12px;
          }
          .eta-card {
            padding: 14px;
            margin-bottom: 10px;
            animation: slideUp .5s ease both;
          }
          .eta-top { display: flex; justify-content: space-between; gap: 10px; }
          .unit { color: #94a3b8; font-size: 11px; letter-spacing: .11em; text-transform: uppercase; }
          .route { margin-top: 4px; font-size: 14px; font-weight: 600; line-height: 1.35; }
          .eta {
            border-radius: 999px;
            border: 1px solid rgba(14,165,233,.5);
            background: rgba(14,165,233,.12);
            color: #0ea5e9;
            padding: 6px 10px;
            font-size: 12px;
            white-space: nowrap;
          }
          .crowd {
            margin-top: 10px;
            font-size: 12px;
            display: flex;
            justify-content: space-between;
            color: #94a3b8;
          }
          .bar-wrap {
            margin-top: 7px;
            width: 100%;
            height: 10px;
            border-radius: 999px;
            background: rgba(71,85,105,.6);
            overflow: hidden;
          }
          .bar {
            height: 100%;
            border-radius: 999px;
          }
          .bar-high { background: #f59e0b; }
          .bar-low { background: #2dd4bf; }
          .vtag {
            display: inline-block;
            margin-top: 6px;
            font-size: 10px;
            letter-spacing: .08em;
            text-transform: uppercase;
            border-radius: 999px;
            padding: 3px 8px;
            font-weight: 600;
          }
          .vtag-jeepney {
            border: 1px solid rgba(251,146,60,.5);
            color: #fdba74;
            background: rgba(251,146,60,.12);
          }
          .vtag-batrasco {
            border: 1px solid rgba(56,189,248,.5);
            color: #7dd3fc;
            background: rgba(56,189,248,.12);
          }
          @keyframes breathe {
            0% { transform: scale(1); opacity: .8; }
            50% { transform: scale(1.5); opacity: 1; }
            100% { transform: scale(1); opacity: .8; }
          }
          @keyframes pulse {
            0% { opacity: .8; }
            50% { opacity: 1; }
            100% { opacity: .8; }
          }
          @keyframes slideUp {
            from { transform: translateY(22px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
        </style>
      </head>
      <body>
        <div class="app">
          <section class="map">
            <iframe
              class="map-frame"
              title="Lipa Live Map"
              src="https://www.openstreetmap.org/export/embed.html?bbox=121.136%2C13.922%2C121.185%2C13.959&amp;layer=mapnik"
            ></iframe>
            <div class="map-tint"></div>
            <div class="overlay">
              <div class="top glass">
                <div class="brand-lockup">
                  <img src="Lipa Move log.png" class="brand-logo" alt="LipaMove"/>
                  <div class="headline">Track rides &amp; ETAs</div>
                </div>
                <div class="pill">Live Tracking</div>
              </div>

              <xsl:for-each select="lipamove_command_center/terminal_analytics/node">
                <xsl:if test="contains(surge_prediction_status, 'CRITICAL')">
                  <div class="alert glass">
                    <xsl:text>Uy, mataas ang demand sa </xsl:text>
                    <xsl:value-of select="name"/>
                    <xsl:text>. 3 units dispatched na.</xsl:text>
                  </div>
                </xsl:if>
              </xsl:for-each>

              <div class="trend-row">
                <span class="trend-chip">#RushHourReady</span>
                <span class="trend-chip">SM Lipa</span>
                <span class="trend-chip">Robinsons Lipa</span>
                <span class="trend-chip">Safe + Tipid Commute</span>
              </div>
            </div>
            <xsl:for-each select="lipamove_command_center/fleet_management/unit">
              <xsl:variable name="p" select="position()"/>
              <xsl:variable name="left">
                <xsl:choose>
                  <xsl:when test="$p = 1">31%</xsl:when>
                  <xsl:when test="$p = 2">47%</xsl:when>
                  <xsl:when test="$p = 3">60%</xsl:when>
                  <xsl:otherwise>69%</xsl:otherwise>
                </xsl:choose>
              </xsl:variable>
              <xsl:variable name="top">
                <xsl:choose>
                  <xsl:when test="$p = 1">42%</xsl:when>
                  <xsl:when test="$p = 2">56%</xsl:when>
                  <xsl:when test="$p = 3">62%</xsl:when>
                  <xsl:otherwise>46%</xsl:otherwise>
                </xsl:choose>
              </xsl:variable>
              <div>
                <xsl:attribute name="class">
                  <xsl:text>marker </xsl:text>
                  <xsl:choose>
                    <xsl:when test="contains(current_occupancy, 'High Density')">high</xsl:when>
                    <xsl:otherwise>low</xsl:otherwise>
                  </xsl:choose>
                </xsl:attribute>
                <xsl:attribute name="style">
                  <xsl:text>left:</xsl:text><xsl:value-of select="$left"/><xsl:text>;top:</xsl:text><xsl:value-of select="$top"/><xsl:text>;</xsl:text>
                </xsl:attribute>
              </div>
            </xsl:for-each>
          </section>

          <section class="cards">
            <div class="section-label">Commuter view — ETAs</div>
            <div class="local-copy">Static snapshot from XML. For animated map, open <code>index.xhtml</code> in a browser.</div>
            <xsl:for-each select="lipamove_command_center/fleet_management/unit">
              <xsl:variable name="ov" select="number(current_occupancy/@value)"/>
              <xsl:variable name="bar" select="round(($ov div 30) * 100)"/>
              <xsl:variable name="eta">
                <xsl:choose>
                  <xsl:when test="$ov &lt;= 10">4</xsl:when>
                  <xsl:when test="$ov &lt;= 18">5</xsl:when>
                  <xsl:when test="$ov &lt;= 24">6</xsl:when>
                  <xsl:otherwise>7</xsl:otherwise>
                </xsl:choose>
              </xsl:variable>
              <article class="eta-card glass">
                <div class="eta-top">
                  <div>
                    <div class="unit"><xsl:value-of select="@id"/></div>
                    <xsl:choose>
                      <xsl:when test="@vehicle_type = 'jeepney'">
                        <div class="vtag vtag-jeepney">Jeepney</div>
                      </xsl:when>
                      <xsl:otherwise>
                        <div class="vtag vtag-batrasco">Batra jeepney</div>
                      </xsl:otherwise>
                    </xsl:choose>
                    <div class="route"><xsl:value-of select="route_assignment"/></div>
                  </div>
                  <div class="eta"><xsl:value-of select="$eta"/> min ETA</div>
                </div>
                <div class="crowd">
                  <span>Crowd Level</span>
                  <xsl:choose>
                    <xsl:when test="contains(current_occupancy, 'High Density')">
                      <span style="color:#f59e0b;">High Density</span>
                    </xsl:when>
                    <xsl:otherwise>
                      <span style="color:#2dd4bf;">Low Density</span>
                    </xsl:otherwise>
                  </xsl:choose>
                </div>
                <div class="bar-wrap">
                  <div>
                    <xsl:attribute name="class">
                      <xsl:text>bar </xsl:text>
                      <xsl:choose>
                        <xsl:when test="contains(current_occupancy, 'High Density')">bar-high</xsl:when>
                        <xsl:otherwise>bar-low</xsl:otherwise>
                      </xsl:choose>
                    </xsl:attribute>
                    <xsl:attribute name="style">
                      <xsl:text>width:</xsl:text>
                      <xsl:choose>
                        <xsl:when test="$bar &lt; 8">8</xsl:when>
                        <xsl:when test="$bar &gt; 100">100</xsl:when>
                        <xsl:otherwise><xsl:value-of select="$bar"/></xsl:otherwise>
                      </xsl:choose>
                      <xsl:text>%;</xsl:text>
                    </xsl:attribute>
                  </div>
                </div>
              </article>
            </xsl:for-each>
          </section>
        </div>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
