"use strict";

/**
 * Normalize PH-style mobile numbers to E.164 (+63…).
 * Keeps accounts from splitting across "+63917…", "0917…", "917…".
 */
function normalizePhone(phone) {
  if (phone == null || phone === "") {
    return "";
  }
  let s = String(phone).trim().replace(/\s+/g, "");
  let d = s.replace(/[^\d+]/g, "");
  if (d.startsWith("+")) {
    d = d.slice(1);
  }
  if (d.startsWith("63")) {
    return "+" + d;
  }
  if (d.startsWith("0") && d.length >= 10) {
    return "+63" + d.slice(1);
  }
  if (d.length === 10 && d[0] === "9") {
    return "+63" + d;
  }
  if (d.length >= 10) {
    return "+" + d;
  }
  return s.startsWith("+") ? s : "+" + d;
}

module.exports = { normalizePhone };
