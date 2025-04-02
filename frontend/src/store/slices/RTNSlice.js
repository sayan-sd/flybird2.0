import { createSlice } from "@reduxjs/toolkit";

const RTNSlice = createSlice({
    name: "realTimeNotification",
    initialState: {
        likeNotification: [],
    },
    reducers: {
        setLikeNotification: (state, action) => {
            if (action.payload.type === "like") {
                state.likeNotification.push(action.payload);
            } else if (action.payload.type === "dislike") {
                state.likeNotification = state.likeNotification.filter(
                    (item) => item.userId !== action.payload.userId
                );
            }
        },
    },
});

export default RTNSlice.reducer;
export const { setLikeNotification } = RTNSlice.actions;