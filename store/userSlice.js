import { createSlice } from "@reduxjs/toolkit";

const userSlide = createSlice({
    name: "users",
    initialState: {
        storedUsers: {}
    },
    reducers: {
        setStoredUsers: (state, action) => {
            const newUsers = action.payload.newData;
            const existingUsers = state.storedUsers;

            const usersArray = Object.values(newUsers);

            for(let i = 0; i < usersArray.length; i++){
                const userData = usersArray[i];
                existingUsers[userData.userId] = userData;
            }

            state.userData = existingUsers;
        }
    }
});

export const setDidTryAutoLogin = userSlide.actions.setStoredUsers;
export default userSlide.reducer;