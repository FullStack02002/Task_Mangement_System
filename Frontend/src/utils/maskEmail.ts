export const maskEmail = (email: string) => {
    const [local, domain] = email.split("@");
    if (!local || !domain) return email;
    const masked = local[0] + "*".repeat(Math.max(local.length - 1, 3));
    return `${masked}@${domain}`;
};
