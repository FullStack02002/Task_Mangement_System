import { UserRole } from "./user.types.js";

export interface CreateUserDTO {
    name: string;
    email: string;
    password: string;
    role?: UserRole;
    timezone:string;
}


export interface UpdateUserDTO extends Partial<CreateUserDTO> { }


export interface UserResponseDTO {
    _id: string;
    name: string;
    email: string;
    role: UserRole;
    isVerified: Boolean;
    timezone: string;
    createdAt: Date;
    updatedAt: Date;
}


export const toUserResponseDTO = (user: any): UserResponseDTO => ({
    _id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    isVerified: user.isVerified,
    timezone: user.timezone,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
});


export interface LoginUserDTO {
    email: string;
    password: string;
}

export interface LoginResponseDTO {
    user: UserResponseDTO;
    accessToken: string;
    refreshToken: string
}
