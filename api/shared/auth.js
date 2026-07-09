/* Parse the Azure Static Web Apps client principal and check roles. */
function getPrincipal(req) {
  try {
    const header = req.headers["x-ms-client-principal"];
    if (!header) return null;
    const decoded = Buffer.from(header, "base64").toString("utf8");
    return JSON.parse(decoded);
  } catch (e) {
    return null;
  }
}

function isAdmin(req) {
  const p = getPrincipal(req);
  return !!(p && Array.isArray(p.userRoles) && p.userRoles.includes("admin"));
}

module.exports = { getPrincipal, isAdmin };
