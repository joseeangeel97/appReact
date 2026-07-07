import bcrypt from 'bcryptjs';

import { getAuthCollection } from '../db.js';
import { readString } from '../utils/validation.js';

export function registerAuthRoutes(app) {
  // Login principal: valida el santo y seña contra la colección access_keys.
  app.post('/login', async (req, res) => {
    const name = readString(req.body?.name, { maxLength: 120 });
    const password = readString(req.body?.password, { maxLength: 200 });

    if (!name || !password) {
      return res
        .status(400)
        .json({ ok: false, message: 'Santo y seña obligatorios' });
    }

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

      const session = req.setServerSession({
        accessGranted: true,
        profile: null,
        attendingEvents: [],
      });

      return res.status(200).json({ ok: true, session });
    } catch (error) {
      console.error('MongoDB login error:', error);

      return res.status(503).json({
        ok: false,
        message: 'No se pudo comprobar el santo y seña',
      });
    }
  });
}
