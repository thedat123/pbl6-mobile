import { createSlice } from "@reduxjs/toolkit";

const vocabSlice = createSlice({
    name: "vocab",
    initialState: {
        vocabData: {}
    },
    reducers: {
        setVocabData: (state, action) => {
            state.vocabData = { ...action.payload.vocabData};
        }
    }
});

export const setVocabData = vocabSlice.actions.setVocabData;
export default vocabSlice.reducer;