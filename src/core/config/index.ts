import type { User } from "../../modules/settings/services/userService";

export interface profileData {
    message: string;
    success: boolean;
    data: User;
}