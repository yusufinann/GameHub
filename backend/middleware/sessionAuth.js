export const sessionAuth = (req, res, next) => {
    if (req.session.user) {
      next(); // Kullanıcı oturumu varsa devam et
    } else {
      return res.status(401).json({ message: "Unauthorized. Please log in." });
    }
  };
  