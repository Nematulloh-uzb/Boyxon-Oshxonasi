import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { env } from './env';
import { User } from '../models/User.model';

export function initPassport(): void {
  if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) {
    console.warn('⚠️  Google OAuth sozlanmagan — /api/auth/google ishlamaydi');
    return;
  }
  passport.use(
    new GoogleStrategy(
      {
        clientID: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
        callbackURL: env.GOOGLE_CALLBACK_URL,
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value?.toLowerCase();
          if (!email) return done(new Error('Google email bermadi'));

          /**
           * Xavfsizlik: faqat Google tasdiqlagan email bilan hisobni bog'laymiz.
           * Aks holda birov Google hisobida boshqaning emailini ko'rsatib, uning
           * hisobini egallab olishi mumkin edi.
           */
          const verified = profile.emails?.[0]?.verified;
          if (verified === false) {
            return done(new Error('Google email tasdiqlanmagan'));
          }

          let user = await User.findOne({
            $or: [{ googleId: profile.id }, { email }],
          });

          if (user && !user.isActive) {
            return done(new Error('Hisob bloklangan'));
          }

          if (!user) {
            user = await User.create({
              name: profile.displayName || email.split('@')[0],
              email,
              googleId: profile.id,
              avatar: profile.photos?.[0]?.value ?? null,
              role: 'user',
              // Google emailni o'zi tasdiqlagan — qo'shimcha havola shart emas.
              emailVerified: true,
            });
          } else {
            if (!user.googleId) user.googleId = profile.id;
            if (!user.avatar) user.avatar = profile.photos?.[0]?.value ?? null;
            // Google orqali kirgan bo'lsa, email egaligi tasdiqlangan hisoblanadi.
            if (!user.emailVerified) user.emailVerified = true;
            await user.save();
          }
          return done(null, user as unknown as Express.User);
        } catch (e) {
          return done(e as Error);
        }
      },
    ),
  );
  passport.serializeUser((user: unknown, done) => {
    done(null, (user as { _id: string })._id);
  });
  passport.deserializeUser(async (id: string, done) => {
    try {
      done(null, await User.findById(id));
    } catch (e) {
      done(e as Error);
    }
  });
}
