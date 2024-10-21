export interface ChangePassword {
    newPassword:        string;
    confirmPassword:    string;
}

export interface UpdatePassword {
    newPassword:        string;
    confirmPassword:    string;
    lastPassword:       string;
}