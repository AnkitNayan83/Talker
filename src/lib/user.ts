import db from "../utils/db";

export const generateUserName = async (firstName: string, lastName: string) => {
    let counter = 1;
    let userName = firstName + lastName + counter;

    while (!(await isUsernameUnique(userName))) {
        counter++;
        userName = firstName + lastName + counter;
    }

    return userName;
};

export const isUsernameUnique = async (userName: string) => {
    const isUsername = await db.user.findFirst({
        where: {
            userName,
        },
    });

    if (isUsername) return false;

    return true;
};
