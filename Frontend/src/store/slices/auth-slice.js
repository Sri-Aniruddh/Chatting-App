// auth-slice.js
export const createAuthSlice = (set) => ({
    userInfo: undefined,
    setUserInfo: (userInfo) => set({ userInfo }),
});
