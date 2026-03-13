import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { env } from "./env.js";
import { User } from "../modules/user/user.model.js";

passport.use(
    new GoogleStrategy(
        {
            clientID: env.GOOGLE_CLIENT_ID,
            clientSecret: env.GOOGLE_CLIENT_SECRET,
            callbackURL: env.GOOGLE_CALLBACK_URL,
        },
        async (_accessToken, _refreshToken, profile, done) => {
            try {
                const email = profile.emails?.[0]?.value;
                const avatar = profile.photos?.[0]?.value;

                if (!email) return done(new Error("No email from Google"), false);

                let user = await User.findOne({ email });

                if (user) {
                    // existing local user — link Google to their account
                    if (!user.googleId) {
                        user.googleId = profile.id;
                        user.authProvider = "google";
                        user.avatar = avatar ?? null;
                        user.isVerified = true;
                        await user.save();
                    }
                    return done(null, user);
                }

                //  new user — create account
                user = await User.create({
                    name: profile.displayName,
                    email,
                    googleId: profile.id,
                    authProvider: "google",
                    avatar: avatar ?? null,
                    isVerified: true,
                    password: null,
                });

                return done(null, user);

            } catch (error) {
                return done(error, false);
            }
        }
    )
);

export default passport;