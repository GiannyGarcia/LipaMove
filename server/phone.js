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

/** Philippine mobile in E.164 after normalization: +63 and 9 + nine digits (e.g. +639194748917). */
const PH_MOBILE_E164 = /^\+639\d{9}$/;

function isValidPhilippineMobileE164(normalized) {
  return PH_MOBILE_E164.test(String(normalized || ""));
}

module.exports = { normalizePhone, isValidPhilippineMobileE164 };
