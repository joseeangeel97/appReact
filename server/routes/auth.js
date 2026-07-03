import bcrypt from 'bcryptjs';

import { getAuthCollection } from '../db.js';

export function registerAuthRoutes(app) {
  // Login principal: valida el santo y seña contra la colección access_keys.
  app.post('/login', async (req, res) => {
    const name = String(req.body?.name || '').trim();
    const password = String(req.body?.password || '').trim();

    try {
      const authCollection = await getAuthCollection();
      const user = await authCollection.findOne(
        { name },
        { projection: { passwordHash: 1 } },
      );
      const validUser =
        user?.passwordHash &&
        (await bcrypt.compare(password, user.passwordHash));

      // Nunca devolvemos si falló el usuario o la contraseña: ambos son "no autorizado".
      if (!validUser) {
        return res
          .status(401)
          .json({ ok: false, message: 'Santo o seña incorrecta' });
      }

      return res.status(200).json({ ok: true });
    } catch (error) {
      console.error('MongoDB login error:', error);

      return res.status(503).json({
        ok: false,
        message: 'No se pudo comprobar el santo y seña',
      });
    }
  });
}
