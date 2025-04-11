// store/slices/socketSlice.js
import { createSlice } from '@reduxjs/toolkit';

const socketSlice = createSlice({
    name: 'socketio',
    initialState: {
        isConnected: false,
        // Remove socket object from state
    },
    reducers: {
        setConnectionStatus: (state, action) => {
            state.isConnected = action.payload;
        }
        // Remove setSocket action
    }
});

export const { setConnectionStatus } = socketSlice.actions;
export default socketSlice.reducer;