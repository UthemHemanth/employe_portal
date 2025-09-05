const jwt = require("jsonwebtoken");

function verifycart(req, res, next) {
    const autheader = req.headers["authorization"];
    if (!autheader) return res.status(401).json({ message: "Authorization Invalid" });

    console.log(autheader);

    const parts = autheader.split(" "); //fourth chanhe
    const token = parts.length === 2 && parts[0] === "Bearer" ? parts[1] : null;


    console.log(token); // gives token

    if (!token) {
        return res.status(403).json({ message: "Invalid Token" });
    }

    try {
        const decode = jwt.verify(token, "abc123");
        console.log(decode)
        req.cart_user = decode;   // attach user to request
        next(); // 🚀 continue to next middleware or controller
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}

module.exports = { verifycart };
