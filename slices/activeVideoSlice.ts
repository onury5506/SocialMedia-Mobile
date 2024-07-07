import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '@/store/store'
import { LoginResponseDto, UserProfileDTO } from '@/api/models';

interface ActiveVideoState {
    id: string | undefined
}

const initialState: ActiveVideoState = {
    id: undefined
}

export const activeVideoSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        setVideo : (state, action: PayloadAction<ActiveVideoState['id']>) => {
            state.id = action.payload
        },
        clear: (state) => {
            state.id = undefined
        }
    }
})

export const { setVideo, clear } = activeVideoSlice.actions

export const selectActiveVideo = (state: RootState) => state.activeVideo.id

export default activeVideoSlice.reducer