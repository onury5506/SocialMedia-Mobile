import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '@/store/store'
import { LoginResponseDto, UserProfileDTO } from '@/api/models';

interface UserState {
    profile?: UserProfileDTO,
    auth?: LoginResponseDto
}

const initialState: UserState = {
    profile: undefined,
    auth: undefined
}

export const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        setProfile: (state, action: PayloadAction<UserState['profile']>) => {
            state.profile = action.payload
        },
        setAuth: (state, action: PayloadAction<UserState['auth']>) => {
            state.auth = action.payload
        },
        clear: (state) => {
            state.profile = undefined
            state.auth = undefined
        }
    }
})

export const { setProfile, setAuth, clear } = userSlice.actions

export const selectProfile = (state: RootState) => state.user.profile
export const selectAuth = (state: RootState) => state.user.auth

export default userSlice.reducer