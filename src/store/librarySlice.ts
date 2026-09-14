import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface LibraryState {
  bookmarkedMangaIds: string[];
}

const initialState: LibraryState = {
  bookmarkedMangaIds: [],
};

const librarySlice = createSlice({
  name: 'library',
  initialState,
  reducers: {
    addBookmark(state, action: PayloadAction<string>) {
      if (!state.bookmarkedMangaIds.includes(action.payload)) {
        state.bookmarkedMangaIds.push(action.payload);
      }
    },
    removeBookmark(state, action: PayloadAction<string>) {
      state.bookmarkedMangaIds = state.bookmarkedMangaIds.filter(
        (id) => id !== action.payload,
      );
    },
  },
});

export const { addBookmark, removeBookmark } = librarySlice.actions;
export default librarySlice.reducer;
