import { User } from "./user.model.js";
import { ApiError } from "../../utils/ApiError.js";
import { toUserResponseDTO, type CreateUserDTO, type UpdateUserDTO, type LoginUserDTO, type LoginResponseDTO } from "./user.dto.js";
import type { IUserDocument } from "./user.types.js";
import { redis } from "../../config/redis.js";
import { sendVerificationEmail, sendLoginOTPEmail, sendForgotPasswordEmail } from "../../config/mailer.js";
import { generateToken, hashToken, generateOTP } from "../../utils/token.js";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "../../utils/utils.js";
import { invalidateUserCache } from "../../utils/cache.js";

const getVerifyKey = (email: string) => `verify:${email}`;
const getResendKey = (email: string) => `resend:${email}`;
const getRefreshKey = (userId: string) => `refresh:${userId}`;
const getLoginOTPKey = (email: string) => `loginotp:${email}`;
const getOTPRateKey = (email: string) => `loginotp:rate:${email}`;
const getForgotPasswordKey = (email: string) => `forgot:${email}`;
const getForgotPasswordRate = (email: string) => `forgot:rate:${email}`;



// Auth Services
export const CreateUser = async (data: CreateUserDTO) => {

    const existingUser = await User.findOne({ email: data.email });

    if (existingUser) {
        throw new ApiError(409, "Email already in use");
    }

    const user: IUserDocument = await User.create({
        name: data.name,
        email: data.email,
        password: data.password
    })

    // generate token 
    const rawToken = generateToken();

    // hash token and store in redis
    const hashedToken = hashToken(rawToken);
    await redis.set(getVerifyKey(data.email), hashedToken, "EX", 600);

    // send raw token to email
    try {
        await sendVerificationEmail(data.email, rawToken);
    } catch (error) {
        await User.findByIdAndDelete(user._id);
        await redis.del(getVerifyKey(data.email));
        throw new ApiError(500, "Failed to send verification email. Please try again");
    }

    return toUserResponseDTO(user);
}


export const verifyEmail = async (email: string, token: string) => {

    // get hashed token from Redis

    const storedHash = await redis.get(getVerifyKey(email));

    if (!storedHash) {
        throw new ApiError(400, "Verification Link expired Please Request a new one")
    }

    const incomingHash = hashToken(token)


    if (incomingHash !== storedHash) {
        throw new ApiError(400, "Invalid verification token");
    }

    const user = await User.findOneAndUpdate(
        { email },
        { isVerified: true },
        { new: true }
    );

    if (!user) throw new ApiError(404, "User not found")

    await redis.del(getVerifyKey(email));

    return toUserResponseDTO(user);
}

export const resendVerification = async (email: string) => {
    const user = await User.findOne({ email });
    if (!user) throw new ApiError(404, "User not found");
    if (user.isVerified) throw new ApiError(400, "Email already verified");

    //  rate limit — max 3 resends per hour
    const resendKey = getResendKey(email);
    const attempts = await redis.incr(resendKey);

    if (attempts === 1) {
        await redis.expire(resendKey, 3600);
    }

    if (attempts > 3) {
        const ttl = await redis.ttl(resendKey);
        throw new ApiError(429, `Too many attempts. Try again in ${ttl} seconds`);
    }

    //  generate new token
    const rawToken = generateToken();
    const hashedToken = hashToken(rawToken);

    //  overwrite old token in Redis
    await redis.set(getVerifyKey(email), hashedToken, "EX", 600);

    //  send new raw token
    try {
        await sendVerificationEmail(email, rawToken);

    } catch (error) {
        await redis.del(getVerifyKey(email));
        await redis.decr(resendKey);
        throw new ApiError(500, "Failed to send verification email. Please try again");

    }

    return { message: "Verification email sent successfully" };
};


export const loginUser = async (data: LoginUserDTO) => {
    const { email, password } = data;

    const user = await User.findOne({ email }).select("+password")
    if (!user) throw new ApiError(404, 'Invalid credentials');

    if (!user.isVerified) {
        throw new ApiError(403, "Please verify your email before logging in")
    }

    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) throw new ApiError(401, "Invalid credentials");


    const otp = generateOTP();
    const hashedOTP = hashToken(otp);
    await redis.set(getLoginOTPKey(data.email), hashedOTP, "EX", 600);


    try {
        await sendLoginOTPEmail(data.email, otp);
    } catch (error) {
        await redis.del(getLoginOTPKey(data.email));
        throw new ApiError(500, "Failed to send OTP email. Please try again");

    }

    return { message: "OTP sent to your email" };

}


export const verifyLoginOTP = async (email: string, otp: string): Promise<LoginResponseDTO> => {

    const storedHash = await redis.get(getLoginOTPKey(email));
    if (!storedHash) throw new ApiError(400, "OTP expired. Please login again");

    const incomingHash = hashToken(otp);
    if (incomingHash !== storedHash) throw new ApiError(400, "Invalid OTP");

    const user = await User.findOne({ email });
    if (!user) throw new ApiError(404, "User not found");

    const payload = {
        _id: user._id.toString(),
        email: user.email,
        role: user.role,
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    await redis.set(
        getRefreshKey(user._id.toString()),
        refreshToken,
        "EX",
        60 * 60 * 24 * 7
    );

    await redis.del(getLoginOTPKey(email));
    await redis.del(getOTPRateKey(email));

    return {
        user: toUserResponseDTO(user),
        accessToken,
        refreshToken,
    };
};

export const resendLoginOTP = async (email: string) => {
    const user = await User.findOne({ email });
    if (!user) throw new ApiError(404, "User not found");

    if (!user.isVerified) throw new ApiError(403, "Please verify your email first");


    // rate limit max-3 resends per hour
    const resendKey = getOTPRateKey(email);
    const attempts = await redis.incr(resendKey);
    await redis.expire(resendKey, 3600);


    if (attempts > 3) {
        const ttl = await redis.ttl(resendKey);
        throw new ApiError(429, `Too many attempts. Try again in ${ttl} seconds`);
    }

    // clean old otp before setting new one 
    await redis.del(getLoginOTPKey(email));


    const otp = generateOTP();
    const hashedOTP = hashToken(otp);
    await redis.set(getLoginOTPKey(email), hashedOTP, "EX", 600);

    try {
        await sendLoginOTPEmail(email, otp);
    } catch (error) {
        await redis.del(getLoginOTPKey(email));
        throw new ApiError(500, "Failed to send OTP email. Please try again");
    }
    return { message: "OTP sent to your email" }


}

export const refreshToken = async (token: string): Promise<{ accessToken: string }> => {
    const decoded = verifyRefreshToken(token);

    const storedToken = await redis.get(getRefreshKey(decoded._id));
    if (!storedToken) throw new ApiError(401, "Refresh token expired. Please login again");
    if (storedToken !== token) throw new ApiError(401, "Invalid refresh token");

    const accessToken = generateAccessToken({
        _id: decoded._id,
        email: decoded.email,
        role: decoded.role,
    });

    return { accessToken };
};


export const logoutUser = async (userId: string): Promise<void> => {
    await redis.del(getRefreshKey(userId));
};

export const forgotPassword = async (email: string) => {
    const user = await User.findOne({ email });

    if (!user) return { message: "If this email exists, a reset link has been sent" };

    if (!user.isVerified) throw new ApiError(403, "Please verify your email first");

    if (!user.password) throw new ApiError(400, "This account was created with Google. Please sign in with Google instead");

    const rateKey = getForgotPasswordRate(email);
    const attempts = await redis.incr(rateKey);
    await redis.expire(rateKey, 3600);

    if (attempts > 3) {
        const ttl = await redis.ttl(rateKey);
        throw new ApiError(429, `Too many attempts. Try again in ${ttl} seconds`);
    }


    // generate Token
    const token = generateToken();
    const hashedToken = hashToken(token);

    // store hashed token in Redis — 15 min expiry
    await redis.set(getForgotPasswordKey(email), hashedToken, "EX", 900);

    //  send email
    try {
        await sendForgotPasswordEmail(email, token);
    } catch (error) {
        await redis.del(getForgotPasswordKey(email));
        throw new ApiError(500, "Failed to send reset email. Please try again");
    }

    return { message: "If this email exists, a reset link has been sent" };

}


export const resetPassword = async (
    email: string,
    token: string,
    newPassword: string
) => {
    // get stored hashed Token

    const storedHash = await redis.get(getForgotPasswordKey(email));
    if (!storedHash) {
        throw new ApiError(400, "Reset link has expired or is invalid")
    }

    // has incoming token and compare
    const hashedToken = hashToken(token);
    if (hashedToken !== storedHash) {
        throw new ApiError(400, "Invalid rest token");
    }

    // find user 

    const user = await User.findOne({ email }).select("+password");
    if (!user) throw new ApiError(404, "User not found");

    // update password
    user.password = newPassword;
    await user.save();

    // delete token 
    await redis.del(getForgotPasswordKey(email));

    // Invalidate all existing refresh tokens

    await redis.del(`refresh:${user._id}`);


    return { message: "Password reset successfully" };
}


export const googleAuthService = async (user: IUserDocument) => {
    const accessToken = generateAccessToken({
        _id: user._id.toString(),
        email: user.email,
        role: user.role,
    });

    const refreshToken = generateRefreshToken({
        _id: user._id.toString(),
        email: user.email,
        role: user.role,
    });

    await redis.set(
        `refresh:${user._id}`,
        refreshToken,
        "EX",
        7 * 24 * 60 * 60
    );

    return { accessToken, refreshToken };
};


// Auth Services

export const getUsers = async () => {
    return User.find();
}

export const getById = async (id: string) => {

    const user = await User.findById(id).lean();

    if (!user) {
        throw new ApiError(404, "User Not Found")
    }

    return user;

}

export const deleteUser = async (id: string) => {
    const user = await User.findByIdAndDelete(id);

    if (!user) {
        throw new ApiError(404, "User Not Found");
    }
    await invalidateUserCache(id);
    return user;
}


export const updateUser = async (id: string, data: UpdateUserDTO) => {
    const user = await User.findByIdAndUpdate(
        id,
        { $set: data },
        {
            new: true,
            runValidators: true,
        }
    ).lean();

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    await invalidateUserCache(id);

    return user;

}
